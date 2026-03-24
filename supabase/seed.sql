-- Demo seed for Aprender Sin Barreras
-- Prerequisite: create these auth users in Supabase Auth (Dashboard or Admin API):
--   docente@zelada.edu.ar
--   familia@zelada.edu.ar
--   estudiante1@zelada.edu.ar
--   estudiante2@zelada.edu.ar
--   admin@zelada.edu.ar

do $$
declare
  v_teacher_id uuid;
  v_family_id uuid;
  v_student1_profile_id uuid;
  v_student2_profile_id uuid;
  v_admin_id uuid;
  v_family_row_id uuid;
  v_student1_id uuid;
  v_student2_id uuid;
  v_subject_math uuid;
  v_subject_lengua uuid;
  v_module_math_1 uuid;
  v_module_math_2 uuid;
  v_module_lengua_1 uuid;
begin
  select id into v_teacher_id from auth.users where email = 'docente@zelada.edu.ar' limit 1;
  select id into v_family_id from auth.users where email = 'familia@zelada.edu.ar' limit 1;
  select id into v_student1_profile_id from auth.users where email = 'estudiante1@zelada.edu.ar' limit 1;
  select id into v_student2_profile_id from auth.users where email = 'estudiante2@zelada.edu.ar' limit 1;
  select id into v_admin_id from auth.users where email = 'admin@zelada.edu.ar' limit 1;

  if v_teacher_id is null or v_family_id is null or v_student1_profile_id is null or v_student2_profile_id is null or v_admin_id is null then
    raise exception 'Faltan usuarios en auth.users. Crea primero los 5 emails demo indicados en supabase/seed.sql.';
  end if;

  insert into public.profiles (id, full_name, role)
  values
    (v_teacher_id, 'Docente Demo', 'teacher'),
    (v_family_id, 'Familia Demo', 'family'),
    (v_student1_profile_id, 'Alumno Demo 1', 'student'),
    (v_student2_profile_id, 'Alumno Demo 2', 'student'),
    (v_admin_id, 'Admin Demo', 'admin')
  on conflict (id) do update set
    full_name = excluded.full_name,
    role = excluded.role;

  insert into public.students (profile_id, school_name, grade, section, active)
  values
    (v_student1_profile_id, 'Escuela N° 361', '5to', 'A', true),
    (v_student2_profile_id, 'Escuela N° 361', '5to', 'A', true)
  on conflict (profile_id) do update set
    school_name = excluded.school_name,
    grade = excluded.grade,
    section = excluded.section,
    active = excluded.active
  returning id into v_student1_id;

  select id into v_student1_id from public.students where profile_id = v_student1_profile_id;
  select id into v_student2_id from public.students where profile_id = v_student2_profile_id;

  insert into public.families (profile_id, relation_type)
  values (v_family_id, 'Madre/Padre')
  on conflict (profile_id) do update set relation_type = excluded.relation_type
  returning id into v_family_row_id;

  select id into v_family_row_id from public.families where profile_id = v_family_id;

  insert into public.family_students (family_id, student_id)
  values
    (v_family_row_id, v_student1_id),
    (v_family_row_id, v_student2_id)
  on conflict (family_id, student_id) do nothing;

  insert into public.subjects (teacher_id, title, description, color, icon, is_active)
  values
    (v_teacher_id, 'Matemática', 'Resolución de problemas y cálculo visual.', '#43b8f4', 'calculator', true),
    (v_teacher_id, 'Lengua', 'Lectoescritura con apoyo visual y auditivo.', '#6aa9ff', 'book-open', true)
  on conflict do nothing;

  select id into v_subject_math
  from public.subjects
  where teacher_id = v_teacher_id and title = 'Matemática'
  limit 1;

  select id into v_subject_lengua
  from public.subjects
  where teacher_id = v_teacher_id and title = 'Lengua'
  limit 1;

  insert into public.modules (subject_id, title, description, position, is_locked_by_default)
  values
    (v_subject_math, 'Números y cantidades', 'Reconocer cantidades y operaciones simples.', 1, false),
    (v_subject_math, 'Problemas cotidianos', 'Aplicar sumas y restas en situaciones reales.', 2, true),
    (v_subject_lengua, 'Comprensión de palabras', 'Asociar imagen, palabra y sonido.', 1, false)
  on conflict (subject_id, position) do update set
    title = excluded.title,
    description = excluded.description,
    is_locked_by_default = excluded.is_locked_by_default;

  select id into v_module_math_1 from public.modules where subject_id = v_subject_math and position = 1;
  select id into v_module_math_2 from public.modules where subject_id = v_subject_math and position = 2;
  select id into v_module_lengua_1 from public.modules where subject_id = v_subject_lengua and position = 1;

  insert into public.activities (module_id, type, title, prompt, instructions, settings_json, position)
  values
    (
      v_module_math_1,
      'multiple_choice_visual',
      'Contar objetos',
      '¿Cuántas manzanas hay en la imagen?',
      'Selecciona la opción correcta.',
      '{"options":[{"id":"a","label":"3","isCorrect":false},{"id":"b","label":"4","isCorrect":true},{"id":"c","label":"5","isCorrect":false}]}'::jsonb,
      1
    ),
    (
      v_module_math_1,
      'true_false',
      'Operación simple',
      '2 + 2 es igual a 4.',
      'Marca verdadero o falso.',
      '{}'::jsonb,
      2
    ),
    (
      v_module_math_2,
      'sequence',
      'Ordena los pasos',
      'Ordena los pasos para resolver el problema.',
      'Primero lee, luego piensa, después responde.',
      '{"steps":["Leer","Pensar","Responder"]}'::jsonb,
      1
    ),
    (
      v_module_lengua_1,
      'image_select',
      'Selecciona la imagen',
      'Elige la imagen que corresponde a la palabra "sol".',
      'Observa y toca la imagen correcta.',
      '{"options":[{"id":"sol","label":"Sol","isCorrect":true},{"id":"luna","label":"Luna","isCorrect":false}]}'::jsonb,
      1
    )
  on conflict (module_id, position) do update set
    type = excluded.type,
    title = excluded.title,
    prompt = excluded.prompt,
    instructions = excluded.instructions,
    settings_json = excluded.settings_json;

  insert into public.student_subjects (student_id, subject_id)
  values
    (v_student1_id, v_subject_math),
    (v_student1_id, v_subject_lengua),
    (v_student2_id, v_subject_math)
  on conflict (student_id, subject_id) do nothing;

  insert into public.access_links (student_id, type, token, expires_at, is_active)
  values
    (v_student1_id, 'qr', encode(gen_random_bytes(16), 'hex'), now() + interval '90 days', true),
    (v_student2_id, 'qr', encode(gen_random_bytes(16), 'hex'), now() + interval '90 days', true),
    (v_student1_id, 'magic_link', encode(gen_random_bytes(16), 'hex'), now() + interval '7 days', true)
  on conflict (token) do nothing;
end $$;
