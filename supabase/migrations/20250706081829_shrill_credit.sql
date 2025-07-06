/*
  # Create POS System without Sessions

  1. New Tables
    - `pos_transactions`
      - `id` (uuid, primary key)
      - `transaction_number` (text, unique)
      - `cashier_id` (uuid, references profiles)
      - `customer_id` (uuid, references profiles, nullable)
      - `subtotal` (numeric)
      - `tax_amount` (numeric)
      - `discount_amount` (numeric)
      - `total_amount` (numeric)
      - `payment_method` (text)
      - `payment_status` (text)
      - `notes` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `pos_transaction_items`
      - `id` (uuid, primary key)
      - `transaction_id` (uuid, references pos_transactions)
      - `product_id` (uuid, references products)
      - `quantity` (integer)
      - `unit_price` (numeric)
      - `discount_amount` (numeric)
      - `total_price` (numeric)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for transaction management
    - Managers can view all transactions
    - Cashiers can view/create own transactions

  3. Functions
    - Transaction number generation
    - Automatic total calculation
*/

-- Create pos_transactions table
CREATE TABLE IF NOT EXISTS pos_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_number text UNIQUE NOT NULL,
  cashier_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  tax_amount numeric(10,2) NOT NULL DEFAULT 0,
  discount_amount numeric(10,2) NOT NULL DEFAULT 0,
  total_amount numeric(10,2) NOT NULL DEFAULT 0,
  payment_method text NOT NULL CHECK (payment_method IN ('cash', 'card', 'digital_wallet', 'store_credit')),
  payment_status text NOT NULL DEFAULT 'completed' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create pos_transaction_items table
CREATE TABLE IF NOT EXISTS pos_transaction_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid REFERENCES pos_transactions(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL,
  discount_amount numeric(10,2) NOT NULL DEFAULT 0,
  total_price numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE pos_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_transaction_items ENABLE ROW LEVEL SECURITY;

-- POS Transactions policies
CREATE POLICY "Managers can view all transactions"
  ON pos_transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('manager', 'admin')
    )
  );

CREATE POLICY "Cashiers can view own transactions"
  ON pos_transactions
  FOR SELECT
  TO authenticated
  USING (cashier_id = auth.uid());

CREATE POLICY "Cashiers can create transactions"
  ON pos_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    cashier_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('manager', 'admin', 'cashier')
    )
  );

CREATE POLICY "Cashiers can update own transactions"
  ON pos_transactions
  FOR UPDATE
  TO authenticated
  USING (cashier_id = auth.uid());

-- POS Transaction Items policies
CREATE POLICY "Users can view transaction items for accessible transactions"
  ON pos_transaction_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pos_transactions
      WHERE id = transaction_id AND (
        cashier_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role IN ('manager', 'admin')
        )
      )
    )
  );

CREATE POLICY "Cashiers can create transaction items"
  ON pos_transaction_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pos_transactions
      WHERE id = transaction_id AND cashier_id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_pos_transactions_cashier_id ON pos_transactions(cashier_id);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_created_at ON pos_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_pos_transaction_items_transaction_id ON pos_transaction_items(transaction_id);

-- Function to generate transaction number
CREATE OR REPLACE FUNCTION generate_transaction_number()
RETURNS text AS $$
DECLARE
  prefix text := 'TXN';
  date_part text := to_char(now(), 'YYYYMMDD');
  sequence_part text;
  transaction_number text;
BEGIN
  -- Get the next sequence number for today
  SELECT LPAD((COUNT(*) + 1)::text, 4, '0')
  INTO sequence_part
  FROM pos_transactions
  WHERE DATE(created_at) = CURRENT_DATE;
  
  transaction_number := prefix || '-' || date_part || '-' || sequence_part;
  
  RETURN transaction_number;
END;
$$ LANGUAGE plpgsql;

-- Function to update transaction totals
CREATE OR REPLACE FUNCTION update_transaction_totals()
RETURNS trigger AS $$
DECLARE
  transaction_subtotal numeric(10,2);
  tax_rate numeric(3,4) := 0.08; -- 8% tax rate
BEGIN
  -- Calculate subtotal from transaction items
  SELECT COALESCE(SUM(total_price), 0)
  INTO transaction_subtotal
  FROM pos_transaction_items
  WHERE transaction_id = COALESCE(NEW.transaction_id, OLD.transaction_id);
  
  -- Update the transaction totals
  UPDATE pos_transactions
  SET 
    subtotal = transaction_subtotal,
    tax_amount = transaction_subtotal * tax_rate,
    total_amount = transaction_subtotal + (transaction_subtotal * tax_rate) - discount_amount,
    updated_at = now()
  WHERE id = COALESCE(NEW.transaction_id, OLD.transaction_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update transaction totals when items change
CREATE TRIGGER update_transaction_totals_trigger
  AFTER INSERT OR UPDATE OR DELETE ON pos_transaction_items
  FOR EACH ROW EXECUTE FUNCTION update_transaction_totals();

-- Add cashier role to profiles if it doesn't exist
DO $$
BEGIN
  -- Update the role constraint to include cashier
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
    CHECK (role = ANY (ARRAY['customer'::text, 'manager'::text, 'admin'::text, 'cashier'::text]));
END $$;

-- Create sample POS data using existing profiles
DO $$
DECLARE
  manager_id uuid;
  customer_id uuid;
  transaction_id uuid;
  product_ids uuid[];
BEGIN
  -- Get existing manager/admin profile
  SELECT id INTO manager_id FROM profiles WHERE role IN ('manager', 'admin') LIMIT 1;
  
  -- Get existing customer profile
  SELECT id INTO customer_id FROM profiles WHERE role = 'customer' LIMIT 1;
  
  -- Get some product IDs
  SELECT array_agg(id) INTO product_ids FROM products WHERE active = true LIMIT 5;
  
  -- Only proceed if we have the necessary data
  IF manager_id IS NOT NULL AND array_length(product_ids, 1) > 0 THEN
    
    -- Create sample transaction 1
    INSERT INTO pos_transactions (
      transaction_number, cashier_id, customer_id, subtotal, tax_amount, total_amount, 
      payment_method, payment_status, created_at
    ) VALUES (
      generate_transaction_number(),
      manager_id,
      customer_id,
      25.50, 2.04, 27.54,
      'cash', 'completed',
      now() - interval '1 hour'
    ) RETURNING id INTO transaction_id;
    
    -- Add items to transaction 1
    INSERT INTO pos_transaction_items (transaction_id, product_id, quantity, unit_price, total_price) VALUES
      (transaction_id, product_ids[1], 2, 5.99, 11.98),
      (transaction_id, product_ids[2], 1, 13.52, 13.52);
    
    -- Create sample transaction 2
    INSERT INTO pos_transactions (
      transaction_number, cashier_id, customer_id, subtotal, tax_amount, total_amount,
      payment_method, payment_status, created_at
    ) VALUES (
      generate_transaction_number(),
      manager_id,
      customer_id,
      45.75, 3.66, 49.41,
      'card', 'completed',
      now() - interval '30 minutes'
    ) RETURNING id INTO transaction_id;
    
    -- Add items to transaction 2
    INSERT INTO pos_transaction_items (transaction_id, product_id, quantity, unit_price, total_price) VALUES
      (transaction_id, product_ids[3], 1, 29.99, 29.99),
      (transaction_id, product_ids[4], 3, 5.25, 15.75);
      
  END IF;
END $$;