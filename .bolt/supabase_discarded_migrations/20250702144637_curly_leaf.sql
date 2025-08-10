/*
  # Custom Authentication System

  1. New Tables
    - `users` - Main user table with email/password authentication
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `password_hash` (text, encrypted password)
      - `full_name` (text)
      - `role` (text, default 'customer')
      - `active` (boolean, default true)
      - `email_verified` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `users` table
    - Add policies for user management
    - Remove dependency on Supabase auth.users

  3. Changes
    - Drop existing foreign key constraint from profiles to auth.users
    - Update all foreign key references to point to new users table
    - Add password hashing extension
    - Create authentication helper functions
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing foreign key constraints that reference auth.users
DO $$
BEGIN
  -- Drop foreign key constraint from profiles table
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_id_fkey' AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles DROP CONSTRAINT profiles_id_fkey;
  END IF;

  -- Drop foreign key constraints from other tables
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'cart_items_user_id_fkey' AND table_name = 'cart_items'
  ) THEN
    ALTER TABLE cart_items DROP CONSTRAINT cart_items_user_id_fkey;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'orders_user_id_fkey' AND table_name = 'orders'
  ) THEN
    ALTER TABLE orders DROP CONSTRAINT orders_user_id_fkey;
  END IF;
END $$;

-- Create custom users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text,
  role text DEFAULT 'customer' CHECK (role IN ('customer', 'manager', 'admin')),
  active boolean DEFAULT true,
  email_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (id = current_setting('app.current_user_id')::uuid);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (id = current_setting('app.current_user_id')::uuid);

-- Create function to hash passwords
CREATE OR REPLACE FUNCTION hash_password(password text)
RETURNS text AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf', 10));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to verify passwords
CREATE OR REPLACE FUNCTION verify_password(password text, hash text)
RETURNS boolean AS $$
BEGIN
  RETURN hash = crypt(password, hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to authenticate user
CREATE OR REPLACE FUNCTION authenticate_user(user_email text, user_password text)
RETURNS TABLE(user_id uuid, user_email text, user_role text, user_name text) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email, u.role, u.full_name
  FROM users u
  WHERE u.email = user_email 
    AND u.active = true 
    AND verify_password(user_password, u.password_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update profiles table structure if needed
DO $$
BEGIN
  -- Remove profiles table since we're consolidating into users table
  -- But first, let's preserve any existing profile data
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    -- We'll keep profiles table for now but update its foreign key
    -- Add foreign key constraint to new users table
    ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey 
      FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Update other tables to reference new users table
ALTER TABLE cart_items ADD CONSTRAINT cart_items_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE orders ADD CONSTRAINT orders_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Update RLS policies to work with custom authentication
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;

CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (id = current_setting('app.current_user_id')::uuid);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (id = current_setting('app.current_user_id')::uuid);

CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = current_setting('app.current_user_id')::uuid 
        AND role = 'admin'
    )
  );

-- Update cart_items policies
DROP POLICY IF EXISTS "Users can manage own cart" ON cart_items;
CREATE POLICY "Users can manage own cart"
  ON cart_items
  FOR ALL
  TO authenticated
  USING (user_id = current_setting('app.current_user_id')::uuid);

-- Update orders policies
DROP POLICY IF EXISTS "Users can read own orders" ON orders;
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
DROP POLICY IF EXISTS "Managers can read all orders" ON orders;

CREATE POLICY "Users can read own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (user_id = current_setting('app.current_user_id')::uuid);

CREATE POLICY "Users can create own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = current_setting('app.current_user_id')::uuid);

CREATE POLICY "Managers can read all orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = current_setting('app.current_user_id')::uuid 
        AND role IN ('manager', 'admin')
    )
  );

-- Update order_items policies
DROP POLICY IF EXISTS "Users can read own order items" ON order_items;
DROP POLICY IF EXISTS "Users can create order items for own orders" ON order_items;
DROP POLICY IF EXISTS "Managers can read all order items" ON order_items;

CREATE POLICY "Users can read own order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
        AND orders.user_id = current_setting('app.current_user_id')::uuid
    )
  );

CREATE POLICY "Users can create order items for own orders"
  ON order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
        AND orders.user_id = current_setting('app.current_user_id')::uuid
    )
  );

CREATE POLICY "Managers can read all order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = current_setting('app.current_user_id')::uuid 
        AND role IN ('manager', 'admin')
    )
  );

-- Update products policies to work with custom auth
DROP POLICY IF EXISTS "Managers and admins can manage products" ON products;
CREATE POLICY "Managers and admins can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = current_setting('app.current_user_id')::uuid 
        AND role IN ('manager', 'admin')
    )
  );

-- Insert test users with hashed passwords
INSERT INTO users (id, email, password_hash, full_name, role, email_verified, created_at, updated_at) VALUES 
  (
    '11111111-1111-1111-1111-111111111111', 
    'customer@test.com', 
    hash_password('password123'), 
    'Test Customer', 
    'customer', 
    true, 
    NOW(), 
    NOW()
  ),
  (
    '22222222-2222-2222-2222-222222222222', 
    'manager@test.com', 
    hash_password('password123'), 
    'Test Manager', 
    'manager', 
    true, 
    NOW(), 
    NOW()
  ),
  (
    '33333333-3333-3333-3333-333333333333', 
    'admin@test.com', 
    hash_password('password123'), 
    'Test Admin', 
    'admin', 
    true, 
    NOW(), 
    NOW()
  )
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Insert corresponding profiles
INSERT INTO profiles (id, full_name, role, created_at, updated_at) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Test Customer', 'customer', NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', 'Test Manager', 'manager', NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333333', 'Test Admin', 'admin', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Insert sample products if the table is empty
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