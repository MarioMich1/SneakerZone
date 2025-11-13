@echo off
REM Lanzador para que NO se cierre si hay errores
REM Requisitos: Python 3.10+, pillow numpy pandas pytesseract opencv-python-headless
REM y Tesseract OCR instalado (recomendado)

set "SCRIPT=%~dp0SneakerRenamerAI_GUI_pro.py"
python "%SCRIPT%"
echo.
echo (Si la ventana se cerro, revisa mensajes arriba: faltan dependencias / PATH de Tesseract)
pause
