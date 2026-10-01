(() => {
 const API='https://api-production-c1a79.up.railway.app';
 const token=()=>sessionStorage.getItem('materialinsel-session')||'';
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 async function call(path,data,method){
  const response=await fetch(API+path,{method:method||(data?'POST':'GET'),headers:{...(data?{'Content-Type':'application/json'}:{}),...(token()?{Authorization:'Bearer '+token()}:{})},...(data?{body:JSON.stringify(data)}:{})});
  const result=await response.json();if(!response.ok)throw Error(result.error||'Die Anfrage konnte nicht abgeschlossen werden.');return result;
 }
 const accountLink=document.querySelector('[data-account-link]');
 let current=null;
 async function loadUser(){if(!token())return null;try{current=(await call('/me')).user;if(accountLink)accountLink.textContent=current.role==='admin'?'Konto & Freischaltungen':'Mein Konto';return current;}catch(e){sessionStorage.removeItem('materialinsel-session');return null;}}
 const ready=loadUser();
 document.addEventListener('click',async e=>{
  const link=e.target.closest('[data-protected]');if(!link)return;e.preventDefault();
  await ready;
  if(!token()){sessionStorage.setItem('materialinsel-return',location.pathname);location.href='/konto/';return;}
  link.setAttribute('aria-busy','true');
  try{
   const r=await fetch(API+'/download/'+encodeURIComponent(link.dataset.protected),{headers:{Authorization:'Bearer '+token()}});
   if(!r.ok){const d=await r.json();if(r.status===402&&d.code==='purchase_required'){openPurchase(d.product,()=>link.click());return;}throw Error(d.error||'Download nicht möglich.');}
   const url=URL.createObjectURL(await r.blob());const a=document.createElement('a');a.href=url;a.download=link.dataset.protected+'.pdf';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
  }catch(err){showNotice(err.message);}finally{link.removeAttribute('aria-busy');}
 });

 // ---------- Shop: Mappen einzeln kaufen (PayPal) ----------
 let shop={enabled:false,products:{}},owned=new Set(),fileProduct={};
 const price=(c,cur)=>(c/100).toLocaleString('de-DE',{style:'currency',currency:cur||'EUR'});
 const shopReady=(async()=>{try{shop=await (await fetch(API+'/shop')).json();for(const [pid,p] of Object.entries(shop.products||{}))for(const f of p.files)fileProduct[f]=pid;}catch(e){}
  await ready;if(shop.enabled&&token()){try{owned=new Set((await call('/purchases')).products);}catch(e){}}decorate();})();
 function decorate(){
  if(!shop.enabled)return;
  document.querySelectorAll('.theme-menu').forEach(theme=>{
   const first=theme.querySelector('[data-protected]');const pid=first&&fileProduct[first.dataset.protected];if(!pid)return;
   theme.querySelectorAll('[data-protected] .download-label').forEach(l=>{l.textContent=l.textContent.replace('mit Freischaltung',owned.has(pid)?'gekauft':'nach Kauf');});
   const summary=theme.querySelector(':scope>summary');if(summary&&!summary.querySelector('.shop-price')){const tag=document.createElement('span');tag.className='shop-price';tag.textContent=owned.has(pid)?'✓ Gekauft':'Komplette Mappe · '+price(shop.products[pid].price,shop.products[pid].currency);summary.append(tag);}
   const box=theme.querySelector(':scope>div')||theme;if(box.querySelector('.shop-bar'))return;
   const bar=document.createElement('div');bar.className='shop-bar'+(owned.has(pid)?' is-owned':'');
   bar.innerHTML=owned.has(pid)?'<strong>✓ Diese Mappe gehört dir.</strong> Alle Lehrkräfte- und Schülerdownloads dieser Mappe sind freigeschaltet.':`<div><strong>Komplette Mappe kaufen · ${esc(price(shop.products[pid].price,shop.products[pid].currency))}</strong><small>Einmalig bezahlen, alle Downloads dieser Mappe dauerhaft in deinem Konto. Musterseiten kannst du vorher ansehen.</small></div><button type="button" data-buy="${esc(pid)}">Jetzt kaufen</button>`;
   box.prepend(bar);
  });
 }
 document.addEventListener('click',e=>{const b=e.target.closest('[data-buy]');if(!b)return;e.preventDefault();openPurchase(b.dataset.buy,()=>location.reload());});
 document.addEventListener('toggle',()=>decorate(),true);
 let sdk=null;
 function loadSdk(){if(window.paypal)return Promise.resolve();if(sdk)return sdk;sdk=new Promise((ok,fail)=>{const s=document.createElement('script');s.src='https://www.paypal.com/sdk/js?client-id='+encodeURIComponent(shop.clientId)+'&currency=EUR&intent=capture&locale=de_DE&components=buttons&disable-funding=sepa,paylater';s.onload=ok;s.onerror=()=>fail(Error('PayPal konnte nicht geladen werden.'));document.head.append(s);});return sdk;}
 async function openPurchase(pid,done){
  await shopReady;const p=shop.products[pid];if(!p||!shop.enabled){showNotice('Der Kauf ist gerade nicht möglich.');return;}
  if(!token()){sessionStorage.setItem('materialinsel-return',location.pathname);location.href='/konto/';return;}
  if(current&&current.status!=='approved'){showNotice('Dein Konto wartet noch auf Freischaltung. Danach kannst du Mappen kaufen.');return;}
  document.querySelector('#shop-dialog')?.remove();
  const d=document.createElement('dialog');d.id='shop-dialog';d.className='shop-dialog';
  d.innerHTML=`<form method="dialog" class="shop-close"><button aria-label="Schließen">×</button></form><p class="eyebrow">MAPPE KAUFEN</p><h2>${esc(p.title)}</h2><p class="shop-total">${esc(price(p.price,p.currency))} <small>Endpreis</small></p><p class="shop-tax">Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.</p><p>Nach der Zahlung sind alle Downloads dieser Mappe sofort und dauerhaft in deinem Konto freigeschaltet. Die Bestellbestätigung kommt per E-Mail.</p><label class="shop-consent"><input type="checkbox" data-consent> Ich stimme ausdrücklich zu, dass die Materialinsel vor Ablauf der Widerrufsfrist mit der Bereitstellung der digitalen Inhalte beginnt. Mir ist bekannt, dass ich dadurch mein Widerrufsrecht verliere.</label><p class="shop-legal">Es gelten die <a href="/agb/" target="_blank">AGB</a> und die <a href="/agb/#widerruf" target="_blank">Widerrufsbelehrung</a>. Hinweise zu PayPal in der <a href="/konto/datenschutz.html" target="_blank">Datenschutzerklärung</a>.</p><div data-paypal class="shop-paypal"></div><p role="status" class="shop-status" data-status></p>`;
  document.body.append(d);d.showModal();
  const status=t=>d.querySelector('[data-status]').textContent=t;const consent=d.querySelector('[data-consent]');
  try{await loadSdk();}catch(e){status(e.message);return;}
  window.paypal.Buttons({style:{layout:'vertical',label:'buynow'},
   onInit:(_,actions)=>{actions.disable();consent.onchange=()=>consent.checked?actions.enable():actions.disable();},
   onClick:()=>{if(!consent.checked)status('Bitte zuerst das Kästchen zur sofortigen Bereitstellung bestätigen.');},
   createOrder:async()=>{status('');return (await call('/paypal/order',{product:pid,consent:true})).id;},
   onApprove:async data=>{status('Zahlung wird bestätigt …');try{await call('/paypal/capture',{orderID:data.orderID});owned.add(pid);status('Vielen Dank! Die Mappe ist freigeschaltet.');setTimeout(()=>{d.close();d.remove();done&&done();},1200);}catch(err){status(err.message);}},
   onCancel:()=>status('Zahlung abgebrochen. Es wurde nichts abgebucht.'),
   onError:err=>status((err&&err.message)||'Bei PayPal ist ein Fehler aufgetreten.')}).render(d.querySelector('[data-paypal]'));
 }
 function showNotice(text){let box=document.querySelector('#account-notice');if(!box){box=document.createElement('div');box.id='account-notice';box.className='account-notice';box.setAttribute('role','alert');document.body.append(box);}box.replaceChildren(document.createTextNode(text+' '));const a=document.createElement('a');a.href='/konto/';a.textContent='Zum Konto';box.append(a);const close=document.createElement('button');close.textContent='×';close.setAttribute('aria-label','Hinweis schließen');close.onclick=()=>box.remove();box.append(close);}
 const root=document.querySelector('[data-account]');if(!root)return;
 const adminPage=root.hasAttribute('data-admin-page');
 const msg=(s,error=false)=>{const box=root.querySelector('[data-message]');box.textContent=s;box.classList.toggle('is-error',error);};
 function bind(form,handler){form.onsubmit=async e=>{e.preventDefault();const button=form.querySelector('[type=submit]');button.disabled=true;try{await handler(Object.fromEntries(new FormData(form)));}catch(err){msg(err.message,true);}finally{button.disabled=false;}};}
 const fragment=new URLSearchParams(location.hash.slice(1));const setup=fragment.get('setup'),reset=fragment.get('reset');
 if(setup||reset){history.replaceState(null,'',location.pathname);root.innerHTML=`<h2>${setup?'Deinen Verwaltungszugang einrichten':'Neues Passwort festlegen'}</h2><p>Dieser Link kann nur einmal verwendet werden.</p><form>${setup?'<label>E-Mail<input name="email" type="email" required autocomplete="email" maxlength="254"></label>':''}<label>Neues Passwort · mindestens 12 Zeichen<input name="password" type="password" minlength="12" maxlength="200" required autocomplete="new-password"></label><button type="submit">${setup?'Verwaltung aktivieren':'Passwort speichern'}</button></form><p role="status" data-message></p>`;bind(root.querySelector('form'),async d=>{await call(setup?'/setup':'/reset',{...d,token:setup||reset});root.innerHTML='<h2>Gespeichert</h2><p>Du kannst dich jetzt mit deiner E-Mail und deinem Passwort anmelden.</p><a href="/konto/">Zur Anmeldung</a>';});return;}
 async function render(){
  await ready;
  if(current){
   if(adminPage&&current.role!=='admin'){root.innerHTML='<h2>Verwaltungszugang erforderlich</h2><p>Du bist mit einem Lehrkräftekonto angemeldet. Nur die Administration kann Accounts freischalten.</p><a href="/konto/">Zu deinem Konto</a>';return;}
   if(adminPage&&current.role==='admin'&&window.MaterialAdmin){await window.MaterialAdmin.mount(root,{call,current,logout:async()=>{try{await call('/logout',{});}catch{}sessionStorage.removeItem('materialinsel-session');location.reload();}});return;}
   root.innerHTML=`<h2>Hallo ${esc(current.name)}</h2><p class="account-status">${current.status==='approved'?'Freigeschaltet · Lehrkräftematerialien verfügbar':'Freischaltung ausstehend · Julia prüft deine Anfrage'}</p><p>${esc(current.email)} · ${esc(current.school)}</p><p><a href="${esc(sessionStorage.getItem('materialinsel-return')?.startsWith('/faecher/')?sessionStorage.getItem('materialinsel-return'):'/faecher/geschichte/')}">Zu den Materialien →</a></p><button type="button" data-logout>Abmelden</button><p role="status" data-message></p>${current.role==='admin'?'<section class="account-admin"><p><a class="button" href="/admin.html">Adminübersicht & Statistik →</a></p><h2>Konten freischalten</h2><p>Name, Schule und E-Mail sind Selbstauskünfte. Prüfe vor der Freischaltung, dass die Person eine Lehrkraft ist. Die E-Mail-Adresse wurde nicht automatisch verifiziert.</p><div data-users></div></section>':''}<p class="account-help">Passwort vergessen oder Konto löschen lassen? <a href="mailto:sonnenwaldju@gmail.com">Julia kontaktieren</a>.</p>`;
   shopReady.then(async()=>{if(!shop.enabled)return;const sec=document.createElement('section');sec.className='shop-owned';
    if(current.role==='admin'){try{const r=await call('/admin/purchases');sec.innerHTML='<h3>Verkäufe</h3>'+(r.purchases.length?'<ul>'+r.purchases.map(p=>`<li>${esc(new Date(p.created*1000).toLocaleDateString('de-DE'))} · ${esc(p.title)} · ${esc(p.name)} (${esc(p.email)}) · ${p.source==='paypal'?esc(price(p.amount,p.currency)):'manuell freigegeben'}</li>`).join('')+'</ul>':'<p>Noch keine Verkäufe.</p>');}catch(e){return;}}
    else{const list=[...owned].map(pid=>shop.products[pid]?.title).filter(Boolean);sec.innerHTML='<h3>Meine Mappen</h3>'+(list.length?'<ul>'+list.map(t=>`<li>${esc(t)}</li>`).join('')+'</ul>':'<p>Du hast noch keine Mappe gekauft. Auf den Fachseiten kannst du einzelne Mappen kaufen.</p>');}
    root.append(sec);});
   root.querySelector('[data-logout]').onclick=async()=>{try{await call('/logout',{});}catch{}sessionStorage.removeItem('materialinsel-session');location.reload();};
   if(current.role==='admin')await loadAdmin();return;
  }
  root.innerHTML='<div class="account-columns"><section><h2>Anmelden</h2><form data-login><label>E-Mail<input type="email" name="email" required autocomplete="username"></label><label>Passwort<input type="password" name="password" required autocomplete="current-password"></label><button type="submit">Anmelden</button></form><p class="account-help">Passwort vergessen? <a href="mailto:sonnenwaldju@gmail.com">Julia kontaktieren</a>.</p></section><section><h2>Account anlegen</h2><p>Für Lehrkräfte. Nach der persönlichen Prüfung schaltet Julia dein Konto frei.</p><form data-register><label>Name<input name="name" required minlength="2" maxlength="120" autocomplete="name"></label><label>Schule / Bildungseinrichtung<input name="school" required minlength="2" maxlength="200" autocomplete="organization"></label><label>E-Mail<input type="email" name="email" required maxlength="254" autocomplete="email"></label><label>Passwort · mindestens 12 Zeichen<input type="password" name="password" minlength="12" maxlength="200" required autocomplete="new-password"></label><p class="account-help">Die Angaben werden für dein Konto und die Prüfung des Lehrkräftezugangs gespeichert. <a href="/konto/datenschutz.html">Datenschutzhinweise</a></p><button type="submit">Konto beantragen</button></form></section></div><p role="status" aria-live="polite" data-message></p>';
  if(adminPage){root.querySelector('[data-register]').closest('section').remove();root.querySelector('h2').textContent='Als Administratorin anmelden';}
  bind(root.querySelector('[data-login]'),async d=>{const result=await call('/login',d);sessionStorage.setItem('materialinsel-session',result.token);location.reload();});
  if(!adminPage)bind(root.querySelector('[data-register]'),async d=>{const r=await call('/register',d);root.querySelector('[data-register]').reset();msg(r.message);});
 }
 async function loadAdmin(){const data=await call('/admin/users');const container=root.querySelector('[data-users]');
  const users=data.users.filter(u=>u.role!=='admin');
  const pending=users.filter(u=>u.status==='pending').length;
  container.innerHTML=`<p class="account-status">${pending} offene Anfrage${pending===1?'':'n'} · ${users.filter(u=>u.status==='approved').length} freigeschaltet · ${users.filter(u=>u.status==='blocked').length} gesperrt</p>` + (users.sort((a,b)=>({pending:0,approved:1,blocked:2}[a.status]-{pending:0,approved:1,blocked:2}[b.status])).map(u=>`<article class="account-person"><strong>${esc(u.name)}</strong><span>${esc(u.school)} · ${esc(u.email)}</span><small>${({pending:'Wartet auf Freischaltung',approved:'Freigeschaltet',blocked:'Gesperrt'})[u.status]}</small><div class="account-actions">${u.status!=='approved'?`<button data-id="${esc(u.id)}" data-status="approved">Freischalten</button>`:`<button data-id="${esc(u.id)}" data-status="blocked">Sperren</button>`}<button data-reset="${esc(u.id)}">Passwort-Link</button><button data-delete="${esc(u.id)}">Konto löschen</button></div></article>`).join('')||'<p>Es liegen noch keine Anfragen vor.</p>');
  container.onclick=async e=>{const b=e.target.closest('button');if(!b)return;b.disabled=true;try{
   if(b.dataset.status){await call('/admin/users/'+b.dataset.id,{status:b.dataset.status},'PATCH');await loadAdmin();msg('Kontostatus aktualisiert.');}
   if(b.dataset.reset){const d=await call('/admin/users/'+b.dataset.reset+'/reset',{});const url=location.origin+'/konto/#reset='+d.token;msg('Passwort-Link (24 Stunden gültig). Nur der betreffenden Person persönlich weitergeben: '+url);}
   if(b.dataset.delete&&confirm('Dieses Konto und seine Anmeldungen dauerhaft löschen?')){await call('/admin/users/'+b.dataset.delete,{},'DELETE');await loadAdmin();msg('Konto gelöscht.');}
  }catch(err){msg(err.message,true);}finally{b.disabled=false;}};
 }
 render().catch(e=>{root.innerHTML='<p role="alert">Der Kontobereich ist momentan nicht erreichbar. Bitte später erneut versuchen.</p>';});
})();
