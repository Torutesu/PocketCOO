#!/bin/bash
cd "$(dirname "$0")/../backend"
if [ -d ".venv" ]; then
  source .venv/bin/activate
elif [ -d "venv" ]; then
  source venv/bin/activate
else
  echo "virtualenv not found (.venv or venv)."
  exit 1
fi

if [ -f "../.env.local" ]; then
  set -a
  . ../.env.local
  set +a
elif [ -f "../.env" ]; then
  set -a
  . ../.env
  set +a
fi
python main.py
