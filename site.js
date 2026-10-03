// Keep previously shared homepage section links usable after moving the areas.
if(location.pathname==='/'||location.pathname==='/index.html'){
 const previousArea={'#lehrkraefte':'/lehrkraefte/','#mappen':'/lehrkraefte/#mappen','#gratis':'/lehrkraefte/#gratis','#eltern-schueler':'/eltern-schueler/'}[location.hash];
 if(previousArea)location.replace(previousArea);
}
(() => {
 const book='<svg class="brand-icon" viewBox="0 0 120 120" aria-hidden="true"><rect x="2" y="2" width="116" height="116" rx="30" fill="#153a36"/><path d="M24 78 L24 40 L42 58 L60 34 L78 58 L96 40 L96 78" fill="none" stroke="#fff" stroke-width="9" stroke-linejoin="round" stroke-linecap="round"/><circle cx="60" cy="22" r="7" fill="#e8a46e"/><path d="M18 92 q10.5 -7 21 0 t21 0 t21 0 t21 0" fill="none" stroke="#5fb3a6" stroke-width="5" stroke-linecap="round"/></svg>';
 if(!document.querySelector('link[rel=icon]')){const fav=document.createElement('link');fav.rel='icon';fav.type='image/svg+xml';fav.href='/assets/favicon.svg';document.head.append(fav);}
 const header=document.createElement('header');header.className='site-header';
 header.innerHTML=`<div class="site-bar"><a class="brand" href="/">${book}<span>Materialinsel</span></a><nav id="site-navigation" aria-label="Hauptnavigation"><a href="/lehrkraefte/">Für Lehrkräfte</a><a href="/eltern-schueler/">Für Eltern &amp; Schüler</a><a href="/lehrkraefte/#mappen">Mappen-Shop</a><a href="https://erinnernesr-production.up.railway.app/" target="_blank" rel="noopener">Gedenkstättenfahrten</a><a href="/ueber-mich/">Über mich</a></nav><a class="account-link" data-account-link href="/konto/">Anmelden / Account anlegen</a><button class="menu-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="site-navigation">☰</button></div>`;
 document.body.prepend(header);
 const toggle=header.querySelector('.menu-toggle');toggle.onclick=()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Menü schließen':'Menü öffnen');header.classList.toggle('menu-open',open);};
 header.querySelector('nav').addEventListener('click',()=>{toggle.setAttribute('aria-expanded','false');header.classList.remove('menu-open');});
 let footer=document.querySelector('footer');if(!footer){footer=document.createElement('footer');document.body.append(footer);}
 footer.className='site-footer';footer.innerHTML=`<div><a class="brand" href="/">${book}<span>Materialinsel</span></a><p>Material für guten Unterricht. Neue Lernwege für zu Hause.</p><small>© Materialinsel</small></div><div><strong>Entdecken</strong><a href="/lehrkraefte/">Für Lehrkräfte</a><a href="/eltern-schueler/">Für Eltern &amp; Schüler</a><a href="/faecher/geschichte/">Geschichte</a><a href="/faecher/praktische-philosophie/">Praktische Philosophie</a><a href="/faecher/deutsch/">Deutsch</a><a href="/lehrkraefte/#mappen">Alle Mappen</a><a href="/projekte/wfu-zweitzeugen/">Projekte & Kurse</a><a href="https://erinnernesr-production.up.railway.app/" target="_blank" rel="noopener">Gedenkstättenfahrten ↗</a><a href="/ueber-mich/">Über mich</a></div><div><strong>Lehrkräftebereich</strong><a href="/konto/">Anmelden & Registrieren</a><a href="/admin.html">Adminbereich</a><a href="/agb/">AGB und Widerruf</a><a href="/impressum/">Impressum</a><a href="/konto/datenschutz.html">Datenschutzhinweise</a><a href="mailto:shop@materialinsel.de">Kontakt</a></div>`;
})();

(() => {
 if(location.pathname.startsWith('/konto/')||location.pathname.includes('admin')||navigator.doNotTrack==='1'||navigator.globalPrivacyControl)return;
 const API='https://api-production-c1a79.up.railway.app/events';
 function send(kind,key){fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind,key}),keepalive:true,credentials:'omit'}).catch(()=>{});}
 if(!location.hostname.endsWith('materialinsel.de'))return;
 send('pageview',location.pathname);
 document.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(!a||a.dataset.protected)return;try{const u=new URL(a.href,location.href);if(u.origin===location.origin&&u.pathname.startsWith('/materialien/')&&u.pathname.endsWith('.pdf'))send('public_download',decodeURIComponent(u.pathname));}catch{};});
})();
