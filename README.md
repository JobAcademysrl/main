# www.jobacademysrl.com

Sito istituzionale di Job Academy srl: statico (GitHub Pages), stesso sistema visivo di microcredito.jobacademysrl.com e agenti.jobacademysrl.com, con il rosso del marchio come accento.

- `index.html`: chi siamo, i quattro settori, modulo "Cerchi personale?", banner microcredito, Diventa JAM, la sede (video e foto), contatti, dati societari.
- `privacy.html`, `cookie.html`, `note-legali.html`: pagine legali. Nessun cookie né strumento di terze parti, quindi nessun banner di consenso.
- `config.js`: progetto Supabase usato solo per il modulo aziende.
- `supabase/functions/richiesta-azienda`: funzione che manda la richiesta a info@jobacademyilma.com e la conferma al referente (stessi secret SMTP della piattaforma agenti). Già pubblicata.
- Collegamenti: i link verso microcredito portano `utm_source=jobacademysrl`; il modulo JAM apre la registrazione di agenti.jobacademysrl.com già compilata (nome, cognome, email, telefono).
- `og-src/`: sorgente dell'immagine di anteprima `og.png` (`node og-src/render.js`).
- Video e foto: dal reel della sede (`assets/video/sede.webm` e `.mp4`, ottimizzati, senza audio).

## Pubblicazione

GitHub *Settings → Pages*: branch `main`, cartella `/ (root)`. Il file `CNAME` imposta `www.jobacademysrl.com`.
DNS su IONOS: `www` CNAME → `jobacademysrl.github.io`; dominio senza www (`@`) record A verso 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153. I record di posta (MX) non vanno toccati.
