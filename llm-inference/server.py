import torch
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from transformers import AutoTokenizer, AutoModelForCausalLM
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateRequest(BaseModel):
    prompt: str
    max_new_tokens: int = 256
    temperature: float = 0.2
    max_length: int = 512
    top_p: int = 0.95


print("Loading model (meta-llama/Llama-2-7b-chat-hf)...")
# CPU Inference default
tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-2-7b-chat-hf")
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-7b-chat-hf",
    torch_dtype=None,
)

# GPU
# Phase 2 - detect latency threshold exceeded from CPU inference, swap to GPU if available
# model = AutoModelForCausalLM.from_pretrained(
#     "meta-llama/Llama-2-7b-chat-hf",
#     torch_dtype=torch.float16,  # half precision
#     device_map="auto",          # automatically place layers on available GPU(s)
# )

model.eval()
print("Model loaded!")

@app.post("/generate")
def generate_text(req: GenerateRequest):
    """
    Receives a prompt and generation parameters (max_new_tokens, temperature).
    Returns JSON with {"generated_text": "..."}.
    """
    inputs = tokenizer(req.prompt, return_tensors="pt").to(model.device)

    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_length=req.max_length,
            max_new_tokens=req.max_new_tokens,
            temperature=req.temperature,
            top_p=req.top_p,
            do_sample=True,
        )

    generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)

    return {"generated_text": generated_text}
