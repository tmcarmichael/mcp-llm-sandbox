# llm-inference

**Under Development**

## Overview

Python/FastAPI server running phi-2. Returns generated responses to mcp-orchestrator.

## Quick Start

1. Create venv (recommended)

```bash
python -m venv venv
```

2. Activate venv (recommended)

```bash
source venv/bin/activate
```

3. Install requirements

```bash
pip install -r llm-inference/requirements.txt
```

4. Make `run.sh` executable (Only needed once)

```bash
chmod +x run.sh
```

5. Set the huggingface token in `.env` of root

ref: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
Create account -> Request Model Access -> Add HF Token to .env
**Refer to .env.example, and create .env in root with the token set, it's accessed by the next script**

6. Run the server with script, must be in ./llm-inference and not root. The `.env` in root must have your HF token for success in this script.

```bash
./run.sh
```

(Default runs on port 8000: uvicorn server:app --host 0.0.0.0 --port 8000)
