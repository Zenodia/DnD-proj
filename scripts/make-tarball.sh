#!/usr/bin/env bash
set -euo pipefail
name="anime-agentic-ai-nextjs.tar.gz"
tar -czf "$name" -C "$(dirname "$0")/.." .
echo "$name"
