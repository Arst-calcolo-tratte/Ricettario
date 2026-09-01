-- Ricettario: abilita l'aggiornamento delle ricette con il client anon.
-- Eseguire nel Supabase SQL Editor se l'app segnala che l'UPDATE è bloccato da RLS.
-- ATTENZIONE: il progetto attuale non usa autenticazione utenti, quindi questa policy
-- consente l'UPDATE a chiunque possieda l'URL/anon key dell'app.

alter table public.recipes enable row level security;

drop policy if exists "recipes_update_public" on public.recipes;
create policy "recipes_update_public"
on public.recipes
for update
to anon, authenticated
using (true)
with check (true);
