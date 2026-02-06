#!/bin/bash
cd "$(dirname "$0")/../backend"
source venv/bin/activate
export $(cat ../.env | grep -v '^#' | xargs)
python main.py
