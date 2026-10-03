// Auswahl Bundesland / Schulabschluss / Prüfungsjahr und Heftliste für /eltern-schueler/
// Daten: window.elternHefte aus /eltern-hefte.js (gebaut mit site/scripts/build-eltern-hefte.cjs).
(function () {
  'use strict';
  var form = document.getElementById('family-picker');
  if (!form) return;

  var GENERISCH = [
    { id: 'esa', name: 'Erster Schulabschluss (ESA)', alias: ['ESA', 'HS', 'EBR'] },
    { id: 'msa', name: 'Mittlerer Schulabschluss (MSA)', alias: ['MSA', 'RS', 'MSA10'] }
  ];
  // zuerst: die Länder, für die Hefte entstehen (Abschlussnamen nach deutsch/eltern_zp/RECHERCHE.md)
  var LAENDER = [
    { id: 'nrw', name: 'Nordrhein-Westfalen', kurz: ['NRW', 'NW'], zuerst: true, abschluesse: [
      { id: 'eesa', name: 'ZP 10 – Erweiterter Erster Schulabschluss (EESA)', alias: ['EESA'] },
      { id: 'msa', name: 'ZP 10 – Mittlerer Schulabschluss (MSA)', alias: ['MSA', 'FOR'] }] },
    { id: 'he', name: 'Hessen', kurz: ['HE', 'HESSEN'], zuerst: true, abschluesse: [
      { id: 'hs', name: 'Hauptschulabschluss', alias: ['HS', 'ESA'] },
      { id: 'rs', name: 'Realschulabschluss', alias: ['RS', 'MSA'] }] },
    { id: 'by', name: 'Bayern', kurz: ['BY', 'BAYERN'], zuerst: true, abschluesse: [
      { id: 'quali', name: 'Quali (Kl. 9)', alias: ['QUALI', 'ESA'] },
      { id: 'm10', name: 'Mittlerer Schulabschluss M10', alias: ['M10'] },
      { id: 'rs', name: 'Realschulabschluss', alias: ['RS', 'MSA'] }] },
    { id: 'bw', name: 'Baden-Württemberg', kurz: ['BW'], zuerst: true, abschluesse: [
      { id: 'hs', name: 'Hauptschulabschluss (Kl. 9)', alias: ['HS', 'HSA', 'HSAP', 'ESA'] },
      { id: 'rs', name: 'Realschulabschluss (Kl. 10)', alias: ['RS', 'RSA', 'RSAP', 'MSA'] }] },
    { id: 'ni', name: 'Niedersachsen', kurz: ['NI', 'NDS'], zuerst: true, abschluesse: [
      { id: 'hs', name: 'Hauptschulabschluss Kl. 9/10', alias: ['HS', 'HS9', 'HS10', 'ESA'] },
      { id: 'rs', name: 'Realschulabschluss', alias: ['RS', 'MSA'] }] },
    { id: 'be', name: 'Berlin', kurz: ['BE'] },
    { id: 'bb', name: 'Brandenburg', kurz: ['BB'] },
    { id: 'hb', name: 'Bremen', kurz: ['HB'] },
    { id: 'hh', name: 'Hamburg', kurz: ['HH'] },
    { id: 'mv', name: 'Mecklenburg-Vorpommern', kurz: ['MV'] },
    { id: 'rp', name: 'Rheinland-Pfalz', kurz: ['RP'] },
    { id: 'sl', name: 'Saarland', kurz: ['SL'] },
    { id: 'sn', name: 'Sachsen', kurz: ['SN'] },
    { id: 'st', name: 'Sachsen-Anhalt', kurz: ['ST'] },
    { id: 'sh', name: 'Schleswig-Holstein', kurz: ['SH'] },
    { id: 'th', name: 'Thüringen', kurz: ['TH'] }
  ];
  var JAHRE = ['2027', '2028'];
  var LERNBEREICHE = ['Lesen & Verstehen', 'Schreiben & Überarbeiten', 'Sprache & Ausdruck'];
  var KEY = 'materialinsel-eltern-auswahl';
  var HEFTE = Array.isArray(window.elternHefte) ? window.elternHefte : [];

  var selLand = document.getElementById('fp-land');
  var selAbschluss = document.getElementById('fp-abschluss');
  var selJahr = document.getElementById('fp-jahr');
  var status = document.getElementById('family-status');
  var hint = document.getElementById('family-empty');
  var shareLink = document.getElementById('family-share');

  function esc(t) {
    return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function norm(t) { return String(t || '').normalize('NFKD').replace(/[^\x00-\x7F]/g, '').toUpperCase().replace(/[^A-Z0-9]/g, ''); }
  function land(id) { for (var i = 0; i < LAENDER.length; i++) if (LAENDER[i].id === id) return LAENDER[i]; return null; }
  function abschluesse(l) { return (l && l.abschluesse) || GENERISCH; }
  function abschluss(l, id) { var a = abschluesse(l); for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i]; return null; }

  // Länder-Auswahl füllen: zuerst die Länder mit Heften, dann alle weiteren
  function fillLaender() {
    var g1 = document.createElement('optgroup'); g1.label = 'Hefte zuerst für';
    var g2 = document.createElement('optgroup'); g2.label = 'Weitere Bundesländer';
    LAENDER.forEach(function (l) {
      var o = document.createElement('option'); o.value = l.id; o.textContent = l.name;
      (l.zuerst ? g1 : g2).appendChild(o);
    });
    selLand.appendChild(g1); selLand.appendChild(g2);
  }
  function fillAbschluesse(l, keep) {
    selAbschluss.innerHTML = '';
    var o0 = document.createElement('option'); o0.value = '';
    o0.textContent = l ? 'Abschluss wählen' : 'Erst Bundesland wählen';
    selAbschluss.appendChild(o0);
    if (!l) { selAbschluss.disabled = true; return; }
    abschluesse(l).forEach(function (a) {
      var o = document.createElement('option'); o.value = a.id; o.textContent = a.name; selAbschluss.appendChild(o);
    });
    selAbschluss.disabled = false;
    selAbschluss.value = keep && abschluss(l, keep) ? keep : '';
  }

  function passt(h, l, a, jahr) {
    var hl = norm(h.land_kurz), hn = norm(h.land);
    var landOk = norm(l.name) === hn || l.kurz.some(function (k) { return norm(k) === hl; });
    if (!landOk || String(h.pruefungsjahr || 2027) !== jahr) return false;
    var ak = norm(h.abschluss_kurz);
    return a.alias.some(function (x) { return norm(x) === ak; });
  }

  function karte(h) {
    var meta = [];
    if (h.seiten) meta.push(h.seiten + ' Seiten');
    if (h.preis) meta.push(h.preis);
    var knopf = h.url
      ? '<a class="fh-btn" href="' + esc(h.url) + '">Ansehen &amp; kaufen<span class="sr-only">: ' + esc(h.titel) + '</span></a>'
      : '<span class="fh-btn fh-btn--off" aria-disabled="true">Bald erhältlich</span>';
    return '<li class="fh-card"><p class="fh-teil">' + esc(h.pruefungsteil) + '</p><h4>' + esc(h.titel) + '</h4>' +
      (h.kurzbeschreibung ? '<p class="fh-desc">' + esc(h.kurzbeschreibung) + '</p>' : '') +
      '<p class="fh-meta">' + esc(meta.join(' · ')) + '</p>' + knopf + '</li>';
  }

  function hashFor(s) { return s.land && s.abschluss ? '#' + s.land + '-' + s.abschluss + '-' + s.jahr : ''; }
  function parseHash() {
    var m = /^#([a-z]+)-([a-z0-9]+)-(\d{4})$/.exec(location.hash || '');
    if (!m) return null;
    var l = land(m[1]);
    if (!l || !abschluss(l, m[2]) || JAHRE.indexOf(m[3]) < 0) return null;
    return { land: m[1], abschluss: m[2], jahr: m[3] };
  }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (s && land(s.land)) return { land: s.land, abschluss: abschluss(land(s.land), s.abschluss) ? s.abschluss : '', jahr: JAHRE.indexOf(s.jahr) >= 0 ? s.jahr : JAHRE[0] };
    } catch (e) {}
    return null;
  }

  function current() { return { land: selLand.value, abschluss: selAbschluss.value, jahr: selJahr.value || JAHRE[0] }; }

  function render() {
    var s = current(), l = land(s.land), a = l && abschluss(l, s.abschluss);
    document.querySelectorAll('.quick-land button').forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-land') === s.land ? 'true' : 'false');
    });
    var lists = {};
    document.querySelectorAll('[data-lernbereich]').forEach(function (el) { lists[el.getAttribute('data-lernbereich')] = el; });

    if (!l || !a) {
      status.textContent = l ? 'Wähle jetzt deinen Schulabschluss.' : 'Wähle oben dein Bundesland und deinen Schulabschluss. Dann siehst du hier die passenden Hefte.';
      LERNBEREICHE.forEach(function (lb) { if (lists[lb]) lists[lb].innerHTML = ''; });
      hint.hidden = true; shareLink.hidden = true;
      return;
    }
    var treffer = HEFTE.filter(function (h) { return passt(h, l, a, s.jahr); });
    var label = l.name + ' · ' + a.name + ' · Prüfung ' + s.jahr;
    status.textContent = treffer.length
      ? (treffer.length === 1 ? '1 Heft' : treffer.length + ' Hefte') + ' für ' + label + '.'
      : label + ': Hefte folgen.';
    LERNBEREICHE.forEach(function (lb) {
      var el = lists[lb]; if (!el) return;
      var hs = treffer.filter(function (h) { return h.lernbereich === lb; });
      el.innerHTML = hs.length ? hs.map(karte).join('')
        : (treffer.length ? '<li class="fh-none">Das Heft für diesen Lernbereich folgt.</li>' : '');
    });
    hint.hidden = treffer.length > 0;
    if (!treffer.length) {
      hint.querySelector('[data-empty-text]').textContent = l.zuerst
        ? 'Für ' + l.name + ' (' + a.name + ', Prüfung ' + s.jahr + ') erscheinen die Hefte bald. Wir arbeiten Land für Land und Abschluss für Abschluss. Schau bald wieder vorbei.'
        : 'Für ' + l.name + ' gibt es noch keine Hefte. Zuerst erscheinen sie für Nordrhein-Westfalen, Hessen, Bayern, Baden-Württemberg und Niedersachsen; weitere Länder folgen. Schau bald wieder vorbei.';
    }
    shareLink.hidden = false;
    shareLink.href = location.pathname + hashFor(s);
  }

  function update(fromUser) {
    var s = current();
    save(s);
    var h = hashFor(s);
    if (fromUser && history.replaceState) history.replaceState(null, '', h || location.pathname + location.search);
    render();
  }

  function apply(s) {
    selLand.value = s && land(s.land) ? s.land : '';
    fillAbschluesse(land(selLand.value), s && s.abschluss);
    selJahr.value = s && JAHRE.indexOf(s.jahr) >= 0 ? s.jahr : JAHRE[0];
  }

  fillLaender();
  apply(parseHash() || load());
  if (location.hash && parseHash()) save(current());
  render();

  selLand.addEventListener('change', function () { fillAbschluesse(land(selLand.value), selAbschluss.value); update(true); });
  selAbschluss.addEventListener('change', function () { update(true); });
  selJahr.addEventListener('change', function () { update(true); });
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  document.querySelectorAll('.quick-land button').forEach(function (b) {
    b.addEventListener('click', function () {
      selLand.value = b.getAttribute('data-land');
      fillAbschluesse(land(selLand.value), selAbschluss.value);
      update(true);
      selAbschluss.focus();
    });
  });
  window.addEventListener('hashchange', function () { var s = parseHash(); if (s) { apply(s); save(s); render(); } });
})();
