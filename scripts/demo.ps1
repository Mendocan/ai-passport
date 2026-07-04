# AI Passport - demo recording helper (see docs/DEMO.md)
# Run from repo root: .\scripts\demo.ps1

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "AI Passport - Demo Setup" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Install CLI (global)..." -ForegroundColor Yellow
npm install -g @ai-passport-core/cli@latest

Write-Host ""
Write-Host "Step 2: Onboard Cursor with this repo..." -ForegroundColor Yellow
$repoRoot = Split-Path -Parent $PSScriptRoot
ai-passport onboard cursor --path $repoRoot --yes

Write-Host ""
Write-Host "--- Demo ready ---" -ForegroundColor Green
Write-Host ""
Write-Host "Next:"
Write-Host ('  1. Open Cursor in: ' + $repoRoot)
Write-Host "  2. Ensure MCP config from above is in Cursor Settings"
Write-Host '  3. Ask: What languages and frameworks do I prefer?'
Write-Host ""
Write-Host "Full guide: docs/DEMO.md"
Write-Host ""
