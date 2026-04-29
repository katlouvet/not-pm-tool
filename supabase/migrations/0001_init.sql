-- NOT. PM Tool — initial schema
-- All tables use UUID primary keys, timestamptz for time, and snake_case naming.

-- ------------------------------------------------------------------
-- Extensions
-- ------------------------------------------------------------------
create extension if not exists "uuid-ossp";


-- ------------------------------------------------------------------
-- profiles — extends auth.users with role + tenant link
-- ------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  role        text not null check (role in ('team', 'client')),
  client_id   uuid,             -- null for team members; FK added after clients table exists
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index profiles_client_id_idx on public.profiles(client_id);


-- ------------------------------------------------------------------
-- clients
-- ------------------------------------------------------------------
create table public.clients (
  id                    uuid primary key default uuid_generate_v4(),
  name                  text not null,
  slug                  text not null unique,         -- used in /portal/[slug] URLs
  primary_contact_email text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index clients_slug_idx on public.clients(slug);

-- now that clients exists, link profiles.client_id
alter table public.profiles
  add constraint profiles_client_id_fkey
  foreign key (client_id) references public.clients(id) on delete set null;


-- ------------------------------------------------------------------
-- projects
-- ------------------------------------------------------------------
create table public.projects (
  id              uuid primary key default uuid_generate_v4(),
  client_id       uuid not null references public.clients(id) on delete cascade,
  name            text not null,
  status          text not null default 'planning'
                    check (status in ('planning', 'in_progress', 'done', 'paused')),
  kickoff_date    date,
  delivery_date   date,
  overview        text,
  internal_notes  text,                              -- not visible to clients
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index projects_client_id_idx on public.projects(client_id);
create index projects_status_idx on public.projects(status);


-- ------------------------------------------------------------------
-- project_stages — chronological stages of a project
-- ------------------------------------------------------------------
create table public.project_stages (
  id          uuid primary key default uuid_generate_v4(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  name        text not null,
  start_date  date,
  end_date    date,
  status      text not null default 'not_started'
                check (status in ('not_started', 'in_progress', 'done', 'blocked')),
  sort_order  integer not null default 0,            -- fixes prototype chronological-sort bug
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index project_stages_project_id_idx
  on public.project_stages(project_id, sort_order);


-- ------------------------------------------------------------------
-- meeting_logs — must exist before tasks (FK target)
-- ------------------------------------------------------------------
create table public.meeting_logs (
  id              uuid primary key default uuid_generate_v4(),
  project_id      uuid not null references public.projects(id) on delete cascade,
  meeting_id      text not null,                     -- idempotency key (Gmail msg id, etc.)
  meeting_date    date not null,
  summary         text,
  raw_transcript  text,
  review_status   text not null default 'pending'
                    check (review_status in ('pending', 'approved', 'auto_committed')),
  processed_at    timestamptz,
  created_at      timestamptz not null default now(),
  unique (project_id, meeting_id)
);

create index meeting_logs_project_id_idx on public.meeting_logs(project_id);


-- ------------------------------------------------------------------
-- tasks — action items, often extracted from meeting transcripts
-- ------------------------------------------------------------------
create table public.tasks (
  id                       uuid primary key default uuid_generate_v4(),
  project_id               uuid not null references public.projects(id) on delete cascade,
  title                    text not null,
  owner                    text,
  due_date                 date,
  due_date_original_text   text,                     -- e.g. "by next Friday"
  status                   text not null default 'open'
                             check (status in ('open', 'in_progress', 'done', 'blocked')),
  priority                 text not null default 'medium'
                             check (priority in ('high', 'medium', 'low')),
  confidence               text not null default 'high'
                             check (confidence in ('high', 'medium', 'low')),
  source_meeting_id        uuid references public.meeting_logs(id) on delete set null,
  source_quote             text,                     -- verbatim quote from transcript
  client_visible           boolean not null default false,  -- show on client portal?
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index tasks_project_id_idx on public.tasks(project_id);
create index tasks_status_idx on public.tasks(status);


-- ------------------------------------------------------------------
-- kpis — metrics displayed on the portal
-- ------------------------------------------------------------------
create table public.kpis (
  id              uuid primary key default uuid_generate_v4(),
  project_id      uuid not null references public.projects(id) on delete cascade,
  name            text not null,
  target_value    numeric,
  current_value   numeric,
  unit            text,
  trend           text check (trend in ('up', 'down', 'flat')),
  last_updated    timestamptz not null default now(),
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now()
);

create index kpis_project_id_idx on public.kpis(project_id, sort_order);


-- ------------------------------------------------------------------
-- audit_log — captures changes for the History tab
-- ------------------------------------------------------------------
create table public.audit_log (
  id          uuid primary key default uuid_generate_v4(),
  table_name  text not null,
  record_id   uuid not null,
  action      text not null check (action in ('insert', 'update', 'delete')),
  actor_id    uuid references auth.users(id) on delete set null,
  diff        jsonb,
  created_at  timestamptz not null default now()
);

create index audit_log_record_idx on public.audit_log(table_name, record_id, created_at desc);


-- ------------------------------------------------------------------
-- updated_at trigger
-- ------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch        before update on public.profiles        for each row execute function public.touch_updated_at();
create trigger clients_touch         before update on public.clients         for each row execute function public.touch_updated_at();
create trigger projects_touch        before update on public.projects        for each row execute function public.touch_updated_at();
create trigger project_stages_touch  before update on public.project_stages  for each row execute function public.touch_updated_at();
create trigger tasks_touch           before update on public.tasks           for each row execute function public.touch_updated_at();


-- ------------------------------------------------------------------
-- new-user trigger — auto-create a profile when an auth user is created
-- ------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'team'),
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
