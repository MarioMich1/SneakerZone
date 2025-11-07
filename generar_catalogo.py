import os
import json

# === CONFIGURACIÓN ===
# Carpeta base donde están las marcas
BASE_DIR = r"C:\Users\Mario\OneDrive\Escritorio\SneakerZone\Inventario_Marcas"
# Carpeta de salida
OUTPUT_DIR = os.path.join(os.path.dirname(BASE_DIR), "assets")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "productos.json")

# Asegurar que la carpeta assets existe
os.makedirs(OUTPUT_DIR, exist_ok=True)

productos = []

# === RECORRER TODAS LAS CARPETAS DE MARCAS ===
for marca_folder in os.listdir(BASE_DIR):
    marca_path = os.path.join(BASE_DIR, marca_folder)
    if not os.path.isdir(marca_path):
        continue

    for file in os.listdir(marca_path):
        if not (file.lower().endswith(".jpg") or file.lower().endswith(".jpeg") or file.lower().endswith(".png")):
            continue

        try:
            # Separar los datos del nombre de archivo
            nombre, _ = os.path.splitext(file)
            partes = nombre.split("_")

            if len(partes) < 6:
                print(f"⚠️ Nombre inválido: {file}")
                continue

            marca = partes[0]
            genero = partes[1]
            modelo = partes[2]
            color = partes[3]
            precio = int(partes[4])
            tallas = partes[5].split("-")

            # Construir la ruta relativa para GitHub
            ruta_relativa = f"assets/imagenes/{marca}/{file}"

            productos.append({
                "marca": marca,
                "genero": genero,
                "modelo": modelo,
                "color": color,
                "precio": precio,
                "tallas": tallas,
                "ruta_imagen": ruta_relativa
            })
        except Exception as e:
            print(f"Error procesando {file}: {e}")

# === GUARDAR EL JSON ===
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(productos, f, indent=2, ensure_ascii=False)

print(f"✅ Catálogo generado con {len(productos)} productos en {OUTPUT_FILE}")
