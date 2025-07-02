/*
  # Update product catalog with retail items

  1. Changes
    - Remove existing grocery products
    - Add furniture, electronics, toys, and other retail items
    - Update categories to match retail store
    - Add realistic pricing and stock levels

  2. New Categories
    - Furniture
    - Electronics
    - Toys
    - Clothing
    - Home & Garden
    - Sports & Outdoors
    - Books & Media
    - Health & Beauty
*/

-- Clear existing products
DELETE FROM products;

-- Insert new retail products
INSERT INTO products (name, description, price, original_price, stock, category, image_url, discount_percentage, rating, reviews_count) VALUES
  -- Furniture
  ('Modern Office Chair', 'Ergonomic office chair with lumbar support and adjustable height', 299.99, 399.99, 25, 'Furniture', 'https://images.pexels.com/photos/586996/pexels-photo-586996.jpeg', 25, 4.5, 89),
  ('Wooden Coffee Table', 'Solid oak coffee table with storage drawer', 449.99, 549.99, 12, 'Furniture', 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg', 18, 4.3, 45),
  ('Queen Size Bed Frame', 'Modern platform bed frame with headboard', 599.99, 799.99, 8, 'Furniture', 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg', 25, 4.7, 67),
  ('Dining Table Set', '6-person dining table with chairs', 899.99, 1199.99, 5, 'Furniture', 'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg', 25, 4.4, 32),
  
  -- Electronics
  ('Wireless Bluetooth Headphones', 'Premium noise-canceling headphones with 30-hour battery', 199.99, 249.99, 45, 'Electronics', 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg', 20, 4.6, 234),
  ('4K Smart TV 55"', 'Ultra HD Smart TV with streaming apps built-in', 699.99, 899.99, 18, 'Electronics', 'https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg', 22, 4.5, 156),
  ('Gaming Laptop', 'High-performance gaming laptop with RTX graphics', 1299.99, 1599.99, 12, 'Electronics', 'https://images.pexels.com/photos/2047905/pexels-photo-2047905.jpeg', 19, 4.7, 98),
  ('Smartphone', 'Latest flagship smartphone with advanced camera', 899.99, 999.99, 35, 'Electronics', 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg', 10, 4.4, 445),
  ('Wireless Speaker', 'Portable Bluetooth speaker with premium sound', 149.99, 199.99, 60, 'Electronics', 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg', 25, 4.3, 178),
  
  -- Toys
  ('LEGO Architecture Set', 'Build famous landmarks with this detailed LEGO set', 79.99, 99.99, 40, 'Toys', 'https://images.pexels.com/photos/298825/pexels-photo-298825.jpeg', 20, 4.8, 156),
  ('Remote Control Drone', 'HD camera drone with GPS and auto-return feature', 299.99, 399.99, 22, 'Toys', 'https://images.pexels.com/photos/442587/pexels-photo-442587.jpeg', 25, 4.5, 89),
  ('Board Game Collection', 'Classic strategy board game for family fun', 49.99, 59.99, 75, 'Toys', 'https://images.pexels.com/photos/278918/pexels-photo-278918.jpeg', 17, 4.6, 234),
  ('Electric Scooter', 'Kids electric scooter with LED lights and music', 199.99, 249.99, 15, 'Toys', 'https://images.pexels.com/photos/1149137/pexels-photo-1149137.jpeg', 20, 4.4, 67),
  
  -- Clothing
  ('Designer Jeans', 'Premium denim jeans with perfect fit', 89.99, 119.99, 120, 'Clothing', 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg', 25, 4.2, 345),
  ('Winter Jacket', 'Waterproof winter jacket with thermal insulation', 149.99, 199.99, 45, 'Clothing', 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg', 25, 4.5, 123),
  ('Running Shoes', 'Professional running shoes with advanced cushioning', 129.99, 159.99, 80, 'Clothing', 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg', 19, 4.7, 289),
  ('Casual T-Shirt', 'Comfortable cotton t-shirt in various colors', 24.99, 29.99, 200, 'Clothing', 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg', 17, 4.3, 456),
  
  -- Home & Garden
  ('Robot Vacuum', 'Smart robot vacuum with app control and mapping', 399.99, 499.99, 28, 'Home & Garden', 'https://images.pexels.com/photos/4239091/pexels-photo-4239091.jpeg', 20, 4.6, 167),
  ('Garden Tool Set', 'Complete gardening tool set with carrying case', 79.99, 99.99, 35, 'Home & Garden', 'https://images.pexels.com/photos/1301856/pexels-photo-1301856.jpeg', 20, 4.4, 89),
  ('Air Purifier', 'HEPA air purifier for large rooms', 249.99, 299.99, 20, 'Home & Garden', 'https://images.pexels.com/photos/4239091/pexels-photo-4239091.jpeg', 17, 4.5, 134),
  ('Kitchen Appliance Set', 'Complete kitchen appliance starter set', 199.99, 249.99, 15, 'Home & Garden', 'https://images.pexels.com/photos/4239091/pexels-photo-4239091.jpeg', 20, 4.3, 78),
  
  -- Sports & Outdoors
  ('Mountain Bike', 'Professional mountain bike with 21-speed transmission', 599.99, 799.99, 12, 'Sports & Outdoors', 'https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg', 25, 4.6, 145),
  ('Camping Tent', '4-person waterproof camping tent with easy setup', 149.99, 199.99, 25, 'Sports & Outdoors', 'https://images.pexels.com/photos/2398220/pexels-photo-2398220.jpeg', 25, 4.5, 98),
  ('Yoga Mat Set', 'Premium yoga mat with accessories and carrying bag', 49.99, 69.99, 85, 'Sports & Outdoors', 'https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg', 29, 4.4, 234),
  ('Basketball', 'Official size basketball for indoor and outdoor play', 29.99, 39.99, 150, 'Sports & Outdoors', 'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg', 25, 4.3, 167),
  
  -- Books & Media
  ('Bestseller Novel Collection', 'Collection of top 10 bestselling novels', 89.99, 119.99, 50, 'Books & Media', 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg', 25, 4.7, 345),
  ('Educational Board Games', 'STEM learning games for kids and teens', 59.99, 79.99, 40, 'Books & Media', 'https://images.pexels.com/photos/278918/pexels-photo-278918.jpeg', 25, 4.5, 123),
  ('Art Supply Kit', 'Complete art supplies for drawing and painting', 79.99, 99.99, 30, 'Books & Media', 'https://images.pexels.com/photos/1153213/pexels-photo-1153213.jpeg', 20, 4.6, 89),
  
  -- Health & Beauty
  ('Electric Toothbrush', 'Smart electric toothbrush with app connectivity', 99.99, 129.99, 45, 'Health & Beauty', 'https://images.pexels.com/photos/3845457/pexels-photo-3845457.jpeg', 23, 4.5, 234),
  ('Skincare Set', 'Complete skincare routine with natural ingredients', 149.99, 199.99, 60, 'Health & Beauty', 'https://images.pexels.com/photos/3845457/pexels-photo-3845457.jpeg', 25, 4.6, 345),
  ('Fitness Tracker', 'Advanced fitness tracker with heart rate monitoring', 199.99, 249.99, 55, 'Health & Beauty', 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg', 20, 4.4, 456),
  ('Hair Styling Kit', 'Professional hair styling tools and accessories', 89.99, 119.99, 35, 'Health & Beauty', 'https://images.pexels.com/photos/3845457/pexels-photo-3845457.jpeg', 25, 4.3, 167);