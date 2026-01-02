-- Migration: create chat_sessions table and add session_id to chat_history
-- Run this in your Supabase SQL editor or via your migration tooling.

create extension if not exists pgcrypto;

create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text default '',
  created_at timestamptz default now()
);

create index if not exists idx_chat_sessions_user_created_at on public.chat_sessions (user_id, created_at);

-- Add session_id to chat_history (if not exists)
alter table public.chat_history
  add column if not exists session_id uuid null;

alter table public.chat_history
  add constraint if not exists chat_history_session_id_fkey foreign key (session_id) references public.chat_sessions(id) on delete cascade;

-- Ensure session_id is present for future inserts (application must provide it)


