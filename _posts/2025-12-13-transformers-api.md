---
layout: post
title: "[Transformers] 파이토치 루프 탈출: Trainer API 200% 활용 가이드"
date: 2025-12-13 10:00:00
description: Raw PyTorch Loop 대신 Trainer를 써야 하는 이유. Custom Callback을 이용한 실시간 생성 평가와 효율적인 체크포인트 관리 전략.
tags: python transformers training mlops backend
categories: engineering
---

딥러닝 모델링을 처음 배울 때는 `for epoch in epochs:` 로 시작하는 PyTorch의 Raw Loop를 직접 짜는 것이 공부에 도움이 된다. 
하지만 **상용 수준의 LLM 학습 파이프라인**을 구축할 때 이 방식은 '기술 부채(Technical Debt)'가 되기 쉽다.

Mixed Precision(fp16), Gradient Accumulation, Multi-GPU 분산 학습(DDP), Logging, Checkpointing 기능을 매번 직접 구현하고 디버깅하는 것은 비효율적이다.

이번 포스트에서는 Hugging Face의 `Trainer` API를 단순한 편의 도구가 아닌, **견고한 학습 파이프라인의 표준 규격**으로 활용하는 엔지니어링 팁을 공유한다.

---

## 1. Trainer: Boilerplate Code 제거와 표준화

`Trainer` 클래스는 학습에 필요한 모든 Best Practice가 집약되어 있다. 

### 🔴 Bad Practice: Raw PyTorch Loop
```python
# 매 프로젝트마다 반복되는 지루한 코드...
scaler = torch.cuda.amp.GradScaler()
for batch in dataloader:
    optimizer.zero_grad()
    outputs = model(**batch)
    loss = outputs.loss
    scaler.scale(loss).backward()  # fp16 처리
    
    if step % accumulation_steps == 0: # 그라디언트 누적 처리
        scaler.step(optimizer)
        scaler.update()
    
    # 로깅, 체크포인트 저장, 검증 로직 등 수백 줄 추가 필요
```

### 🟢 Best Practice: TrainingArguments 활용
`TrainingArguments`에 설정값만 넘기면 복잡한 기능들이 내부적으로 최적화되어 실행된다.

```python
from transformers import TrainingArguments, Trainer

args = TrainingArguments(
    output_dir="./results",
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4, # 배치 크기 16 효과
    fp16=True,                     # Mixed Precision 자동 적용
    logging_steps=100,
    report_to="wandb",             # WandB, MLflow 자동 연동
)

trainer = Trainer(
    model=model,
    args=args,
    train_dataset=train_dataset,
    # ...
)
```

> **Engineering Note:** 팀 내에서 `TrainingArguments` 설정을 공유하면, 누가 학습 코드를 짜더라도 동일한 로깅 포맷과 저장 구조를 유지할 수 있어 협업 효율이 극대화된다.

---

## 2. Callback: 학습 중간에 개입하기 (Hooking)

`Trainer`를 쓰면 내부 로직을 수정하기 어렵다고 생각하기 쉽다. 하지만 `TrainerCallback`을 사용하면 **학습의 특정 시점(Start, Step End, Epoch End 등)**에 원하는 코드를 주입(Hook)할 수 있다.

LLM 학습 시 가장 유용한 것은 **"Loss만 보지 말고, 실제 텍스트가 잘 생성되는지 확인하는 것"**이다.



### 🟢 Best Practice: 실시간 생성 평가 Callback
학습 도중(예: 매 500 step 마다) 모델이 멍청한 소리를 하고 있진 않은지 샘플을 생성해서 로그에 찍어보는 콜백이다.

```python
from transformers import TrainerCallback

class GenerationCallback(TrainerCallback):
    def __init__(self, tokenizer, prompt_text="User: 안녕?\nAssistant:"):
        self.tokenizer = tokenizer
        self.prompt_text = prompt_text

    def on_step_end(self, args, state, control, model=None, **kwargs):
        # 500 스텝마다 실행
        if state.global_step % 500 == 0:
            inputs = self.tokenizer(self.prompt_text, return_tensors="pt").to(model.device)
            
            # 학습 모드(train) -> 평가 모드(eval)로 잠시 전환
            model.eval()
            with torch.no_grad():
                outputs = model.generate(**inputs, max_new_tokens=50)
                generated_text = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            print(f"\n[Step {state.global_step}] Sample:\n{generated_text}\n")
            
            # 다시 학습 모드로 복귀
            model.train()

# Trainer에 등록
trainer = Trainer(
    ...,
    callbacks=[GenerationCallback(tokenizer)]
)
```

이 콜백이 있으면 학습이 산으로 가고 있는지(Overfitting/Collapse)를 Loss 그래프보다 훨씬 직관적으로 파악할 수 있다.

---

## 3. Storage Management: 디스크 폭발 방지

LLM 체크포인트(Checkpoint)는 개당 수십 GB에 달한다. 기본 설정으로 두면 매 `save_steps` 마다 저장이 되어 금세 디스크가 가득 찬다.

### 🟢 Best Practice: `save_total_limit` & `load_best_model_at_end`

가장 성능이 좋은 모델 하나와, 혹시 모를 중단을 대비한 최신 모델 하나만 남기는 전략이다.

```python
args = TrainingArguments(
    output_dir="./llm-checkpoints",
    save_strategy="steps",
    save_steps=1000,
    evaluation_strategy="steps",
    eval_steps=1000,
    
    # 핵심 옵션:
    save_total_limit=2,          # 가장 최근 2개만 남기고 자동 삭제
    load_best_model_at_end=True, # 학습 종료 시 validation loss가 가장 낮은 모델 로드
    metric_for_best_model="loss"
)
```

이 설정을 통해 디스크 용량을 효율적으로 관리하면서도, 학습이 중간에 멈췄을 때 `trainer.train(resume_from_checkpoint=True)`를 통해 언제든 재개할 수 있는 안전장치를 마련할 수 있다.

---

## 4. Gradient Checkpointing: VRAM 부족 시 최후의 수단

LLM을 파인튜닝할 때 VRAM이 부족한 또 다른 이유는 **Activation(활성화값)** 때문이다. Forward Pass에서 계산된 모든 레이어의 중간값을 Backward Pass(역전파)를 위해 메모리에 쌓아두기 때문이다.

**Gradient Checkpointing**은 Activation을 저장하지 않고, Backward Pass 시 필요한 시점에 다시 계산(재연산)하는 방식이다. 연산량이 약 33% 증가하는 대신 Activation 메모리를 대폭 줄여준다.

```python
args = TrainingArguments(
    output_dir="./results",
    per_device_train_batch_size=2,
    gradient_accumulation_steps=8,
    fp16=True,
    gradient_checkpointing=True,  # Activation 메모리 절약 (속도 약 20% 저하 감수)
)
```

> **Engineering Trade-off:** `gradient_checkpointing=True`는 학습 속도를 약 20% 느리게 만든다. 하지만 OOM으로 학습이 불가한 상황에서는 선택이 아닌 필수다. QLoRA + Gradient Checkpointing 조합은 소비자 GPU(RTX 4090, 24GB)에서 13B 모델을 파인튜닝하는 실질적인 표준이 되었다.

---

## 결론

`Trainer` API를 잘 쓴다는 것은 단순히 코드를 줄이는 것을 넘어, **실험의 재현성(Reproducibility)**과 **운영의 안정성(Stability)**을 확보한다는 의미다.

1.  **Arguments:** 복잡한 학습 설정을 dataclass 하나로 관리.
2.  **Callback:** 학습 과정에 유연하게 개입하여 Custom Logic 실행.
3.  **Checkpointing:** 디스크 용량 관리 자동화.
4.  **Gradient Checkpointing:** VRAM 부족 시 Activation 메모리를 연산으로 교환.

이제 모델을 학습시키는 파이프라인까지 구축했다. 마지막 단계는 학습된 거대 모델을 더 작고 빠르게 만드는 **"5. Optimization: 양자화(Quantization)와 효율화 기법"**이다. 다음 포스트에서 시리즈를 마무리해보자.