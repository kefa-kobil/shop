/*
  # Add sample auctions from existing products

  1. Sample Auctions
    - Creates auctions from existing products with realistic pricing
    - Sets different auction durations for variety
    - Includes flash sales and ending soon auctions

  2. Sample Bids
    - Adds bid history for each auction
    - Uses existing customer profiles
    - Creates realistic bidding progression

  3. Data Integrity
    - Only uses existing products and profiles
    - Maintains foreign key constraints
    - Updates current prices based on highest bids
*/

-- Create sample auctions using existing products
INSERT INTO auctions (
  product_id,
  title,
  description,
  starting_price,
  current_price,
  min_bid_increment,
  start_time,
  end_time,
  status,
  created_by
)
SELECT 
  p.id as product_id,
  p.name as title,
  p.description,
  CASE 
    WHEN p.price > 100 THEN p.price * 0.7
    ELSE p.price * 0.8
  END as starting_price,
  CASE 
    WHEN p.price > 100 THEN p.price * 0.7
    ELSE p.price * 0.8
  END as current_price,
  CASE 
    WHEN p.price > 100 THEN 10.00
    WHEN p.price > 50 THEN 5.00
    ELSE 1.00
  END as min_bid_increment,
  now() - interval '1 hour' as start_time,
  now() + interval '48 hours' as end_time,
  'active' as status,
  (SELECT id FROM profiles WHERE role IN ('manager', 'admin') LIMIT 1) as created_by
FROM products p
WHERE p.active = true
  AND p.stock > 0
  AND NOT EXISTS (
    SELECT 1 FROM auctions a WHERE a.product_id = p.id
  )
LIMIT 8;

-- Add sample bids for the newly created auctions
DO $$
DECLARE
    auction_rec RECORD;
    customer_ids uuid[];
    customer_count integer;
    current_customer_id uuid;
    bid_count integer;
    bid_amount numeric;
BEGIN
    -- Get existing customer user IDs
    SELECT array_agg(id) INTO customer_ids FROM profiles WHERE role = 'customer';
    customer_count := array_length(customer_ids, 1);
    
    -- Only proceed if we have customers
    IF customer_count > 0 THEN
        -- Add bids for each auction created in this migration
        FOR auction_rec IN 
            SELECT id, starting_price, min_bid_increment, title
            FROM auctions 
            WHERE created_at >= now() - interval '5 minutes'
            ORDER BY created_at 
        LOOP
            bid_count := 0;
            bid_amount := auction_rec.starting_price;
            
            -- Add 2-4 bids per auction using different customers
            WHILE bid_count < 3 AND bid_count < customer_count LOOP
                current_customer_id := customer_ids[(bid_count % customer_count) + 1];
                bid_amount := bid_amount + auction_rec.min_bid_increment;
                
                INSERT INTO bids (auction_id, user_id, amount, created_at) VALUES
                (
                    auction_rec.id, 
                    current_customer_id, 
                    bid_amount, 
                    now() - interval '50 minutes' + (interval '15 minutes' * bid_count)
                );
                
                bid_count := bid_count + 1;
            END LOOP;
            
            -- Update the auction's current price to the highest bid
            UPDATE auctions 
            SET current_price = bid_amount
            WHERE id = auction_rec.id;
        END LOOP;
    END IF;
END $$;

-- Create a few more auctions with different time periods for variety
INSERT INTO auctions (
  product_id,
  title,
  description,
  starting_price,
  current_price,
  min_bid_increment,
  start_time,
  end_time,
  status,
  created_by
)
SELECT 
  p.id as product_id,
  'Flash Sale: ' || p.name as title,
  'Limited time auction! ' || p.description,
  p.price * 0.6 as starting_price,
  p.price * 0.6 as current_price,
  CASE 
    WHEN p.price > 100 THEN 15.00
    WHEN p.price > 50 THEN 8.00
    ELSE 2.00
  END as min_bid_increment,
  now() - interval '30 minutes' as start_time,
  now() + interval '6 hours' as end_time,
  'active' as status,
  (SELECT id FROM profiles WHERE role IN ('manager', 'admin') LIMIT 1) as created_by
FROM products p
WHERE p.active = true
  AND p.stock > 0
  AND p.price > 20
  AND NOT EXISTS (
    SELECT 1 FROM auctions a WHERE a.product_id = p.id
  )
LIMIT 3;

-- Add some ending soon auctions
INSERT INTO auctions (
  product_id,
  title,
  description,
  starting_price,
  current_price,
  min_bid_increment,
  start_time,
  end_time,
  status,
  created_by
)
SELECT 
  p.id as product_id,
  'Ending Soon: ' || p.name as title,
  'Do not miss out! ' || p.description,
  p.price * 0.5 as starting_price,
  p.price * 0.75 as current_price,
  CASE 
    WHEN p.price > 100 THEN 20.00
    WHEN p.price > 50 THEN 10.00
    ELSE 3.00
  END as min_bid_increment,
  now() - interval '6 hours' as start_time,
  now() + interval '2 hours' as end_time,
  'active' as status,
  (SELECT id FROM profiles WHERE role IN ('manager', 'admin') LIMIT 1) as created_by
FROM products p
WHERE p.active = true
  AND p.stock > 0
  AND p.price > 50
  AND NOT EXISTS (
    SELECT 1 FROM auctions a WHERE a.product_id = p.id
  )
LIMIT 2;