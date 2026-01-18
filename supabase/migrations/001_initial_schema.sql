-- Create updated_at trigger function
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 1. ideas table
create table ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  title text not null,
  problem text not null,
  target_customer text not null,
  painkiller_moment text not null,
  revenue_model text not null,
  unfair_advantage text not null,
  distribution_channel text not null,
  time_commitment text not null check (time_commitment in ('nights_weekends', 'part_time', 'full_time')),
  status text default 'draft' check (status in ('draft', 'validated', 'archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index ideas_user_id_idx on ideas(user_id);
create index ideas_created_at_idx on ideas(created_at);

-- Trigger for ideas updated_at
create trigger ideas_updated_at
  before update on ideas
  for each row
  execute function handle_updated_at();

-- 2. validations table
create table validations (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references ideas(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  overall_score integer not null check (overall_score >= 0 and overall_score <= 100),
  traffic_light text not null check (traffic_light in ('red', 'yellow', 'green')),
  painkiller_score integer not null check (painkiller_score >= 0 and painkiller_score <= 10),
  painkiller_reasoning text not null,
  revenue_model_score integer not null check (revenue_model_score >= 0 and revenue_model_score <= 10),
  revenue_model_reasoning text not null,
  acquisition_score integer not null check (acquisition_score >= 0 and acquisition_score <= 10),
  acquisition_reasoning text not null,
  moat_score integer not null check (moat_score >= 0 and moat_score <= 10),
  moat_reasoning text not null,
  founder_fit_score integer not null check (founder_fit_score >= 0 and founder_fit_score <= 10),
  founder_fit_reasoning text not null,
  time_to_revenue_score integer not null check (time_to_revenue_score >= 0 and time_to_revenue_score <= 10),
  time_to_revenue_reasoning text not null,
  time_to_revenue_estimate text,
  scalability_score integer not null check (scalability_score >= 0 and scalability_score <= 10),
  scalability_reasoning text not null,
  red_flags jsonb default '[]'::jsonb,
  comparable_companies jsonb default '[]'::jsonb,
  recommendations jsonb default '[]'::jsonb,
  model_used text default 'gemini-2.0-flash-exp',
  processing_time_ms integer,
  created_at timestamptz default now()
);

create index validations_idea_id_idx on validations(idea_id);
create index validations_user_id_idx on validations(user_id);
create index validations_created_at_idx on validations(created_at);

-- 3. benchmark_data table
create table benchmark_data (
  id uuid primary key default gen_random_uuid(),
  month text not null unique, -- format: 'YYYY-MM'
  total_validations integer default 0,
  avg_overall_score numeric,
  score_distribution jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);

create unique index benchmark_data_month_idx on benchmark_data(month);

-- Trigger for benchmark_data updated_at
create trigger benchmark_data_updated_at
  before update on benchmark_data
  for each row
  execute function handle_updated_at();

-- Enable RLS on all tables
alter table ideas enable row level security;
alter table validations enable row level security;
alter table benchmark_data enable row level security;

-- Create RLS policies

-- ideas policies
create policy "Users can only access their own ideas"
  on ideas for all
  using (auth.uid() = user_id);

-- validations policies
create policy "Users can only access their own validations"
  on validations for all
  using (auth.uid() = user_id);

-- benchmark_data policies
create policy "All authenticated users can select benchmark_data"
  on benchmark_data for select
  to authenticated
  using (true);
