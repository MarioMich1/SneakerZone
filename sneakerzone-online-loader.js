
/**
 * SneakerZone Online Loader (dual-mode)
 */
(function(){
  function ensureNewsletterFooterBottom(){
    const nl = document.getElementById('newsletter-section');
    const ft = document.getElementById('site-footer');
    if (!nl || !ft) return;
    document.body.appendChild(nl);
    document.body.appendChild(ft);
  }
  function getCatalogRoot(){
    let root = document.getElementById('catalogRoot');
    const nl = document.getElementById('newsletter-section');
    if (!root){
      root = document.createElement('div');
      root.id = 'catalogRoot';
      root.className = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';
    }
    if (nl){
      if (root.nextSibling !== nl) { document.body.insertBefore(root, nl); }
    } else {
      document.body.appendChild(root);
    }
    return root;
  }
  window.getCatalogRoot = getCatalogRoot;
  const obs = new MutationObserver(()=>{ ensureNewsletterFooterBottom(); getCatalogRoot(); });

  function esGitHubPages(){ return /\.github\.io$/.test(location.hostname); }

  function ensureBrandSectionUsingTemplate(brand, genero){
    if (typeof window.ensureBrandSectionUsingTemplate === 'function'){
      return window.ensureBrandSectionUsingTemplate(brand, genero);
    }
    const root = getCatalogRoot();
    let section = document.querySelector(`section.section-brand[data-brand="${brand.toLowerCase()}"]`);
    if (!section){
      section = document.createElement('section');
      section.className = 'section-brand';
      section.setAttribute('data-brand', brand.toLowerCase());
      section.innerHTML = `<h2 class="text-3xl font-bold text-black mb-4">${brand}</h2>
        <div class="gender-wrap mb-6" data-gender="Hombre"><h3 class="font-medium mb-2">Hombre</h3><div class="grid grid-cols-1 md:grid-cols-3 gap-8 section-grid" data-grid="Hombre"></div></div>
        <div class="gender-wrap mb-6" data-gender="Mujer"><h3 class="font-medium mb-2">Mujer</h3><div class="grid grid-cols-1 md:grid-cols-3 gap-8 section-grid" data-grid="Mujer"></div></div>
        <div class="gender-wrap mb-6" data-gender="Unisex"><h3 class="font-medium mb-2">Unisex</h3><div class="grid grid-cols-1 md:grid-cols-3 gap-8 section-grid" data-grid="Unisex"></div></div>`;
      root.appendChild(section);
    }
    const grid = section.querySelector(`.gender-wrap[data-gender="${genero}"] .section-grid, .gender-wrap[data-gender="${genero}"] .grid`);
    return grid || section;
  }

  function makeCard(data){
    if (typeof window.makeCard === 'function') return window.makeCard(data);
    const { imgURL, brand, genero, modelo, color, precio, tallas } = data;
    const generoTexto = genero === 'Hombre' ? 'Tenis para Hombre' : genero === 'Mujer' ? 'Tenis para Mujer' : 'Tenis Unisex';
    const tallaButtons = (tallas||[]).map(t => 
      `<button class="size-btn border border-gray-300 hover:border-black py-2 text-sm rounded transition-colors" data-size="${t}">${t}</button>`
    ).join('');
    const card = document.createElement('div');
    card.className = 'product-card nike-hover group cursor-pointer';
    card.setAttribute('data-brand', String(brand||'').toLowerCase());
    card.innerHTML = `
      <div class="relative overflow-hidden bg-gray-50 rounded-lg mb-4">
        <div class="product-image aspect-square flex items-center justify-center p-4">
          <img src="${imgURL}" alt="${modelo||''}" class="w-full h-full object-cover rounded-lg"
               onerror="this.src=''; this.alt='Imagen no disponible'; this.style.display='none';">
        </div>
      </div>
      <div class="space-y-2">
        <h3 class="font-medium text-black">${modelo||''}</h3>
        <p class="text-gray-500 text-sm">${brand||''} - ${generoTexto}</p>
        <p class="font-medium text-black">$${Number(precio||0).toFixed(0)}</p>
        <div class="size-selector mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <p class="text-sm text-gray-600 mb-2">Talla:</p>
          <div class="grid grid-cols-4 gap-2 mb-4">${tallaButtons}</div>
        </div>
        <button class="whatsapp-btn w-full nike-button bg-green-600 text-white py-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-green-700" disabled>
          Comprar por WhatsApp
        </button>
      </div>`;
    return card;
  }

  async function cargarCatalogoDesdeJSON(){
    ensureNewsletterFooterBottom(); getCatalogRoot();
    const res = await fetch('catalog.json?ts=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) throw new Error('No pude leer catalog.json');
    const data = await res.json();
    for (const item of (data.items || [])){
      const grid = ensureBrandSectionUsingTemplate(item.brand, item.genero);
      const card = makeCard({ imgURL: item.image, ...item });
      grid.appendChild(card);
    }
    if (typeof window.updateButtonState === 'function'){
      document.querySelectorAll('.product-card').forEach(window.updateButtonState);
    }
  }

  const VALID_EXT = ['jpg','jpeg','png','webp','gif'];
  const NAME_RE = /^(?<brand>[A-Za-z]+)_(?<genero>Hombre|Mujer|Unisex)_(?<modelo>[^_]+)_(?<color>[^_]+)_(?<precio>\d+(?:\.\d+)?)_(?<tallas>(?:\d+(?:\.\d+)?)(?:-\d+(?:\.\d+)?)*)\.(?<ext>jpg|jpeg|png|webp|gif)$/i;
  async function* walkDir(dirHandle){
    for await (const entry of dirHandle.values()){
      if (entry.kind === 'file') yield entry;
      else if (entry.kind === 'directory') yield* walkDir(entry);
    }
  }
  async function fileToObjectURL(h){ const f = await h.getFile(); return URL.createObjectURL(f); }
  function parseName(name){
    const m = name.match(NAME_RE);
    if(!m) return null;
    const {brand, genero, modelo, color, precio, tallas} = m.groups;
    return { brand, genero, modelo, color, precio: parseFloat(precio), tallas: tallas.split('-') };
  }
  async function cargarDesdeCarpeta(){
    ensureNewsletterFooterBottom(); getCatalogRoot();
    if (!('showDirectoryPicker' in window)){
      alert('Tu navegador no permite abrir carpetas. En GitHub Pages usa catalog.json.');
      return;
    }
    const dir = await window.showDirectoryPicker({ id: 'sneakerzone-inventario' });
    for await (const fh of walkDir(dir)){
      const name = fh.name;
      const ext = name.split('.').pop().toLowerCase();
      if (!VALID_EXT.includes(ext)) { continue; }
      const meta = parseName(name);
      if (!meta){ continue; }
      const imgURL = await fileToObjectURL(fh);
      const grid = ensureBrandSectionUsingTemplate(meta.brand, meta.genero);
      const card = makeCard({ imgURL, ...meta });
      grid.appendChild(card);
    }
    if (typeof window.updateButtonState === 'function'){
      document.querySelectorAll('.product-card').forEach(window.updateButtonState);
    }
  }

  function wireButton(){
    const btn = document.getElementById('pickDirBtn');
    if (!btn) return;
    btn.addEventListener('click', async (e)=>{
      e.preventDefault();
      try{
        if (esGitHubPages()) await cargarCatalogoDesdeJSON();
        else await cargarDesdeCarpeta();
      }catch(err){ console.error(err); alert('No se pudo cargar el catálogo.'); }
    });
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    ensureNewsletterFooterBottom(); getCatalogRoot(); wireButton();
    obs.observe(document.body, { childList: true });
  });
})();
