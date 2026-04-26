-- =========================================================================
-- PARCHE DE SEGURIDAD - APLICAR EN EL SQL EDITOR DE SUPABASE (NUBE)
-- =========================================================================

-- 1. CORRECCION: RESTABLECER LA POLITICA DE PRIVACIDAD PARA ALUMNOS
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

-- 2. CORRECCION: RESTABLECER LA POLITICA DE PRIVACIDAD PARA FAMILIAS
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

-- 3. CORRECCION: VALIDACION DE MATERIA AL COMPLETAR ACTIVIDAD
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

  -- ¡NUEVA VALIDACION CRITICA!
  if not exists (
    select 1
    from public.student_subjects ss
    where ss.student_id = p_student_id
      and ss.subject_id = v_subject_id
  ) then
    raise exception 'El estudiante no está asignado a la materia de esta actividad';
  end if;

  insert into public.student_activity_progress (
    student_id, activity_id, status, score, completed_at, time_spent_seconds, attempts, response_json
  )
  values (
    p_student_id, p_activity_id, 'completed', p_score, now(),
    greatest(0, coalesce(p_time_spent_seconds, 0)), 1, coalesce(p_response_json, '{}'::jsonb)
  )
  on conflict (student_id, activity_id)
  do update set
    status = 'completed',
    score = excluded.score,
    completed_at = now(),
    time_spent_seconds = public.student_activity_progress.time_spent_seconds + greatest(0, coalesce(p_time_spent_seconds, 0)),
    attempts = public.student_activity_progress.attempts + 1,
    response_json = excluded.response_json;

  select count(*) into v_total_activities
  from public.activities a where a.module_id = v_module_id;

  select count(*) into v_completed_activities
  from public.student_activity_progress sap
  join public.activities a on a.id = sap.activity_id
  where sap.student_id = p_student_id and a.module_id = v_module_id and sap.status = 'completed';

  if v_total_activities = 0 then
    v_module_progress := 100;
    v_module_status := 'completed';
  else
    v_module_progress := round((v_completed_activities::numeric * 100.0) / v_total_activities, 2);
    v_module_status := case when v_completed_activities >= v_total_activities then 'completed' else 'in_progress' end;
  end if;

  insert into public.student_module_progress (
    student_id, module_id, status, unlocked_at, completed_at, progress_percent
  )
  values (
    p_student_id, v_module_id, v_module_status, now(),
    case when v_module_status = 'completed' then now() else null end, v_module_progress
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
    select m2.id into v_next_module_id
    from public.modules m2
    where m2.subject_id = v_subject_id and m2.position > v_current_position
    order by m2.position asc limit 1;

    if v_next_module_id is not null then
      insert into public.student_module_progress (student_id, module_id, status, unlocked_at, progress_percent)
      values (p_student_id, v_next_module_id, 'pending', now(), 0)
      on conflict (student_id, module_id)
      do update set
        status = case when public.student_module_progress.status = 'blocked' then 'pending' else public.student_module_progress.status end,
        unlocked_at = case when public.student_module_progress.unlocked_at is null then now() else public.student_module_progress.unlocked_at end;
    end if;
  end if;

  select count(*) into v_total_modules
  from public.modules m where m.subject_id = v_subject_id;

  select count(*) into v_completed_modules
  from public.student_module_progress smp
  join public.modules m on m.id = smp.module_id
  where smp.student_id = p_student_id and m.subject_id = v_subject_id and smp.status = 'completed';

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
    student_id, subject_id, progress_percent, completed_modules, total_modules, status
  )
  values (
    p_student_id, v_subject_id, v_subject_progress, v_completed_modules, v_total_modules, v_subject_status
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
