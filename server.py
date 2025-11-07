from flask import Flask, jsonify
import os
import re

app = Flask(__name__)

# Ruta base donde están tus carpetas de marcas
RUTA_BASE = r"C:\Users\Mario\OneDrive\Escritorio\SneakerZone\Inventario_Marcas"

# Expresión regular que valida los nombres de archivo
PATRON = re.compile(r"^([A-Za-z]+)_([A-Za-z]+)_([A-Za-z0-9]+)_([A-Za-z]+)_([0-9]+)_([0-9#\.-]+)\.(jpg|jpeg|png)$", re.IGNORECASE)

@app.route("/cargar-tenis")
def cargar_tenis():
    tenis = []

    for root, _, files in os.walk(RUTA_BASE):
        for archivo in files:
            match = PATRON.match(archivo)
            if match:
                marca, genero, modelo, color, precio, tallas, ext = match.groups()
                ruta_relativa = os.path.relpath(os.path.join(root, archivo), RUTA_BASE)
                tenis.append({
                    "marca": marca,
                    "genero": genero,
                    "modelo": modelo,
                    "color": color,
                    "precio": precio,
                    "tallas": tallas.replace("-", " / "),
                    "imagen": ruta_relativa.replace("\\", "/")
                })

    return jsonify(tenis)

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000)
