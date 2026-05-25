#!/usr/bin/env bash
set -euo pipefail
sudo apt-get update
sudo apt-get install -y git curl build-essential jq ripgrep fd-find tree python3 python3-venv python3-pip
corepack enable
