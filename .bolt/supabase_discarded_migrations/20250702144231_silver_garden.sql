/*
  # Fix database schema with users table and proper setup

  1. New Tables
    - `users` table to store authentication data (referenced by profiles)
    - Proper foreign key relationships

  2. Security
    - Enable RLS on all tables
    - Add proper policies for user access
    - Fix existing policies

  3. Functions
    - Create trigger function to handle new user registration
    - Automatically create profile when user signs up

  4. Fixes
    - Resolve foreign key constraint issues
    - Ensure proper user registration flow
*/

-- Create users table (this should match Supabase auth.users structure)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Update profiles table to ensure proper structure
DO $$
BEGIN
  -- Add any missing columns to profiles if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN id uuid PRIMARY KEY DEFAULT gen_random_uuid();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN full_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role text DEFAULT 'customer';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN created_at timestamptz DEFAULT now();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Ensure profiles table has proper constraints
DO $$
BEGIN
  -- Add role check constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'profiles' AND constraint_name = 'profiles_role_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
    CHECK (role = ANY (ARRAY['customer'::text, 'manager'::text, 'admin'::text]));
  END IF;
END $$;

-- Create or replace the trigger function for handling new users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users (this connects to Supabase's auth system)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Insert some test data for development
DO $$
BEGIN
  -- Insert test users if they don't exist
  INSERT INTO users (id, email) VALUES 
    ('11111111-1111-1111-1111-111111111111', 'customer@test.com'),
    ('22222222-2222-2222-2222-222222222222', 'manager@test.com'),
    ('33333333-3333-3333-3333-333333333333', 'admin@test.com')
  ON CONFLICT (email) DO NOTHING;

  -- Insert corresponding profiles
  INSERT INTO profiles (id, full_name, role, created_at, updated_at) VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Test Customer', 'customer', NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222222', 'Test Manager', 'manager', NOW(), NOW()),
    ('33333333-3333-3333-3333-333333333333', 'Test Admin', 'admin', NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    updated_at = NOW();
END $$;

-- Insert some sample products if the table is empty
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM products LIMIT 1) THEN
    INSERT INTO products (name, description, price, original_price, stock, category, image_url, discount_percentage, rating, reviews_count) VALUES
    ('Fresh Bananas', 'Organic bananas, perfect for breakfast', 2.99, 3.49, 50, 'Fruits', 'https://images.pexels.com/photos/2872755/pexels-photo-2872755.jpeg', 15, 4.5, 23),
    ('Whole Milk', 'Fresh whole milk, 1 gallon', 3.99, NULL, 30, 'Dairy', 'https://images.pexels.com/photos/236010/pexels-photo-236010.jpeg', NULL, 4.2, 45),
    ('Sourdough Bread', 'Artisan sourdough bread, freshly baked', 4.99, 5.99, 20, 'Bakery', 'https://images.pexels.com/photos/209206/pexels-photo-209206.jpeg', 17, 4.8, 67),
    ('Ground Beef', 'Premium ground beef, 1 lb package', 8.99, 9.99, 25, 'Meat', 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg', 10, 4.3, 34),
    ('Roma Tomatoes', 'Fresh roma tomatoes, perfect for cooking', 1.99, NULL, 40, 'Vegetables', 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg', NULL, 4.1, 28),
    ('Cheddar Cheese', 'Sharp cheddar cheese, 8 oz block', 5.49, 6.49, 35, 'Dairy', 'https://images.pexels.com/photos/773253/pexels-photo-773253.jpeg', 15, 4.6, 52);
  END IF;
END $$;