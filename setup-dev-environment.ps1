<#
  setup-dev-environment.ps1
  Rebuilds the trash-can.net (Roast Graveyard) dev toolchain on a fresh Windows PC.

  HOW TO RUN:
    1. Right-click the Start button > "Terminal (Admin)" / "PowerShell (Admin)".
    2. cd into this project folder, e.g.:
         cd C:\Users\lewih\Dev\trash-can.net\trash-can
    3. Allow this one script to run, then run it:
         Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
         .\setup-dev-environment.ps1

  It installs: Chocolatey (if missing), Node.js LTS (+npm), Git, GitHub Desktop,
  VS Code, then runs `npm install` for this project. Cloudflare login + the
  Gemini API key are manual steps printed at the end (they can't be scripted).
#>

$ErrorActionPreference = 'Stop'

function Write-Step($msg) { Write-Host "`n=== $msg ===" -ForegroundColor Cyan }

# --- 0. Must be admin (Chocolatey needs it) -------------------------------
$isAdmin = ([Security.Principal.WindowsPrincipal] `
  [Security.Principal.WindowsIdentity]::GetCurrent()
).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
  Write-Host "Please re-run this in an ADMIN PowerShell (Start > Terminal (Admin))." -ForegroundColor Red
  exit 1
}

# --- 1. Chocolatey --------------------------------------------------------
Write-Step "Chocolatey"
if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
  Write-Host "Installing Chocolatey..."
  Set-ExecutionPolicy Bypass -Scope Process -Force
  [System.Net.ServicePointManager]::SecurityProtocol = 3072
  Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
} else {
  Write-Host "Chocolatey already installed: $(choco --version)"
}

# --- 2. Core tools --------------------------------------------------------
Write-Step "Installing tools (Node LTS, Git, GitHub Desktop, VS Code)"
# nodejs-lts ships Node 22.x which matches this project (@types/node ^22).
choco install -y nodejs-lts git github-desktop vscode

# Refresh PATH so node/npm/git are usable in THIS session.
Write-Step "Refreshing environment"
$chocoHelper = "$env:ChocolateyInstall\helpers\chocolateyProfile.psm1"
if (Test-Path $chocoHelper) { Import-Module $chocoHelper; refreshenv }

# --- 3. Verify ------------------------------------------------------------
Write-Step "Versions"
node --version
npm --version
git --version

# --- 4. Project dependencies ---------------------------------------------
Write-Step "Installing project npm packages"
Set-Location $PSScriptRoot
npm install

# --- 5. Next (manual) steps ----------------------------------------------
Write-Step "DONE - a few manual steps remain"
@"
1. CLOSE and REOPEN PowerShell once so PATH is fully refreshed everywhere.

2. Log in to Cloudflare (opens a browser):
       npx wrangler login

3. Add your Gemini API key for LOCAL dev. Create a file named  .dev.vars
   in this folder containing exactly:
       GEMINI_API_KEY=your-real-key-here
   (.dev.vars is git-ignored, so the key never gets committed.)

   For the LIVE site, set it as a secret instead:
       npx wrangler secret put GEMINI_API_KEY

4. Run the site locally:
       npm run dev
   Then open the URL wrangler prints (usually http://localhost:8787).

5. Other commands you'll use:
       npm run build     # type-check + build to ./dist
       npm run lint      # tsc --noEmit (type errors only)
       npm run deploy    # build + deploy to Cloudflare (live site)
"@ | Write-Host -ForegroundColor Green
