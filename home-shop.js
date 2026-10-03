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

 let prices = {};
 const price = e => prices[e.id] ? (prices[e.id].price / 100).toLocaleString('de-DE', {style: 'currency', currency: 'EUR'}) : 'Preis auf der Detailseite';
 const meta = e => {
  const g = e.grades.join(', ');
  const k = /12\/13/.test(g) ? 'Kursstufe ' + g : (/^\d+$/.test(g) ? 'Klasse ' + g : 'Klasse ' + g);
  return [k, e.units ? e.units + ' Doppelstunden' : '', e.package || (e.pages ? e.pages + ' Seiten' : '')].filter(Boolean).join(' · ');
 };
 function card(e, big, pp) {
  const p = price(e);
  return `<article class="sh-card">
  <a class="sh-card__cover${pp ? ' sh-card__cover--pp' : ''}" href="${esc(e.href)}"><img src="/materialien/cover/${esc(e.id)}.jpg?v=8" alt="Titelseite: ${esc(e.title)}" loading="lazy">${big ? '<span class="sh-badge">NEU</span>' : ''}</a>
  <div class="sh-card__body">
   <p class="sh-card__meta"><span class="sh-subject-tag sh-subject-tag--${esc(e.subject)}">${esc(SUBJECT[e.subject])}</span><span>Klasse ${esc(e.grades.join(', '))}</span></p>
   <h3><a href="${esc(e.href)}">${esc(e.title)}</a></h3>
   ${e.sample ? `<a class="sh-sample" href="${esc(e.href+'?muster=1')}">Muster ansehen ↗</a>` : ''}${free[e.id] ? `<a class="sh-sample sh-sample--free" href="${esc(free[e.id].href)}" target="_blank" rel="noopener">Erste Stunde gratis ↓</a>` : ''}
   <div class="sh-card__foot"><span class="sh-price">${esc(p)}</span><span class="sh-card__actions"><a class="sh-btn sh-btn--primary sh-btn--small" href="${esc(e.href)}">Mappe ansehen →</a></span></div>
  </div></article>`;
 }
 // Kostenlose Probestunden (gratis.js)
 const free = window.freeSamples || {};
 const freeList = document.getElementById('sh-free-list');
 const freeEntries = all.filter(e => free[e.id]);
 if (freeList && freeEntries.length) {
  const order = ['praktische-philosophie', 'deutsch', 'geschichte'];
  freeEntries.sort((a, b) => order.indexOf(a.subject) - order.indexOf(b.subject) || (parseInt(a.grades[0]) || 0) - (parseInt(b.grades[0]) || 0));
  freeList.innerHTML = freeEntries.map(e => { const f = free[e.id]; return `<article class="sh-free-card">
  <a class="sh-free-card__cover" href="${esc(f.href)}" target="_blank" rel="noopener"><img src="/materialien/cover/${esc(e.id)}.jpg?v=8" alt="" loading="lazy"><span class="sh-badge sh-badge--free">GRATIS</span></a>
  <div class="sh-free-card__body"><p class="sh-card__meta"><span class="sh-subject-tag sh-subject-tag--${esc(e.subject)}">${esc(SUBJECT[e.subject])}</span><span>Klasse ${esc(e.grades.join(', '))}</span></p>
  <h3>${esc(e.title)}</h3><p class="sh-free-card__unit">${esc(f.unit)}</p>
  <a class="sh-btn sh-btn--free sh-btn--small" href="${esc(f.href)}" target="_blank" rel="noopener">PDF ansehen · ${f.pages} S.</a>
  <a class="sh-free-card__more" href="${esc(e.href)}">Zur ganzen Mappe →</a></div></article>`; }).join('');
  document.getElementById('gratis').hidden = false;
 }
 const picks = [entries.get(NEW[0]), all.find(e => e.subject === 'deutsch'), all.find(e => e.subject === 'praktische-philosophie'), entries.get(NEW[1]), ...all.filter(e => e.subject === 'praktische-philosophie').slice(1,3)].filter(Boolean);
 const pages = ['Mauer-in-den-Koepfen-unit-3', 'Mauer-in-den-Koepfen-unit-3-teacher'].flatMap(k => (window.teacherPreviews || {})[k] || []).slice(0, 3);
 const inside = document.getElementById('sh-inside-pages');
 if (pages.length) inside.innerHTML = pages.map(src => `<img src="${esc(src)}" alt="" loading="lazy" draggable="false">`).join('');
;

 const q=document.getElementById('sh-query'), subjectFilter=document.getElementById('sh-subject'), gradeFilter=document.getElementById('sh-grade'), typeFilter=document.getElementById('sh-type'), sortFilter=document.getElementById('sh-sort');
 const ordered=[...picks,...all.filter(e=>!picks.includes(e))];
 const normalize=s=>String(s||'').toLocaleLowerCase('de').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss');
 function hasGrade(e,n){return e.grades.some(g=>{const nums=g.match(/\d+/g)?.map(Number)||[];return nums.length>1&&/[–-]/.test(g)?n>=nums[0]&&n<=nums[1]:nums.includes(n);});}
 const kind=e=>e.subject==='deutsch'?'lesen':/projekt|podcast|workshop/i.test(e.title)?'projekt':'reihe';
 function runSearch(){
  const words=normalize(q.value).trim().split(/\s+/).filter(Boolean);
  const hits=ordered.filter(e=>(!subjectFilter.value||e.subject===subjectFilter.value)&&(!gradeFilter.value||hasGrade(e,Number(gradeFilter.value)))&&(!typeFilter.value||kind(e)===typeFilter.value)&&words.every(w=>normalize([e.title,e.description,SUBJECT[e.subject],e.grades.join(' '),TEXT[e.id]].join(' ')).includes(w)));
  if(sortFilter.value==='title')hits.sort((a,b)=>a.title.localeCompare(b.title,'de'));
  if(sortFilter.value.startsWith('price-'))hits.sort((a,b)=>{const pa=prices[a.id]?.price,pb=prices[b.id]?.price;if(pa==null)return pb==null?0:1;if(pb==null)return -1;return (pa-pb)*(sortFilter.value==='price-up'?1:-1);});
  document.getElementById('sh-results-title').textContent=`${hits.length} ${hits.length===1?'Mappe':'Mappen'}`;
  document.getElementById('sh-results-grid').innerHTML=hits.length?hits.map(e=>card(e,false,e.subject==='praktische-philosophie')).join(''):'<p class="sh-empty">Keine passende Mappe gefunden. Versuche einen anderen Suchbegriff oder setze die Filter zurück.</p>';
 }
 document.getElementById('sh-search').addEventListener('submit',ev=>{ev.preventDefault();runSearch();document.getElementById('mappen').scrollIntoView({behavior:'smooth'});});
 q.addEventListener('input',runSearch);
 [subjectFilter,gradeFilter,typeFilter,sortFilter].forEach(el=>el.addEventListener('change',runSearch));
 document.getElementById('sh-reset').onclick=()=>{q.value='';subjectFilter.value='';gradeFilter.value='';typeFilter.value='';sortFilter.value='recommended';runSearch();};
 const panel=document.querySelector('.sh-filter-panel'),mobile=window.matchMedia('(max-width: 760px)');
 const syncPanel=()=>{panel.open=!mobile.matches;};syncPanel();mobile.addEventListener('change',syncPanel);
 runSearch();
 fetch(API+'/shop').then(r=>{if(!r.ok)throw new Error('shop');return r.json();}).then(d=>{prices=d.products||{};runSearch();}).catch(()=>{});
})();
