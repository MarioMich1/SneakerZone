@echo off
setlocal
set "TESS=C:\Program Files\Tesseract-OCR"
set "PATH=%TESS%;%PATH%"
where py >nul 2>&1 && (set "PY=py -3") || (set "PY=python")

echo === Smoketest OCR ===
%PY% -m pip install --upgrade pip
%PY% -m pip install pillow numpy pandas pytesseract opencv-python-headless
%PY% "ocr_smoketest.py"
echo.
echo === Lanzando GUI (fixed) ===
%PY% "SneakerRenamerAI_GUI_pro_fixed.py"
echo.
pause
endlocal
