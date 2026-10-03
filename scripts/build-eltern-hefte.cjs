#!/usr/bin/env node
// Baut site/eltern-hefte.js (window.elternHefte = [...]) für /eltern-schueler/
// aus deutsch/eltern_zp/hefte.json (erzeugt von deutsch/eltern_zp/liste.py).
// Aufruf: node site/scripts/build-eltern-hefte.cjs [pfad/zu/hefte.json]
// Fehlt hefte.json, wird eine leere Liste geschrieben.
// Kaufbar ist ein Heft erst, wenn es eine Produktseite site/mappen/<id>/ gibt
// (Feld "produkt_id" in hefte.json oder abgeleitet aus der Heft-ID, z. B. NRW_EESA_T2 -> nrw-eesa-t2).
const fs = require('fs'), path = require('path');
const site = path.resolve(__dirname, '..');
const werkstatt = path.resolve(site, '..');
const src = process.argv[2] ? path.resolve(process.argv[2]) : path.join(werkstatt, 'deutsch', 'eltern_zp', 'hefte.json');
const out = path.join(site, 'eltern-hefte.js');
const slug = t => String(t || '').normalize('NFKD').replace(/[^\x00-\x7F]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);

// echte Preise (Cent) aus dem Shop, falls vorhanden
let shop = {};
try { shop = JSON.parse(fs.readFileSync(path.join(werkstatt, 'pay', 'deploy', 'products.json'), 'utf8')).products || {}; } catch (e) {}
const euro = c => (c / 100).toFixed(2).replace('.', ',') + ' €';

let hefte = [], stand = '';
if (fs.existsSync(src)) {
  const data = JSON.parse(fs.readFileSync(src, 'utf8'));
  stand = data.stand || '';
  hefte = (Array.isArray(data) ? data : data.hefte || []).map(h => {
    const kandidaten = [h.produkt_id, h.slug, slug(h.id)].filter(Boolean).map(slug);
    const produkt = kandidaten.find(k => fs.existsSync(path.join(site, 'mappen', k, 'index.html'))) || '';
    const preis = produkt && shop[produkt] && shop[produkt].price ? euro(shop[produkt].price) : (h.preis || h.preis_vorschlag || '');
    return {
      id: h.id, titel: h.titel, land: h.land || '', land_kurz: h.land_kurz || '',
      abschluss: h.abschluss || '', abschluss_kurz: h.abschluss_kurz || '',
      pruefungsjahr: Number(h.pruefungsjahr) || 2027, lernbereich: h.lernbereich || 'Lesen & Verstehen',
      pruefungsteil: h.pruefungsteil || '', seiten: h.seiten || 0, preis,
      kurzbeschreibung: h.kurzbeschreibung || '', url: produkt ? '/mappen/' + produkt + '/' : ''
    };
  });
} else {
  console.warn('Hinweis: ' + src + ' fehlt – schreibe leere Liste.');
}

const js = '// Automatisch erzeugt von site/scripts/build-eltern-hefte.cjs' + (stand ? ' (Stand der Heftliste: ' + stand + ')' : '') +
  ' – nicht von Hand bearbeiten.\nwindow.elternHefte = ' + JSON.stringify(hefte, null, 1) + ';\n';
fs.writeFileSync(out, js);
console.log(out + ': ' + hefte.length + ' Hefte, davon kaufbar: ' + hefte.filter(h => h.url).length);
