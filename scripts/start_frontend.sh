#!/bin/bash
cd "$(dirname "$0")/../frontend"
export $(cat ../.env | grep -v '^#' | xargs)
npm run dev
