-- =============================================================================
-- SAS Trace — SQL para crear USUARIOS DUMMY en Supabase
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ORDEN: 1) schema.sql → 2) seed_users.sql → 3) seed_data.sql
-- =============================================================================
--
-- FIX CRÍTICO incluido:
--   - auth.users con bcrypt cost=10 (igual que usa Supabase internamente)
--   - auth.identities → SIN ESTO EL LOGIN FALLA AUNQUE LA CONTRASEÑA SEA CORRECTA
--
-- IDs fijos de usuarios:
--   Admin:    a0000000-0000-0000-0000-000000000001
--   Operador: a0000000-0000-0000-0000-000000000002
-- =============================================================================

-- Extensión necesaria para bcrypt
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================================================
-- PASO 0: Limpiar si ya existen (para poder re-ejecutar limpio)
-- =============================================================================
DELETE FROM auth.identities
  WHERE user_id IN (
    'a0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000002'
  );

DELETE FROM auth.users
  WHERE id IN (
    'a0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000002'
  )
  OR email IN ('admin@sastrace.com', 'operador@sastrace.com');

DELETE FROM profiles
  WHERE id IN (
    'a0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000002'
  );

-- =============================================================================
-- PASO 1: Crear usuarios en auth.users
-- CLAVE: gen_salt('bf', 10) — cost factor 10, igual que Supabase Auth
-- =============================================================================

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
) VALUES
-- Admin
(
  'a0000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'admin@sastrace.com',
  crypt('SasTrace2026!', gen_salt('bf', 10)),
  now(),
  '{"full_name": "Andrés Rodríguez"}',
  '{"provider": "email", "providers": ["email"]}',
  false,
  'authenticated',
  'authenticated',
  now(),
  now(),
  '', '', ''
),
-- Operador
(
  'a0000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'operador@sastrace.com',
  crypt('SasTrace2026!', gen_salt('bf', 10)),
  now(),
  '{"full_name": "Leo Martínez"}',
  '{"provider": "email", "providers": ["email"]}',
  false,
  'authenticated',
  'authenticated',
  now(),
  now(),
  '', '', ''
);

-- =============================================================================
-- PASO 2: Crear identities — SIN ESTE INSERT EL LOGIN NUNCA FUNCIONA
-- Supabase Auth valida la contraseña a través de auth.identities, no solo auth.users
-- =============================================================================

INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES
-- Admin identity
(
  gen_random_uuid(),
  'a0000000-0000-0000-0000-000000000001',
  jsonb_build_object(
    'sub', 'a0000000-0000-0000-0000-000000000001',
    'email', 'admin@sastrace.com',
    'email_verified', true
  ),
  'email',
  'admin@sastrace.com',
  now(),
  now(),
  now()
),
-- Operador identity
(
  gen_random_uuid(),
  'a0000000-0000-0000-0000-000000000002',
  jsonb_build_object(
    'sub', 'a0000000-0000-0000-0000-000000000002',
    'email', 'operador@sastrace.com',
    'email_verified', true
  ),
  'email',
  'operador@sastrace.com',
  now(),
  now(),
  now()
);

-- =============================================================================
-- PASO 3: Crear profiles con roles correctos
-- (el trigger on_auth_user_created puede haberlos creado, hacemos upsert)
-- =============================================================================

INSERT INTO profiles (id, full_name, email, role) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Andrés Rodríguez', 'admin@sastrace.com', 'admin'),
  ('a0000000-0000-0000-0000-000000000002', 'Leo Martínez', 'operador@sastrace.com', 'operator')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email     = EXCLUDED.email,
  role      = EXCLUDED.role;

-- =============================================================================
-- PASO 4: Verificación — ejecutar estas queries para confirmar
-- =============================================================================

-- ¿Usuarios creados?
SELECT
  u.id,
  u.email,
  u.email_confirmed_at IS NOT NULL AS email_confirmed,
  i.provider,
  p.full_name,
  p.role
FROM auth.users u
LEFT JOIN auth.identities i ON i.user_id = u.id
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email IN ('admin@sastrace.com', 'operador@sastrace.com');

-- Resultado esperado: 2 filas con email_confirmed = true, provider = email,
-- full_name y role completados
