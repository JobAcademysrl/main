(function () {
  var d = document, cfg = window.JA_CONFIG || {};
  d.documentElement.classList.add('js');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var y = d.getElementById('anno'); if (y) y.textContent = new Date().getFullYear();

  // reveal on scroll, staggered among siblings
  var els = d.querySelectorAll('.reveal, .unveil, .sector');
  els.forEach(function (el) {
    var sibs = [].filter.call(el.parentNode.children, function (c) { return c.classList.contains('reveal') || c.classList.contains('unveil'); });
    if (sibs.indexOf(el) >= 0) el.style.setProperty('--d', Math.min(sibs.indexOf(el), 6) * 90 + 'ms');
  });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }); }, { rootMargin: '0px 0px -10% 0px' });
    els.forEach(function (el) { io.observe(el); });
  } else els.forEach(function (el) { el.classList.add('in'); });

  // nav shadow, sector cards shrinking as the next one stacks over them
  var nav = d.querySelector('.nav'), cards = [].slice.call(d.querySelectorAll('.sector')), ticking = false;
  function update() {
    ticking = false;
    if (nav) nav.classList.toggle('scrolled', scrollY > 8);
    if (reduce || innerWidth <= 860) { cards.forEach(function (c) { c.style.transform = ''; c.style.filter = ''; }); return; }
    cards.forEach(function (c, i) {
      var next = cards[i + 1]; if (!next) return;
      var p = Math.max(0, Math.min(1, 1 - (next.getBoundingClientRect().top - c.getBoundingClientRect().top) / c.offsetHeight));
      c.style.transform = 'scale(' + (1 - p * 0.06).toFixed(3) + ')';
      c.style.filter = 'brightness(' + (1 - p * 0.25).toFixed(3) + ')';
    });
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', update);
  update();
  if (reduce) d.querySelectorAll('video[autoplay]').forEach(function (v) { v.removeAttribute('autoplay'); v.pause(); v.controls = true; });

  function stop(form, msg, field) {
    var err = form.querySelector('.err'); err.textContent = msg;
    if (field && field.focus) field.focus();
    err.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
  function firstInvalid(form) { return [].filter.call(form.querySelectorAll('[required]'), function (i) { return !i.checkValidity(); })[0]; }

  // ---------- companies looking for staff ----------
  var az = d.getElementById('azienda'), opened = Date.now();
  if (az) az.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = firstInvalid(az);
    if (bad) {
      var label = bad.closest('label') ? bad.closest('label').firstChild.textContent.trim() : bad.name === 'estero' ? 'se accettate lavoratori dall\'estero' : bad.name === 'alloggio' ? "l'alloggio" : 'un campo';
      return stop(az, 'Manca o non è valido: ' + label.toLowerCase() + '.', bad);
    }
    var data = {}; new FormData(az).forEach(function (v, k) { data[k] = v; });
    data.aperto_da_ms = Date.now() - opened;
    var btn = az.querySelector('button[type=submit]'); btn.disabled = true; btn.textContent = 'Invio in corso…';
    az.querySelector('.err').textContent = '';
    fetch(cfg.supabaseUrl + '/functions/v1/richiesta-azienda', {
      method: 'POST', headers: { 'Content-Type': 'application/json', apikey: cfg.supabaseKey, Authorization: 'Bearer ' + cfg.supabaseKey },
      body: JSON.stringify(data)
    }).then(function (r) { return r.json().then(function (j) { if (!r.ok || !j.ok) throw new Error(j.error || 'invio'); }); })
      .then(function () {
        d.getElementById('az-card').innerHTML = '<div class="ok-box"><h3>Richiesta inviata</h3><p style="margin:0">Grazie. Ti abbiamo mandato una conferma via email e ti ricontattiamo a breve per parlare dei profili che cerchi.</p></div>';
      }).catch(function () {
        stop(az, 'Invio non riuscito. Riprova tra poco oppure scrivici a info@jobacademyilma.com.');
        btn.disabled = false; btn.textContent = 'Invia la richiesta';
      });
  });

  // ---------- email button: mailto does nothing without a mail app, so also copy the address ----------
  var mb = d.getElementById('mail-btn');
  if (mb) mb.addEventListener('click', function () {
    var note = d.getElementById('mail-note');
    if (navigator.clipboard) navigator.clipboard.writeText('info@jobacademyilma.com').then(function () {
      if (note) note.innerHTML = 'Indirizzo <strong>info@jobacademyilma.com</strong> copiato: se non si apre la tua app di posta, incollalo in una nuova email · <a href="https://mail.google.com/mail/?view=cm&amp;to=info@jobacademyilma.com&amp;su=Richiesta%20informazioni%20dal%20sito" target="_blank" rel="noopener">scrivi da Gmail</a>';
    }).catch(function () {});
  });

  // ---------- JAM: hand the data over to the agents platform, which pre-fills its registration ----------
  var jam = d.getElementById('jam-form');
  if (jam) jam.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = firstInvalid(jam);
    if (bad) return stop(jam, 'Compila nome, cognome, email e telefono.', bad);
    var q = new URLSearchParams({ nome: jam.nome.value.trim(), cognome: jam.cognome.value.trim(), email: jam.email.value.trim(), telefono: jam.telefono.value.trim(), utm_source: 'jobacademysrl', utm_medium: 'jam' });
    location.href = cfg.agentiUrl + '?' + q.toString() + '#iscriviti';
  });
})();
