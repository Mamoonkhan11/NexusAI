-- Migration: create chat_history table (compatibility with existing schema)
-- Run this in your Supabase SQL editor or via your migration tooling.

-- Ensure uuid-ossp extension is available for uuid_generate_v4()
create extension if not exists "uuid-ossp";

create table if not exists public.chat_history (
  id uuid not null default uuid_generate_v4(),
  user_id uuid not null,
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz null default now(),
  constraint chat_history_pkey primary key (id),
  constraint chat_history_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
) tablespace pg_default;

create index if not exists idx_chat_history_user_id on public.chat_history using btree (user_id) tablespace pg_default;


