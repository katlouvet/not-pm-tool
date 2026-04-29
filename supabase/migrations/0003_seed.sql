-- NOT. PM Tool — demo seed data
-- 1 client (JD Sports) with 5 separate projects (POCs).
-- Run AFTER 0001_init.sql and 0002_rls.sql.

-- Bypass RLS for the seed insert (we're running as superuser via the SQL Editor)
set local role postgres;

-- ------------------------------------------------------------------
-- Client
-- ------------------------------------------------------------------
insert into public.clients (id, name, slug, primary_contact_email)
values (
  '11111111-1111-1111-1111-111111111111',
  'JD Sports',
  'jd-sports',
  'cfo@jdsports.demo'
);


-- ------------------------------------------------------------------
-- Projects (5 POCs)
-- ------------------------------------------------------------------
insert into public.projects (id, client_id, name, status, kickoff_date, delivery_date, overview, internal_notes)
values
  ('21111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
   'AI Creative Studio',
   'in_progress', '2026-01-15', '2026-05-31',
   'Generative creative tool that produces on-brand campaign visuals from a single prompt. Reduces creative production time by 80%.',
   'Ludovic excited about this one — high CFO visibility. Marine leading creative direction.'),

  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111',
   'Social Content Engine',
   'in_progress', '2026-02-01', '2026-06-15',
   'Always-on content engine generating daily social posts across IG, TikTok, and X tailored to each market.',
   'Need to align with their existing social team — politics. Nicolas owns relationship.'),

  ('23333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111',
   'Product Photography Automation',
   'in_progress', '2026-03-01', '2026-07-30',
   'Automated product photography pipeline — from raw catalog images to e-commerce-ready assets at scale.',
   'Requires integration with their PIM. Tech-heavy, longer timeline.'),

  ('24444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111',
   'Localised Brand Voice',
   'planning', '2026-05-01', '2026-09-30',
   'AI-localised brand copy across UK, FR, DE, NL — preserves brand voice while adapting to cultural nuance.',
   'Kicks off after AI Creative Studio ships. Aware of legal review on tone guidelines.'),

  ('25555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111',
   'In-Store Personalisation',
   'planning', '2026-06-15', '2026-12-15',
   'Personalised in-store digital signage triggered by customer profile and live store inventory.',
   'Hardware partner TBD. Pending their CTO sign-off.');


-- ------------------------------------------------------------------
-- Project stages — AI Creative Studio (the POC we'll demo)
-- ------------------------------------------------------------------
insert into public.project_stages (project_id, name, start_date, end_date, status, sort_order)
values
  ('21111111-1111-1111-1111-111111111111', 'Discovery & Strategy',     '2026-01-15', '2026-01-31', 'done',         1),
  ('21111111-1111-1111-1111-111111111111', 'Brand Audit',              '2026-02-01', '2026-02-14', 'done',         2),
  ('21111111-1111-1111-1111-111111111111', 'Creative Concepting',      '2026-02-15', '2026-03-15', 'in_progress',  3),
  ('21111111-1111-1111-1111-111111111111', 'Model Training',           '2026-03-15', '2026-04-15', 'not_started',  4),
  ('21111111-1111-1111-1111-111111111111', 'UI Prototype',             '2026-04-15', '2026-05-10', 'not_started',  5),
  ('21111111-1111-1111-1111-111111111111', 'Launch & Handover',        '2026-05-10', '2026-05-31', 'not_started',  6);


-- Stages — Social Content Engine
insert into public.project_stages (project_id, name, start_date, end_date, status, sort_order)
values
  ('22222222-2222-2222-2222-222222222222', 'Discovery',                '2026-02-01', '2026-02-15', 'done',         1),
  ('22222222-2222-2222-2222-222222222222', 'Content Strategy',         '2026-02-15', '2026-03-10', 'done',         2),
  ('22222222-2222-2222-2222-222222222222', 'Engine Build',             '2026-03-10', '2026-05-01', 'in_progress',  3),
  ('22222222-2222-2222-2222-222222222222', 'Pilot Campaign',           '2026-05-01', '2026-06-01', 'not_started',  4),
  ('22222222-2222-2222-2222-222222222222', 'Rollout',                  '2026-06-01', '2026-06-15', 'not_started',  5);


-- Stages — Product Photography Automation
insert into public.project_stages (project_id, name, start_date, end_date, status, sort_order)
values
  ('23333333-3333-3333-3333-333333333333', 'PIM Integration Spec',     '2026-03-01', '2026-03-20', 'done',         1),
  ('23333333-3333-3333-3333-333333333333', 'Pipeline Architecture',    '2026-03-20', '2026-04-15', 'in_progress',  2),
  ('23333333-3333-3333-3333-333333333333', 'Automation Build',         '2026-04-15', '2026-06-15', 'not_started',  3),
  ('23333333-3333-3333-3333-333333333333', 'QA & Testing',             '2026-06-15', '2026-07-15', 'not_started',  4),
  ('23333333-3333-3333-3333-333333333333', 'Production Rollout',       '2026-07-15', '2026-07-30', 'not_started',  5);


-- Stages — Localised Brand Voice (planning)
insert into public.project_stages (project_id, name, start_date, end_date, status, sort_order)
values
  ('24444444-4444-4444-4444-444444444444', 'Voice Audit',              '2026-05-01', '2026-05-20', 'not_started',  1),
  ('24444444-4444-4444-4444-444444444444', 'Localisation Framework',   '2026-05-20', '2026-06-30', 'not_started',  2),
  ('24444444-4444-4444-4444-444444444444', 'Model Tuning',             '2026-06-30', '2026-08-15', 'not_started',  3),
  ('24444444-4444-4444-4444-444444444444', 'Launch',                   '2026-08-15', '2026-09-30', 'not_started',  4);


-- Stages — In-Store Personalisation (planning)
insert into public.project_stages (project_id, name, start_date, end_date, status, sort_order)
values
  ('25555555-5555-5555-5555-555555555555', 'Hardware Partner Selection','2026-06-15', '2026-07-31', 'not_started', 1),
  ('25555555-5555-5555-5555-555555555555', 'Inventory API Integration','2026-08-01', '2026-09-30', 'not_started',  2),
  ('25555555-5555-5555-5555-555555555555', 'Personalisation Engine',   '2026-10-01', '2026-11-15', 'not_started',  3),
  ('25555555-5555-5555-5555-555555555555', 'Pilot Stores',             '2026-11-15', '2026-12-15', 'not_started',  4);


-- ------------------------------------------------------------------
-- KPIs — AI Creative Studio
-- ------------------------------------------------------------------
insert into public.kpis (project_id, name, target_value, current_value, unit, trend, sort_order)
values
  ('21111111-1111-1111-1111-111111111111', 'Asset production speed',     80,  62,  '% faster',  'up',   1),
  ('21111111-1111-1111-1111-111111111111', 'On-brand consistency score', 95,  88,  '%',         'up',   2),
  ('21111111-1111-1111-1111-111111111111', 'Concepts per week',         100,  72,  'concepts',  'up',   3),
  ('21111111-1111-1111-1111-111111111111', 'Stakeholder approval rate',  90,  84,  '%',         'flat', 4);

-- KPIs — Social Content Engine
insert into public.kpis (project_id, name, target_value, current_value, unit, trend, sort_order)
values
  ('22222222-2222-2222-2222-222222222222', 'Posts generated per week',  500, 320, 'posts',      'up',   1),
  ('22222222-2222-2222-2222-222222222222', 'Engagement lift',            25,  18, '%',          'up',   2),
  ('22222222-2222-2222-2222-222222222222', 'Markets covered',             4,   3, 'markets',    'flat', 3);

-- KPIs — Product Photography Automation
insert into public.kpis (project_id, name, target_value, current_value, unit, trend, sort_order)
values
  ('23333333-3333-3333-3333-333333333333', 'SKUs processed per day',   2000, 450, 'SKUs',       'up',   1),
  ('23333333-3333-3333-3333-333333333333', 'Cost per asset',              0.5, 0.85, '€',       'down', 2),
  ('23333333-3333-3333-3333-333333333333', 'Auto-approval rate',         70,  41,  '%',         'up',   3);


-- ------------------------------------------------------------------
-- Sample meeting log + tasks (so the dashboard isn't empty)
-- ------------------------------------------------------------------
insert into public.meeting_logs (id, project_id, meeting_id, meeting_date, summary, review_status, processed_at)
values (
  '31111111-1111-1111-1111-111111111111',
  '21111111-1111-1111-1111-111111111111',
  'demo-meeting-001',
  '2026-04-22',
  'Weekly sync — AI Creative Studio. Reviewed concept board v3, agreed on direction shift toward editorial-style outputs. Discussed model training timeline.',
  'approved',
  now()
);

insert into public.tasks (project_id, title, owner, due_date, due_date_original_text, status, priority, confidence, source_meeting_id, source_quote, client_visible)
values
  ('21111111-1111-1111-1111-111111111111',
   'Send updated concept board to JD Sports brand team',
   'Marine', '2026-04-30', 'by end of next week', 'in_progress', 'high', 'high',
   '31111111-1111-1111-1111-111111111111',
   'Marine will send the updated board by end of next week.', true),

  ('21111111-1111-1111-1111-111111111111',
   'Finalise model training dataset',
   'Nicolas', '2026-05-05', 'before training kicks off', 'open', 'high', 'high',
   '31111111-1111-1111-1111-111111111111',
   'Nicolas needs the training dataset locked before we kick off training.', false),

  ('21111111-1111-1111-1111-111111111111',
   'Confirm GPU budget with their CTO',
   'TBD', null, 'asap', 'open', 'medium', 'low',
   '31111111-1111-1111-1111-111111111111',
   'Someone needs to chase their CTO on the GPU budget question.', false),

  ('22222222-2222-2222-2222-222222222222',
   'Align with internal social team on tone guidelines',
   'Marine', '2026-05-10', 'next sprint', 'open', 'medium', 'high', null, null, false);
