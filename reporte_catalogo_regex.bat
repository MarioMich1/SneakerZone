@echo off
setlocal EnableExtensions

:: === CONFIGURA TU RUTA AQUÍ ===
set "BASEDIR=C:\Users\Mario\OneDrive\Escritorio\SneakerZone\Inventario_Marcas"

:: === SALIDA ÚNICA (junto al .bat) ===
set "REPORT=%~dp0reporte_catalogo.txt"

:: === PATRÓN (regex .NET, insensible a may/min) ===
set "PATTERN=%~1"
if "%PATTERN%"=="" (
  echo Escribe el PATRON (regex .NET). Ejemplos:
  echo   _Mujer_
  echo   ^[A-Za-z].*_Mujer_
  set /p "PATTERN=Patron: "
)

if "%PATTERN%"=="" (
  echo [ERROR] No se proporciono patron.
  exit /b 1
)

:: Ejecuta PowerShell para hacer el filtrado con regex real
powershell -NoProfile -Command ^
  "$ErrorActionPreference='Stop';" ^
  "$base = '%BASEDIR%';" ^
  "$pattern = '%PATTERN%';" ^
  "$exts = '*.jpg','*.jpeg','*.png','*.webp','*.gif','*.bmp','*.heic','*.avif';" ^
  "$names = Get-ChildItem -Path $base -Recurse -Include $exts -File | ForEach-Object { $_.BaseName };" ^
  "$matched = New-Object System.Collections.Generic.List[string];" ^
  "$nomatch = New-Object System.Collections.Generic.List[string];" ^
  "foreach($n in $names){ if($n -imatch $pattern){ $matched.Add($n) } else { $nomatch.Add($n) } }" ^
  "$header = 'Listo: ' + $matched.Count + ' coincidieron, ' + $nomatch.Count + ' no coincidieron';" ^
  "[System.IO.File]::WriteAllText('%REPORT%', $header, [System.Text.Encoding]::UTF8);" ^
  "if($matched.Count -gt 0){ Add-Content -LiteralPath '%REPORT%' -Value ($matched -join [Environment]::NewLine) -Encoding UTF8 }" ^
  "if($nomatch.Count -gt 0){ Add-Content -LiteralPath '%REPORT%' -Value ($nomatch -join [Environment]::NewLine) -Encoding UTF8 }"

if errorlevel 1 (
  echo Ocurrio un error generando el reporte. Revisa la ruta BASEDIR o el patron.
  exit /b 1
)

echo Hecho: %REPORT%
echo Abre el archivo para ver: "Listo: N coincidieron, M no coincidieron" seguido por las listas.
echo.
pause
endlocal
