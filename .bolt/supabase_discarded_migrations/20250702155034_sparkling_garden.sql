/*
  # Add Sample Auction Data

  1. Sample Auctions
    - Creates several active auctions using existing products
    - Sets realistic starting prices and bid increments
    - Includes auctions with different time periods
    - Uses manager/admin accounts as creators

  2. Sample Bids
    - Adds realistic bid history for some auctions
    - Shows progression of bidding
    - Demonstrates current price updates
*/

-- Insert sample auctions (using existing products)
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
) VALUES
-- Auction 1: Electronics item
(
  (SELECT id FROM products WHERE category = 'Electronics' LIMIT 1),
  'Premium Laptop Auction',
  'High-performance laptop perfect for work and gaming. Excellent condition with warranty.',
  800.00,
  950.00,
  25.00,
  now() - interval '2 hours',
  now() + interval '22 hours',
  'active',
  (SELECT id FROM profiles WHERE role IN ('manager', 'admin') LIMIT 1)
),
-- Auction 2: Home & Garden item
(
  (SELECT id FROM products WHERE category = 'Home & Garden' LIMIT 1),
  'Smart Home Security System',
  'Complete home security system with cameras, sensors, and mobile app control.',
  200.00,
  275.00,
  10.00,
  now() - interval '1 hour',
  now() + interval '47 hours',
  'active',
  (SELECT id FROM profiles WHERE role IN ('manager', 'admin') LIMIT 1)
),
-- Auction 3: Fashion item
(
  (SELECT id FROM products WHERE category = 'Fashion' LIMIT 1),
  'Designer Watch Collection',
  'Luxury designer watch in excellent condition. Perfect for special occasions.',
  150.00,
  220.00,
  15.00,
  now() - interval '30 minutes',
  now() + interval '71 hours',
  'active',
  (SELECT id FROM profiles WHERE role IN ('manager', 'admin') LIMIT 1)
),
-- Auction 4: Sports item
(
  (SELECT id FROM products WHERE category = 'Sports' LIMIT 1),
  'Professional Fitness Equipment',
  'High-quality fitness equipment for home gym setup. Barely used.',
  300.00,
  385.00,
  20.00,
  now() - interval '3 hours',
  now() + interval '45 hours',
  'active',
  (SELECT id FROM profiles WHERE role IN ('manager', 'admin') LIMIT 1)
),
-- Auction 5: Books item
(
  (SELECT id FROM products WHERE category = 'Books' LIMIT 1),
  'Rare Book Collection',
  'Collection of rare and vintage books. Perfect for collectors and enthusiasts.',
  50.00,
  85.00,
  5.00,
  now() - interval '4 hours',
  now() + interval '20 hours',
  'active',
  (SELECT id FROM profiles WHERE role IN ('manager', 'admin') LIMIT 1)
);

-- Insert sample bids for the auctions
DO $$
DECLARE
    auction_rec RECORD;
    customer_id uuid;
BEGIN
    -- Get a customer user ID
    SELECT id INTO customer_id FROM profiles WHERE role = 'customer' LIMIT 1;
    
    -- If no customer exists, create one
    IF customer_id IS NULL THEN
        INSERT INTO profiles (id, full_name, role) 
        VALUES (gen_random_uuid(), 'Sample Customer', 'customer')
        RETURNING id INTO customer_id;
    END IF;

    -- Add bids for each auction
    FOR auction_rec IN SELECT id, starting_price, current_price, min_bid_increment FROM auctions LOOP
        -- Add 2-4 bids per auction
        INSERT INTO bids (auction_id, user_id, amount, created_at) VALUES
        (auction_rec.id, customer_id, auction_rec.starting_price + auction_rec.min_bid_increment, now() - interval '3 hours'),
        (auction_rec.id, customer_id, auction_rec.starting_price + (auction_rec.min_bid_increment * 2), now() - interval '2 hours'),
        (auction_rec.id, customer_id, auction_rec.current_price, now() - interval '1 hour');
    END LOOP;
END $$;

-- Update auction current prices to match the highest bids
UPDATE auctions 
SET current_price = (
    SELECT COALESCE(MAX(amount), starting_price)
    FROM bids 
    WHERE bids.auction_id = auctions.id
)
WHERE id IN (SELECT id FROM auctions);