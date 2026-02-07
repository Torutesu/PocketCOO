#!/bin/bash
cd "$(dirname "$0")/../frontend"
if [ -f "../.env" ]; then
  set -a
  . ../.env
  set +a
fi
npm run dev
