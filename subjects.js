const themeSlug=t=>String(t).normalize('NFKD').replace(/[^\x00-\x7F]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,60);
const subjects = window.materialSubjects;
if(window.elternProdukte)subjects.eltern=window.elternProdukte; // Selbstlernhefte für Eltern & Schüler: nur auf deren Produktseiten geladen

subjects.geschichte.materials = {9: window.historyMaterials || [], 10: window.historyMaterials || [], 12: window.auschwitzMaterials || [], 13: window.auschwitzMaterials || []};
const key = document.body.dataset.subject;
const subject = subjects[key];
const productId=document.body.dataset.product;
const productTheme=productId && Object.values(subject.materials).flat().find(t=>themeSlug(t.title)===productId);
const esc = value => String(value || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
document.documentElement.style.setProperty("--fach-accent", subject.accent);
if(!productId)document.title = `${subject.name} · Materialinsel`;
document.querySelector("[data-name]").textContent = productTheme ? productTheme.title : subject.name;
document.querySelector("[data-subtitle]").textContent = productTheme ? "Musterseiten entdecken · einmal kaufen · als PDF herunterladen" : subject.subtitle;
if(document.querySelector("[data-icon]"))document.querySelector("[data-icon]").innerHTML = `<img src="${esc(subject.image)}" alt="">`;
const list = document.querySelector("[data-grades]");
if(!productId)list.insertAdjacentHTML('beforebegin', '<div class="material-search"><label for="material-search">Materialien durchsuchen</label><input id="material-search" type="search" placeholder="Thema, Lernziel oder Methode …"><p role="status" aria-live="polite" id="search-status">Alle Materialien werden angezeigt.</p></div>');
const sampleButton = f => window.teacherPreviews?.[f.protectedId] ? `<button type="button" class="teacher-sample" data-sample="${esc(f.protectedId)}">Mustervorschau ansehen <span>· ${Math.min(3,window.teacherPreviews[f.protectedId].length)} Seiten</span></button>` : '';
const download = (f,teacher=false) => `<a class="unit-download ${teacher?'unit-download--teacher':''}" ${f.protectedId?`href="/konto/" data-protected="${esc(f.protectedId)}"`:`href="${esc(f.href)}" download`}><span class="download-label">${teacher?'Lehrkräfte · mit Freischaltung':'Schülermaterial · mit Freischaltung'} · PDF ↓</span><strong>${esc(f.label)}</strong><small>${esc(f.detail)}</small></a>${sampleButton(f)}`;
const facts = info => !info ? '' : `<dl class="unit-facts">${[['Lernziel',info.goal],['Dauer',info.duration],['Didaktisches Prinzip',info.principle],['Zielgruppe',info.audience],['Ergebnis',info.result],['Vorbereitung & Technik',info.preparation],['Voraussetzungen',info.prerequisites],['Sozialform',info.socialForm]].filter(([,v])=>v).map(([label,v])=>`<div><dt>${label}${label==='Lernziel'&&info.details?` <button class="goal-info" type="button" aria-label="Ausführliche Lernziele" data-goals="${esc(JSON.stringify(info.details))}">ⓘ</button>`:''}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;

const goalsBlock=d=>!d||!(d.items||[]).length?'':`<div class="unit-goals"><h5>Lernziele der Stunde</h5>${d.summary?`<p>${esc(d.summary)}</p>`:''}<p class="unit-goals__lead">Die Schülerinnen und Schüler sollen …</p><ul>${d.items.map(i=>`<li>${esc(i)}</li>`).join('')}</ul></div>`;
const pagesOf=f=>((f.detail||'').match(/(\d+) Seiten/)||[])[1];
const mini=(f,label,kind)=>f&&f.protectedId?`<a class="mini-dl mini-dl--${kind}" href="/konto/" data-protected="${esc(f.protectedId)}" title="${esc(f.label)}"><span class="file-kind">${label}${pagesOf(f)?` · ${pagesOf(f)} S.`:''}</span><span class="download-action">Datei im Paket</span></a>`:'';
const miniSample=f=>f&&window.teacherPreviews?.[f.protectedId]?`<button type="button" class="mini-sample" data-sample="${esc(f.protectedId)}">Muster</button>`:'';
function renderTheme(theme){
 const files=theme.files||[];
 const isUnit=f=>f.info||/^\d+\./.test(f.label||'');
 const units=files.filter(isUnit),pack=files.filter(f=>!isUnit(f));
 const cover=`/materialien/cover/${themeSlug(theme.title)}.jpg?v=8`;
 const firstSample=[...pack,...units].find(f=>window.teacherPreviews?.[f.protectedId]);
 const free=(window.freeSamples||{})[themeSlug(theme.title)];
 const head=`<div class="mappe-head"><img class="mappe-cover" src="${cover}" alt="" loading="lazy" onerror="this.remove()"><div class="mappe-head__text"><p>${esc(theme.description)}</p>${firstSample?`<button type="button" class="mini-sample mini-sample--big" data-sample="${esc(firstSample.protectedId)}">Musterseiten ansehen</button>`:''}${free?`<a class="free-sample" href="${esc(free.href)}" target="_blank" rel="noopener"><strong>Erste Stunde kostenlos ansehen</strong><span>${esc(free.unit)} · PDF, ${free.pages} Seiten · ohne Konto</span></a>`:''}</div></div>`;
 const packRows=pack.length?`<h4 class="mappe-sub">Gesamtpaket und Unterlagen</h4><ul class="mappe-list">${pack.map(f=>`<li class="unit-row mappe-row"><div class="mappe-row__title"><strong>${esc(f.label)}</strong><small>${esc(f.detail||'')}</small></div><div class="mappe-row__actions">${mini(f,f.kind==='teacher'?'Lehrkraft':'PDF',f.kind==='teacher'?'teacher':'student')}${f.inclusive?mini(f.inclusive,'Inklusiv','student'):''}${f.teacher?mini(f.teacher,'Lehrkraft','teacher'):''}${miniSample(f)}</div></li>`).join('')}</ul>`:'';
 const unitRows=units.length?`<h4 class="mappe-sub">Lerneinheiten einzeln</h4><ol class="mappe-list mappe-units">${units.map(f=>`<li class="unit-row mappe-row"><div class="mappe-row__title${f.info?' mappe-row__title--toggle':''}"${f.info?` role="button" tabindex="0" aria-label="Infos zu ${esc(f.label)} anzeigen" data-toggle-unit="1"`:''}><strong>${esc(f.label)}</strong>${f.info&&f.info.goal?`<small>Lernziel: ${esc(f.info.goal)}</small>`:`<small>${esc(f.detail||'')}</small>`}</div><div class="mappe-row__actions">${mini(f,'Schüler','student')}${f.inclusive?mini(f.inclusive,'Inklusiv','student'):''}${f.teacher?mini(f.teacher,'Lehrkraft','teacher'):''}${miniSample(f)}</div>${f.info?`<details class="mappe-more"><summary>Alle Infos zur Stunde: Lernziele, Dauer, Ergebnis, Vorbereitung</summary><div class="unit-panel">${goalsBlock(f.info.details)}${facts(f.info.details&&(f.info.details.items||[]).length?{...f.info,goal:''}:f.info)}</div></details>`:''}</li>`).join('')}</ol>`:'';
 return head+packRows+unitRows;
}
if(productTheme){
 const pack=productTheme.files.filter(f=>!f.info&&!/^\d+\./.test(f.label||''));
 list.innerHTML=`<details open class="theme-menu product-detail" id="${esc(productId)}"><summary><strong>Paketinhalt & Downloads</strong></summary><div class="theme-files">${renderTheme(productTheme)}</div></details>`;
 const head=list.querySelector('.mappe-head');
 const description=head.querySelector('.mappe-head__text>p');
 if(productTheme.description.length>260){
  const first=productTheme.description.indexOf('. ',150);
  if(first>0){description.textContent=productTheme.description.slice(0,first+1);const more=document.createElement('details');more.className='product-description';more.innerHTML=`<summary>${key==='eltern'?'Mehr zum Heft':'Mehr zur Unterrichtsreihe'}</summary><p>${esc(productTheme.description.slice(first+2))}</p>`;description.after(more);}
 }

 const facts=document.createElement('div');facts.className='product-included';
 facts.innerHTML=`<p class="eyebrow">IM PAKET ENTHALTEN</p><ul>${pack.map(f=>`<li><strong>${esc(f.label)}</strong><span>${esc(f.detail)}</span></li>`).join('')}</ul><p>Alle aufgeführten Dateien sind im einmaligen Kaufpreis enthalten. Kein Abonnement.</p>`;
 head.querySelector('.mappe-head__text').append(facts);
} else {
const finalGrade=Math.max(10,...Object.keys(subject.materials).map(Number));
for(let grade=5;grade<=finalGrade;grade++){
 const themes=subject.materials[grade]||[];
 const details=document.createElement('details');details.className='grade';details.id='jahrgang-'+grade;
 details.innerHTML=`<summary>Jahrgang ${grade}<span class="grade-count">${themes.filter(t=>!t.unlisted).length ? themes.filter(t=>!t.unlisted).length+(themes.filter(t=>!t.unlisted).length===1?' Thema':' Themen') : 'Noch keine Materialien'}</span></summary><div class="grade__content">${themes.length?themes.map(theme=>`<details class="theme-menu" id="${themeSlug(theme.title)}"${theme.unlisted?' data-unlisted="1" hidden':''}><summary><strong>${esc(theme.title)}</strong><span class="expand-hint">Paket, Musterseiten und Kauf anzeigen</span></summary><div class="theme-files">${renderTheme(theme)}</div></details>`).join(''):'<p class="empty">Für diesen Jahrgang werden Materialien nach und nach ergänzt.</p>'}</div>`;
 list.append(details);
}
const normalize=s=>s.toLocaleLowerCase('de').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss');
document.querySelector('#material-search').addEventListener('input',e=>{
 const terms=normalize(e.target.value).trim().split(/\s+/).filter(Boolean);
 const matches=s=>terms.every(t=>normalize(s).includes(t));
 let count=0;
 list.querySelectorAll('details').forEach(d=>{if(terms.length&&d.dataset.wasOpen===undefined)d.dataset.wasOpen=String(d.open);});
 list.querySelectorAll('.grade').forEach(grade=>{
  let found=false;
  grade.querySelectorAll('.theme-menu').forEach(theme=>{
   const all=matches(theme.querySelector('summary').textContent);let any=false;
   theme.querySelectorAll('.unit-row').forEach(row=>{row.hidden=terms.length>0&&!all&&!matches(row.textContent);any ||= !row.hidden;});
   theme.hidden=(terms.length>0&&!any)||(theme.dataset.unlisted==='1'&&theme.dataset.owned!=='1');
   if(!theme.hidden){found=true;count++;}
   if(terms.length)theme.open=!theme.hidden;
  });
  grade.hidden=terms.length>0&&!found;
  if(terms.length)grade.open=found;
 });
 if(!terms.length)list.querySelectorAll('details').forEach(d=>{if(d.dataset.wasOpen!==undefined){d.open=d.dataset.wasOpen==='true';delete d.dataset.wasOpen;}});
 document.querySelector('#search-status').textContent=terms.length?(count ? count+' passende Themen (nach Jahrgang)':'Keine Treffer. Bitte einen anderen Suchbegriff verwenden.'):'Alle Materialien werden angezeigt.';
});
}
const dialog=document.createElement('dialog');dialog.className='preview-dialog';dialog.innerHTML='<button type="button" class="preview-close" aria-label="Vorschau schließen">Schließen ×</button><div class="sample-pages"></div><img alt="Arbeitsplan-Vorschau">';
document.body.append(dialog);
dialog.querySelector('button').onclick=()=>dialog.close();
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();const buy=e.target.closest('[data-sample-buy]');if(buy){dialog.close();const link=document.querySelector(`[data-protected="${CSS.escape(buy.dataset.sampleBuy)}"]`);link?link.click():location.href='/konto/';}});
dialog.addEventListener('contextmenu',e=>{if(e.target.closest('.sample-pages'))e.preventDefault();});
dialog.addEventListener('dragstart',e=>{if(e.target.closest('.sample-pages'))e.preventDefault();});
document.addEventListener('click',e=>{const b=e.target.closest('[data-preview]');if(b){dialog.querySelector('.sample-pages').innerHTML='';dialog.querySelector('img').hidden=false;dialog.querySelector('img').src=b.dataset.preview;dialog.showModal();}const sample=e.target.closest('[data-sample]');if(sample){dialog.querySelector('img').hidden=true;const pid=sample.dataset.sample;dialog.querySelector('.sample-pages').innerHTML='<p class="sample-note">Musteransicht · höchstens 3 Seiten · Download nach dem Kauf</p>'+window.teacherPreviews[pid].slice(0,3).map((src,i)=>`<figure class="sample-page"><img src="${esc(src)}" alt="Mustervorschau Seite ${i+1}" draggable="false"><span class="sample-mark" aria-hidden="true">MUSTER</span><figcaption>Mustervorschau · Seite ${i+1}</figcaption></figure>`).join('')+`<p class="sample-buy-row"><button type="button" class="sample-buy" data-sample-buy="${esc(pid)}">Ganze Mappe kaufen</button></p>`;dialog.showModal();}});
let popup,active,timer;
function closeGoal(){active?.removeAttribute('aria-describedby');popup?.remove();popup=null;active=null;}
function showGoal(b){
 clearTimeout(timer);if(active===b)return;closeGoal();active=b;
 const d=JSON.parse(b.dataset.goals);popup=document.createElement('div');popup.className='goal-popup';popup.id='active-goals';popup.setAttribute('role','tooltip');
 popup.innerHTML=`<strong>${d.shared?'Lernziele der Projektreihe':'Lernziele dieser Einheit'}</strong><p>${esc(d.summary)}</p><ul>${d.items.map(i=>`<li>${esc(i)}</li>`).join('')}</ul>`;
 document.body.append(popup);b.setAttribute('aria-describedby',popup.id);
 const r=b.getBoundingClientRect();popup.style.left=Math.max(12,Math.min(r.left,innerWidth-popup.offsetWidth-12))+'px';popup.style.top=(r.bottom+8+popup.offsetHeight<innerHeight?r.bottom+8:Math.max(12,r.top-popup.offsetHeight-8))+'px';
 popup.onpointerenter=()=>clearTimeout(timer);popup.onpointerleave=()=>{timer=setTimeout(closeGoal,200);};
}
document.addEventListener('pointerover',e=>{const b=e.target.closest('.goal-info');if(b)showGoal(b);});
document.addEventListener('pointerout',e=>{if(e.target.closest('.goal-info'))timer=setTimeout(closeGoal,200);});
document.addEventListener('focusin',e=>{if(e.target.matches('.goal-info'))showGoal(e.target);});
document.addEventListener('focusout',e=>{if(e.target.matches('.goal-info'))timer=setTimeout(closeGoal,200);});
document.addEventListener('click',e=>{const b=e.target.closest('.goal-info');if(b)showGoal(b);else if(!e.target.closest('.goal-popup'))closeGoal();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeGoal();});
window.addEventListener('resize',closeGoal);
window.addEventListener('scroll',e=>{if(!e.target.closest?.('.goal-popup'))closeGoal();},true);

const initialQuery=new URLSearchParams(location.search).get('q');
if(initialQuery&&!productId){const input=document.querySelector('#material-search');input.value=initialQuery;input.dispatchEvent(new Event('input'));}
if(/^#jahrgang-\d+$/.test(location.hash)){const selected=document.getElementById(location.hash.slice(1));if(selected){selected.open=true;requestAnimationFrame(()=>selected.scrollIntoView({block:'start'}));}}

if(location.hash&&!/^#jahrgang-/.test(location.hash)){const t=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(t&&t.classList.contains('theme-menu')){t.open=true;const g=t.closest('details:not(.theme-menu)');if(g)g.open=true;requestAnimationFrame(()=>t.scrollIntoView({block:'start'}));if(new URLSearchParams(location.search).get('muster')){const b=t.querySelector('[data-sample]');if(b)setTimeout(()=>b.click(),300);}}}

const toggleUnit=t=>{const m=t.closest('.mappe-row')?.querySelector('.mappe-more');if(m)m.open=!m.open;};
document.addEventListener('click',e=>{const t=e.target.closest('[data-toggle-unit]');if(t)toggleUnit(t);});
document.addEventListener('keydown',e=>{const t=e.target.closest?.('[data-toggle-unit]');if(t&&(e.key==='Enter'||e.key===' ')){e.preventDefault();toggleUnit(t);}});

if(productTheme&&new URLSearchParams(location.search).get('muster'))list.querySelector('[data-sample]')?.click();
