# INSTALLATION & VERIFICATION SCRIPT
# Run this before first demo to ensure everything works

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "EMERGENCY DISPATCH SYSTEM - SETUP VERIFICATION" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js not found. Please install from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check npm
Write-Host "Checking npm..." -ForegroundColor Yellow
$npmVersion = npm --version 2>$null
if ($npmVersion) {
    Write-Host "✓ npm found: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "✗ npm not found" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "INSTALLING DEPENDENCIES" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# Install dependencies
Write-Host "Running: npm install..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Dependency installation failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "VERIFYING PROJECT FILES" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

$requiredFiles = @(
    "server\server.js",
    "server\dsa\HashTable.js",
    "server\dsa\PriorityQueue.js",
    "server\dsa\Graph.js",
    "server\dsa\Dijkstra.js",
    "desktop\index.html",
    "desktop\script.js",
    "desktop\styles.css",
    "mobile\index.html",
    "mobile\script.js",
    "mobile\styles.css",
    "shared\cityMapData.js",
    "package.json",
    "README.md"
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✓ $file" -ForegroundColor Green
    } else {
        Write-Host "✗ $file - MISSING!" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host ""
    Write-Host "✗ Some files are missing. Please check project structure." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "SETUP COMPLETE!" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Start server:    npm start" -ForegroundColor White
Write-Host "2. Open desktop:    http://localhost:3000/desktop/index.html" -ForegroundColor White
Write-Host "3. Open mobile:     http://localhost:3000/mobile/index.html" -ForegroundColor White
Write-Host ""
Write-Host "For quick demo, see: QUICKSTART.md" -ForegroundColor Cyan
Write-Host "For testing guide, see: TESTING.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ready to present! 🚀" -ForegroundColor Green
Write-Host ""
