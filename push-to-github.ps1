#!/usr/bin/env pwsh
# GitHub Push Script - Secure PAT Handling

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           GITHUB PUSH - SECURE AUTHENTICATION             ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Get PAT securely
$pat = Read-Host "Enter your GitHub Personal Access Token (will be hidden)" -AsSecureString
$patPlainText = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToCoTaskMemUnicode($pat))

if (-not $patPlainText) {
    Write-Host "❌ No token provided. Exiting." -ForegroundColor Red
    exit 1
}

# Configure git remote with PAT
$repoUrl = "https://erolledph:$patPlainText@github.com/erolledph/nextjs-standard-pwa-main.git"

Write-Host "`n🔄 Configuring git remote..." -ForegroundColor Yellow
git remote set-url origin $repoUrl

# Push to GitHub
Write-Host "📤 Pushing to GitHub..." -ForegroundColor Yellow
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ SUCCESS! Your code has been pushed to GitHub!" -ForegroundColor Green
    Write-Host "`n📍 Repository: https://github.com/erolledph/nextjs-standard-pwa-main" -ForegroundColor Green
    Write-Host "🔗 View your commit: https://github.com/erolledph/nextjs-standard-pwa-main/commits/main`n" -ForegroundColor Green
} else {
    Write-Host "`n❌ Push failed. Please check your credentials and try again." -ForegroundColor Red
}

# Clean up sensitive data from memory
$patPlainText = $null
$repoUrl = $null
