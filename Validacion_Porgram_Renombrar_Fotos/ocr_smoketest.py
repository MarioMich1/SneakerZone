import sys, os
print("Python:", sys.version)
try:
    import pytesseract
    print("pytesseract OK, version:", getattr(pytesseract, "__version__", "unknown"))
    try:
        print("tesseract.exe:", pytesseract.get_tesseract_version())
    except Exception as e:
        print("No pudo leer version de tesseract via pytesseract:", e)
except Exception as e:
    print("ERROR importando pytesseract:", e)

try:
    from PIL import Image
    print("Pillow OK")
except Exception as e:
    print("ERROR importando Pillow:", e)

try:
    import cv2
    print("OpenCV OK, version:", cv2.__version__)
except Exception as e:
    print("OpenCV ausente (opcional):", e)
