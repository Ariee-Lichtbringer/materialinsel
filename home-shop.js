(() => {
 const API = 'https://api-production-c1a79.up.railway.app';
 const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const slug = t => String(t).normalize('NFKD').replace(/[^\x00-\x7F]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
 const SUBJECT = {'geschichte': 'Geschichte', 'praktische-philosophie': 'Praktische Philosophie'};

 // Alle Mappen aus den vorhandenen Daten sammeln
 const entries = new Map();
 function add(theme, subject, grade) {
  const id = slug(theme.title);
  const files = theme.files || [];
  const first = files[0] || {};
  const text = [theme.description, first.detail].join(' ');
  const e = entries.get(id) || {id, title: theme.title, subject, grades: [], description: theme.description || ''};
  if (!e.grades.includes(String(grade))) e.grades.push(String(grade));
  e.pages = e.pages || (text.match(/(\d+) Seiten/) || [])[1];
  e.units = e.units || (text.match(/(\d+) (Doppelstunden|Lernstationen)/) || [])[1];
  e.href = `/faecher/${subject}/#${id}`;
  entries.set(id, e);
 }
 for (const [subject, data] of Object.entries(window.materialSubjects || {}))
  for (const [grade, list] of Object.entries(data.materials || {})) (list || []).forEach(t => add(t, subject, grade));
 (window.historyMaterials || []).forEach(t => add(t, 'geschichte', '9/10'));
 (window.auschwitzMaterials || []).forEach(t => add(t, 'geschichte', '12/13'));
 entries.set('zweitzeugen-projekt-wfu', {id: 'zweitzeugen-projekt-wfu', title: 'Zweitzeugen-Projekt · Novemberpogrome und Stimmenwand', subject: 'geschichte', grades: ['8–10'], description: 'Projektkurs mit Zeitzeugeninterviews, Novemberpogromen und digitaler Stimmenwand.', href: '/projekte/wfu-zweitzeugen/'});

 const TEXT = {
  'der-weg-in-die-demokratie-deutschland-und-europa-19451961': 'Von Churchills Zürcher Rede über die Westbindung bis zum Mauerbau.',
  'von-vier-zonen-zu-zwei-blocken-trizonesien-19451953': 'Stunde Null, Alltag in Trümmern, Liedquellen, Luftbrücke und 17. Juni.',
  'die-mauer-in-den-kopfen-teilung-propaganda-stasi': 'Satire als Zugang, Zeitzeugen und der Umgang mit den Stasi-Akten.'
 };
 const NEW = ['der-weg-in-die-demokratie-deutschland-und-europa-19451961', 'von-vier-zonen-zu-zwei-blocken-trizonesien-19451953', 'die-mauer-in-den-kopfen-teilung-propaganda-stasi'];
 const all = [...entries.values()];
 const shelves = [
  {id: 'neu', eyebrow: 'NEU IM SHOP', title: 'Deutschland und Europa nach 1945', big: true, items: NEW.map(id => entries.get(id)).filter(Boolean)},
  {id: 'geschichte-9-10', eyebrow: 'GESCHICHTE · KLASSE 9/10', title: 'Gedenkstättenfahrten und Erinnerungskultur', items: all.filter(e => e.subject === 'geschichte' && !e.grades.includes('12/13') && !NEW.includes(e.id))},
  {id: 'kursstufe', eyebrow: 'GESCHICHTE · KURSSTUFE 12/13', title: 'Auschwitz: vorbereiten, erinnern, gestalten', items: all.filter(e => e.grades.includes('12/13'))},
  {id: 'pp', eyebrow: 'PRAKTISCHE PHILOSOPHIE · KLASSE 5–8', title: 'Philosophieren mit Kindern und Jugendlichen', pp: true, items: all.filter(e => e.subject === 'praktische-philosophie').sort((a, b) => parseInt(a.grades[0]) - parseInt(b.grades[0]))}
 ];

 let prices = {};
 const price = e => prices[e.id] ? (prices[e.id].price / 100).toLocaleString('de-DE', {style: 'currency', currency: 'EUR'}) : '';
 const meta = e => {
  const g = e.grades.join(', ');
  const k = /12\/13/.test(g) ? 'Kursstufe ' + g : (/^\d+$/.test(g) ? 'Klasse ' + g : 'Klasse ' + g);
  return [k, e.units ? e.units + ' Doppelstunden' : '', e.pages ? e.pages + ' Seiten' : ''].filter(Boolean).join(' · ');
 };
 function card(e, big, pp) {
  const p = price(e);
  return `<article class="sh-card${big ? ' sh-card--big' : ''}">
  <a class="sh-card__cover${pp ? ' sh-card__cover--pp' : ''}" href="${esc(e.href)}"><img src="/materialien/cover/${esc(e.id)}.jpg?v=6" alt="Titelseite: ${esc(e.title)}" loading="lazy">${big ? '<span class="sh-badge">NEU</span>' : ''}</a>
  <div class="sh-card__body">
   <p class="sh-card__meta">${esc(meta(e))}</p>
   <h3><a href="${esc(e.href)}">${esc(e.title)}</a></h3>
   ${big && TEXT[e.id] ? `<p class="sh-card__text">${esc(TEXT[e.id])}</p>` : ''}
   <div class="sh-card__foot"><span class="sh-price">${esc(p)}</span><span class="sh-card__actions">${big ? `<a class="sh-btn sh-btn--ghost" href="${esc(e.href.includes('#') ? e.href.replace('#', '?muster=1#') : e.href)}">Muster</a>` : ''}<a class="sh-btn sh-btn--primary sh-btn--small" href="${esc(e.href)}">Ansehen</a></span></div>
  </div></article>`;
 }
 function renderShelves() {
  document.getElementById('sh-shelves').innerHTML = shelves.filter(s => s.items.length).map(s => `<section class="sh-shelf" id="${s.id}"><div class="sh-head"><div><p class="sh-eyebrow">${s.eyebrow}</p><h2>${esc(s.title)}</h2></div></div><div class="sh-grid ${s.big ? 'sh-grid--3' : 'sh-grid--4'}">${s.items.map(e => card(e, s.big, s.pp)).join('')}</div></section>`).join('');
 }
 const cats = [
  {title: 'Geschichte 9/10', target: '#geschichte-9-10', sub: n => n + ' Mappen · Nachkriegszeit, Gedenkstätten', count: () => all.filter(e => e.subject === 'geschichte' && !e.grades.includes('12/13')).length},
  {title: 'Kursstufe 12/13', target: '#kursstufe', sub: n => n + ' Mappen · Auschwitz, Oral History', count: () => all.filter(e => e.grades.includes('12/13')).length},
  {title: 'Praktische Philosophie', target: '#pp', sub: n => n + ' Mappen · Klasse 5 bis 8', count: () => all.filter(e => e.subject === 'praktische-philosophie').length},
  {title: 'Alle Fächer', target: '/faecher/', sub: () => 'Nach Jahrgang stöbern', count: () => 0}
 ];
 document.getElementById('sh-cats').innerHTML = cats.map(c => `<a class="sh-cat" href="${c.target}"><strong>${esc(c.title)}</strong><span>${esc(c.sub(c.count()))}</span></a>`).join('');
 document.getElementById('sh-hero-art').innerHTML = NEW.map((id, i) => `<img class="sh-hero__cover sh-hero__cover--${i}" src="/materialien/cover/${id}.jpg?v=6" alt="">`).join('') + '<span class="sh-badge sh-hero__badge">NEU</span>';
 const pages = ['Mauer-in-den-Koepfen-unit-3', 'Mauer-in-den-Koepfen-unit-3-teacher'].flatMap(k => (window.teacherPreviews || {})[k] || []).slice(0, 3);
 const inside = document.getElementById('sh-inside-pages');
 if (pages.length) inside.innerHTML = pages.map(src => `<img src="${esc(src)}" alt="" loading="lazy" draggable="false">`).join('');
;

 renderShelves();
 fetch(API + '/shop').then(r => r.json()).then(d => {prices = d.products || {}; renderShelves(); runSearch();}).catch(() => {});

 // Suche
 const q = document.getElementById('sh-query'), results = document.getElementById('sh-results'), shelvesEl = document.getElementById('sh-shelves');
 function runSearch() {
  const term = (q.value || '').trim().toLowerCase();
  if (!term) {results.hidden = true; shelvesEl.hidden = false; return;}
  const words = term.split(/\s+/);
  const hits = all.filter(e => {const hay = [e.title, e.description, SUBJECT[e.subject], e.grades.join(' '), TEXT[e.id]].join(' ').toLowerCase(); return words.every(w => hay.includes(w));});
  document.getElementById('sh-results-title').textContent = hits.length ? `${hits.length} ${hits.length === 1 ? 'Mappe' : 'Mappen'} zu „${q.value.trim()}“` : `Keine Mappe zu „${q.value.trim()}“ gefunden`;
  document.getElementById('sh-results-grid').innerHTML = hits.map(e => card(e, false, e.subject === 'praktische-philosophie')).join('');
  results.hidden = false; shelvesEl.hidden = true;
 }
 document.getElementById('sh-search').addEventListener('submit', ev => {ev.preventDefault(); runSearch(); document.getElementById('mappen').scrollIntoView({behavior: 'smooth'});});
 q.addEventListener('input', () => {if (!q.value) runSearch();});
 document.getElementById('sh-reset').onclick = () => {q.value = ''; runSearch();};
})();
