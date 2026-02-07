#!/bin/bash
cd "$(dirname "$0")/../frontend"
if [ -f "../.env.local" ]; then
  set -a
  . ../.env.local
  set +a
elif [ -f "../.env" ]; then
  set -a
  . ../.env
  set +a
fi
npm run dev
