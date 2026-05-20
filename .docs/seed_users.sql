-- =============================================================================
-- SAS Trace — SQL para crear USUARIOS DUMMY directamente en Supabase
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- Orden de ejecución: PRIMERO este archivo, LUEGO seed_data.sql
-- =============================================================================
--
-- ESTE SCRIPT:
--   1. Crea los 2 usuarios en auth.users con contraseña cifrada
--   2. Crea sus profiles con rol correcto
--   3. Actualiza las órdenes de trabajo para asignar created_by
--
-- IDs fijos de usuarios:
--   Admin:    a0000000-0000-0000-0000-000000000001
--   Operador: a0000000-0000-0000-0000-000000000002
-- =============================================================================

-- Habilitar pgcrypto para cifrado de contraseñas
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================================================
-- 1. CREAR USUARIOS EN auth.users
-- =============================================================================

-- Usuario admin
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  raw_app_meta_data,
  is_super_admin,
  role,
  aud,
  created_at,
  updated_at,
  confirmation_token,
  email_change_token_new,
  recovery_token
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'admin@sastrace.com',
  crypt('SasTrace2026!', gen_salt('bf')),
  now(),
  '{"full_name": "Andrés Rodríguez", "role": "admin"}',
  '{"provider": "email", "providers": ["email"]}',
  false,
  'authenticated',
  'authenticated',
  now(),
  now(),
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Usuario operador
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  raw_app_meta_data,
  is_super_admin,
  role,
  aud,
  created_at,
  updated_at,
  confirmation_token,
  email_change_token_new,
  recovery_token
) VALUES (
  'a0000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'operador@sastrace.com',
  crypt('SasTrace2026!', gen_salt('bf')),
  now(),
  '{"full_name": "Leo Martínez", "role": "operator"}',
  '{"provider": "email", "providers": ["email"]}',
  false,
  'authenticated',
  'authenticated',
  now(),
  now(),
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 2. CREAR PROFILES (el trigger on_auth_user_created debería haberlos creado,
--    pero los insertamos manualmente con upsert por si el trigger falló)
-- =============================================================================

INSERT INTO profiles (id, full_name, email, role) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Andrés Rodríguez', 'admin@sastrace.com', 'admin'),
  ('a0000000-0000-0000-0000-000000000002', 'Leo Martínez', 'operador@sastrace.com', 'operator')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- =============================================================================
-- 3. ACTUALIZAR ÓRDENES para asignar created_by a los usuarios reales
--    (las primeras órdenes las creó el admin, las últimas el operador)
-- =============================================================================

UPDATE work_orders SET
  created_by = 'a0000000-0000-0000-0000-000000000001'  -- admin
WHERE id IN (
  'bb100000-0000-0000-0000-000000000001',
  'bb100000-0000-0000-0000-000000000002',
  'bb100000-0000-0000-0000-000000000003',
  'bb100000-0000-0000-0000-000000000004',
  'bb100000-0000-0000-0000-000000000005',
  'bb100000-0000-0000-0000-000000000006',
  'bb100000-0000-0000-0000-000000000007',
  'bb100000-0000-0000-0000-000000000008'
);

UPDATE work_orders SET
  created_by = 'a0000000-0000-0000-0000-000000000002'  -- operador
WHERE id IN (
  'bb100000-0000-0000-0000-000000000009',
  'bb100000-0000-0000-0000-000000000010',
  'bb100000-0000-0000-0000-000000000011',
  'bb100000-0000-0000-0000-000000000012',
  'bb100000-0000-0000-0000-000000000013'
);

-- =============================================================================
-- 4. ASIGNAR changed_by en el historial de estados
-- =============================================================================

UPDATE work_order_status_history SET
  changed_by = 'a0000000-0000-0000-0000-000000000001'
WHERE changed_by IS NULL
  AND work_order_id IN (
    'bb100000-0000-0000-0000-000000000001',
    'bb100000-0000-0000-0000-000000000002',
    'bb100000-0000-0000-0000-000000000004'
  );

-- =============================================================================
-- 5. VERIFICACIÓN — Ejecutar después para confirmar que todo está OK
-- =============================================================================

-- Verificar usuarios creados:
-- SELECT id, email, email_confirmed_at FROM auth.users WHERE email LIKE '%sastrace%';

-- Verificar profiles:
-- SELECT id, full_name, email, role FROM profiles;

-- Verificar órdenes con usuario asignado:
-- SELECT order_number, created_by FROM work_orders ORDER BY order_number;

-- Para testear login (debería devolver el usuario si la contraseña es correcta):
-- SELECT id, email FROM auth.users WHERE email = 'admin@sastrace.com';
