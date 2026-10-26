// Staff request from www.jobacademysrl.com (#aziende): email to Job Academy with all details, receipt to the requester.
// Same SMTP secrets as notifica-cliente (SMTP_USER, SMTP_PASS); port 465 because Supabase blocks 25 and 587.
import nodemailer from "npm:nodemailer@6.9.16";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const ADMIN = Deno.env.get("ADMIN_EMAIL") ?? "info@jobacademyilma.com";
const esc = (s: unknown) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
const CAMPI: [string, string, boolean][] = [
  ["ragione_sociale", "Ragione sociale", true], ["partita_iva", "Partita IVA", false], ["settore", "Settore", true],
  ["sede", "Sede di lavoro", true], ["dimensione", "Dimensione", true], ["referente", "Referente", true], ["ruolo", "Ruolo", true],
  ["email", "Email", true], ["telefono", "Telefono", true], ["profili", "Profili e mansioni", true], ["numero", "Persone", true],
  ["quando", "Quando", true], ["contratto", "Contratto", true], ["lingue", "Lingue", false],
  ["estero", "Lavoratori dall'estero", true], ["alloggio", "Alloggio", true], ["note", "Note", false],
];

// Reads the secrets tolerating the usual slips (lowercase or padded names, spaces inside the app password).
// On failure it logs only which SMTP-like secret names exist, never their values.
function smtpCredenziali() {
  const env = Deno.env.toObject();
  const trova = (nome: string) => {
    const k = Object.keys(env).find((k) => k.trim().toUpperCase() === nome);
    return k ? env[k].trim() : "";
  };
  const user = trova("SMTP_USER"), pass = trova("SMTP_PASS").replace(/\s+/g, "");
  if (!user || !pass) {
    const nomi = Object.keys(env).filter((k) => /smtp|mail|pass/i.test(k));
    throw new Error(`credenziali SMTP mancanti: SMTP_USER ${user ? "ok" : "assente"}, SMTP_PASS ${pass ? "ok" : "assente"}; segreti simili trovati: ${nomi.join(", ") || "nessuno"}`);
  }
  return { user, pass };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
  try {
    const d = await req.json();
    // filled in under 3 seconds: almost certainly an automated submission
    if (!(Number(d.aperto_da_ms) >= 3000)) return json({ ok: false, error: "riprova" }, 400);
    if (d.consenso !== "on") return json({ ok: false, error: "consenso" }, 400);
    for (const [k, , req] of CAMPI) {
      const v = String(d[k] ?? "").trim();
      if (req && !v) return json({ ok: false, error: `manca ${k}` }, 400);
      if (v.length > 2000) return json({ ok: false, error: `troppo lungo ${k}` }, 400);
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(d.email))) return json({ ok: false, error: "email" }, 400);

    const tabella = `<table cellpadding="6" style="border-collapse:collapse;font:14px system-ui,Arial">${CAMPI
      .filter(([k]) => String(d[k] ?? "").trim())
      .map(([k, label]) => `<tr><td style="color:#5f636b;vertical-align:top">${esc(label)}</td><td><b>${esc(d[k]).replace(/\n/g, "<br>")}</b></td></tr>`).join("")}</table>`;
    const { user, pass } = smtpCredenziali();
    const smtp = nodemailer.createTransport({
      host: Deno.env.get("SMTP_HOST") ?? "smtp.gmail.com", port: 465, secure: true, auth: { user, pass },
    });
    const from = `"Job Academy" <${user}>`;
    await smtp.sendMail({ from, to: ADMIN, replyTo: String(d.email), subject: `Richiesta personale: ${d.ragione_sociale} (${d.numero} persone)`,
      html: `<p>Nuova richiesta di personale dal sito www.jobacademysrl.com.</p>${tabella}<p>Consenso privacy dato il ${new Date().toLocaleString("it-IT", { timeZone: "Europe/Rome" })}.</p>` });
    await smtp.sendMail({ from, to: String(d.email), replyTo: ADMIN, subject: "Abbiamo ricevuto la tua richiesta di personale · Job Academy",
      html: `<p>Gentile ${esc(d.referente)},</p><p>abbiamo ricevuto la richiesta di personale per <b>${esc(d.ragione_sociale)}</b>. Ti ricontattiamo a breve per approfondire profili, tempi e condizioni.</p><p>La ricerca e la selezione sono svolte da Jobtech srl, Agenzia per il Lavoro nostra partner.</p>${tabella}<p>Per qualsiasi dubbio rispondi a questa email.</p><p>Job Academy srl · Via Stefano Canzio 50r, Genova · P.IVA 03071340990</p>` });
    return json({ ok: true });
  } catch (e) {
    console.error(e);
    return json({ ok: false, error: "invio" }, 500);
  }
});
