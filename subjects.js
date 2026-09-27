const subjects = {
  "praktische-philosophie": {
    name: "Praktische Philosophie", image: "../../assets/fach-praktische-philosophie.png", accent: "#0b8792",
    subtitle: "Denken, prüfen und begründen",
    materials: {
      5: [{
        title: "Wer bin ich?",
        description: "Sich selbst mit Sokrates entdecken - mit einer Ich-Kiste, konkreten Alltagssituationen, Gefühlen, Rollen, Selbst- und Fremdbild sowie einem Brief an das Zukunfts-Ich.",
        files: [
          { label: "Arbeitsmappe", detail: "Klasse 5 · vollständige Lernreise", kind: "standard", href: "../../materialien/praktische-philosophie/Arbeitsmappe_PP_Wer_bin_ich_2026_Klasse5.pdf" },
          { label: "Falt-Namensschild", detail: "Wer bin ich? · A4 quer · einseitig drucken und mittig falten", kind: "standard", href: "../../materialien/praktische-philosophie/Namensschild-PP-Klasse-5-Wer-bin-ich.pdf" }
        ]
      }],
      7: [{
        title: "Wenn Bauch und Kopf streiten",
        description: "Gefühls- und Verstandesentscheidungen auf dem Prüfstand – mit Immanuel Kant als philosophischer Grundlage.",
        files: [
          { label: "Arbeitsmappe", detail: "Standardfassung", kind: "standard", href: "../../materialien/praktische-philosophie/Arbeitsmappe_PP_Bauch_und_Kopf_2026_Klasse7.pdf" },
          { label: "Inklusive Version", detail: "vereinfachte Texte und Hilfen", kind: "inclusive", href: "../../materialien/praktische-philosophie/Arbeitsmappe_PP_Bauch_und_Kopf_2026_Klasse7_Inklusive_Version.pdf" },
          { label: "QR-Codes & Medientipps", detail: "Kant-Video, Erklärvideos und Podcasts", kind: "media", href: "../../materialien/praktische-philosophie/Medientipps_Bauch_und_Kopf_Klasse7_Videos_Podcasts.pdf" },
          { label: "Elternbrief", detail: "Leistungsbewertung und Rückläufer", kind: "parent", href: "../../materialien/praktische-philosophie/Elternbrief_PP_Jahrgang7_Leistungsbewertung.pdf" }
        ]
      }],
      8: [{
        title: "Stell dir eine Welt vor, in der …",
        description: "Utopien und ihre politische Funktion – Thomas Morus und Ernst Bloch vergleichen, Zukunftsbilder prüfen und eine eigene politische Utopie entwickeln.",
        files: [
          { label: "Arbeitsmappe", detail: "Standardfassung", kind: "standard", href: "../../materialien/praktische-philosophie/Arbeitsmappe_PP_Utopien_2026_Klasse8.pdf" },
          { label: "Inklusive Version", detail: "vereinfachte Texte, Satzanfänge und Schreibhilfen", kind: "inclusive", href: "../../materialien/praktische-philosophie/Arbeitsmappe_PP_Utopien_2026_Klasse8_Inklusive_Version.pdf" },
          { label: "QR-Codes & Medientipps", detail: "Utopie, Morus, Bloch und M1–M12", kind: "media", href: "../../materialien/praktische-philosophie/Medientipps_Utopien_Klasse8_QR_Codes.pdf" },
          { label: "Kunstbetrachtung", detail: "Lorenzetti und Signac · Morus- und Bloch-Brille", kind: "media", href: "../../materialien/praktische-philosophie/Kunstbetrachtung_Utopien_Klasse8_Lorenzetti_Signac.pdf" },
          { label: "Elternbrief", detail: "Leistungsbewertung und Rückläufer", kind: "parent", href: "../../materialien/praktische-philosophie/Elternbrief_PP_Jahrgang8_Leistungsbewertung.pdf" }
        ]
      }]
    }
  },
  "geschichte": { name: "Geschichte", image: "../../assets/fach-geschichte.png", accent: "#a65d38", subtitle: "Vergangenheit untersuchen und Gegenwart verstehen", materials: {} },
  "gl": { name: "Gesellschaftslehre", image: "../../assets/fach-gl.png", accent: "#24778e", subtitle: "Räume, Zeiten und Gesellschaft zusammendenken", materials: {} },
  "deutsch": { name: "Deutsch", image: "../../assets/fach-deutsch.png", accent: "#8d4e86", subtitle: "Lesen, schreiben, sprechen und Sprache untersuchen", materials: {} },
  "politik": { name: "Politik", image: "../../assets/fach-politik.png", accent: "#466a3b", subtitle: "Gesellschaft verstehen, urteilen und mitbestimmen", materials: {} }
};

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
const download = (f,teacher=false) => `<a class="unit-download ${teacher?'unit-download--teacher':''}" ${f.protectedId?`href="/konto/" data-protected="${esc(f.protectedId)}"`:`href="${esc(f.href)}" download`}><span class="download-label">${teacher?'Lehrkräfte · mit Freischaltung':'Schülermaterial · frei'} · PDF ↓</span><strong>${esc(f.label)}</strong><small>${esc(f.detail)}</small></a>`;
const facts = info => !info ? '' : `<dl class="unit-facts">${[['Lernziel',info.goal],['Dauer',info.duration],['Didaktisches Prinzip',info.principle],['Zielgruppe',info.audience],['Ergebnis',info.result],['Vorbereitung & Technik',info.preparation],['Voraussetzungen',info.prerequisites],['Sozialform',info.socialForm]].filter(([,v])=>v).map(([label,v])=>`<div><dt>${label}${label==='Lernziel'&&info.details?` <button class="goal-info" type="button" aria-label="Ausführliche Lernziele" data-goals="${esc(JSON.stringify(info.details))}">ⓘ</button>`:''}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;
const finalGrade=Math.max(10,...Object.keys(subject.materials).map(Number));
for(let grade=5;grade<=finalGrade;grade++){
 const themes=subject.materials[grade]||[];
 const details=document.createElement('details');details.className='grade';
 details.innerHTML=`<summary>Jahrgang ${grade}<span class="grade-count">${themes.length ? themes.length+(themes.length===1?' Thema':' Themen') : 'Noch keine Materialien'}</span></summary><div class="grade__content">${themes.length?themes.map(theme=>`<details class="theme-menu"><summary><strong>${esc(theme.title)}</strong><small>${esc(theme.description)}</small><span class="expand-hint">Materialien und Downloads anzeigen</span></summary><div class="theme-files">${theme.files.map(f=>`<article class="unit-row ${f.info?'has-info':''}">${f.preview&&!f.protectedId?`<button type="button" class="unit-preview" data-preview="${esc(f.preview)}" aria-label="Arbeitsplan vergrößern: ${esc(f.label)}"><img src="${esc(f.preview)}" alt="Vorschau: ${esc(f.label)}" loading="lazy"><span>Vergrößern</span></button>`:''}<div class="unit-links">${download(f,f.kind==='teacher')}${f.teacher?download(f.teacher,true):''}</div>${facts(f.info)}</article>`).join('')}</div></details>`).join(''):'<p class="empty">Für diesen Jahrgang werden Materialien nach und nach ergänzt.</p>'}</div>`;
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
const dialog=document.createElement('dialog');dialog.className='preview-dialog';dialog.innerHTML='<button type="button" class="preview-close" aria-label="Vorschau schließen">Schließen ×</button><img alt="Arbeitsplan-Vorschau">';
document.body.append(dialog);
dialog.querySelector('button').onclick=()=>dialog.close();
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
document.addEventListener('click',e=>{const b=e.target.closest('[data-preview]');if(b){dialog.querySelector('img').src=b.dataset.preview;dialog.showModal();}});
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
