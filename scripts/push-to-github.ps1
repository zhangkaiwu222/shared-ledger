# 一起算：走本机代理推送到 GitHub 并开启 Pages
# 用法：在 PowerShell 中执行  .\scripts\push-to-github.ps1

$ErrorActionPreference = "Stop"
$Proxy = "http://127.0.0.1:7890"
$env:HTTP_PROXY = $Proxy
$env:HTTPS_PROXY = $Proxy
$env:ALL_PROXY = $Proxy

Set-Location (Split-Path $PSScriptRoot -Parent)

Write-Host "1) 检查 GitHub CLI 登录..." -ForegroundColor Cyan
$auth = gh auth status 2>&1 | Out-String
if ($auth -notmatch "Logged in") {
  Write-Host "尚未登录。即将打开设备授权流程：" -ForegroundColor Yellow
  Write-Host "  浏览器打开 https://github.com/login/device" -ForegroundColor Yellow
  Write-Host "  输入终端显示的一次性代码并授权" -ForegroundColor Yellow
  gh auth login --hostname github.com --git-protocol https --web
}

Write-Host "2) 配置 remote 并推送..." -ForegroundColor Cyan
git config --local http.proxy $Proxy
git config --local https.proxy $Proxy
git branch -M main
git remote remove origin 2>$null
git remote add origin https://github.com/zhangkaiwu222/shared-ledger.git
gh auth setup-git
git push -u origin main

Write-Host "3) 开启 GitHub Pages (/docs)..." -ForegroundColor Cyan
gh api -X PUT "repos/zhangkaiwu222/shared-ledger/pages" `
  -H "Accept: application/vnd.github+json" `
  -f build_type=legacy `
  -f "source[branch]=main" `
  -f "source[path]=/docs" 2>$null
if ($LASTEXITCODE -ne 0) {
  # 已存在时用 POST/改配置
  gh api -X POST "repos/zhangkaiwu222/shared-ledger/pages" `
    -H "Accept: application/vnd.github+json" `
    -f build_type=legacy `
    -f "source[branch]=main" `
    -f "source[path]=/docs"
}

Write-Host ""
Write-Host "完成。约 1-3 分钟后打开：" -ForegroundColor Green
Write-Host "  https://zhangkaiwu222.github.io/shared-ledger/privacy/"
Write-Host "  https://zhangkaiwu222.github.io/shared-ledger/support/"
