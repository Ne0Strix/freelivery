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
  (3, 'Kunde', 'Mustermann', 'Mr', '+10000000003', '1995-03-15'),
  (4, 'Gastronom', 'Huber', 'Ms', '+10000000004', '1988-07-20'),
  (5, 'Stefan', 'Administrator', 'Mr', '+10000000005', '1992-11-10'),
  (6, 'Deus', 'ExMachina', 'Mx', '+10000000006', '2000-01-01');

-- Addresses (with grid coordinates: x,y from -10 to +10)
INSERT INTO address (address_id, label, street_name, house_number, additional_info, city_name, zip_code, country, grid_x, grid_y) VALUES
  (1, 'Alice Zuhause', 'Villacher Straße', '1', 'Top 1', 'Klagenfurt', '9020', 'Österreich', 0, 0),
  (2, 'Gasthaus Bründlwirt', 'Hauptplatz', '10', NULL, 'Villach', '9500', 'Österreich', 2, 3),
  (3, 'Heuriger zum Weinberg', 'Weinbergweg', '42', NULL, 'Perchtoldsdorf', '2380', 'Österreich', -1, 5),
  (4, 'Almhütte Bergstubn', 'Bergstraße', '7', NULL, 'Zell am See', '5700', 'Österreich', 7, -2),
  (5, 'Café Sacher', 'Philharmonikerstraße', '4', NULL, 'Wien', '1010', 'Österreich', -3, -4);

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

-- Restaurant (owned by Bob) - Austrian cuisine, active
INSERT INTO restaurant (
  restaurant_id, name, status, description, cuisine_type, contact_email, contact_phone,
  address_id, owner_user_id, service_fee_percent, min_order_amount, max_delivery_distance
) VALUES (
  1, 'Gasthaus Bründlwirt', 'ACTIVE', 'Traditionelle österreichische Hausmannskost seit 1923', 'AUSTRIAN', 'kontakt@bruendlwirt.at', '+43 4242 12345',
  2, 2, 5.00, 15.00, 8
);

-- Pending restaurants (status = NEW) for site-manager testing
INSERT INTO restaurant (
  restaurant_id, name, status, description, cuisine_type, contact_email, contact_phone,
  address_id, owner_user_id, service_fee_percent, min_order_amount, max_delivery_distance
) VALUES
  (2, 'Heuriger zum Weinberg', 'NEW', 'Gemütlicher Heuriger mit hausgemachten Spezialitäten', 'AUSTRIAN', 'info@weinberg-heuriger.at', '+43 1 8765432',
   3, 4, 4.50, 12.00, 10),
  (3, 'Almhütte Bergstubn', 'NEW', 'Deftige Almküche mit Panoramablick', 'AUSTRIAN', 'servus@bergstubn.at', '+43 6542 54321',
   4, 4, 3.00, 10.00, 6),
  (4, 'Café Sacher', 'NEW', 'Weltberühmt für die Original Sachertorte', 'AUSTRIAN', 'reservierung@sacher.com', '+43 1 51456',
   5, 2, 6.00, 20.00, 7);

-- =====================
-- Categories for Gasthaus Bründlwirt (restaurant_id = 1)
-- =====================
INSERT INTO category (category_id, restaurant_id, name, description) VALUES
  (1, 1, 'Vorspeisen', 'Kleine Gerichte zum Einstieg'),
  (2, 1, 'Hauptspeisen', 'Traditionelle Hauptgerichte'),
  (3, 1, 'Beilagen', 'Klassische Beilagen'),
  (4, 1, 'Nachspeisen', 'Süße Versuchungen'),
  (5, 1, 'Getränke', 'Erfrischungen und mehr');

-- =====================
-- Dishes for Gasthaus Bründlwirt
-- =====================

-- Vorspeisen (category_id = 1)
INSERT INTO dish (dish_id, restaurant_id, category_id, name, description, price, image_url, is_available) VALUES
  (1, 1, 1, 'Frittatensuppe', 'Kräftige Rindssuppe mit hausgemachten Frittaten', 5.90, NULL, true),
  (2, 1, 1, 'Leberknödelsuppe', 'Deftige Suppe mit hausgemachtem Leberknödel', 6.50, NULL, true),
  (3, 1, 1, 'Gebackene Champignons', 'Panierte Champignons mit Sauce Tartare', 8.90, NULL, true),
  (4, 1, 1, 'Grammelschmalz', 'Hausgemachtes Grammelschmalz mit Bauernbrot', 7.50, NULL, true);

-- Hauptspeisen (category_id = 2)
INSERT INTO dish (dish_id, restaurant_id, category_id, name, description, price, image_url, is_available) VALUES
  (5, 1, 2, 'Wiener Schnitzel', 'Original Wiener Schnitzel vom Kalb mit Erdäpfelsalat', 18.90, NULL, true),
  (6, 1, 2, 'Schweinsbraten', 'Knuspriger Schweinsbraten mit Sauerkraut und Semmelknödel', 15.90, NULL, true),
  (7, 1, 2, 'Tafelspitz', 'Gekochtes Rindfleisch mit Apfelkren und Schnittlauchsauce', 22.50, NULL, true),
  (8, 1, 2, 'Backhendl', 'Knusprig gebackenes Huhn mit Vogerlsalat', 16.90, NULL, true),
  (9, 1, 2, 'Zwiebelrostbraten', 'Saftiger Rostbraten mit Röstzwiebeln und Bratkartoffeln', 21.90, NULL, true),
  (10, 1, 2, 'Käsespätzle', 'Hausgemachte Spätzle mit Bergkäse überbacken und Röstzwiebeln', 13.90, NULL, true),
  (11, 1, 2, 'Beuschel', 'Wiener Beuschel vom Kalb mit Semmelknödel', 14.50, NULL, false),
  (12, 1, 2, 'Blunzengröstl', 'Kärntner Gröstl mit Blutwurst und Spiegelei', 12.90, NULL, true);

-- Beilagen (category_id = 3)
INSERT INTO dish (dish_id, restaurant_id, category_id, name, description, price, image_url, is_available) VALUES
  (13, 1, 3, 'Semmelknödel', 'Zwei hausgemachte Semmelknödel', 4.50, NULL, true),
  (14, 1, 3, 'Erdäpfelsalat', 'Wiener Erdäpfelsalat mit Kernöl', 4.90, NULL, true),
  (15, 1, 3, 'Braterdäpfel', 'Knusprige Bratkartoffeln mit Zwiebeln', 4.50, NULL, true),
  (16, 1, 3, 'Sauerkraut', 'Hausgemachtes Sauerkraut', 3.90, NULL, true),
  (17, 1, 3, 'Gurkensalat', 'Frischer Gurkensalat mit Dille', 4.20, NULL, true);

-- Nachspeisen (category_id = 4)
INSERT INTO dish (dish_id, restaurant_id, category_id, name, description, price, image_url, is_available) VALUES
  (18, 1, 4, 'Apfelstrudel', 'Hausgemachter Apfelstrudel mit Vanillesauce', 6.90, NULL, true),
  (19, 1, 4, 'Kaiserschmarrn', 'Flaumiger Kaiserschmarrn mit Zwetschkenröster', 12.90, NULL, true),
  (20, 1, 4, 'Marillenknödel', 'Drei Marillenknödel mit Butterbröseln', 11.50, NULL, true),
  (21, 1, 4, 'Topfenstrudel', 'Warmer Topfenstrudel mit Vanillesauce', 6.50, NULL, true),
  (22, 1, 4, 'Sachertorte', 'Original Rezept mit Schlagobers', 7.90, NULL, true),
  (23, 1, 4, 'Palatschinken', 'Zwei Palatschinken mit Marillenmarmelade', 8.50, NULL, true);

-- Getränke (category_id = 5)
INSERT INTO dish (dish_id, restaurant_id, category_id, name, description, price, image_url, is_available) VALUES
  (24, 1, 5, 'Almdudler', 'Die österreichische Kräuterlimonade (0.33l)', 3.90, NULL, true),
  (25, 1, 5, 'Apfelsaft gespritzt', 'Frischer Apfelsaft mit Soda (0.5l)', 3.50, NULL, true),
  (26, 1, 5, 'Ottakringer Helles', 'Wiener Lagerbier (0.5l)', 4.50, NULL, true),
  (27, 1, 5, 'Grüner Veltliner', 'Hauswein aus der Wachau (0.25l)', 5.90, NULL, true),
  (28, 1, 5, 'Großer Brauner', 'Verlängerter Kaffee mit Milch', 3.80, NULL, true),
  (29, 1, 5, 'Wiener Melange', 'Klassischer Wiener Kaffee', 4.20, NULL, true);

-- Cart for Alice
INSERT INTO cart (cart_id, user_id, restaurant_id) VALUES
  (1, 1, 1);

INSERT INTO cart_item (cart_item_id, cart_id, dish_id, quantity) VALUES
  (1, 1, 1, 2);

-- An example order placed by Alice
INSERT INTO "order" (
  order_id, customer_user_id, restaurant_id, delivery_address_id,
  status, subtotal_amount, service_fee_amount, discount_amount, total_amount,
  payment_method, estimated_delivery_time, delivered_at
) VALUES (
  1, 1, 1, 1,
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
SELECT setval('category_category_id_seq', (SELECT MAX(category_id) FROM category));
SELECT setval('dish_dish_id_seq', (SELECT MAX(dish_id) FROM dish));
SELECT setval('cart_cart_id_seq', (SELECT MAX(cart_id) FROM cart));
SELECT setval('cart_item_cart_item_id_seq', (SELECT MAX(cart_item_id) FROM cart_item));
SELECT setval('order_order_id_seq', (SELECT MAX(order_id) FROM "order"));
SELECT setval('order_item_order_item_id_seq', (SELECT MAX(order_item_id) FROM order_item));

-- End of test data
