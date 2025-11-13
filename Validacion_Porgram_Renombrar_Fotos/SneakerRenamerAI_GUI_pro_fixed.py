#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os, sys

# --- Fuerza la ruta a tesseract.exe (ajusta si tu ruta es distinta) ---
TESSERACT_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
try:
    import pytesseract
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH
except Exception as e:
    pass  # la GUI avisará

from SneakerRenamerAI_GUI_pro import App  # reutilizamos la GUI y motor

if __name__ == "__main__":
    try:
        app = App()
        app.mainloop()
    except Exception as e:
        import traceback, tkinter as tk
        from tkinter import messagebox
        try:
            messagebox.showerror("Error fatal", traceback.format_exc())
        except Exception:
            print(traceback.format_exc())
            input("Pulsa Enter para salir...")
