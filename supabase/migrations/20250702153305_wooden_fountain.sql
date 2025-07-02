/*
  # Create auction system

  1. New Tables
    - `auctions`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key to products)
      - `title` (text)
      - `description` (text)
      - `starting_price` (numeric)
      - `current_price` (numeric)
      - `min_bid_increment` (numeric)
      - `start_time` (timestamp)
      - `end_time` (timestamp)
      - `status` (text: active, ended, cancelled)
      - `winner_id` (uuid, foreign key to profiles)
      - `created_by` (uuid, foreign key to profiles)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `bids`
      - `id` (uuid, primary key)
      - `auction_id` (uuid, foreign key to auctions)
      - `user_id` (uuid, foreign key to profiles)
      - `amount` (numeric)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for auction management and bidding
    - Managers can create/manage auctions
    - Customers can view auctions and place bids
    - Users can view their own bids
*/

CREATE TABLE IF NOT EXISTS auctions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  starting_price numeric(10,2) NOT NULL,
  current_price numeric(10,2) NOT NULL DEFAULT 0,
  min_bid_increment numeric(10,2) DEFAULT 1.00,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'ended', 'cancelled')),
  winner_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id uuid REFERENCES auctions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

-- Auction policies
CREATE POLICY "Everyone can read active auctions"
  ON auctions
  FOR SELECT
  TO anon, authenticated
  USING (status = 'active' AND start_time <= now() AND end_time > now());

CREATE POLICY "Managers can manage auctions"
  ON auctions
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('manager', 'admin')
  ));

-- Bid policies
CREATE POLICY "Users can read bids for active auctions"
  ON bids
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM auctions
    WHERE auctions.id = bids.auction_id
    AND auctions.status = 'active'
  ));

CREATE POLICY "Users can create bids on active auctions"
  ON bids
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM auctions
      WHERE auctions.id = auction_id
      AND auctions.status = 'active'
      AND auctions.start_time <= now()
      AND auctions.end_time > now()
    )
  );

CREATE POLICY "Users can read own bids"
  ON bids
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_auctions_status_time ON auctions(status, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_bids_auction_id ON bids(auction_id);
CREATE INDEX IF NOT EXISTS idx_bids_user_id ON bids(user_id);