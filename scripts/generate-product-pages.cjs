const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..');
const context={window:{}};vm.createContext(context);
for(const f of ['subject-data.js','history-materials.js','auschwitz-materials.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),context);
const w=context.window;w.materialSubjects.geschichte.materials={9:w.historyMaterials,12:w.auschwitzMaterials};
const slug=t=>String(t).normalize('NFKD').replace(/[^\x00-\x7F]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,60);
const esc=t=>String(t||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let count=0;const done=new Set();
for(const [key,subject] of Object.entries(w.materialSubjects))for(const themes of Object.values(subject.materials||{}))for(const theme of themes){
 if(theme.unlisted)continue;const id=slug(theme.title);if(done.has(id))continue;done.add(id);
 const dir=path.join(root,'mappen',id);fs.mkdirSync(dir,{recursive:true});
 const html=`<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(theme.title)} · Materialinsel</title><meta name="description" content="${esc(theme.description)}"><link rel="canonical" href="https://www.materialinsel.de/mappen/${id}/"><link rel="stylesheet" href="/styles.css?v=20261003-shop"><link rel="stylesheet" href="/editorial.css?v=20261003-shop"></head><body class="product-page" data-subject="${key}" data-product="${id}"><header class="hero"><div class="hero__inner"><p class="eyebrow">${esc(subject.name)} · UNTERRICHTSMAPPE</p><h1 data-name>${esc(theme.title)}</h1><p class="lead" data-subtitle>Musterseiten entdecken · einmal kaufen · als PDF herunterladen</p></div></header><main><p class="breadcrumb"><a href="/#mappen">← Zum Mappen-Shop</a> · <a href="/faecher/${key}/">${esc(subject.name)}</a></p><section data-grades aria-label="Paket und Dateien"></section><noscript><p>Bitte aktiviere JavaScript, um Musterseiten, Preis und Paketinhalt zu sehen.</p></noscript></main>${['history-materials','auschwitz-materials','subject-data','teacher-previews','subjects','site','account'].map(f=>`<script src="/${f}.js?v=20261003-shop"></script>`).join('')}</body></html>`;
 fs.writeFileSync(path.join(dir,'index.html'),html);count++;
}console.log({productPages:count});
