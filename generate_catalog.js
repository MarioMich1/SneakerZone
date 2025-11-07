
// generate_catalog.js
// Recorre Inventario_Marcas, valida nombres y crea catalog.json.
// Opcional: copia imágenes al directorio del sitio para publicarlas en GitHub Pages.
//
// Uso (Windows PowerShell):
//   node generate_catalog.js --src "C:\Users\Mario\OneDrive\Escritorio\SneakerZone\Inventario_Marcas" --out "./catalog.json" --copy "./Inventario_Marcas"
//
// Donde:
//  --src   = carpeta raíz con subcarpetas por marca
//  --out   = ruta del catalog.json a generar (por defecto ./catalog.json)
//  --copy  = (opcional) carpeta destino dentro de tu proyecto donde copiará las imágenes
//            para que se publiquen junto al sitio. Si no la pones, no copia, solo lista.
//
// El JSON final queda con esta forma:
//  {
//    "generatedAt": "...ISO...",
//    "items":[
//      {
//        "brand": "Chanel",
//        "genero": "Mujer",
//        "modelo": "Sandalias",
//        "color": "Blancas",
//        "precio": 380,
//        "tallas": ["26"],
//        "image": "Inventario_Marcas/Chanel/Chanel_Mujer_Sandalias_Blancas_380_26.jpg"
//      }, ...
//    ]
//  }

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

function parseArgs(argv){
  const args = { src: null, out: './catalog.json', copy: null };
  for (let i=2;i<argv.length;i++){
    const a = argv[i];
    if (a === '--src') args.src = argv[++i];
    else if (a === '--out') args.out = argv[++i];
    else if (a === '--copy') args.copy = argv[++i];
  }
  if (!args.src) {
    console.error('Error: Debes proporcionar --src "ruta/de/Inventario_Marcas"');
    process.exit(1);
  }
  return args;
}

const NAME_RE = /^(?<brand>[A-Za-z]+)_(?<genero>Hombre|Mujer|Unisex)_(?<modelo>[^_]+)_(?<color>[^_]+)_(?<precio>\d+(?:\.\d+)?)_(?<tallas>(?:\d+(?:\.\d+)?)(?:-\d+(?:\.\d+)?)*)\.(?<ext>jpg|jpeg|png|webp|gif)$/i;
const VALID_EXT = new Set(['jpg','jpeg','png','webp','gif']);

async function* walkDir(dir){
  const entries = await fsp.readdir(dir, { withFileTypes: true });
  for (const ent of entries){
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      yield* walkDir(full);
    } else if (ent.isFile()){
      yield full;
    }
  }
}

function parseName(filename){
  const base = path.basename(filename);
  const m = base.match(NAME_RE);
  if(!m) return null;
  const { brand, genero, modelo, color, precio, tallas, ext } = m.groups;
  return {
    brand,
    genero,
    modelo,
    color,
    precio: parseFloat(precio),
    tallas: tallas.split('-'),
    ext: ext.toLowerCase(),
    base
  };
}

async function ensureDir(dir){
  await fsp.mkdir(dir, { recursive: true });
}

async function main(){
  const args = parseArgs(process.argv);
  const srcRoot = path.resolve(args.src);
  const outFile = path.resolve(args.out);
  const copyRoot = args.copy ? path.resolve(args.copy) : null;

  const items = [];
  let added=0, skipped=0;

  for await (const file of walkDir(srcRoot)){
    const ext = path.extname(file).slice(1).toLowerCase();
    if(!VALID_EXT.has(ext)) { skipped++; continue; }
    const meta = parseName(file);
    if(!meta){ skipped++; continue; }

    let relImagePath;
    if (copyRoot){
      // Construye ruta de destino: copyRoot/brand/base
      const brandDir = path.join(copyRoot, meta.brand);
      await ensureDir(brandDir);
      const dest = path.join(brandDir, meta.base);
      await fsp.copyFile(file, dest);
      relImagePath = path.relative(path.dirname(outFile), dest).replace(/\\/g,'/'); // para JSON/web
    } else {
      // Ruta relativa desde el JSON hacia el archivo original (si fuera a servirse desde ahí)
      relImagePath = path.relative(path.dirname(outFile), file).replace(/\\/g,'/');
    }

    items.push({
      brand: meta.brand,
      genero: meta.genero,
      modelo: meta.modelo,
      color: meta.color,
      precio: meta.precio,
      tallas: meta.tallas,
      image: relImagePath
    });
    added++;
  }

  const data = {
    generatedAt: new Date().toISOString(),
    items
  };

  await ensureDir(path.dirname(outFile));
  await fsp.writeFile(outFile, JSON.stringify(data, null, 2), 'utf8');

  console.log(`✅ Catálogo generado: ${outFile}`);
  console.log(`   ${added} válidos, ${skipped} ignorados.`);
  if (copyRoot){
    console.log(`📁 Imágenes copiadas a: ${copyRoot}`);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
