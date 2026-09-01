# Ricettario – versione aggiornata

Questa versione mantiene React/Vite + Supabase + Cloudflare Pages Functions + OneSignal e aggiunge:

- layout responsive desktop/mobile;
- ricerca su titolo, sottotitolo, categoria, tag e ingredienti;
- filtri per categoria;
- preferiti salvati sul dispositivo;
- scheda ricetta più completa;
- modalità "Inizia a cucinare" passo-passo con timer;
- importazione migliorata del formato Titolo/Sottotitolo/Categoria/Tempo/Persone/Tag/Ingredienti/Passaggi;
- manifest e icone PWA mancanti;
- invio chat con chiamata diretta alla Pages Function `/api/notify`.

## Notifiche OneSignal

La Pages Function legge `ONESIGNAL_APP_ID` e `ONESIGNAL_REST_API_KEY` dai Variables/Secrets del progetto Cloudflare Pages. Non inserire la REST API key nel codice client.

La funzione riceve il messaggio inserito da Supabase e invia la push agli iscritti, escludendo il device che ha inviato il messaggio tramite il tag `device_id`.

Poiché questa versione richiama `/api/notify` direttamente da `sendMessage()`, se nel progetto Supabase esiste anche un Database Webhook che invia lo stesso record alla stessa funzione, disattivarlo per evitare notifiche duplicate.

Su iPhone/iPad la Web Push dipende anche dall'installazione della web app come PWA e dalle autorizzazioni del sistema/browser.

## Ricette

L'elaborazione delle ricette resta esterna all'app: il testo che prepari con ChatGPT può essere importato con il formato standard già supportato. In questo progetto non è stata inserita alcuna API key di AI nel browser.
