# JWST Deep Sky Explorer - Development Environment Setup
# PowerShell script for automated VS Code workspace configuration

param(
    [switch]$InstallExtensions = $false,
    [switch]$Force = $false
)

Write-Host "🌌 JWST Deep Sky Explorer - Development Setup" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# Check if VS Code is installed
try {
    $codeVersion = code --version
    Write-Host "✅ VS Code detected: $($codeVersion[0])" -ForegroundColor Green
}
catch {
    Write-Host "❌ VS Code not found. Please install VS Code first." -ForegroundColor Red
    exit 1
}

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js detected: $nodeVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Install dependencies if package-lock.json exists
if (Test-Path "package-lock.json") {
    Write-Host "📦 Installing npm dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}
else {
    Write-Host "⚠️  No package-lock.json found. Run 'npm install' manually." -ForegroundColor Yellow
}

# Install VS Code extensions if requested
if ($InstallExtensions) {
    Write-Host "🔧 Installing VS Code extensions..." -ForegroundColor Yellow
    
    $extensions = @(
        "ms-vscode.vscode-typescript-next",
        "bradlc.vscode-tailwindcss",
        "esbenp.prettier-vscode", 
        "github.copilot",
        "github.copilot-chat",
        "formulahendry.auto-rename-tag",
        "christian-kohler.path-intellisense",
        "slevesque.shader",
        "humao.rest-client",
        "naumovs.color-highlight",
        "dbaeumer.vscode-eslint",
        "eamodio.gitlens"
    )
    
    foreach ($ext in $extensions) {
        Write-Host "  Installing $ext..." -ForegroundColor Gray
        code --install-extension $ext --force:$Force
    }
    
    Write-Host "✅ Extensions installation completed" -ForegroundColor Green
}

# Verify .vscode configuration exists
if (Test-Path ".vscode") {
    Write-Host "✅ VS Code workspace configuration found" -ForegroundColor Green
    
    $configFiles = @("settings.json", "tasks.json", "launch.json", "extensions.json")
    foreach ($file in $configFiles) {
        if (Test-Path ".vscode/$file") {
            Write-Host "  ✅ $file configured" -ForegroundColor Green
        }
        else {
            Write-Host "  ⚠️  $file missing" -ForegroundColor Yellow
        }
    }
}
else {
    Write-Host "❌ .vscode directory not found" -ForegroundColor Red
}

# Check .env configuration
if (Test-Path ".env") {
    Write-Host "✅ .env file found" -ForegroundColor Green
    
    $envContent = Get-Content .env -Raw
    if ($envContent -match 'VITE_NASA_API_KEY=([^\r\n]+)') {
        $apiKey = $matches[1].Trim()
        if ($apiKey -and $apiKey -ne 'your_nasa_api_key_here') {
            Write-Host "  ✅ NASA API key configured" -ForegroundColor Green
        }
        else {
            Write-Host "  ⚠️  NASA API key placeholder found - add your actual key" -ForegroundColor Yellow
        }
    }
    else {
        Write-Host "  ⚠️  No NASA API key configuration found" -ForegroundColor Yellow
    }
}
else {
    Write-Host "⚠️  .env file not found - copy from .env.example" -ForegroundColor Yellow
}

# Test NASA API connectivity
Write-Host "🛰️ Testing NASA API connectivity..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://images-api.nasa.gov/search?q=webb&media_type=image&page_size=1" -TimeoutSec 10
    if ($response.collection.items.Count -gt 0) {
        Write-Host "✅ NASA API connection successful" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️  NASA API responded but no data returned" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "❌ NASA API connection failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🚀 Setup Complete! Next Steps:" -ForegroundColor Green
Write-Host "  1. Configure NASA API key in .env file (optional but recommended)" -ForegroundColor White
Write-Host "  2. Open VS Code: 'code .'" -ForegroundColor White  
Write-Host "  3. Start dev server: Ctrl+Shift+B or 'npm run dev'" -ForegroundColor White
Write-Host "  4. Visit: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "🔑 NASA API Key Setup:" -ForegroundColor Cyan
Write-Host "  • Get free API key: https://api.nasa.gov/" -ForegroundColor White
Write-Host "  • Edit .env: VITE_NASA_API_KEY=your_key_here" -ForegroundColor White
Write-Host "  • Test with: Ctrl+Shift+P → 'Tasks: Run Task' → 'test: NASA API with Key'" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan  
Write-Host "  • Workspace Setup: .vscode/workspace-setup.md" -ForegroundColor White
Write-Host "  • AI Instructions: .github/copilot-instructions.md" -ForegroundColor White
Write-Host "  • Project Requirements: PRD.md" -ForegroundColor White