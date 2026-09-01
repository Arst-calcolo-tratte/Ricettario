# Ricettario V5 — fix salvataggio

Questa versione cambia il comportamento del salvataggio delle modifiche:
- la UI aggiorna immediatamente la ricetta e torna alla scheda della ricetta;
- la scrittura su Supabase viene eseguita subito dopo, senza bloccare la navigazione;
- in caso di errore reale di Supabase, viene mostrato un avviso e lo stato locale viene ripristinato.

Le notifiche push non sono state modificate.
