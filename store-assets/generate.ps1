# Genera assets para Chrome Web Store usando Chrome headless
$ErrorActionPreference = "Stop"

$chromePaths = @(
    "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe"
)
$chrome = $chromePaths | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $chrome) {
    Write-Error "No se encontro Google Chrome."
}

$root = Split-Path -Parent $PSScriptRoot
$assetsDir = Join-Path $root "store-assets"
$outDir = Join-Path $assetsDir "output"
$iconsDir = Join-Path $root "icons"

if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }
if (-not (Test-Path $iconsDir)) { New-Item -ItemType Directory -Path $iconsDir | Out-Null }

function Invoke-ChromeScreenshot {
    param(
        [string]$HtmlFile,
        [string]$OutputFile,
        [int]$Width,
        [int]$Height
    )

    $htmlPath = (Resolve-Path $HtmlFile).Path
    $uri = [System.Uri]::new($htmlPath).AbsoluteUri
    $outDirResolved = Split-Path $OutputFile -Parent
    if (-not (Test-Path $outDirResolved)) {
        New-Item -ItemType Directory -Path $outDirResolved -Force | Out-Null
    }
    $outFile = (Resolve-Path $outDirResolved).Path
    if (-not $outFile.EndsWith('\')) { $outFile += '\' }
    $outFile += Split-Path $OutputFile -Leaf

    & $chrome `
        --headless=new `
        --disable-gpu `
        --hide-scrollbars `
        --force-device-scale-factor=1 `
        --window-size="$Width,$Height" `
        --screenshot="$outFile" `
        $uri | Out-Null

    if (-not (Test-Path $outFile)) {
        throw "No se pudo generar: $outFile"
    }

    Write-Host "[OK] $outFile"
}

$jobs = @(
    @{ Html = "screenshot-1-main.html";     Out = "screenshot-1-main.png";     W = 1280; H = 800 },
    @{ Html = "screenshot-2-progress.html"; Out = "screenshot-2-progress.png"; W = 1280; H = 800 },
    @{ Html = "screenshot-3-success.html";  Out = "screenshot-3-success.png";  W = 1280; H = 800 },
    @{ Html = "promo-small.html";           Out = "promo-small-440x280.png";   W = 440;  H = 280 },
    @{ Html = "promo-marquee.html";         Out = "promo-marquee-1400x560.png"; W = 1400; H = 560 },
    @{ Html = "icon-128.html";              Out = "icon-128.png";              W = 128;  H = 128 },
    @{ Html = "icon-48.html";               Out = "icon-48.png";               W = 48;   H = 48 },
    @{ Html = "icon-16.html";               Out = "icon-16.png";               W = 16;   H = 16 }
)

foreach ($job in $jobs) {
    $html = Join-Path $assetsDir $job.Html
    $out = Join-Path $outDir $job.Out
    Invoke-ChromeScreenshot -HtmlFile $html -OutputFile $out -Width $job.W -Height $job.H
}

Copy-Item (Join-Path $outDir "icon-128.png") (Join-Path $iconsDir "icon128.png") -Force
Copy-Item (Join-Path $outDir "icon-48.png")  (Join-Path $iconsDir "icon48.png")  -Force
Copy-Item (Join-Path $outDir "icon-16.png")  (Join-Path $iconsDir "icon16.png")  -Force

Write-Host ""
Write-Host "Listo. Archivos en: $outDir"
Write-Host "Iconos copiados a: $iconsDir"
