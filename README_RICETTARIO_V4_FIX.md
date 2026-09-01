# Ricettario V4 — fix salvataggio reale

Correzioni principali:
- rimosso `.select()` dalla richiesta UPDATE delle ricette;
- dopo l'UPDATE viene eseguita una SELECT reale per verificare la persistenza;
- gli errori Supabase vengono mostrati direttamente dentro la schermata "Modifica ricetta";
- correzione del selettore "Cambia copertina" dalla scheda ricetta (passaggio corretto di recipe.id);
- quando una foto viene impostata come copertina viene aggiornato anche il campo `cover`, non solo `photos`;
- cancellando la copertina, la prima foto restante diventa la nuova copertina;
- il pulsante di salvataggio viene disabilitato durante l'operazione.

## Nota
Se compare un errore RLS, il problema è lato Supabase e va applicata una policy UPDATE coerente con la sicurezza del progetto. Non aprire policy indiscriminatamente senza verificare il modello di accesso.
