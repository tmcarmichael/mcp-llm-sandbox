#!/usr/bin/env bash
#
# Usage:
#   1) Make sure you have a .env file at the project root (ignored by Git).
#   2) Fill in necessary environment variables (e.g. HF_TOKEN, etc.).
#   3) Make this file executable (chmod +x run.sh).
#   4) Run ./run.sh.

set -e

set -a
source ../.env
set +a

# echo "Using HF_TOKEN=$HF_TOKEN"
echo "Using LLM_MODEL=$LLM_MODEL"

uvicorn server:app --host 0.0.0.0 --port 8000
