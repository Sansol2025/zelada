-- Aprender Sin Barreras - Initial schema, progress engine, and RLS.
-- PostgreSQL / Supabase migration

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('teacher', 'student', 'family', 'admin');
  end if;

  if not exists (select 1 from pg_type where typname = 'progress_status') then
    create type public.progress_status as enum ('pending', 'in_progress', 'completed', 'blocked');
  end if;

  if not exists (select 1 from pg_type where typname = 'access_link_type') then
    create type public.access_link_type as enum ('qr', 'magic_link');
  end if;

  if not exists (select 1 from pg_type where typname = 'activity_kind') then
    create type public.activity_kind as enum (
      'multiple_choice_visual',
      'true_false',
      'drag_drop',
      'image_select',
      'fill_with_support',
      'sequence',
      'audio_guided_response',
      'touch_activity'
    );
  end if;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role public.user_role not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  school_name text,
  grade text,
  section text,
  qr_code_value text,
  magic_link_token text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.families (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  relation_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.family_students (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (family_id, student_id)
);

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) >= 3),
  description text,
  color text not null default '#43b8f4',
  icon text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  title text not null check (char_length(title) >= 3),
  description text,
  position integer not null check (position > 0),
  is_locked_by_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (subject_id, position)
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  type public.activity_kind not null,
  title text not null check (char_length(title) >= 3),
  prompt text not null check (char_length(prompt) >= 5),
  instructions text,
  audio_url text,
  image_url text,
  settings_json jsonb not null default '{}'::jsonb,
  position integer not null check (position > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (module_id, position)
);

create table if not exists public.student_subjects (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  unique (student_id, subject_id)
);

create table if not exists public.student_activity_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  activity_id uuid not null references public.activities(id) on delete cascade,
  status public.progress_status not null default 'pending',
  score numeric(5,2),
  completed_at timestamptz,
  time_spent_seconds integer not null default 0 check (time_spent_seconds >= 0),
  attempts integer not null default 0 check (attempts >= 0),
  response_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, activity_id)
);

create table if not exists public.student_module_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  module_id uuid not null references public.modules(id) on delete cascade,
  status public.progress_status not null default 'pending',
  unlocked_at timestamptz,
  completed_at timestamptz,
  progress_percent numeric(5,2) not null default 0 check (progress_percent >= 0 and progress_percent <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, module_id)
);

create table if not exists public.student_subject_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  progress_percent numeric(5,2) not null default 0 check (progress_percent >= 0 and progress_percent <= 100),
  completed_modules integer not null default 0,
  total_modules integer not null default 0,
  status public.progress_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, subject_id)
);

create table if not exists public.access_links (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  type public.access_link_type not null,
  token text not null unique,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_students_profile_id on public.students(profile_id);
create index if not exists idx_families_profile_id on public.families(profile_id);
create index if not exists idx_family_students_family on public.family_students(family_id);
create index if not exists idx_family_students_student on public.family_students(student_id);
create index if not exists idx_subjects_teacher on public.subjects(teacher_id);
create index if not exists idx_modules_subject on public.modules(subject_id);
create index if not exists idx_activities_module on public.activities(module_id);
create index if not exists idx_student_subjects_student on public.student_subjects(student_id);
create index if not exists idx_student_subjects_subject on public.student_subjects(subject_id);
create index if not exists idx_sap_student on public.student_activity_progress(student_id);
create index if not exists idx_sap_activity on public.student_activity_progress(activity_id);
create index if not exists idx_smp_student on public.student_module_progress(student_id);
create index if not exists idx_smp_module on public.student_module_progress(module_id);
create index if not exists idx_ssp_student on public.student_subject_progress(student_id);
create index if not exists idx_ssp_subject on public.student_subject_progress(subject_id);
create index if not exists idx_access_links_student on public.access_links(student_id);
create index if not exists idx_access_links_token on public.access_links(token);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_students_updated_at on public.students;
create trigger trg_students_updated_at before update on public.students
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_families_updated_at on public.families;
create trigger trg_families_updated_at before update on public.families
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_subjects_updated_at on public.subjects;
create trigger trg_subjects_updated_at before update on public.subjects
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_modules_updated_at on public.modules;
create trigger trg_modules_updated_at before update on public.modules
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_activities_updated_at on public.activities;
create trigger trg_activities_updated_at before update on public.activities
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_sap_updated_at on public.student_activity_progress;
create trigger trg_sap_updated_at before update on public.student_activity_progress
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_smp_updated_at on public.student_module_progress;
create trigger trg_smp_updated_at before update on public.student_module_progress
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_ssp_updated_at on public.student_subject_progress;
create trigger trg_ssp_updated_at before update on public.student_subject_progress
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_access_links_updated_at on public.access_links;
create trigger trg_access_links_updated_at before update on public.access_links
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_notifications_updated_at on public.notifications;
create trigger trg_notifications_updated_at before update on public.notifications
for each row execute procedure public.set_updated_at();

create or replace function public.current_profile_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select p.role::text from public.profiles p where p.id = auth.uid()), 'anon');
$$;

create or replace function public.current_student_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select s.id from public.students s where s.profile_id = auth.uid() limit 1;
$$;

create or replace function public.current_family_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select f.id from public.families f where f.profile_id = auth.uid() limit 1;
$$;

create or replace function public.initialize_student_subject_progress(p_student_id uuid, p_subject_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total_modules integer;
begin
  select count(*) into v_total_modules
  from public.modules m
  where m.subject_id = p_subject_id;

  insert into public.student_subject_progress (
    student_id,
    subject_id,
    progress_percent,
    completed_modules,
    total_modules,
    status
  )
  values (
    p_student_id,
    p_subject_id,
    0,
    0,
    coalesce(v_total_modules, 0),
    case when coalesce(v_total_modules, 0) = 0 then 'pending'::public.progress_status else 'in_progress'::public.progress_status end
  )
  on conflict (student_id, subject_id)
  do update set total_modules = excluded.total_modules;

  insert into public.student_module_progress (
    student_id,
    module_id,
    status,
    unlocked_at,
    progress_percent
  )
  select
    p_student_id,
    m.id,
    case
      when m.position = 1 and not m.is_locked_by_default then 'pending'::public.progress_status
      else 'blocked'::public.progress_status
    end,
    case
      when m.position = 1 and not m.is_locked_by_default then now()
      else null
    end,
    0
  from public.modules m
  where m.subject_id = p_subject_id
  on conflict (student_id, module_id) do nothing;
end;
$$;

create or replace function public.on_student_subject_assigned()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.initialize_student_subject_progress(new.student_id, new.subject_id);
  return new;
end;
$$;

drop trigger if exists trg_student_subject_assigned on public.student_subjects;
create trigger trg_student_subject_assigned
after insert on public.student_subjects
for each row execute procedure public.on_student_subject_assigned();

create or replace function public.on_module_created_refresh_progress()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.student_module_progress (
    student_id,
    module_id,
    status,
    progress_percent
  )
  select
    ss.student_id,
    new.id,
    case
      when new.position = 1 and not new.is_locked_by_default then 'pending'::public.progress_status
      else 'blocked'::public.progress_status
    end,
    0
  from public.student_subjects ss
  where ss.subject_id = new.subject_id
  on conflict (student_id, module_id) do nothing;

  update public.student_subject_progress ssp
  set total_modules = (
    select count(*)
    from public.modules m
    where m.subject_id = new.subject_id
  )
  where ssp.subject_id = new.subject_id;

  return new;
end;
$$;

drop trigger if exists trg_module_created_refresh on public.modules;
create trigger trg_module_created_refresh
after insert on public.modules
for each row execute procedure public.on_module_created_refresh_progress();

create or replace function public.complete_activity_and_recalculate_progress(
  p_student_id uuid,
  p_activity_id uuid,
  p_score numeric default null,
  p_time_spent_seconds integer default 0,
  p_response_json jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_module_id uuid;
  v_subject_id uuid;
  v_current_position integer;
  v_next_module_id uuid;
  v_total_activities integer;
  v_completed_activities integer;
  v_module_progress numeric(5,2);
  v_module_status public.progress_status;
  v_total_modules integer;
  v_completed_modules integer;
  v_subject_progress numeric(5,2);
  v_subject_status public.progress_status;
begin
  select a.module_id, m.subject_id, m.position
  into v_module_id, v_subject_id, v_current_position
  from public.activities a
  join public.modules m on m.id = a.module_id
  where a.id = p_activity_id;

  if v_module_id is null then
    raise exception 'Actividad no encontrada';
  end if;

  if not exists (
    select 1
    from public.student_subjects ss
    where ss.student_id = p_student_id
      and ss.subject_id = v_subject_id
  ) then
    raise exception 'El estudiante no está asignado a la materia de esta actividad';
  end if;

  insert into public.student_activity_progress (
    student_id,
    activity_id,
    status,
    score,
    completed_at,
    time_spent_seconds,
    attempts,
    response_json
  )
  values (
    p_student_id,
    p_activity_id,
    'completed',
    p_score,
    now(),
    greatest(0, coalesce(p_time_spent_seconds, 0)),
    1,
    coalesce(p_response_json, '{}'::jsonb)
  )
  on conflict (student_id, activity_id)
  do update set
    status = 'completed',
    score = excluded.score,
    completed_at = now(),
    time_spent_seconds = public.student_activity_progress.time_spent_seconds + greatest(0, coalesce(p_time_spent_seconds, 0)),
    attempts = public.student_activity_progress.attempts + 1,
    response_json = excluded.response_json;

  select count(*)
  into v_total_activities
  from public.activities a
  where a.module_id = v_module_id;

  select count(*)
  into v_completed_activities
  from public.student_activity_progress sap
  join public.activities a on a.id = sap.activity_id
  where sap.student_id = p_student_id
    and a.module_id = v_module_id
    and sap.status = 'completed';

  if v_total_activities = 0 then
    v_module_progress := 100;
    v_module_status := 'completed';
  else
    v_module_progress := round((v_completed_activities::numeric * 100.0) / v_total_activities, 2);
    v_module_status := case when v_completed_activities >= v_total_activities then 'completed' else 'in_progress' end;
  end if;

  insert into public.student_module_progress (
    student_id,
    module_id,
    status,
    unlocked_at,
    completed_at,
    progress_percent
  )
  values (
    p_student_id,
    v_module_id,
    v_module_status,
    now(),
    case when v_module_status = 'completed' then now() else null end,
    v_module_progress
  )
  on conflict (student_id, module_id)
  do update set
    status = excluded.status,
    unlocked_at = coalesce(public.student_module_progress.unlocked_at, excluded.unlocked_at),
    completed_at = case
      when excluded.status = 'completed' then coalesce(public.student_module_progress.completed_at, now())
      else public.student_module_progress.completed_at
    end,
    progress_percent = excluded.progress_percent;

  if v_module_status = 'completed' then
    select m2.id
    into v_next_module_id
    from public.modules m2
    where m2.subject_id = v_subject_id
      and m2.position > v_current_position
    order by m2.position asc
    limit 1;

    if v_next_module_id is not null then
      insert into public.student_module_progress (
        student_id,
        module_id,
        status,
        unlocked_at,
        progress_percent
      )
      values (
        p_student_id,
        v_next_module_id,
        'pending',
        now(),
        0
      )
      on conflict (student_id, module_id)
      do update set
        status = case
          when public.student_module_progress.status = 'blocked' then 'pending'
          else public.student_module_progress.status
        end,
        unlocked_at = case
          when public.student_module_progress.unlocked_at is null then now()
          else public.student_module_progress.unlocked_at
        end;
    end if;
  end if;

  select count(*)
  into v_total_modules
  from public.modules m
  where m.subject_id = v_subject_id;

  select count(*)
  into v_completed_modules
  from public.student_module_progress smp
  join public.modules m on m.id = smp.module_id
  where smp.student_id = p_student_id
    and m.subject_id = v_subject_id
    and smp.status = 'completed';

  if v_total_modules = 0 then
    v_subject_progress := 0;
    v_subject_status := 'pending';
  else
    v_subject_progress := round((v_completed_modules::numeric * 100.0) / v_total_modules, 2);
    v_subject_status := case
      when v_completed_modules >= v_total_modules then 'completed'
      when v_completed_modules > 0 then 'in_progress'
      else 'pending'
    end;
  end if;

  insert into public.student_subject_progress (
    student_id,
    subject_id,
    progress_percent,
    completed_modules,
    total_modules,
    status
  )
  values (
    p_student_id,
    v_subject_id,
    v_subject_progress,
    v_completed_modules,
    v_total_modules,
    v_subject_status
  )
  on conflict (student_id, subject_id)
  do update set
    progress_percent = excluded.progress_percent,
    completed_modules = excluded.completed_modules,
    total_modules = excluded.total_modules,
    status = excluded.status;

  return jsonb_build_object(
    'student_id', p_student_id,
    'activity_id', p_activity_id,
    'module_id', v_module_id,
    'subject_id', v_subject_id,
    'module_progress_percent', v_module_progress,
    'subject_progress_percent', v_subject_progress,
    'module_status', v_module_status,
    'subject_status', v_subject_status
  );
end;
$$;

create or replace function public.teacher_student_progress_overview(p_teacher_id uuid)
returns table (
  student_id uuid,
  student_name text,
  progress_percent numeric(5,2),
  blocked_modules bigint,
  completed_modules bigint,
  total_time_seconds bigint
)
language sql
security definer
set search_path = public
as $$
  with teacher_subjects as (
    select s.id
    from public.subjects s
    where s.teacher_id = p_teacher_id
  ),
  assigned_students as (
    select distinct ss.student_id
    from public.student_subjects ss
    join teacher_subjects ts on ts.id = ss.subject_id
  ),
  student_base as (
    select
      st.id as student_id,
      coalesce(p.full_name, 'Estudiante') as student_name
    from public.students st
    join assigned_students a on a.student_id = st.id
    left join public.profiles p on p.id = st.profile_id
  ),
  progress_agg as (
    select
      ssp.student_id,
      round(avg(ssp.progress_percent)::numeric, 2) as progress_percent
    from public.student_subject_progress ssp
    join teacher_subjects ts on ts.id = ssp.subject_id
    group by ssp.student_id
  ),
  module_agg as (
    select
      smp.student_id,
      count(*) filter (where smp.status = 'blocked') as blocked_modules,
      count(*) filter (where smp.status = 'completed') as completed_modules
    from public.student_module_progress smp
    join public.modules m on m.id = smp.module_id
    join teacher_subjects ts on ts.id = m.subject_id
    group by smp.student_id
  ),
  time_agg as (
    select
      sap.student_id,
      coalesce(sum(sap.time_spent_seconds), 0)::bigint as total_time_seconds
    from public.student_activity_progress sap
    join public.activities a on a.id = sap.activity_id
    join public.modules m on m.id = a.module_id
    join teacher_subjects ts on ts.id = m.subject_id
    group by sap.student_id
  )
  select
    sb.student_id,
    sb.student_name,
    coalesce(pa.progress_percent, 0)::numeric(5,2) as progress_percent,
    coalesce(ma.blocked_modules, 0)::bigint as blocked_modules,
    coalesce(ma.completed_modules, 0)::bigint as completed_modules,
    coalesce(ta.total_time_seconds, 0)::bigint as total_time_seconds
  from student_base sb
  left join progress_agg pa on pa.student_id = sb.student_id
  left join module_agg ma on ma.student_id = sb.student_id
  left join time_agg ta on ta.student_id = sb.student_id
  order by sb.student_name asc;
$$;

grant execute on function public.complete_activity_and_recalculate_progress(uuid, uuid, numeric, integer, jsonb) to authenticated;
grant execute on function public.teacher_student_progress_overview(uuid) to authenticated;
grant execute on function public.current_profile_role() to authenticated;
grant execute on function public.current_student_id() to authenticated;
grant execute on function public.current_family_id() to authenticated;

alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.families enable row level security;
alter table public.family_students enable row level security;
alter table public.subjects enable row level security;
alter table public.modules enable row level security;
alter table public.activities enable row level security;
alter table public.student_subjects enable row level security;
alter table public.student_activity_progress enable row level security;
alter table public.student_module_progress enable row level security;
alter table public.student_subject_progress enable row level security;
alter table public.access_links enable row level security;
alter table public.notifications enable row level security;

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
for select using (
  id = auth.uid()
  or public.current_profile_role() in ('teacher', 'admin')
);

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
for update using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists students_select on public.students;
create policy students_select on public.students
for select using (
  profile_id = auth.uid()
  or public.current_profile_role() = 'admin'
  or (
    public.current_profile_role() = 'teacher'
    and exists (
      select 1
      from public.student_subjects ss
      join public.subjects s on s.id = ss.subject_id
      where ss.student_id = students.id
        and s.teacher_id = auth.uid()
    )
  )
  or exists (
    select 1
    from public.family_students fs
    join public.families f on f.id = fs.family_id
    where fs.student_id = students.id
      and f.profile_id = auth.uid()
  )
);

drop policy if exists students_manage_teacher_admin on public.students;
create policy students_manage_teacher_admin on public.students
for all using (public.current_profile_role() in ('teacher', 'admin'))
with check (public.current_profile_role() in ('teacher', 'admin'));

drop policy if exists families_select on public.families;
create policy families_select on public.families
for select using (
  profile_id = auth.uid()
  or public.current_profile_role() = 'admin'
  or (
    public.current_profile_role() = 'teacher'
    and exists (
      select 1
      from public.family_students fs
      join public.student_subjects ss on ss.student_id = fs.student_id
      join public.subjects sub on sub.id = ss.subject_id
      where fs.family_id = families.id
        and sub.teacher_id = auth.uid()
    )
  )
);

drop policy if exists families_manage_teacher_admin on public.families;
create policy families_manage_teacher_admin on public.families
for all using (public.current_profile_role() in ('teacher', 'admin'))
with check (public.current_profile_role() in ('teacher', 'admin'));

drop policy if exists family_students_select on public.family_students;
create policy family_students_select on public.family_students
for select using (
  public.current_profile_role() in ('teacher', 'admin')
  or family_id = public.current_family_id()
);

drop policy if exists family_students_manage on public.family_students;
create policy family_students_manage on public.family_students
for all using (public.current_profile_role() in ('teacher', 'admin'))
with check (public.current_profile_role() in ('teacher', 'admin'));

drop policy if exists subjects_select on public.subjects;
create policy subjects_select on public.subjects
for select using (
  teacher_id = auth.uid()
  or public.current_profile_role() = 'admin'
  or exists (
    select 1
    from public.student_subjects ss
    join public.students st on st.id = ss.student_id
    where ss.subject_id = subjects.id
      and st.profile_id = auth.uid()
  )
  or exists (
    select 1
    from public.student_subjects ss
    join public.family_students fs on fs.student_id = ss.student_id
    join public.families f on f.id = fs.family_id
    where ss.subject_id = subjects.id
      and f.profile_id = auth.uid()
  )
);

drop policy if exists subjects_manage on public.subjects;
create policy subjects_manage on public.subjects
for all using (
  teacher_id = auth.uid() or public.current_profile_role() = 'admin'
)
with check (
  teacher_id = auth.uid() or public.current_profile_role() = 'admin'
);

drop policy if exists modules_select on public.modules;
create policy modules_select on public.modules
for select using (
  exists (
    select 1
    from public.subjects s
    where s.id = modules.subject_id
      and (
        s.teacher_id = auth.uid()
        or public.current_profile_role() = 'admin'
        or exists (
          select 1
          from public.student_subjects ss
          join public.students st on st.id = ss.student_id
          where ss.subject_id = s.id and st.profile_id = auth.uid()
        )
        or exists (
          select 1
          from public.student_subjects ss
          join public.family_students fs on fs.student_id = ss.student_id
          join public.families f on f.id = fs.family_id
          where ss.subject_id = s.id and f.profile_id = auth.uid()
        )
      )
  )
);

drop policy if exists modules_manage on public.modules;
create policy modules_manage on public.modules
for all using (
  exists (
    select 1 from public.subjects s
    where s.id = modules.subject_id
      and (s.teacher_id = auth.uid() or public.current_profile_role() = 'admin')
  )
)
with check (
  exists (
    select 1 from public.subjects s
    where s.id = modules.subject_id
      and (s.teacher_id = auth.uid() or public.current_profile_role() = 'admin')
  )
);

drop policy if exists activities_select on public.activities;
create policy activities_select on public.activities
for select using (
  exists (
    select 1
    from public.modules m
    join public.subjects s on s.id = m.subject_id
    where m.id = activities.module_id
      and (
        s.teacher_id = auth.uid()
        or public.current_profile_role() = 'admin'
        or exists (
          select 1
          from public.student_subjects ss
          join public.students st on st.id = ss.student_id
          where ss.subject_id = s.id and st.profile_id = auth.uid()
        )
        or exists (
          select 1
          from public.student_subjects ss
          join public.family_students fs on fs.student_id = ss.student_id
          join public.families f on f.id = fs.family_id
          where ss.subject_id = s.id and f.profile_id = auth.uid()
        )
      )
  )
);

drop policy if exists activities_manage on public.activities;
create policy activities_manage on public.activities
for all using (
  exists (
    select 1
    from public.modules m
    join public.subjects s on s.id = m.subject_id
    where m.id = activities.module_id
      and (s.teacher_id = auth.uid() or public.current_profile_role() = 'admin')
  )
)
with check (
  exists (
    select 1
    from public.modules m
    join public.subjects s on s.id = m.subject_id
    where m.id = activities.module_id
      and (s.teacher_id = auth.uid() or public.current_profile_role() = 'admin')
  )
);

drop policy if exists student_subjects_select on public.student_subjects;
create policy student_subjects_select on public.student_subjects
for select using (
  public.current_profile_role() = 'admin'
  or exists (
    select 1 from public.subjects s
    where s.id = student_subjects.subject_id and s.teacher_id = auth.uid()
  )
  or student_id = public.current_student_id()
  or exists (
    select 1
    from public.family_students fs
    where fs.family_id = public.current_family_id()
      and fs.student_id = student_subjects.student_id
  )
);

drop policy if exists student_subjects_manage on public.student_subjects;
create policy student_subjects_manage on public.student_subjects
for all using (
  public.current_profile_role() = 'admin'
  or exists (
    select 1 from public.subjects s
    where s.id = student_subjects.subject_id and s.teacher_id = auth.uid()
  )
)
with check (
  public.current_profile_role() = 'admin'
  or exists (
    select 1 from public.subjects s
    where s.id = student_subjects.subject_id and s.teacher_id = auth.uid()
  )
);

drop policy if exists sap_select on public.student_activity_progress;
create policy sap_select on public.student_activity_progress
for select using (
  student_id = public.current_student_id()
  or public.current_profile_role() = 'admin'
  or exists (
    select 1
    from public.activities a
    join public.modules m on m.id = a.module_id
    join public.subjects s on s.id = m.subject_id
    where a.id = student_activity_progress.activity_id
      and s.teacher_id = auth.uid()
  )
  or exists (
    select 1
    from public.family_students fs
    where fs.family_id = public.current_family_id()
      and fs.student_id = student_activity_progress.student_id
  )
);

drop policy if exists sap_manage on public.student_activity_progress;
create policy sap_manage on public.student_activity_progress
for all using (
  student_id = public.current_student_id()
  or public.current_profile_role() = 'admin'
  or exists (
    select 1
    from public.activities a
    join public.modules m on m.id = a.module_id
    join public.subjects s on s.id = m.subject_id
    where a.id = student_activity_progress.activity_id
      and s.teacher_id = auth.uid()
  )
)
with check (
  student_id = public.current_student_id()
  or public.current_profile_role() = 'admin'
  or exists (
    select 1
    from public.activities a
    join public.modules m on m.id = a.module_id
    join public.subjects s on s.id = m.subject_id
    where a.id = student_activity_progress.activity_id
      and s.teacher_id = auth.uid()
  )
);

drop policy if exists smp_select on public.student_module_progress;
create policy smp_select on public.student_module_progress
for select using (
  student_id = public.current_student_id()
  or public.current_profile_role() = 'admin'
  or exists (
    select 1
    from public.modules m
    join public.subjects s on s.id = m.subject_id
    where m.id = student_module_progress.module_id
      and s.teacher_id = auth.uid()
  )
  or exists (
    select 1
    from public.family_students fs
    where fs.family_id = public.current_family_id()
      and fs.student_id = student_module_progress.student_id
  )
);

drop policy if exists smp_manage on public.student_module_progress;
create policy smp_manage on public.student_module_progress
for all using (
  student_id = public.current_student_id()
  or public.current_profile_role() = 'admin'
  or exists (
    select 1
    from public.modules m
    join public.subjects s on s.id = m.subject_id
    where m.id = student_module_progress.module_id
      and s.teacher_id = auth.uid()
  )
)
with check (
  student_id = public.current_student_id()
  or public.current_profile_role() = 'admin'
  or exists (
    select 1
    from public.modules m
    join public.subjects s on s.id = m.subject_id
    where m.id = student_module_progress.module_id
      and s.teacher_id = auth.uid()
  )
);

drop policy if exists ssp_select on public.student_subject_progress;
create policy ssp_select on public.student_subject_progress
for select using (
  student_id = public.current_student_id()
  or public.current_profile_role() = 'admin'
  or exists (
    select 1
    from public.subjects s
    where s.id = student_subject_progress.subject_id
      and s.teacher_id = auth.uid()
  )
  or exists (
    select 1
    from public.family_students fs
    where fs.family_id = public.current_family_id()
      and fs.student_id = student_subject_progress.student_id
  )
);

drop policy if exists ssp_manage on public.student_subject_progress;
create policy ssp_manage on public.student_subject_progress
for all using (
  student_id = public.current_student_id()
  or public.current_profile_role() = 'admin'
  or exists (
    select 1
    from public.subjects s
    where s.id = student_subject_progress.subject_id
      and s.teacher_id = auth.uid()
  )
)
with check (
  student_id = public.current_student_id()
  or public.current_profile_role() = 'admin'
  or exists (
    select 1
    from public.subjects s
    where s.id = student_subject_progress.subject_id
      and s.teacher_id = auth.uid()
  )
);

drop policy if exists access_links_select on public.access_links;
create policy access_links_select on public.access_links
for select using (
  public.current_profile_role() = 'admin'
  or exists (
    select 1
    from public.students st
    join public.subjects s on s.teacher_id = auth.uid()
    join public.student_subjects ss on ss.subject_id = s.id and ss.student_id = st.id
    where st.id = access_links.student_id
  )
  or access_links.student_id = public.current_student_id()
  or exists (
    select 1
    from public.family_students fs
    where fs.family_id = public.current_family_id()
      and fs.student_id = access_links.student_id
  )
);

drop policy if exists access_links_manage on public.access_links;
create policy access_links_manage on public.access_links
for all using (
  public.current_profile_role() = 'admin'
  or exists (
    select 1
    from public.students st
    join public.subjects s on s.teacher_id = auth.uid()
    join public.student_subjects ss on ss.subject_id = s.id and ss.student_id = st.id
    where st.id = access_links.student_id
  )
)
with check (
  public.current_profile_role() = 'admin'
  or exists (
    select 1
    from public.students st
    join public.subjects s on s.teacher_id = auth.uid()
    join public.student_subjects ss on ss.subject_id = s.id and ss.student_id = st.id
    where st.id = access_links.student_id
  )
);

drop policy if exists notifications_select on public.notifications;
create policy notifications_select on public.notifications
for select using (user_id = auth.uid() or public.current_profile_role() = 'admin');

drop policy if exists notifications_manage on public.notifications;
create policy notifications_manage on public.notifications
for all using (user_id = auth.uid() or public.current_profile_role() = 'admin')
with check (user_id = auth.uid() or public.current_profile_role() = 'admin');
