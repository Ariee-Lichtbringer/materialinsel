(() => {
 const API = 'https://api-production-c1a79.up.railway.app';
 document.querySelectorAll('form[data-newsletter]').forEach(form => {
  const out = form.querySelector('.nl-status');
  form.addEventListener('submit', async ev => {
   ev.preventDefault();
   const email = form.querySelector('input[type=email]').value.trim();
   const consent = form.querySelector('input[type=checkbox]').checked;
   out.className = 'nl-status'; out.textContent = 'Wird gesendet …';
   try {
    const r = await fetch(API + '/newsletter', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({email, consent, source: form.dataset.newsletter})});
    const d = await r.json();
    out.textContent = d.message || d.error || 'Etwas ist schiefgelaufen.';
    out.classList.add(r.ok ? 'nl-status--ok' : 'nl-status--err');
    if (r.ok) form.querySelector('button').disabled = true;
   } catch (e) { out.textContent = 'Keine Verbindung. Bitte später erneut versuchen.'; out.classList.add('nl-status--err'); }
  });
 });
 const st = new URLSearchParams(location.search).get('status'), box = document.getElementById('nl-result');
 if (box && st) {
  const msg = {bestaetigt: ['Danke! Deine Anmeldung ist bestätigt.', 'Du bekommst ab jetzt eine E-Mail, wenn neue Mappen erscheinen.'],
   abgemeldet: ['Du bist abgemeldet.', 'Du bekommst keinen Newsletter mehr. Schade, dass du gehst!'],
   ungueltig: ['Dieser Link ist nicht mehr gültig.', 'Bitte melde dich einfach noch einmal an.']}[st];
  if (msg) { box.hidden = false; box.querySelector('h2').textContent = msg[0]; box.querySelector('p').textContent = msg[1]; }
 }
})();
