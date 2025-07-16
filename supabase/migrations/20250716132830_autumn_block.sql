/*
  # Create test users for authentication

  1. Test Users
    - Creates test accounts for customer, manager, and admin roles
    - Sets up authentication records in auth.users
    - Creates corresponding profile records

  2. Security
    - Uses Supabase's built-in authentication system
    - Profiles are linked to auth.users via foreign key
*/

-- Insert test users into auth.users (this requires admin privileges)
-- Note: In production, users should sign up through the application

-- Create customer test user
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'customer@test.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Create manager test user
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'manager@test.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Create admin test user
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@test.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Create corresponding profiles for the test users
-- Customer profile
INSERT INTO profiles (id, full_name, role)
SELECT id, 'Test Customer', 'customer'
FROM auth.users 
WHERE email = 'customer@test.com'
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- Manager profile
INSERT INTO profiles (id, full_name, role)
SELECT id, 'Test Manager', 'manager'
FROM auth.users 
WHERE email = 'manager@test.com'
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- Admin profile
INSERT INTO profiles (id, full_name, role)
SELECT id, 'Test Admin', 'admin'
FROM auth.users 
WHERE email = 'admin@test.com'
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;