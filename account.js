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
   if(!r.ok){const d=await r.json();throw Error(d.error||'Download nicht möglich.');}
   const url=URL.createObjectURL(await r.blob());const a=document.createElement('a');a.href=url;a.download=link.dataset.protected+'.pdf';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
  }catch(err){showNotice(err.message);}finally{link.removeAttribute('aria-busy');}
 });
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
   root.innerHTML=`<h2>Hallo ${esc(current.name)}</h2><p class="account-status">${current.status==='approved'?'Freigeschaltet · Lehrkräftematerialien verfügbar':'Freischaltung ausstehend · Julia prüft deine Anfrage'}</p><p>${esc(current.email)} · ${esc(current.school)}</p><p><a href="${esc(sessionStorage.getItem('materialinsel-return')?.startsWith('/faecher/')?sessionStorage.getItem('materialinsel-return'):'/faecher/geschichte/')}">Zu den Materialien →</a></p><button type="button" data-logout>Abmelden</button><p role="status" data-message></p>${current.role==='admin'?'<section class="account-admin"><h2>Konten freischalten</h2><p>Name, Schule und E-Mail sind Selbstauskünfte. Prüfe vor der Freischaltung, dass die Person eine Lehrkraft ist. Die E-Mail-Adresse wurde nicht automatisch verifiziert.</p><div data-users></div></section>':''}<p class="account-help">Passwort vergessen oder Konto löschen lassen? <a href="mailto:sonnenwaldju@gmail.com">Julia kontaktieren</a>.</p>`;
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
