-- Supabase schema for Fitness Survey Analytics v3
-- Run this in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.survey_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  survey_version text not null default '3',
  fingerprint_hash text not null,

  lang text not null check (lang in ('ru','kg','en')),
  segment text not null,
  age_range text,
  gender text,
  family_status text[] not null default '{}',

  understands_location text,
  daytime_location text,
  travel_time text,
  location_convenience text,

  current_activity text,
  attended_gym_3m text,
  weekly_visits text,
  current_monthly_price text,

  goals text[] not null default '{}',
  barriers text[] not null default '{}',

  importance_location int check (importance_location between 1 and 5),
  importance_cleanliness int check (importance_cleanliness between 1 and 5),
  importance_equipment int check (importance_equipment between 1 and 5),
  importance_safety int check (importance_safety between 1 and 5),
  importance_separate_zones int check (importance_separate_zones between 1 and 5),
  importance_privacy int check (importance_privacy between 1 and 5),
  importance_female_staff int check (importance_female_staff between 1 and 5),

  concept_interest text,
  first_month_probability text,
  preferred_time text,
  wanted_services text[] not null default '{}',

  affordable_price text,
  refusal_price text,
  pay_more_for text[] not null default '{}',
  payment_format text,
  pre_opening_action text,

  student_institution text,
  jaiu_info_language text,
  jaiu_english_staff_importance int check (jaiu_english_staff_importance between 1 and 5),
  jaiu_student_price text,
  jaiu_attend_with text,
  other_student_tariff text,

  local_mixed_audience_comfort text,
  local_rules_needed text[] not null default '{}',
  local_separate_hours text,

  comment text,
  wants_contact boolean not null default false,
  contact text,

  lead_score int not null default 0 check (lead_score between 0 and 100),
  lead_level text not null default 'weak' check (lead_level in ('strong','warm','weak')),

  answers jsonb not null default '{}'::jsonb
);

-- Prevent repeated submission from the same browser/device fingerprint for the same survey version.
create unique index if not exists survey_responses_unique_fingerprint_version
on public.survey_responses (survey_version, fingerprint_hash);

create index if not exists survey_responses_created_at_idx on public.survey_responses (created_at desc);
create index if not exists survey_responses_lang_idx on public.survey_responses (lang);
create index if not exists survey_responses_segment_idx on public.survey_responses (segment);
create index if not exists survey_responses_age_idx on public.survey_responses (age_range);
create index if not exists survey_responses_gender_idx on public.survey_responses (gender);
create index if not exists survey_responses_lead_idx on public.survey_responses (lead_level, lead_score desc);
create index if not exists survey_responses_services_gin_idx on public.survey_responses using gin (wanted_services);
create index if not exists survey_responses_barriers_gin_idx on public.survey_responses using gin (barriers);
create index if not exists survey_responses_answers_gin_idx on public.survey_responses using gin (answers);

alter table public.survey_responses enable row level security;

-- Respondents: no registration, no login. They can only INSERT answers.
drop policy if exists "anonymous respondents can insert" on public.survey_responses;
create policy "anonymous respondents can insert"
on public.survey_responses
for insert
to anon
with check (true);

-- Admin access option A: recommended. Create admin users here and use Supabase Auth email/password.
create table if not exists public.admin_users (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

drop function if exists public.is_admin();
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users a
    where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

drop policy if exists "admins can read responses" on public.survey_responses;
create policy "admins can read responses"
on public.survey_responses
for select
to authenticated
using (public.is_admin());

drop policy if exists "admins can read admin list" on public.admin_users;
create policy "admins can read admin list"
on public.admin_users
for select
to authenticated
using (public.is_admin());

-- Add your admin email after creating the user in Supabase Authentication:
-- insert into public.admin_users(email) values ('your-email@example.com') on conflict do nothing;

-- Admin access option B: not recommended, but possible for a closed local demo.
-- If you really want admin.html without any login, set VITE_ADMIN_REQUIRE_AUTH=false in .env.local
-- AND uncomment this policy. Anyone with the anon key and admin URL can read all answers.
-- create policy "public can read responses - demo only"
-- on public.survey_responses
-- for select
-- to anon
-- using (true);
