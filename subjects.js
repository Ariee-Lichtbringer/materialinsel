const subjects = window.materialSubjects;

subjects.geschichte.materials = {9: window.historyMaterials || [], 10: window.historyMaterials || [], 12: window.auschwitzMaterials || [], 13: window.auschwitzMaterials || []};
const key = document.body.dataset.subject;
const subject = subjects[key];
const esc = value => String(value || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
document.documentElement.style.setProperty("--fach-accent", subject.accent);
document.title = `${subject.name} · Materialinsel`;
document.querySelector("[data-name]").textContent = subject.name;
document.querySelector("[data-subtitle]").textContent = subject.subtitle;
document.querySelector("[data-icon]").innerHTML = `<img src="${esc(subject.image)}" alt="">`;
const list = document.querySelector("[data-grades]");
list.insertAdjacentHTML('beforebegin', '<div class="material-search"><label for="material-search">Materialien durchsuchen</label><input id="material-search" type="search" placeholder="Thema, Lernziel oder Methode …"><p role="status" aria-live="polite" id="search-status">Alle Materialien werden angezeigt.</p></div>');
const sampleButton = f => window.teacherPreviews?.[f.protectedId] ? `<button type="button" class="teacher-sample" data-sample="${esc(f.protectedId)}">Mustervorschau ansehen <span>· ${window.teacherPreviews[f.protectedId].length} Seiten</span></button>` : '';
const download = (f,teacher=false) => `<a class="unit-download ${teacher?'unit-download--teacher':''}" ${f.protectedId?`href="/konto/" data-protected="${esc(f.protectedId)}"`:`href="${esc(f.href)}" download`}><span class="download-label">${teacher?'Lehrkräfte · mit Freischaltung':'Schülermaterial · mit Freischaltung'} · PDF ↓</span><strong>${esc(f.label)}</strong><small>${esc(f.detail)}</small></a>${sampleButton(f)}`;
const facts = info => !info ? '' : `<dl class="unit-facts">${[['Lernziel',info.goal],['Dauer',info.duration],['Didaktisches Prinzip',info.principle],['Zielgruppe',info.audience],['Ergebnis',info.result],['Vorbereitung & Technik',info.preparation],['Voraussetzungen',info.prerequisites],['Sozialform',info.socialForm]].filter(([,v])=>v).map(([label,v])=>`<div><dt>${label}${label==='Lernziel'&&info.details?` <button class="goal-info" type="button" aria-label="Ausführliche Lernziele" data-goals="${esc(JSON.stringify(info.details))}">ⓘ</button>`:''}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;
const finalGrade=Math.max(10,...Object.keys(subject.materials).map(Number));
for(let grade=5;grade<=finalGrade;grade++){
 const themes=subject.materials[grade]||[];
 const details=document.createElement('details');details.className='grade';details.id='jahrgang-'+grade;
 details.innerHTML=`<summary>Jahrgang ${grade}<span class="grade-count">${themes.length ? themes.length+(themes.length===1?' Thema':' Themen') : 'Noch keine Materialien'}</span></summary><div class="grade__content">${themes.length?themes.map(theme=>`<details class="theme-menu"><summary><strong>${esc(theme.title)}</strong><small>${esc(theme.description)}</small><span class="expand-hint">Materialien und Downloads anzeigen</span></summary><div class="theme-files">${theme.files.map(f=>`<article class="unit-row ${f.info?'has-info':''}">${f.preview&&!f.protectedId?`<button type="button" class="unit-preview" data-preview="${esc(f.preview)}" aria-label="Arbeitsplan vergrößern: ${esc(f.label)}"><img src="${esc(f.preview)}" alt="Vorschau: ${esc(f.label)}" loading="lazy"><span>Vergrößern</span></button>`:''}<div class="unit-links">${download(f,f.kind==='teacher')}${f.inclusive?download(f.inclusive):''}${f.teacher?download(f.teacher,true):''}</div>${facts(f.info)}</article>`).join('')}</div></details>`).join(''):'<p class="empty">Für diesen Jahrgang werden Materialien nach und nach ergänzt.</p>'}</div>`;
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
   theme.hidden=terms.length>0&&!any;
   if(!theme.hidden){found=true;count++;}
   if(terms.length)theme.open=!theme.hidden;
  });
  grade.hidden=terms.length>0&&!found;
  if(terms.length)grade.open=found;
 });
 if(!terms.length)list.querySelectorAll('details').forEach(d=>{if(d.dataset.wasOpen!==undefined){d.open=d.dataset.wasOpen==='true';delete d.dataset.wasOpen;}});
 document.querySelector('#search-status').textContent=terms.length?(count ? count+' passende Themen (nach Jahrgang)':'Keine Treffer. Bitte einen anderen Suchbegriff verwenden.'):'Alle Materialien werden angezeigt.';
});
const dialog=document.createElement('dialog');dialog.className='preview-dialog';dialog.innerHTML='<button type="button" class="preview-close" aria-label="Vorschau schließen">Schließen ×</button><div class="sample-pages"></div><img alt="Arbeitsplan-Vorschau">';
document.body.append(dialog);
dialog.querySelector('button').onclick=()=>dialog.close();
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
document.addEventListener('click',e=>{const b=e.target.closest('[data-preview]');if(b){dialog.querySelector('.sample-pages').innerHTML='';dialog.querySelector('img').hidden=false;dialog.querySelector('img').src=b.dataset.preview;dialog.showModal();}const sample=e.target.closest('[data-sample]');if(sample){dialog.querySelector('img').hidden=true;dialog.querySelector('.sample-pages').innerHTML=window.teacherPreviews[sample.dataset.sample].map((src,i)=>`<figure><img src="${esc(src)}" alt="Mustervorschau Seite ${i+1}"><figcaption>Mustervorschau · Seite ${i+1}</figcaption></figure>`).join('');dialog.showModal();}});
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
if(initialQuery){const input=document.querySelector('#material-search');input.value=initialQuery;input.dispatchEvent(new Event('input'));}
if(/^#jahrgang-\d+$/.test(location.hash)){const selected=document.getElementById(location.hash.slice(1));if(selected){selected.open=true;requestAnimationFrame(()=>selected.scrollIntoView({block:'start'}));}}
