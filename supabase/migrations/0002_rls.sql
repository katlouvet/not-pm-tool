-- NOT. PM Tool — Row Level Security
-- Tenant isolation enforced at the database layer. Even with broken middleware,
-- Postgres refuses to return another client's data.

-- ------------------------------------------------------------------
-- Helper: current user's role (cached per-statement)
-- ------------------------------------------------------------------
create or replace function public.current_role_name()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.current_client_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select client_id from public.profiles where id = auth.uid()
$$;


-- ------------------------------------------------------------------
-- Enable RLS on every public table
-- ------------------------------------------------------------------
alter table public.profiles        enable row level security;
alter table public.clients         enable row level security;
alter table public.projects        enable row level security;
alter table public.project_stages  enable row level security;
alter table public.tasks           enable row level security;
alter table public.kpis            enable row level security;
alter table public.meeting_logs    enable row level security;
alter table public.audit_log       enable row level security;


-- ------------------------------------------------------------------
-- profiles
-- ------------------------------------------------------------------
-- Anyone authenticated can read their own profile
create policy profiles_self_read on public.profiles
  for select using (id = auth.uid());

-- Team members can read all profiles
create policy profiles_team_read on public.profiles
  for select using (public.current_role_name() = 'team');

-- Team members can write profiles (e.g., when inviting clients)
create policy profiles_team_write on public.profiles
  for all using (public.current_role_name() = 'team');


-- ------------------------------------------------------------------
-- clients
-- ------------------------------------------------------------------
-- Team: full access
create policy clients_team_all on public.clients
  for all using (public.current_role_name() = 'team');

-- Client: read only their own client row
create policy clients_self_read on public.clients
  for select using (
    public.current_role_name() = 'client'
    and id = public.current_client_id()
  );


-- ------------------------------------------------------------------
-- projects
-- ------------------------------------------------------------------
create policy projects_team_all on public.projects
  for all using (public.current_role_name() = 'team');

create policy projects_client_read on public.projects
  for select using (
    public.current_role_name() = 'client'
    and client_id = public.current_client_id()
  );


-- ------------------------------------------------------------------
-- project_stages
-- ------------------------------------------------------------------
create policy project_stages_team_all on public.project_stages
  for all using (public.current_role_name() = 'team');

create policy project_stages_client_read on public.project_stages
  for select using (
    public.current_role_name() = 'client'
    and project_id in (
      select id from public.projects
      where client_id = public.current_client_id()
    )
  );


-- ------------------------------------------------------------------
-- tasks
-- ------------------------------------------------------------------
create policy tasks_team_all on public.tasks
  for all using (public.current_role_name() = 'team');

-- Clients see only tasks marked client_visible
create policy tasks_client_read on public.tasks
  for select using (
    public.current_role_name() = 'client'
    and client_visible = true
    and project_id in (
      select id from public.projects
      where client_id = public.current_client_id()
    )
  );


-- ------------------------------------------------------------------
-- kpis
-- ------------------------------------------------------------------
create policy kpis_team_all on public.kpis
  for all using (public.current_role_name() = 'team');

create policy kpis_client_read on public.kpis
  for select using (
    public.current_role_name() = 'client'
    and project_id in (
      select id from public.projects
      where client_id = public.current_client_id()
    )
  );


-- ------------------------------------------------------------------
-- meeting_logs — internal only, never visible to clients
-- ------------------------------------------------------------------
create policy meeting_logs_team_all on public.meeting_logs
  for all using (public.current_role_name() = 'team');


-- ------------------------------------------------------------------
-- audit_log — internal only
-- ------------------------------------------------------------------
create policy audit_log_team_read on public.audit_log
  for select using (public.current_role_name() = 'team');
