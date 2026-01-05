-- Test data for a fresh DB. Safe to run against a brand-new database.
-- This file inserts a small set of rows that exercise enums, FKs and unique constraints.

-- Roles
INSERT INTO role (role_id, name, description) VALUES
  (1, 'admin', 'Administrator'),
  (2, 'restaurant_owner', 'Restaurant owner'),
  (3, 'customer', 'Customer');

-- Users
INSERT INTO "user" (user_id, username, email, password_hash, salt, is_active) VALUES
  (1, 'alice', 'alice@example.com', 'passhash1', 'salt1', true),
  (2, 'bob', 'bob@example.com', 'passhash2', 'salt2', true),
  (3, 'customer', 'customer@freelivery.com', 'customer', 'salt3', true),
  (4, 'restaurant-owner', 'restaurant-owner@freelivery.com', 'restaurant-owner', 'salt4', true),
  (5, 'site-admin', 'site-admin@freelivery.com', 'site-admin', 'salt5', true),
  (6, 'deus', 'deus@freelivery.com', 'deus', 'salt6', true);

-- User data
INSERT INTO user_data (user_id, first_name, last_name, salutation, phone_number, date_of_birth) VALUES
  (1, 'Alice', 'Anderson', 'Ms', '+10000000001', '1990-01-01'),
  (2, 'Bob', 'Baker', 'Mr', '+10000000002', '1985-05-05'),
  (3, 'Customer', 'User', 'Mr', '+10000000003', '1995-03-15'),
  (4, 'Restaurant', 'Owner', 'Ms', '+10000000004', '1988-07-20'),
  (5, 'Site', 'Admin', 'Mr', '+10000000005', '1992-11-10'),
  (6, 'Deus', 'ExMachina', 'Mx', '+10000000006', '2000-01-01');

-- Addresses
INSERT INTO address (address_id, label, street_name, house_number, additional_info, city_name, zip_code, country) VALUES
  (1, 'Alice Home', 'Main Street', '1', 'Apt 1', 'Townsville', '12345', 'Country'),
  (2, 'Luigi Pizzeria', 'Food St', '10', NULL, 'Townsville', '12345', 'Country');

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

-- Restaurant (owned by Bob)
INSERT INTO restaurant (
  restaurant_id, name, status, description, cuisine_type, contact_email, contact_phone,
  address_id, owner_user_id, delivery_zone_id, service_fee_percent, min_order_amount
) VALUES (
  1, 'Luigi Pizzeria', 'ACTIVE', 'Great pizza in town', 'ITALIAN', 'contact@luigi.example', '+10000000010',
  2, 2, 1, 5.00, 10.00
);

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

-- End of test data
