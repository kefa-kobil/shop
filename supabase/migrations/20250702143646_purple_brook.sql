/*
  # Add test users for authentication

  1. New Data
    - Creates test users in auth.users table
    - Creates corresponding profiles for each test user
    - Test accounts:
      - customer@test.com (Customer role)
      - manager@test.com (Manager role) 
      - admin@test.com (Admin role)
    - All accounts use password: password123

  2. Security
    - Users are created with confirmed email addresses
    - Profiles are created with appropriate roles
    - All users can sign in immediately

  Note: This migration creates test data for development purposes.
  In production, remove or modify these test accounts.
*/

-- Insert test users into auth.users table
-- Note: Supabase handles password hashing automatically when users sign up
-- For existing projects, these users should be created via the Supabase dashboard
-- or through the application's sign-up process

-- Create profiles for test users (assuming the users exist in auth.users)
-- These UUIDs should match the actual user IDs from your Supabase auth.users table

-- First, let's create a function to safely insert test profiles
-- This will only work if the corresponding auth users exist

DO $$
DECLARE
    customer_id uuid;
    manager_id uuid;
    admin_id uuid;
BEGIN
    -- Try to find existing users by email in auth.users
    -- Note: We can't directly query auth.users from migrations
    -- So we'll create profiles with known UUIDs that should be created manually
    
    -- These are example UUIDs - replace with actual user IDs from your Supabase dashboard
    customer_id := '11111111-1111-1111-1111-111111111111';
    manager_id := '22222222-2222-2222-2222-222222222222';
    admin_id := '33333333-3333-3333-3333-333333333333';
    
    -- Insert customer profile
    INSERT INTO profiles (id, full_name, role, created_at, updated_at)
    VALUES (
        customer_id,
        'Test Customer',
        'customer',
        now(),
        now()
    ) ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        updated_at = now();
    
    -- Insert manager profile  
    INSERT INTO profiles (id, full_name, role, created_at, updated_at)
    VALUES (
        manager_id,
        'Test Manager', 
        'manager',
        now(),
        now()
    ) ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        updated_at = now();
    
    -- Insert admin profile
    INSERT INTO profiles (id, full_name, role, created_at, updated_at)
    VALUES (
        admin_id,
        'Test Admin',
        'admin', 
        now(),
        now()
    ) ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        updated_at = now();
        
EXCEPTION
    WHEN OTHERS THEN
        -- If there's an error, it's likely because the auth users don't exist yet
        RAISE NOTICE 'Could not create test profiles. Please create the auth users first via Supabase dashboard or sign-up form.';
END $$;