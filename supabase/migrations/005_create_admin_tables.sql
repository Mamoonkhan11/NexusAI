-- Create user_feedback table
create table if not exists public.user_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  message text not null,
  created_at timestamptz default now()
);

-- Create api_logs table
create table if not exists public.api_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  provider text not null,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.user_feedback enable row level security;
alter table public.api_logs enable row level security;

-- Create policies for user_feedback
create policy "Users can insert their own feedback" on public.user_feedback
  for insert with check (auth.uid() = user_id);

create policy "Users can view their own feedback" on public.user_feedback
  for select using (auth.uid() = user_id);

create policy "Admins can view all feedback" on public.user_feedback
  for select using (
    exists (
      select 1 from auth.users
      where id = auth.uid()
      and user_metadata->>'role' = 'admin'
    )
  );

-- Create policies for api_logs
create policy "Users can view their own API logs" on public.api_logs
  for select using (auth.uid() = user_id);

create policy "Admins can view all API logs" on public.api_logs
  for select using (
    exists (
      select 1 from auth.users
      where id = auth.uid()
      and user_metadata->>'role' = 'admin'
    )
  );

create policy "System can insert API logs" on public.api_logs
  for insert with check (true);

-- Create indexes for better performance
create index if not exists idx_user_feedback_created_at on public.user_feedback(created_at desc);
create index if not exists idx_user_feedback_user_id on public.user_feedback(user_id);

create index if not exists idx_api_logs_created_at on public.api_logs(created_at desc);
create index if not exists idx_api_logs_user_id on public.api_logs(user_id);
create index if not exists idx_api_logs_provider on public.api_logs(provider);
