/*
  # Fix database schema and setup

  1. New Tables
    - `users` table to support the foreign key relationship with profiles
  
  2. Updates
    - Ensure profiles table has all required columns
    - Add proper constraints and triggers
    
  3. Security
    - Enable RLS on users table
    - Add policies for user data access
    
  4. Test Data
    - Insert sample users and profiles for development
    - Add sample products for the store
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

-- Insert test data for development
DO $$
DECLARE
  test_user_1 uuid := '11111111-1111-1111-1111-111111111111';
  test_user_2 uuid := '22222222-2222-2222-2222-222222222222';
  test_user_3 uuid := '33333333-3333-3333-3333-333333333333';
BEGIN
  -- First, insert test users
  INSERT INTO users (id, email, created_at, updated_at) VALUES 
    (test_user_1, 'customer@test.com', NOW(), NOW()),
    (test_user_2, 'manager@test.com', NOW(), NOW()),
    (test_user_3, 'admin@test.com', NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW()
  ON CONFLICT (email) DO UPDATE SET
    updated_at = NOW();

  -- Then, insert corresponding profiles (now that users exist)
  INSERT INTO profiles (id, full_name, role, created_at, updated_at) VALUES 
    (test_user_1, 'Test Customer', 'customer', NOW(), NOW()),
    (test_user_2, 'Test Manager', 'manager', NOW(), NOW()),
    (test_user_3, 'Test Admin', 'admin', NOW(), NOW())
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
    ('Cheddar Cheese', 'Sharp cheddar cheese, 8 oz block', 5.49, 6.49, 35, 'Dairy', 'https://images.pexels.com/photos/773253/pexels-photo-773253.jpeg', 15, 4.6, 52),
    ('Greek Yogurt', 'Creamy Greek yogurt, 32 oz container', 6.99, 7.99, 28, 'Dairy', 'https://images.pexels.com/photos/1435735/pexels-photo-1435735.jpeg', 13, 4.7, 89),
    ('Chicken Breast', 'Boneless skinless chicken breast, 2 lbs', 12.99, 14.99, 22, 'Meat', 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg', 13, 4.4, 56),
    ('Red Apples', 'Crisp red apples, 3 lb bag', 4.49, NULL, 45, 'Fruits', 'https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg', NULL, 4.3, 67),
    ('Pasta Sauce', 'Traditional marinara sauce, 24 oz jar', 2.49, 2.99, 60, 'Pantry', 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg', 17, 4.1, 34);
  END IF;
END $$;