@echo off
setlocal EnableExtensions EnableDelayedExpansion

:: === RUTA DE TU INVENTARIO ===
set "BASEDIR=C:\Users\Mario\OneDrive\Escritorio\SneakerZone\assets\Img"

:: === SALIDA ÚNICA (junto al .bat) ===
set "OUTDIR=%~dp0"
set "REPORT=%OUTDIR%reporte_catalogo.txt"

:: === TEMPORALES ===
set "TMPNAMES=%OUTDIR%_tmp_names.txt"
set "TMPMATCH=%OUTDIR%_tmp_match.txt"
set "TMPNO=%OUTDIR%_tmp_nomatch.txt"

:: Limpieza previa
del "%TMPNAMES%" "%TMPMATCH%" "%TMPNO%" "%REPORT%" >nul 2>&1

:: 1) Recolectar nombres de imagen (sin extensión), recursivo
for /r "%BASEDIR%" %%F in (*.jpg *.jpeg *.png *.webp *.gif *.bmp *.heic *.avif) do (
  echo %%~nF>>"%TMPNAMES%"
)

if not exist "%TMPNAMES%" (
  echo No se encontraron imagenes en: %BASEDIR%
  echo Revisa la ruta BASEDIR dentro del .bat
  pause
  exit /b 1
)

:: 2) Pedir (o tomar) el patron findstr (regex basica, insensible a mayusculas)
::    Sugerencia util para tu caso: ^[A-Za-z][A-Za-z]*_Mujer_
set "PATTERN="
if not "%~1"=="" (
  set "PATTERN=%~1"
) else (
  echo Escribe el PATRON (findstr). Ej: ^[A-Za-z][A-Za-z]*_Mujer_
  set /p "PATTERN=Patron: "
)

if "%PATTERN%"=="" (
  echo [ERROR] No se proporciono patron.
  del "%TMPNAMES%" >nul 2>&1
  exit /b 1
)

:: 3) Separar coincidentes / no coincidentes
findstr /I /R /C:"%PATTERN%" "%TMPNAMES%" > "%TMPMATCH%"
findstr /I /R /V /C:"%PATTERN%" "%TMPNAMES%" > "%TMPNO%"

:: 4) Contar
for /f %%C in ('find /v /c "" ^< "%TMPMATCH%"') do set "HITS=%%C"
for /f %%C in ('find /v /c "" ^< "%TMPNO%"')    do set "NOHITS=%%C"

:: 5) Escribir en UN SOLO ARCHIVO con el formato pedido (sin encabezados extra)
> "%REPORT%"  echo Listo: %HITS% coincidieron, %NOHITS% no coincidieron
if %HITS% gtr 0 ( type "%TMPMATCH%" >> "%REPORT%" )
if %NOHITS% gtr 0 ( type "%TMPNO%"   >> "%REPORT%" )

:: 6) Limpiar temporales
del "%TMPNAMES%" "%TMPMATCH%" "%TMPNO%" >nul 2>&1

pause
echo Hecho: %REPORT%
echo Abre ese archivo y deberias ver exactamente:
echo "Listo: N coincidieron, M no coincidieron" + listas
echo.

pause
endlocal
