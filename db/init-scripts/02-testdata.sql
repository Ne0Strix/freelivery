-- Test data for a fresh DB. Safe to run against a brand-new database.
-- This file inserts a small set of rows that exercise enums, FKs and unique constraints.

-- Roles
INSERT INTO role (role_id, name, description) VALUES
  (1, 'admin', 'Administrator'),
  (2, 'restaurant_owner', 'Restaurant owner'),
  (3, 'customer', 'Customer');

-- Users
INSERT INTO "user" (user_id, username, email, password_hash, is_active) VALUES
  (1, 'alice', 'alice@example.com', '$2b$10$I3VQ6pUokxd4B3iFQUVMA.4OK8THfTcqv4/bPglaHnrFKFAEww3mS', true), -- passhash1
  (2, 'bob', 'bob@example.com', '$2b$10$Cuj5lOhhZpL1JTMimwk7kej6SXL1M0oWaS2agxAs59jSAPA6hth..', true), -- passhash2
  (3, 'customer', 'customer@freelivery.com', '$2b$10$GoE1e7QmGM9TWWD.MwvEIe6s8bFyO55OZLbjl1X0L8Mx7K7X2PyEu', true), -- customer
  (4, 'restaurant-owner', 'restaurant-owner@freelivery.com', '$2b$10$VNHTMdJy4N8qxlR/HC..A.55QoHs5pf8GfAFmk2dLoCiBWLKdHE1q', true), -- restaurant
  (5, 'site-admin', 'site-admin@freelivery.com', '$2b$10$8JQ0cVHjM15tVOiVJVckj.KOnH6iCaMH.Dcdx07npMdOQQtOxDCri', true), -- site-admin
  (6, 'deus', 'deus@freelivery.com', '$2b$10$c49sMu7J/TQzNB.X69iFQOjGG1rvdynmAXlRGPq8pc0kNsc0avFe2', true); -- deus

-- User data
INSERT INTO user_data (user_id, first_name, last_name, salutation, phone_number, date_of_birth) VALUES
  (1, 'Alice', 'Anderson', 'Ms', '+10000000001', '1990-01-01'),
  (2, 'Bob', 'Baker', 'Mr', '+10000000002', '1985-05-05'),
  (3, 'Customer', 'User', 'Mr', '+10000000003', '1995-03-15'),
  (4, 'Restaurant', 'Owner', 'Ms', '+10000000004', '1988-07-20'),
  (5, 'Site', 'Admin', 'Mr', '+10000000005', '1992-11-10'),
  (6, 'Deus', 'ExMachina', 'Mx', '+10000000006', '2000-01-01');

-- Addresses (with grid coordinates: x,y from -10 to +10)
INSERT INTO address (address_id, label, street_name, house_number, additional_info, city_name, zip_code, country, grid_x, grid_y) VALUES
  (1, 'Alice Home', 'Villacher Straße', '1', 'Top 1', 'Klagenfurt', '9020', 'Austria', 0, 0),
  (2, 'Luigi Pizzeria', 'Haupstraße', '10', NULL, 'Villach', '9500', 'Austria', 2, 3),
  (3, 'Sakura Sushi', 'Erlenweg', '42', NULL, 'Villach', '9500', 'Austria', -1, 5),
  (4, 'Taco Fiesta', 'Rosegger Gasse', '7', NULL, 'St. Veit / Glan', '9300', 'Austria', 7, -2),
  (5, 'Golden Dragon', 'Völkermarkter Straße', '72', NULL, 'Klagenfurt', '9020', 'Austria', -3, -4);

-- Link users to addresses
INSERT INTO user_address (user_id, address_id, is_default) VALUES
  (1, 1, true),
  (2, 2, true);

-- User roles
INSERT INTO user_role (user_id, role_id) VALUES
  (1, 3), -- Alice is a customer
  (2, 2), -- Bob is a restaurant owner
  (3, 3), -- customer is a customer
  (4, 2), -- restaurant-owner is a restaurant owner
  (5, 1), -- site-admin is an admin
  (6, 1), -- deus has all roles
  (6, 2),
  (6, 3);

-- Delivery zone
INSERT INTO delivery_zone (delivery_zone_id, code, name, description) VALUES
  (1, 'Z001', 'Central', 'Central delivery zone');

-- Restaurant (owned by Bob) - max_delivery_distance determines how far they deliver
INSERT INTO restaurant (
  restaurant_id, name, status, description, cuisine_type, contact_email, contact_phone,
  address_id, owner_user_id, delivery_zone_id, service_fee_percent, min_order_amount, max_delivery_distance
) VALUES (
  1, 'Luigi Pizzeria', 'ACTIVE', 'Beste Pizza in Villach', 'ITALIAN', 'contact@luigi.example', '+10000000010',
  2, 2, 1, 5.00, 10.00, 8
);

-- Pending restaurants (status = NEW) for site-manager testing
INSERT INTO restaurant (
  restaurant_id, name, status, description, cuisine_type, contact_email, contact_phone,
  address_id, owner_user_id, delivery_zone_id, service_fee_percent, min_order_amount, max_delivery_distance
) VALUES
  (2, 'Sakura Sushi', 'NEW', 'Generische Sushi', 'JAPANESE', 'contact@sakura.example', '+10000000011',
   3, 4, 1, 4.50, 15.00, 10),
  (3, 'Taco Fiesta', 'NEW', 'Mediocre Taco', 'MEXICAN', 'hola@tacofiesta.example', '+10000000012',
   4, 4, 1, 3.00, 8.00, 6),
  (4, 'Golden Dragon', 'NEW', 'Traditionelle chinesische Gerichte', 'CHINESE', 'info@goldendragon.example', '+10000000013',
   5, 2, 1, 5.00, 12.00, 7);

-- Category and dishes
INSERT INTO category (category_id, restaurant_id, name, description) VALUES
  (1, 1, 'Pizzas', 'Classic pizzas');

INSERT INTO dish (dish_id, restaurant_id, category_id, name, description, price, is_available) VALUES
  (1, 1, 1, 'Margherita', 'Tomato, mozzarella', 8.50, true),
  (2, 1, 1, 'Pepperoni', 'Pepperoni slices', 9.50, true);

-- Cart for Alice
INSERT INTO cart (cart_id, user_id, restaurant_id) VALUES
  (1, 1, 1);

INSERT INTO cart_item (cart_item_id, cart_id, dish_id, quantity) VALUES
  (1, 1, 1, 2);

-- An example order placed by Alice
INSERT INTO "order" (
  order_id, customer_user_id, restaurant_id, delivery_address_id, delivery_zone_id,
  status, subtotal_amount, service_fee_amount, discount_amount, total_amount,
  payment_method, estimated_delivery_time, delivered_at
) VALUES (
  1, 1, 1, 1, 1,
  'PENDING', 17.00, 0.85, 0.00, 17.85,
  'CREDIT_CARD', (CURRENT_TIMESTAMP + INTERVAL '30 minutes'), NULL
);

INSERT INTO order_item (order_item_id, order_id, dish_id, dish_name_snapshot, unit_price, quantity) VALUES
  (1, 1, 1, 'Margherita', 8.50, 2);

-- Reset sequences to continue after test data IDs
SELECT setval('user_user_id_seq', (SELECT MAX(user_id) FROM "user"));
SELECT setval('user_data_user_id_seq', (SELECT MAX(user_id) FROM user_data));
SELECT setval('address_address_id_seq', (SELECT MAX(address_id) FROM address));
SELECT setval('role_role_id_seq', (SELECT MAX(role_id) FROM role));
SELECT setval('restaurant_restaurant_id_seq', (SELECT MAX(restaurant_id) FROM restaurant));
SELECT setval('delivery_zone_delivery_zone_id_seq', (SELECT MAX(delivery_zone_id) FROM delivery_zone));
SELECT setval('category_category_id_seq', (SELECT MAX(category_id) FROM category));
SELECT setval('dish_dish_id_seq', (SELECT MAX(dish_id) FROM dish));
SELECT setval('cart_cart_id_seq', (SELECT MAX(cart_id) FROM cart));
SELECT setval('cart_item_cart_item_id_seq', (SELECT MAX(cart_item_id) FROM cart_item));
SELECT setval('order_order_id_seq', (SELECT MAX(order_id) FROM "order"));
SELECT setval('order_item_order_item_id_seq', (SELECT MAX(order_item_id) FROM order_item));

-- End of test data
