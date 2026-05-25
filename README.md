# Anime Agentic AI Game

Browser-first Next.js game about agentic AI for teens.

## What this repo contains
- Next.js app scaffold
- mission content
- Claude Code instructions
- CodeGraph indexing config
- Ubuntu setup scripts
- tar.gz packaging script

## Setup on Ubuntu
1. Extract the tarball.
2. Run `env/setup-ubuntu.sh`.
3. Copy `.env.example` to `.env`.
4. Run `scripts/index-codebase.sh`.
5. Run `pnpm install`.
6. Start with `pnpm dev`.

## Hardware
See `infra/machine-requirements.md`.

## Tarball
Run `pnpm tarball` or `bash scripts/make-tarball.sh` to create a portable archive.
