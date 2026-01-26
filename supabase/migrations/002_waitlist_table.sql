-- 002_waitlist_table.sql
create table waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  user_id uuid references auth.users(id), -- optional, if logged in
  created_at timestamptz default now()
);

create index waitlist_email_idx on waitlist(email);

-- Enable RLS
alter table waitlist enable row level security;

-- RLS policies
create policy "Anyone can join waitlist"
  on waitlist for insert
  with check (true);

create policy "Admins can view waitlist"
  on waitlist for select
  to authenticated
  using (auth.jwt() ->> 'email' = 'admin@example.com' or auth.uid() = user_id); -- Simple policy, can be refined
