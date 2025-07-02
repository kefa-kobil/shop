/*
  # Create sample products for testing

  1. Products
    - Add sample products across different categories
    - Include pricing, stock, and other product details
    - Set up realistic product data for testing

  Note: User profiles will need to be created through the authentication system
  since they require corresponding entries in auth.users table.
*/

-- Add sample products if none exist
INSERT INTO products (name, description, price, original_price, stock, category, image_url, discount_percentage, rating, reviews_count) VALUES
  ('Fresh Bananas', 'Organic bananas, perfect for breakfast', 2.99, 3.49, 150, 'Fruits', 'https://images.pexels.com/photos/2872755/pexels-photo-2872755.jpeg', 15, 4.5, 23),
  ('Whole Milk', 'Fresh whole milk, 1 gallon', 3.49, NULL, 80, 'Dairy', 'https://images.pexels.com/photos/236010/pexels-photo-236010.jpeg', NULL, 4.2, 15),
  ('Sourdough Bread', 'Artisan sourdough bread, freshly baked', 4.99, 5.99, 25, 'Bakery', 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg', 17, 4.8, 42),
  ('Ground Beef', 'Premium ground beef, 1 lb package', 8.99, 9.99, 35, 'Meat', 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg', 10, 4.3, 18),
  ('Roma Tomatoes', 'Fresh roma tomatoes, perfect for cooking', 1.99, NULL, 120, 'Vegetables', 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg', NULL, 4.1, 31),
  ('Greek Yogurt', 'Creamy Greek yogurt, vanilla flavor', 5.49, 6.49, 45, 'Dairy', 'https://images.pexels.com/photos/1435735/pexels-photo-1435735.jpeg', 15, 4.6, 28),
  ('Chicken Breast', 'Boneless chicken breast, family pack', 12.99, 14.99, 20, 'Meat', 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg', 13, 4.4, 22),
  ('Orange Juice', 'Fresh squeezed orange juice, 64 oz', 4.49, NULL, 60, 'Beverages', 'https://images.pexels.com/photos/1435735/pexels-photo-1435735.jpeg', NULL, 4.0, 19),
  ('Cheddar Cheese', 'Sharp cheddar cheese, 8 oz block', 3.99, 4.49, 55, 'Dairy', 'https://images.pexels.com/photos/773253/pexels-photo-773253.jpeg', 11, 4.3, 16),
  ('Apples', 'Crisp Honeycrisp apples, 3 lb bag', 4.99, NULL, 90, 'Fruits', 'https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg', NULL, 4.7, 35),
  ('Pasta', 'Italian spaghetti pasta, 1 lb box', 1.49, 1.99, 200, 'Pantry', 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg', 25, 4.2, 28),
  ('Salmon Fillet', 'Fresh Atlantic salmon fillet, 1 lb', 15.99, 17.99, 15, 'Seafood', 'https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg', 11, 4.6, 12)

ON CONFLICT (id) DO NOTHING;