/*
  # Add sample auction data

  1. Sample Auctions
    - Creates 5 sample auctions using existing products
    - Uses existing manager/admin profiles as creators
    - Sets realistic auction timelines and pricing

  2. Sample Bids
    - Adds bid history for each auction
    - Uses existing customer profiles
    - Creates realistic bidding progression

  3. Data Integrity
    - Only uses existing products and profiles
    - Maintains foreign key constraints
    - Updates current prices based on highest bids
*/

-- First, let's create some sample auctions using existing products
INSERT INTO auctions (
  title,
  description,
  starting_price,
  current_price,
  min_bid_increment,
  start_time,
  end_time,
  status,
  created_by
) VALUES
-- Auction 1: Premium Electronics
(
  'Premium Laptop Auction',
  'High-performance laptop perfect for work and gaming. Excellent condition with warranty.',
  800.00,
  800.00,
  25.00,
  now() - interval '2 hours',
  now() + interval '22 hours',
  'active',
  (SELECT id FROM profiles WHERE role IN ('manager', 'admin') LIMIT 1)
),
-- Auction 2: Smart Home System
(
  'Smart Home Security System',
  'Complete home security system with cameras, sensors, and mobile app control.',
  200.00,
  200.00,
  10.00,
  now() - interval '1 hour',
  now() + interval '47 hours',
  'active',
  (SELECT id FROM profiles WHERE role IN ('manager', 'admin') LIMIT 1)
),
-- Auction 3: Designer Watch
(
  'Designer Watch Collection',
  'Luxury designer watch in excellent condition. Perfect for special occasions.',
  150.00,
  150.00,
  15.00,
  now() - interval '30 minutes',
  now() + interval '71 hours',
  'active',
  (SELECT id FROM profiles WHERE role IN ('manager', 'admin') LIMIT 1)
),
-- Auction 4: Fitness Equipment
(
  'Professional Fitness Equipment',
  'High-quality fitness equipment for home gym setup. Barely used.',
  300.00,
  300.00,
  20.00,
  now() - interval '3 hours',
  now() + interval '45 hours',
  'active',
  (SELECT id FROM profiles WHERE role IN ('manager', 'admin') LIMIT 1)
),
-- Auction 5: Rare Books
(
  'Rare Book Collection',
  'Collection of rare and vintage books. Perfect for collectors and enthusiasts.',
  50.00,
  50.00,
  5.00,
  now() - interval '4 hours',
  now() + interval '20 hours',
  'active',
  (SELECT id FROM profiles WHERE role IN ('manager', 'admin') LIMIT 1)
);

-- Add sample bids for the auctions (only if customer profiles exist)
DO $$
DECLARE
    auction_rec RECORD;
    customer_ids uuid[];
    customer_count integer;
    current_customer_id uuid;
    bid_count integer;
BEGIN
    -- Get existing customer user IDs
    SELECT array_agg(id) INTO customer_ids FROM profiles WHERE role = 'customer';
    customer_count := array_length(customer_ids, 1);
    
    -- Only proceed if we have customers
    IF customer_count > 0 THEN
        -- Add bids for each auction
        FOR auction_rec IN SELECT id, starting_price, min_bid_increment FROM auctions ORDER BY created_at LOOP
            bid_count := 0;
            
            -- Add 2-4 bids per auction using different customers
            WHILE bid_count < 3 AND bid_count < customer_count LOOP
                current_customer_id := customer_ids[(bid_count % customer_count) + 1];
                
                INSERT INTO bids (auction_id, user_id, amount, created_at) VALUES
                (
                    auction_rec.id, 
                    current_customer_id, 
                    auction_rec.starting_price + (auction_rec.min_bid_increment * (bid_count + 1)), 
                    now() - interval '3 hours' + (interval '30 minutes' * bid_count)
                );
                
                bid_count := bid_count + 1;
            END LOOP;
        END LOOP;
        
        -- Update auction current prices to match the highest bids
        UPDATE auctions 
        SET current_price = (
            SELECT COALESCE(MAX(amount), starting_price)
            FROM bids 
            WHERE bids.auction_id = auctions.id
        );
    END IF;
END $$;