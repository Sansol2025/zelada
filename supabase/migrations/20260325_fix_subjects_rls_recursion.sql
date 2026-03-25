-- Fix RLS recursion between subjects and student_subjects policies.
-- The previous policies referenced each other, causing:
-- "infinite recursion detected in policy for relation 'subjects'".

create or replace function public.is_subject_teacher(p_subject_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.subjects s
    where s.id = p_subject_id
      and s.teacher_id = auth.uid()
  );
$$;

grant execute on function public.is_subject_teacher(uuid) to authenticated;

drop policy if exists student_subjects_select on public.student_subjects;
create policy student_subjects_select on public.student_subjects
for select using (
  public.current_profile_role() = 'admin'
  or public.is_subject_teacher(subject_id)
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
  or public.is_subject_teacher(subject_id)
)
with check (
  public.current_profile_role() = 'admin'
  or public.is_subject_teacher(subject_id)
);
