# Firebase Deployment Script (PowerShell)
# Deploys Firestore rules and indexes to Firebase

param(
    [int]$Option = 0
)

# Colors
$ErrorColor = "Red"
$SuccessColor = "Green"
$WarningColor = "Yellow"
$InfoColor = "Cyan"

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor $InfoColor
Write-Host "Firebase Firestore Deployment Script" -ForegroundColor $InfoColor
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor $InfoColor

# Check if Firebase CLI is installed
$firebaseInstalled = $null -ne (Get-Command firebase -ErrorAction SilentlyContinue)

if (-not $firebaseInstalled) {
    Write-Host "✗ Firebase CLI is not installed" -ForegroundColor $ErrorColor
    Write-Host "Install it with: npm install -g firebase-tools" -ForegroundColor $WarningColor
    exit 1
}

Write-Host "✓ Firebase CLI found" -ForegroundColor $SuccessColor

# Check if .firebaserc exists
if (-not (Test-Path ".firebaserc")) {
    Write-Host "✗ .firebaserc file not found" -ForegroundColor $ErrorColor
    Write-Host "Please create .firebaserc with your Firebase project ID" -ForegroundColor $WarningColor
    exit 1
}

Write-Host "✓ .firebaserc found" -ForegroundColor $SuccessColor

# Check if firebase.rules exists
if (-not (Test-Path "firebase.rules")) {
    Write-Host "✗ firebase.rules file not found" -ForegroundColor $ErrorColor
    exit 1
}

Write-Host "✓ firebase.rules found" -ForegroundColor $SuccessColor

# Check if firestore.indexes.json exists
if (-not (Test-Path "firestore.indexes.json")) {
    Write-Host "✗ firestore.indexes.json file not found" -ForegroundColor $ErrorColor
    exit 1
}

Write-Host "✓ firestore.indexes.json found" -ForegroundColor $SuccessColor

Write-Host ""
Write-Host "Deployment Options:" -ForegroundColor $WarningColor
Write-Host "1. Deploy everything (rules + indexes)"
Write-Host "2. Deploy only rules"
Write-Host "3. Deploy only indexes"
Write-Host ""

# Get deployment option
if ($Option -eq 0) {
    $Option = Read-Host "Select option (1-3)"
}

switch ($Option) {
    "1" {
        Write-Host ""
        Write-Host "Deploying Firestore rules and indexes..." -ForegroundColor $InfoColor
        firebase deploy --only firestore
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Deployment completed successfully!" -ForegroundColor $SuccessColor
        } else {
            Write-Host "✗ Deployment failed" -ForegroundColor $ErrorColor
            exit 1
        }
    }
    "2" {
        Write-Host ""
        Write-Host "Deploying Firestore rules only..." -ForegroundColor $InfoColor
        firebase deploy --only firestore:rules
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Rules deployed successfully!" -ForegroundColor $SuccessColor
        } else {
            Write-Host "✗ Rules deployment failed" -ForegroundColor $ErrorColor
            exit 1
        }
    }
    "3" {
        Write-Host ""
        Write-Host "Deploying Firestore indexes only..." -ForegroundColor $InfoColor
        firebase deploy --only firestore:indexes
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Indexes deployment started!" -ForegroundColor $SuccessColor
            Write-Host "⚠ Index creation may take 5-15 minutes" -ForegroundColor $WarningColor
        } else {
            Write-Host "✗ Indexes deployment failed" -ForegroundColor $ErrorColor
            exit 1
        }
    }
    default {
        Write-Host "✗ Invalid option" -ForegroundColor $ErrorColor
        exit 1
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor $InfoColor
Write-Host "Deployment complete!" -ForegroundColor $SuccessColor
Write-Host ""
Write-Host "Next steps:" -ForegroundColor $WarningColor
Write-Host "1. Monitor Firebase Console for index creation status"
Write-Host "2. Verify all indexes show 'Enabled' status"
Write-Host "3. Test your application with the new rules and indexes"
Write-Host ""
Write-Host "For more information, see FIREBASE_DEPLOYMENT_GUIDE.md" -ForegroundColor $WarningColor
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor $InfoColor

# Usage examples
Write-Host ""
Write-Host "Usage examples:" -ForegroundColor $InfoColor
Write-Host "  .\deploy-firebase.ps1           # Interactive mode"
Write-Host "  .\deploy-firebase.ps1 -Option 1 # Deploy everything"
Write-Host "  .\deploy-firebase.ps1 -Option 2 # Deploy rules only"
Write-Host "  .\deploy-firebase.ps1 -Option 3 # Deploy indexes only"
