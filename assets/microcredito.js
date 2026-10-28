// Landing microcredito: the form writes the request as a message and opens it in WhatsApp or in the visitor's email.
// Nothing is sent from the page itself, so the confirmation asks the visitor to press Send.
(function () {
  var d = document, form = d.getElementById('lead');
  if (!form) return;
  var WA = '393501591719', MAIL = 'info@jobacademyilma.com', SUBJECT = 'Richiesta informazioni microcredito';
  var q = new URLSearchParams(location.search);
  var source = ['utm_source', 'utm_medium', 'utm_campaign'].map(function (k) { return q.get(k); }).filter(Boolean).join(' / ');

  function stop(msg, field) {
    var err = form.querySelector('.err'); err.textContent = msg;
    if (field && field.focus) field.focus();
    err.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
  function message() {
    var v = function (n) { var el = form.elements[n]; return el ? String(el.value || '').trim() : ''; };
    var lines = [
      'Ciao, vorrei informazioni sul microcredito.',
      '',
      'Chi sono: ' + v('chi'),
      'Nome e cognome: ' + v('nome'),
      'Telefono: ' + v('telefono'),
      'Città: ' + v('citta'),
      'Forma dell\'impresa: ' + v('forma')
    ];
    if (v('importo')) lines.push('Importo che mi interessa: ' + v('importo'));
    if (v('progetto')) lines.push('Il progetto: ' + v('progetto'));
    lines.push('', 'Ho letto l\'informativa privacy e acconsento al trattamento dei dati per ricevere informazioni.');
    lines.push('Da: jobacademysrl.com/microcredito' + (source ? ' (' + source + ')' : ''));
    return lines.join('\n');
  }
  function box(html) {
    var ok = d.getElementById('lead-ok');
    if (!ok) { ok = d.createElement('div'); ok.id = 'lead-ok'; ok.className = 'ok-box'; ok.setAttribute('aria-live', 'polite'); form.appendChild(ok); }
    ok.innerHTML = html;
    ok.scrollIntoView({ block: 'center', behavior: 'smooth' });
    return ok;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var via = e.submitter && e.submitter.getAttribute('data-via') || 'whatsapp';
    var bad = [].filter.call(form.querySelectorAll('[required]'), function (i) { return !i.checkValidity(); })[0];
    if (bad) {
      var label = bad.name === 'chi' ? 'chi sei' : bad.name === 'consenso' ? 'il consenso privacy' : bad.closest('label').firstChild.textContent.trim().toLowerCase();
      return stop('Manca o non è valido: ' + label + '.', bad);
    }
    form.querySelector('.err').textContent = '';
    var text = message();

    if (via === 'whatsapp') {
      var url = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text);
      window.open(url, '_blank', 'noopener');
      box('<h3>Ci sei quasi</h3><p style="margin:0 0 10px">Abbiamo aperto WhatsApp con il messaggio già scritto: premi <strong>Invia</strong> per mandarcelo. Ti rispondiamo il prima possibile.</p>' +
        '<p style="margin:0"><a class="btn btn-sm btn-wa" href="' + url + '" target="_blank" rel="noopener">Non si è aperto? Apri WhatsApp</a></p>');
    } else {
      var mailto = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(SUBJECT) + '&body=' + encodeURIComponent(text);
      var gmail = 'https://mail.google.com/mail/?view=cm&to=' + MAIL + '&su=' + encodeURIComponent(SUBJECT) + '&body=' + encodeURIComponent(text);
      location.href = mailto;
      var ok = box('<h3>Ci sei quasi</h3><p style="margin:0 0 10px">Si apre la tua app di posta con il messaggio già scritto per ' + MAIL + ': premi <strong>Invia</strong> per mandarcelo.</p>' +
        '<p style="margin:0;display:flex;flex-wrap:wrap;gap:8px"><a class="btn btn-sm" href="' + gmail + '" target="_blank" rel="noopener">Scrivi da Gmail</a><button class="btn btn-sm btn-outline" type="button" id="copy-msg">Copia il messaggio</button></p>');
      ok.querySelector('#copy-msg').addEventListener('click', function () {
        var b = this;
        if (navigator.clipboard) navigator.clipboard.writeText(text).then(function () { b.textContent = 'Messaggio copiato'; }).catch(function () { b.textContent = 'Copia non riuscita'; });
      });
    }
  });
})();
