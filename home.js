(() => {
 const e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const norm=s=>s.toLocaleLowerCase('de').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss');
 const data=window.materialSubjects;const source=[];
 for(const t of (window.auschwitzMaterials||[]).filter(t=>!t.unlisted))source.push({theme:t,subject:'geschichte',grades:[12,13]});
 for(const t of (window.historyMaterials||[]).filter(t=>!t.unlisted))source.push({theme:t,subject:'geschichte',grades:[9,10]});
 for(const [subject,d] of Object.entries(data))for(const [grade,themes] of Object.entries(d.materials))for(const theme of themes)source.push({theme,subject,grades:[Number(grade)]});
 source.push({subject:'geschichte',grades:[9,10],project:true,theme:{title:'WfU ZWEITZEUGEN',description:'Stimmen bewahren. Geschichten weitertragen. Ein Kurs zum Zuhören, Erinnern und verantwortlichen Weitergeben.',files:[]}});
 const cards=document.querySelector('#subject-cards');
 cards.innerHTML=Object.entries(data).map(([key,d])=>{const count=source.filter(r=>r.subject===key&&!r.project).length;return `<a class="subject-tile ${key}" href="/faecher/${key}/" style="--accent:${e(d.accent)}"><img class="subject-tile__image" src="${e(d.image.replace('../../','/'))}" alt=""><span class="subject-tile__text"><strong>${e(d.name)}</strong><small>${e(d.subtitle)}</small></span><span class="subject-meta"><small>Jg. ${key==='geschichte'?'5–13':'5–10'}</small><b>${count?count+' Mappen':'Im Aufbau'}</b></span><span class="tile-open">Öffnen <span aria-hidden="true">→</span></span></a>`;}).join('');
 const grades=document.querySelector('#grade-shortcuts');grades.innerHTML=[5,6,7,8,9,10,12,13].map(n=>`<button type="button" data-grade="${n}"><strong>${n}</strong><span>${n>=12?'Kursstufe':'Jahrgang'} ${n}</span></button>`).join('');
 const query=document.querySelector('#home-query'),subject=document.querySelector('#home-subject'),grade=document.querySelector('#home-grade');let mode='all';
 function render(scroll=false){
  const terms=norm(query.value).trim().split(/\s+/).filter(Boolean);
  const found=source.filter(r=>(!subject.value||r.subject===subject.value)&&(!grade.value||r.grades.includes(Number(grade.value)))&&terms.every(t=>norm(JSON.stringify(r.theme)+' '+data[r.subject].name).includes(t))&&(mode==='all'||r.theme.files.some(f=>mode==='methods'?f.label.startsWith('Methodenkoffer'):f.label.startsWith('Didaktisch'))));
  document.querySelector('#catalog-status').textContent=found.length+' '+(found.length===1?'Ergebnis':'Ergebnisse')+(query.value.trim()?' für „'+query.value.trim()+'“':'')+(grade.value?' · Jahrgang '+grade.value:'');
  document.querySelector('#catalog-empty').hidden=found.length>0;
  document.querySelector('#workbook-grid').innerHTML=found.map(r=>{
   const t=r.theme;const unit=t.files.find(f=>f.info);const picture=r.project?'/assets/projekt-zweitzeugen.png':(t.preview||unit?.preview||t.files.find(f=>f.preview)?.preview)?.replace('../../','/')||data[r.subject].image.replace('../../','/');
   const title=t.title.replace(/^Gesamtpaket: /,'');const href=r.project?'/projekte/wfu-zweitzeugen/':'/faecher/'+r.subject+'/?q='+encodeURIComponent(t.title)+'#jahrgang-'+(grade.value||r.grades[0]);
   const selected=mode==='methods'?t.files.find(f=>f.label.startsWith('Methodenkoffer')):mode==='teacher'?t.files.find(f=>f.label.startsWith('Didaktisch')):null;
   const desc=selected?.detail||unit?.info?.goal||t.description;const page=t.pageCount?[String(t.pageCount),String(t.pageCount)]:t.description.match(/(\d+) Seiten/);const unitCount=t.files.filter(f=>f.info).length;
   return `<article class="workbook-card"><a href="${e(href)}" class="workbook-cover ${unit?'is-page':''}" aria-label="${e(title)} öffnen"><img src="${e(picture)}" alt="${unit?'Arbeitsplan-Vorschau':'Illustration'}" loading="lazy"><div class="cover-badges"><span class="pill">${e(data[r.subject].name)}</span><span class="pill">${r.grades.join(' / ')}</span></div><span class="cover-format">${page?page[1]+' Seiten · ':''}PDF${unitCount?' · '+unitCount+' Einheiten':''}</span></a><div class="workbook-body"><p class="workbook-kicker">${mode==='methods'?'METHODEN & STARTHILFEN':mode==='teacher'?'UNTERRICHT VORBEREITEN':r.project?'PROJEKT & KURS':'ARBEITSMAPPE'}</p><h3><a href="${e(href)}">${e(title)}</a></h3><p>${e(desc)}</p><div class="workbook-actions"><span>${selected?'Mit Freischaltung':'Materialien & Vorschauen'}</span><a class="button" ${selected?.protectedId?`href="/konto/" data-protected="${e(selected.protectedId)}"`:`href="${e(href)}"`}>${selected?'PDF herunterladen ↓':'Mappe ansehen →'}</a></div></div></article>`;
  }).join('');
  document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));
  document.querySelectorAll('[data-grade]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.grade===grade.value)));
  if(scroll)document.querySelector('#arbeitsmappen').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
 }
 document.querySelector('#discovery-form').onsubmit=event=>{event.preventDefault();render(true);};
 query.addEventListener('input',()=>render());subject.onchange=()=>render();grade.onchange=()=>render();
 document.querySelectorAll('[data-query]').forEach(b=>b.onclick=()=>{query.value=b.dataset.query;render(true);});
 document.querySelectorAll('[data-grade]').forEach(b=>b.onclick=()=>{grade.value=b.dataset.grade;query.value='';render(true);});
 document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.mode;render();});
 document.querySelector('#reset-search').onclick=()=>{query.value='';subject.value='';grade.value='';mode='all';render();};
 function readLocation(){const params=new URLSearchParams(location.search);mode=params.get('mode')==='methods'?'methods':'all';query.value=params.get('q')||'';render();}
 readLocation();
})();
