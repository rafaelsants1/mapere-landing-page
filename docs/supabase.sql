-- Lista de espera do Mapere. Rode no SQL Editor do Supabase quando for ativar o provedor.
-- Depois defina PUBLIC_WAITLIST_PROVIDER=supabase, PUBLIC_SUPABASE_URL e PUBLIC_SUPABASE_ANON_KEY.

create table if not exists public.waitlist (
  id bigint generated always as identity primary key,
  email text not null unique check (email = lower(email) and char_length(email) <= 254),
  created_at timestamptz not null default now(),
  consent boolean not null check (consent = true),
  source text not null default 'lista' check (source in ('abertura', 'lista'))
);

alter table public.waitlist enable row level security;

-- Visitantes só podem inserir. Sem política de select: a chave pública não lê a lista.
grant insert on public.waitlist to anon;

create policy "visitante entra na lista com consentimento"
  on public.waitlist
  for insert
  to anon
  with check (consent = true);
