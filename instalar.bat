@echo off
REM ===============================================
REM Rocket CIDI v3.0 - Instalador Automatico
REM ===============================================

echo.
echo ========================================
echo  Rocket CIDI v3.0 - INSTALADOR
echo ========================================
echo.

REM Crear carpeta libs si no existe
if not exist "libs" mkdir libs

REM Crear carpeta icons si no existe
if not exist "icons" mkdir icons

echo [1/3] Descargando libreria XLSX.js...
echo.

REM Descargar libreria XLSX usando PowerShell
powershell -Command "& {Invoke-WebRequest -Uri 'https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js' -OutFile 'libs\xlsx.full.min.js'}"

if exist "libs\xlsx.full.min.js" (
    echo [OK] Libreria XLSX descargada correctamente
) else (
    echo [ERROR] No se pudo descargar la libreria XLSX
    echo Por favor descargala manualmente desde:
    echo https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js
    pause
    exit /b 1
)

echo.
echo [2/3] Verificando iconos...
echo.

if exist "icons\icon128.png" (
    echo [OK] Iconos Rocket CIDI presentes en icons/
) else (
    echo [ADVERTENCIA] Faltan iconos en icons\ — agrega icon16/48/128.png
)

echo.
echo [3/3] Verificando archivos...
echo.

set MISSING=0

if not exist "manifest.json" (
    echo [ERROR] Falta archivo: manifest.json
    set MISSING=1
)

if not exist "popup.html" (
    echo [ERROR] Falta archivo: popup.html
    set MISSING=1
)

if not exist "popup.js" (
    echo [ERROR] Falta archivo: popup.js
    set MISSING=1
)

if %MISSING%==1 (
    echo.
    echo [ERROR] Faltan archivos criticos de la extension
    pause
    exit /b 1
)

echo [OK] Todos los archivos estan presentes
echo.
echo ========================================
echo  INSTALACION COMPLETADA
echo ========================================
echo.
echo Ahora puedes instalar la extension en Chrome:
echo.
echo 1. Abre Chrome
echo 2. Ve a: chrome://extensions/
echo 3. Activa "Modo de desarrollador"
echo 4. Click en "Cargar extension sin empaquetar"
echo 5. Selecciona esta carpeta
echo.
echo Presiona cualquier tecla para abrir Chrome Extensions...
pause > nul

start chrome://extensions/

echo.
echo Instalacion finalizada!
echo.
pause
