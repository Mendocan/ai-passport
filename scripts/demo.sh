#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo ""
echo "AI Passport — Demo Setup"
echo "========================"
echo ""

echo "Step 1: Install CLI (global)..."
npm install -g @ai-passport-core/cli@latest

echo ""
echo "Step 2: Onboard Cursor with this repo..."
ai-passport onboard cursor --path "$ROOT" --yes

echo ""
echo "--- Demo ready ---"
echo ""
echo "Next:"
echo "  1. Open Cursor in: $ROOT"
echo "  2. Ensure MCP config from above is in Cursor Settings"
echo "  3. Ask: What languages and frameworks do I prefer?"
echo ""
echo "Full guide: docs/DEMO.md"
echo ""
