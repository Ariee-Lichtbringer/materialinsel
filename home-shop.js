(() => {
 const API = 'https://api-production-c1a79.up.railway.app';
 const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const slug = t => String(t).normalize('NFKD').replace(/[^\x00-\x7F]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
 const SUBJECT = {'geschichte': 'Geschichte', 'praktische-philosophie': 'Praktische Philosophie', 'deutsch': 'Deutsch'};

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
  e.href = `/mappen/${id}/`;
  e.sample = e.sample || files.find(f => window.teacherPreviews?.[f.protectedId])?.protectedId;
  e.package = subject === 'deutsch' ? 'G-Kurs, E-Kurs, inklusive Fassung & Lehrkräfteband' : '';
  entries.set(id, e);
 }
 for (const [subject, data] of Object.entries(window.materialSubjects || {}))
  for (const [grade, list] of Object.entries(data.materials || {})) (list || []).forEach(t => add(t, subject, grade));
 (window.historyMaterials || []).filter(t => !t.unlisted).forEach(t => add(t, 'geschichte', '9/10'));
 (window.auschwitzMaterials || []).filter(t => !t.unlisted).forEach(t => add(t, 'geschichte', '12/13'));
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
  {id: 'deutsch', eyebrow: 'DEUTSCH · KLASSE 7', title: 'Lesetagebücher zu Ganzschriften', items: all.filter(e => e.subject === 'deutsch')},
  {id: 'pp', eyebrow: 'PRAKTISCHE PHILOSOPHIE · KLASSE 5–8', title: 'Philosophieren mit Kindern und Jugendlichen', pp: true, items: all.filter(e => e.subject === 'praktische-philosophie').sort((a, b) => parseInt(a.grades[0]) - parseInt(b.grades[0]))}
 ];

 let prices = {};
 const price = e => prices[e.id] ? (prices[e.id].price / 100).toLocaleString('de-DE', {style: 'currency', currency: 'EUR'}) : 'Preis wird geladen …';
 const meta = e => {
  const g = e.grades.join(', ');
  const k = /12\/13/.test(g) ? 'Kursstufe ' + g : (/^\d+$/.test(g) ? 'Klasse ' + g : 'Klasse ' + g);
  return [k, e.units ? e.units + ' Doppelstunden' : '', e.package || (e.pages ? e.pages + ' Seiten' : '')].filter(Boolean).join(' · ');
 };
 function card(e, big, pp) {
  const p = price(e);
  return `<article class="sh-card${big ? ' sh-card--big' : ''}">
  <a class="sh-card__cover${pp ? ' sh-card__cover--pp' : ''}" href="${esc(e.href)}"><img src="/materialien/cover/${esc(e.id)}.jpg?v=8" alt="Titelseite: ${esc(e.title)}" loading="lazy">${big ? '<span class="sh-badge">NEU</span>' : ''}</a>
  <div class="sh-card__body">
   <p class="sh-card__meta">${esc(meta(e))}</p>
   <h3><a href="${esc(e.href)}">${esc(e.title)}</a></h3>
   ${TEXT[e.id] ? `<p class="sh-card__text">${esc(TEXT[e.id])}</p>` : ''}
   <div class="sh-card__foot"><span class="sh-price">${esc(p)}</span><span class="sh-card__actions">${e.sample ? `<a class="sh-btn sh-btn--ghost" href="${esc(e.href+'?muster=1')}">Musterseiten</a>` : ''}<a class="sh-btn sh-btn--primary sh-btn--small" href="${esc(e.href)}">Details & Kauf</a></span></div>
  </div></article>`;
 }
 const picks = [entries.get(NEW[0]), all.find(e => e.subject === 'deutsch'), all.find(e => e.subject === 'praktische-philosophie'), entries.get(NEW[1]), ...all.filter(e => e.subject === 'praktische-philosophie').slice(1,3)].filter(Boolean);
 function renderShelves() {
  document.getElementById('sh-shelves').innerHTML = `<section class="sh-shelf" id="neu"><div class="sh-head"><div><p class="sh-eyebrow">ZUM EINSTEIGEN</p><h2>Ausgewählte Mappen</h2></div></div><div class="sh-grid sh-grid--3">${picks.map(e => card(e, false, e.subject === 'praktische-philosophie')).join('')}</div></section>`;
 }
 document.getElementById('sh-hero-art').innerHTML = picks.slice(0,3).map(({id}, i) => `<img class="sh-hero__cover sh-hero__cover--${i}" src="/materialien/cover/${id}.jpg?v=8" alt="">`).join('');
 const pages = ['Mauer-in-den-Koepfen-unit-3', 'Mauer-in-den-Koepfen-unit-3-teacher'].flatMap(k => (window.teacherPreviews || {})[k] || []).slice(0, 3);
 const inside = document.getElementById('sh-inside-pages');
 if (pages.length) inside.innerHTML = pages.map(src => `<img src="${esc(src)}" alt="" loading="lazy" draggable="false">`).join('');
;

 renderShelves();
 fetch(API + '/shop').then(r => r.json()).then(d => {prices = d.products || {}; renderShelves(); runSearch();}).catch(() => {});

 // Fach, Jahrgang und Suchbegriff werden gemeinsam ausgewertet.
 const q = document.getElementById('sh-query'), results = document.getElementById('sh-results'), shelvesEl = document.getElementById('sh-shelves');
 const subjectFilter=document.getElementById('sh-subject'), gradeFilter=document.getElementById('sh-grade'), sortFilter=document.getElementById('sh-sort');
 let showAll=false;
 const normalize=s=>String(s||'').toLocaleLowerCase('de').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss');
 function hasGrade(e,n){return e.grades.some(g=>{const nums=g.match(/\d+/g)?.map(Number)||[];return nums.length>1&&/[–-]/.test(g)?n>=nums[0]&&n<=nums[1]:nums.includes(n);});}
 function runSearch() {
  const words=normalize(q.value).trim().split(/\s+/).filter(Boolean);
  const filtering=words.length||subjectFilter.value||gradeFilter.value||showAll||sortFilter.value!=='recommended';
  results.hidden=!filtering;shelvesEl.hidden=!!filtering;
  if(!filtering)return;
  const hits=all.filter(e=>(!subjectFilter.value||e.subject===subjectFilter.value)&&(!gradeFilter.value||hasGrade(e,Number(gradeFilter.value)))&&words.every(w=>normalize([e.title,e.description,SUBJECT[e.subject],e.grades.join(' '),TEXT[e.id]].join(' ')).includes(w)));
  if(sortFilter.value==='title')hits.sort((a,b)=>a.title.localeCompare(b.title,'de'));
  if(sortFilter.value.startsWith('price-'))hits.sort((a,b)=>((prices[a.id]?.price||0)-(prices[b.id]?.price||0))*(sortFilter.value==='price-up'?1:-1));
  document.getElementById('sh-results-title').textContent=hits.length?`${hits.length} passende ${hits.length===1?'Mappe':'Mappen'}`:'Keine passende Mappe gefunden';
  document.getElementById('sh-results-grid').innerHTML=hits.length?hits.map(e=>card(e,false,e.subject==='praktische-philosophie')).join(''):'<p>Versuche einen anderen Suchbegriff oder setze die Filter zurück.</p>';
 }
 document.getElementById('sh-search').addEventListener('submit',ev=>{ev.preventDefault();showAll=true;runSearch();document.getElementById('mappen').scrollIntoView({behavior:'smooth'});});
 q.addEventListener('input',runSearch);
 [subjectFilter,gradeFilter,sortFilter].forEach(el=>el.addEventListener('change',runSearch));
 document.querySelectorAll('[data-subject-filter]').forEach(a=>a.addEventListener('click',()=>{subjectFilter.value=a.dataset.subjectFilter;gradeFilter.value='';q.value='';runSearch();}));
 document.getElementById('sh-all').onclick=()=>{showAll=true;q.value='';subjectFilter.value='';gradeFilter.value='';runSearch();};
 document.getElementById('sh-reset').onclick=()=>{q.value='';subjectFilter.value='';gradeFilter.value='';sortFilter.value='recommended';showAll=false;runSearch();};
})();
