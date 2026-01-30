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

-- Restaurant (owned by Bob, user_id=2) - Austrian cuisine, active
INSERT INTO restaurant (
  restaurant_id, name, status, description, cuisine_type, contact_email, contact_phone,
  address_id, owner_user_id, service_fee_percent, min_order_amount, max_delivery_distance
) VALUES (
  1, 'Gasthaus Bründlwirt', 'ACTIVE', 'Traditionelle österreichische Hausmannskost seit 1923', 'AUSTRIAN', 'kontakt@bruendlwirt.at', '+43 4242 12345',
  2, 2, 5.00, 15.00, 8
);

-- Restaurant (owned by restaurant-owner, user_id=4) - Austrian cuisine, active
INSERT INTO restaurant (
  restaurant_id, name, status, description, cuisine_type, contact_email, contact_phone,
  address_id, owner_user_id, service_fee_percent, min_order_amount, max_delivery_distance
) VALUES (
  2, 'Heuriger zum Weinberg', 'ACTIVE', 'Gemütlicher Heuriger mit hausgemachten Spezialitäten', 'AUSTRIAN', 'info@weinberg-heuriger.at', '+43 1 8765432',
  3, 4, 4.50, 12.00, 10
);

-- Pending restaurants (status = NEW) for site-manager testing
INSERT INTO restaurant (
  restaurant_id, name, status, description, cuisine_type, contact_email, contact_phone,
  address_id, owner_user_id, service_fee_percent, min_order_amount, max_delivery_distance
) VALUES
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

-- =====================
-- Categories for Heuriger zum Weinberg (restaurant_id = 2, owned by restaurant-owner)
-- =====================
INSERT INTO category (category_id, restaurant_id, name, description) VALUES
  (6, 2, 'Kalte Platten', 'Traditionelle Heurigenspezialitäten'),
  (7, 2, 'Warme Speisen', 'Hausgemachte warme Gerichte'),
  (8, 2, 'Mehlspeisen', 'Süße Köstlichkeiten'),
  (9, 2, 'Weine', 'Hauseigene Weine vom Weinberg');

-- =====================
-- Dishes for Heuriger zum Weinberg
-- =====================

-- Kalte Platten (category_id = 6)
INSERT INTO dish (dish_id, restaurant_id, category_id, name, description, price, image_url, is_available) VALUES
  (30, 2, 6, 'Brettljause', 'Gemischte Aufschnittplatte mit Käse, Schinken und Aufstrichen', 14.90, NULL, true),
  (31, 2, 6, 'Liptauer', 'Pikanter Paprikaaufstrich mit Bauernbrot', 6.90, NULL, true),
  (32, 2, 6, 'Verhackertes', 'Hausgemachter Speckaufstrich', 5.90, NULL, true),
  (33, 2, 6, 'Käseplatte', 'Auswahl heimischer Käsesorten mit Weintrauben', 12.50, NULL, true);

-- Warme Speisen (category_id = 7)
INSERT INTO dish (dish_id, restaurant_id, category_id, name, description, price, image_url, is_available) VALUES
  (34, 2, 7, 'Stelze', 'Knusprige Schweinsstelze mit Sauerkraut und Senf', 16.90, NULL, true),
  (35, 2, 7, 'Blunzn mit Kraut', 'Gebratene Blutwurst mit warmem Sauerkraut', 11.90, NULL, true),
  (36, 2, 7, 'Geselchtes mit Kraut', 'Geräuchertes Schweinefleisch mit Sauerkraut', 13.50, NULL, true),
  (37, 2, 7, 'Erdäpfelgulasch', 'Deftiges Kartoffelgulasch mit Würstel', 10.90, NULL, true);

-- Mehlspeisen (category_id = 8)
INSERT INTO dish (dish_id, restaurant_id, category_id, name, description, price, image_url, is_available) VALUES
  (38, 2, 8, 'Buchteln', 'Warme Buchteln mit Vanillesauce', 7.90, NULL, true),
  (39, 2, 8, 'Powidltascherl', 'Gefüllte Teigtaschen mit Powidl und Mohn', 8.50, NULL, true),
  (40, 2, 8, 'Mohnnudeln', 'Kartoffelnudeln mit Mohn und Zucker', 9.90, NULL, true);

-- Weine (category_id = 9)
INSERT INTO dish (dish_id, restaurant_id, category_id, name, description, price, image_url, is_available) VALUES
  (41, 2, 9, 'Gemischter Satz', 'Hauswein weiß (0.25l)', 4.50, NULL, true),
  (42, 2, 9, 'Blauer Zweigelt', 'Hauswein rot (0.25l)', 4.90, NULL, true),
  (43, 2, 9, 'Sturm', 'Frischer Traubenmost (saisonal, 0.25l)', 3.50, NULL, true),
  (44, 2, 9, 'Spritzer', 'Weißwein gespritzt (0.5l)', 4.20, NULL, true);

INSERT INTO opening_hours (opening_hours_id, restaurant_id, day_of_week, open_time, close_time) VALUES
  (1, 2, 0, '11:00', '22:00'),  -- Monday
  (2, 2, 1, '11:00', '22:00'),  -- Tuesday
  (3, 2, 2, '11:00', '22:00'),  -- Wednesday
  (4, 2, 3, '11:00', '23:00'),  -- Thursday
  (5, 2, 4, '11:00', '23:30'),  -- Friday
  (6, 2, 5, '10:00', '23:30');  -- Saturday (closed Sunday)

-- Cart for Alice
INSERT INTO cart (cart_id, user_id, restaurant_id) VALUES
  (1, 1, 1);

INSERT INTO cart_item (cart_item_id, cart_id, dish_id, quantity) VALUES
  (1, 1, 1, 2);

-- Add delivery address for customer user (user_id=3)
INSERT INTO address (address_id, label, street_name, house_number, additional_info, city_name, zip_code, country, grid_x, grid_y) VALUES
  (6, 'Kunde Zuhause', 'Bahnhofstraße', '15', 'Erdgeschoss', 'Klagenfurt', '9020', 'Österreich', 1, 1);

INSERT INTO user_address (user_id, address_id, is_default) VALUES
  (3, 6, true);

-- =====================
-- Orders for Gasthaus Bründlwirt (restaurant_id=1, owned by Bob user_id=2)
-- =====================

-- Order 1: PENDING - new order just placed by Alice
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
  (1, 1, 1, 'Frittatensuppe', 5.90, 2),
  (2, 1, 24, 'Almdudler', 3.90, 1);

-- Order 2: PENDING - new order by customer
INSERT INTO "order" (
  order_id, customer_user_id, restaurant_id, delivery_address_id,
  status, subtotal_amount, service_fee_amount, discount_amount, total_amount,
  payment_method, estimated_delivery_time
) VALUES (
  2, 3, 1, 6,
  'PENDING', 36.70, 1.84, 0.00, 38.54,
  'CASH_ON_DELIVERY', (CURRENT_TIMESTAMP + INTERVAL '45 minutes')
);

INSERT INTO order_item (order_item_id, order_id, dish_id, dish_name_snapshot, unit_price, quantity) VALUES
  (3, 2, 5, 'Wiener Schnitzel', 18.90, 1),
  (4, 2, 14, 'Erdäpfelsalat', 4.90, 1),
  (5, 2, 19, 'Kaiserschmarrn', 12.90, 1);

-- Order 3: CONFIRMED - accepted, waiting to prepare
INSERT INTO "order" (
  order_id, customer_user_id, restaurant_id, delivery_address_id,
  status, subtotal_amount, service_fee_amount, discount_amount, total_amount,
  payment_method, estimated_delivery_time
) VALUES (
  3, 1, 1, 1,
  'CONFIRMED', 31.20, 1.56, 0.00, 32.76,
  'CREDIT_CARD', (CURRENT_TIMESTAMP + INTERVAL '40 minutes')
);

INSERT INTO order_item (order_item_id, order_id, dish_id, dish_name_snapshot, unit_price, quantity) VALUES
  (6, 3, 6, 'Schweinsbraten', 15.90, 1),
  (7, 3, 13, 'Semmelknödel', 4.50, 1),
  (8, 3, 18, 'Apfelstrudel', 6.90, 1),
  (9, 3, 24, 'Almdudler', 3.90, 1);

-- Order 4: PREPARING - currently being cooked
INSERT INTO "order" (
  order_id, customer_user_id, restaurant_id, delivery_address_id,
  status, subtotal_amount, service_fee_amount, discount_amount, total_amount,
  payment_method, estimated_delivery_time
) VALUES (
  4, 3, 1, 6,
  'PREPARING', 56.20, 2.81, 0.00, 59.01,
  'PAYPAL', (CURRENT_TIMESTAMP + INTERVAL '25 minutes')
);

INSERT INTO order_item (order_item_id, order_id, dish_id, dish_name_snapshot, unit_price, quantity) VALUES
  (10, 4, 7, 'Tafelspitz', 22.50, 1),
  (11, 4, 9, 'Zwiebelrostbraten', 21.90, 1),
  (12, 4, 27, 'Grüner Veltliner', 5.90, 2);

-- Order 5: OUT_FOR_DELIVERY - on the way
INSERT INTO "order" (
  order_id, customer_user_id, restaurant_id, delivery_address_id,
  status, subtotal_amount, service_fee_amount, discount_amount, total_amount,
  payment_method, estimated_delivery_time
) VALUES (
  5, 1, 1, 1,
  'OUT_FOR_DELIVERY', 25.60, 1.28, 0.00, 26.88,
  'CREDIT_CARD', (CURRENT_TIMESTAMP + INTERVAL '10 minutes')
);

INSERT INTO order_item (order_item_id, order_id, dish_id, dish_name_snapshot, unit_price, quantity) VALUES
  (13, 5, 8, 'Backhendl', 16.90, 1),
  (14, 5, 17, 'Gurkensalat', 4.20, 1),
  (15, 5, 26, 'Ottakringer Helles', 4.50, 1);

-- Order 6: Another PENDING order
INSERT INTO "order" (
  order_id, customer_user_id, restaurant_id, delivery_address_id,
  status, subtotal_amount, service_fee_amount, discount_amount, total_amount,
  payment_method, estimated_delivery_time
) VALUES (
  6, 1, 1, 1,
  'PENDING', 24.00, 1.20, 0.00, 25.20,
  'CASH_ON_DELIVERY', (CURRENT_TIMESTAMP + INTERVAL '50 minutes')
);

INSERT INTO order_item (order_item_id, order_id, dish_id, dish_name_snapshot, unit_price, quantity) VALUES
  (16, 6, 10, 'Käsespätzle', 13.90, 1),
  (17, 6, 1, 'Frittatensuppe', 5.90, 1),
  (18, 6, 29, 'Wiener Melange', 4.20, 1);

-- =====================
-- Orders for Heuriger zum Weinberg (restaurant_id=2, owned by restaurant-owner user_id=4)
-- =====================

-- Order 7: PENDING - new order
INSERT INTO "order" (
  order_id, customer_user_id, restaurant_id, delivery_address_id,
  status, subtotal_amount, service_fee_amount, discount_amount, total_amount,
  payment_method, estimated_delivery_time
) VALUES (
  7, 1, 2, 1,
  'PENDING', 27.70, 1.25, 0.00, 28.95,
  'CREDIT_CARD', (CURRENT_TIMESTAMP + INTERVAL '35 minutes')
);

INSERT INTO order_item (order_item_id, order_id, dish_id, dish_name_snapshot, unit_price, quantity) VALUES
  (19, 7, 30, 'Brettljause', 14.90, 1),
  (20, 7, 31, 'Liptauer', 6.90, 1),
  (21, 7, 44, 'Spritzer', 4.20, 2);

-- Order 8: PENDING - another new order
INSERT INTO "order" (
  order_id, customer_user_id, restaurant_id, delivery_address_id,
  status, subtotal_amount, service_fee_amount, discount_amount, total_amount,
  payment_method, estimated_delivery_time
) VALUES (
  8, 3, 2, 6,
  'PENDING', 33.20, 1.49, 0.00, 34.69,
  'CASH_ON_DELIVERY', (CURRENT_TIMESTAMP + INTERVAL '40 minutes')
);

INSERT INTO order_item (order_item_id, order_id, dish_id, dish_name_snapshot, unit_price, quantity) VALUES
  (22, 8, 34, 'Stelze', 16.90, 1),
  (23, 8, 38, 'Buchteln', 7.90, 1),
  (24, 8, 41, 'Gemischter Satz', 4.50, 2);

-- Order 9: CONFIRMED - accepted order
INSERT INTO "order" (
  order_id, customer_user_id, restaurant_id, delivery_address_id,
  status, subtotal_amount, service_fee_amount, discount_amount, total_amount,
  payment_method, estimated_delivery_time
) VALUES (
  9, 1, 2, 1,
  'CONFIRMED', 24.30, 1.09, 0.00, 25.39,
  'PAYPAL', (CURRENT_TIMESTAMP + INTERVAL '30 minutes')
);

INSERT INTO order_item (order_item_id, order_id, dish_id, dish_name_snapshot, unit_price, quantity) VALUES
  (25, 9, 36, 'Geselchtes mit Kraut', 13.50, 1),
  (26, 9, 39, 'Powidltascherl', 8.50, 1),
  (27, 9, 43, 'Sturm', 3.50, 1);

-- Order 10: PREPARING - being prepared
INSERT INTO "order" (
  order_id, customer_user_id, restaurant_id, delivery_address_id,
  status, subtotal_amount, service_fee_amount, discount_amount, total_amount,
  payment_method, estimated_delivery_time
) VALUES (
  10, 3, 2, 6,
  'PREPARING', 31.60, 1.42, 0.00, 33.02,
  'CREDIT_CARD', (CURRENT_TIMESTAMP + INTERVAL '20 minutes')
);

INSERT INTO order_item (order_item_id, order_id, dish_id, dish_name_snapshot, unit_price, quantity) VALUES
  (28, 10, 35, 'Blunzn mit Kraut', 11.90, 1),
  (29, 10, 37, 'Erdäpfelgulasch', 10.90, 1),
  (30, 10, 42, 'Blauer Zweigelt', 4.90, 2);

-- Order 11: OUT_FOR_DELIVERY
INSERT INTO "order" (
  order_id, customer_user_id, restaurant_id, delivery_address_id,
  status, subtotal_amount, service_fee_amount, discount_amount, total_amount,
  payment_method, estimated_delivery_time
) VALUES (
  11, 1, 2, 1,
  'OUT_FOR_DELIVERY', 19.30, 0.87, 0.00, 20.17,
  'CASH_ON_DELIVERY', (CURRENT_TIMESTAMP + INTERVAL '5 minutes')
);

INSERT INTO order_item (order_item_id, order_id, dish_id, dish_name_snapshot, unit_price, quantity) VALUES
  (31, 11, 33, 'Käseplatte', 12.50, 1),
  (32, 11, 32, 'Verhackertes', 5.90, 1),
  (33, 11, 43, 'Sturm', 3.50, 1);

-- =====================
-- Historical Orders for Analytics (last 7 days)
-- Orders for Gasthaus Bründlwirt (restaurant_id=1)
-- =====================

-- Yesterday (1 day ago) - 3 orders
INSERT INTO "order" (
  order_id, customer_user_id, restaurant_id, delivery_address_id,
  status, subtotal_amount, service_fee_amount, discount_amount, total_amount,
  payment_method, created_at, delivered_at
) VALUES
  (12, 1, 1, 1, 'DELIVERED', 35.80, 1.79, 0.00, 37.59, 'CREDIT_CARD', CURRENT_DATE - INTERVAL '1 day' + TIME '12:30:00', CURRENT_DATE - INTERVAL '1 day' + TIME '13:15:00'),
  (13, 3, 1, 6, 'DELIVERED', 28.70, 1.44, 0.00, 30.14, 'CASH_ON_DELIVERY', CURRENT_DATE - INTERVAL '1 day' + TIME '18:45:00', CURRENT_DATE - INTERVAL '1 day' + TIME '19:30:00'),
  (14, 1, 1, 1, 'DELIVERED', 42.30, 2.12, 0.00, 44.42, 'PAYPAL', CURRENT_DATE - INTERVAL '1 day' + TIME '20:00:00', CURRENT_DATE - INTERVAL '1 day' + TIME '20:45:00');

INSERT INTO order_item (order_item_id, order_id, dish_id, dish_name_snapshot, unit_price, quantity) VALUES
  (34, 12, 5, 'Wiener Schnitzel', 18.90, 1),
  (35, 12, 8, 'Backhendl', 16.90, 1),
  (36, 13, 6, 'Schweinsbraten', 15.90, 1),
  (37, 13, 19, 'Kaiserschmarrn', 12.90, 1),
  (38, 14, 7, 'Tafelspitz', 22.50, 1),
  (39, 14, 5, 'Wiener Schnitzel', 18.90, 1);

-- 2 days ago - 2 orders
INSERT INTO "order" (
  order_id, customer_user_id, restaurant_id, delivery_address_id,
  status, subtotal_amount, service_fee_amount, discount_amount, total_amount,
  payment_method, created_at, delivered_at
) VALUES
  (15, 3, 1, 6, 'DELIVERED', 31.70, 1.59, 0.00, 33.29, 'CREDIT_CARD', CURRENT_DATE - INTERVAL '2 days' + TIME '13:00:00', CURRENT_DATE - INTERVAL '2 days' + TIME '13:45:00'),
  (16, 1, 1, 1, 'DELIVERED', 25.80, 1.29, 0.00, 27.09, 'CASH_ON_DELIVERY', CURRENT_DATE - INTERVAL '2 days' + TIME '19:30:00', CURRENT_DATE - INTERVAL '2 days' + TIME '20:15:00');

INSERT INTO order_item (order_item_id, order_id, dish_id, dish_name_snapshot, unit_price, quantity) VALUES
  (40, 15, 5, 'Wiener Schnitzel', 18.90, 1),
  (41, 15, 19, 'Kaiserschmarrn', 12.90, 1),
  (42, 16, 10, 'Käsespätzle', 13.90, 1),
  (43, 16, 18, 'Apfelstrudel', 6.90, 1),
  (44, 16, 24, 'Almdudler', 3.90, 1);

-- 3 days ago - 4 orders (busy day)
INSERT INTO "order" (
  order_id, customer_user_id, restaurant_id, delivery_address_id,
  status, subtotal_amount, service_fee_amount, discount_amount, total_amount,
  payment_method, created_at, delivered_at
) VALUES
  (17, 1, 1, 1, 'DELIVERED', 37.80, 1.89, 0.00, 39.69, 'CREDIT_CARD', CURRENT_DATE - INTERVAL '3 days' + TIME '11:30:00', CURRENT_DATE - INTERVAL '3 days' + TIME '12:15:00'),
  (18, 3, 1, 6, 'DELIVERED', 44.40, 2.22, 0.00, 46.62, 'PAYPAL', CURRENT_DATE - INTERVAL '3 days' + TIME '12:45:00', CURRENT_DATE - INTERVAL '3 days' + TIME '13:30:00'),
  (19, 1, 1, 1, 'DELIVERED', 29.70, 1.49, 0.00, 31.19, 'CASH_ON_DELIVERY', CURRENT_DATE - INTERVAL '3 days' + TIME '18:00:00', CURRENT_DATE - INTERVAL '3 days' + TIME '18:45:00'),
  (20, 3, 1, 6, 'DELIVERED', 52.30, 2.62, 0.00, 54.92, 'CREDIT_CARD', CURRENT_DATE - INTERVAL '3 days' + TIME '20:30:00', CURRENT_DATE - INTERVAL '3 days' + TIME '21:15:00');

INSERT INTO order_item (order_item_id, order_id, dish_id, dish_name_snapshot, unit_price, quantity) VALUES
  (45, 17, 5, 'Wiener Schnitzel', 18.90, 2),
  (46, 18, 7, 'Tafelspitz', 22.50, 1),
  (47, 18, 9, 'Zwiebelrostbraten', 21.90, 1),
  (48, 19, 6, 'Schweinsbraten', 15.90, 1),
  (49, 19, 10, 'Käsespätzle', 13.90, 1),
  (50, 20, 5, 'Wiener Schnitzel', 18.90, 2),
  (51, 20, 14, 'Erdäpfelsalat', 4.90, 2),
  (52, 20, 26, 'Ottakringer Helles', 4.50, 1);

-- 4 days ago - 1 order (slow day)
INSERT INTO "order" (
  order_id, customer_user_id, restaurant_id, delivery_address_id,
  status, subtotal_amount, service_fee_amount, discount_amount, total_amount,
  payment_method, created_at, delivered_at
) VALUES
  (21, 1, 1, 1, 'DELIVERED', 22.50, 1.13, 0.00, 23.63, 'CREDIT_CARD', CURRENT_DATE - INTERVAL '4 days' + TIME '19:00:00', CURRENT_DATE - INTERVAL '4 days' + TIME '19:45:00');

INSERT INTO order_item (order_item_id, order_id, dish_id, dish_name_snapshot, unit_price, quantity) VALUES
  (53, 21, 7, 'Tafelspitz', 22.50, 1);

-- 5 days ago - 2 orders
INSERT INTO "order" (
  order_id, customer_user_id, restaurant_id, delivery_address_id,
  status, subtotal_amount, service_fee_amount, discount_amount, total_amount,
  payment_method, created_at, delivered_at
) VALUES
  (22, 3, 1, 6, 'DELIVERED', 33.80, 1.69, 0.00, 35.49, 'PAYPAL', CURRENT_DATE - INTERVAL '5 days' + TIME '12:00:00', CURRENT_DATE - INTERVAL '5 days' + TIME '12:45:00'),
  (23, 1, 1, 1, 'DELIVERED', 27.80, 1.39, 0.00, 29.19, 'CASH_ON_DELIVERY', CURRENT_DATE - INTERVAL '5 days' + TIME '18:30:00', CURRENT_DATE - INTERVAL '5 days' + TIME '19:15:00');

INSERT INTO order_item (order_item_id, order_id, dish_id, dish_name_snapshot, unit_price, quantity) VALUES
  (54, 22, 8, 'Backhendl', 16.90, 2),
  (55, 23, 5, 'Wiener Schnitzel', 18.90, 1),
  (56, 23, 18, 'Apfelstrudel', 6.90, 1);

-- 6 days ago - 3 orders
INSERT INTO "order" (
  order_id, customer_user_id, restaurant_id, delivery_address_id,
  status, subtotal_amount, service_fee_amount, discount_amount, total_amount,
  payment_method, created_at, delivered_at
) VALUES
  (24, 1, 1, 1, 'DELIVERED', 40.70, 2.04, 0.00, 42.74, 'CREDIT_CARD', CURRENT_DATE - INTERVAL '6 days' + TIME '11:00:00', CURRENT_DATE - INTERVAL '6 days' + TIME '11:45:00'),
  (25, 3, 1, 6, 'DELIVERED', 18.90, 0.95, 0.00, 19.85, 'CASH_ON_DELIVERY', CURRENT_DATE - INTERVAL '6 days' + TIME '13:30:00', CURRENT_DATE - INTERVAL '6 days' + TIME '14:15:00'),
  (26, 1, 1, 1, 'DELIVERED', 35.80, 1.79, 0.00, 37.59, 'PAYPAL', CURRENT_DATE - INTERVAL '6 days' + TIME '20:00:00', CURRENT_DATE - INTERVAL '6 days' + TIME '20:45:00');

INSERT INTO order_item (order_item_id, order_id, dish_id, dish_name_snapshot, unit_price, quantity) VALUES
  (57, 24, 9, 'Zwiebelrostbraten', 21.90, 1),
  (58, 24, 5, 'Wiener Schnitzel', 18.90, 1),
  (59, 25, 5, 'Wiener Schnitzel', 18.90, 1),
  (60, 26, 6, 'Schweinsbraten', 15.90, 1),
  (61, 26, 19, 'Kaiserschmarrn', 12.90, 1),
  (62, 26, 24, 'Almdudler', 3.90, 2);

-- =====================
-- Historical Orders for Heuriger zum Weinberg (restaurant_id=2, owned by restaurant-owner user_id=4)
-- =====================

-- Yesterday - 2 orders
INSERT INTO "order" (
  order_id, customer_user_id, restaurant_id, delivery_address_id,
  status, subtotal_amount, service_fee_amount, discount_amount, total_amount,
  payment_method, created_at, delivered_at
) VALUES
  (27, 1, 2, 1, 'DELIVERED', 28.30, 1.27, 0.00, 29.57, 'CREDIT_CARD', CURRENT_DATE - INTERVAL '1 day' + TIME '14:00:00', CURRENT_DATE - INTERVAL '1 day' + TIME '14:45:00'),
  (28, 3, 2, 6, 'DELIVERED', 21.80, 0.98, 0.00, 22.78, 'CASH_ON_DELIVERY', CURRENT_DATE - INTERVAL '1 day' + TIME '19:00:00', CURRENT_DATE - INTERVAL '1 day' + TIME '19:45:00');

INSERT INTO order_item (order_item_id, order_id, dish_id, dish_name_snapshot, unit_price, quantity) VALUES
  (63, 27, 30, 'Brettljause', 14.90, 1),
  (64, 27, 34, 'Stelze', 16.90, 1),
  (65, 28, 35, 'Blunzn mit Kraut', 11.90, 1),
  (66, 28, 40, 'Mohnnudeln', 9.90, 1);

-- 2 days ago - 1 order
INSERT INTO "order" (
  order_id, customer_user_id, restaurant_id, delivery_address_id,
  status, subtotal_amount, service_fee_amount, discount_amount, total_amount,
  payment_method, created_at, delivered_at
) VALUES
  (29, 1, 2, 1, 'DELIVERED', 32.30, 1.45, 0.00, 33.75, 'PAYPAL', CURRENT_DATE - INTERVAL '2 days' + TIME '18:30:00', CURRENT_DATE - INTERVAL '2 days' + TIME '19:15:00');

INSERT INTO order_item (order_item_id, order_id, dish_id, dish_name_snapshot, unit_price, quantity) VALUES
  (67, 29, 34, 'Stelze', 16.90, 1),
  (68, 29, 38, 'Buchteln', 7.90, 1),
  (69, 29, 41, 'Gemischter Satz', 4.50, 2);

-- 3 days ago - 3 orders
INSERT INTO "order" (
  order_id, customer_user_id, restaurant_id, delivery_address_id,
  status, subtotal_amount, service_fee_amount, discount_amount, total_amount,
  payment_method, created_at, delivered_at
) VALUES
  (30, 3, 2, 6, 'DELIVERED', 24.40, 1.10, 0.00, 25.50, 'CREDIT_CARD', CURRENT_DATE - INTERVAL '3 days' + TIME '12:00:00', CURRENT_DATE - INTERVAL '3 days' + TIME '12:45:00'),
  (31, 1, 2, 1, 'DELIVERED', 29.80, 1.34, 0.00, 31.14, 'CASH_ON_DELIVERY', CURRENT_DATE - INTERVAL '3 days' + TIME '17:30:00', CURRENT_DATE - INTERVAL '3 days' + TIME '18:15:00'),
  (32, 3, 2, 6, 'DELIVERED', 18.40, 0.83, 0.00, 19.23, 'PAYPAL', CURRENT_DATE - INTERVAL '3 days' + TIME '20:00:00', CURRENT_DATE - INTERVAL '3 days' + TIME '20:45:00');

INSERT INTO order_item (order_item_id, order_id, dish_id, dish_name_snapshot, unit_price, quantity) VALUES
  (70, 30, 30, 'Brettljause', 14.90, 1),
  (71, 30, 39, 'Powidltascherl', 8.50, 1),
  (72, 31, 30, 'Brettljause', 14.90, 2),
  (73, 32, 37, 'Erdäpfelgulasch', 10.90, 1),
  (74, 32, 38, 'Buchteln', 7.90, 1);

-- 5 days ago - 2 orders
INSERT INTO "order" (
  order_id, customer_user_id, restaurant_id, delivery_address_id,
  status, subtotal_amount, service_fee_amount, discount_amount, total_amount,
  payment_method, created_at, delivered_at
) VALUES
  (33, 1, 2, 1, 'DELIVERED', 26.80, 1.21, 0.00, 28.01, 'CREDIT_CARD', CURRENT_DATE - INTERVAL '5 days' + TIME '13:00:00', CURRENT_DATE - INTERVAL '5 days' + TIME '13:45:00'),
  (34, 3, 2, 6, 'DELIVERED', 33.80, 1.52, 0.00, 35.32, 'CASH_ON_DELIVERY', CURRENT_DATE - INTERVAL '5 days' + TIME '19:30:00', CURRENT_DATE - INTERVAL '5 days' + TIME '20:15:00');

INSERT INTO order_item (order_item_id, order_id, dish_id, dish_name_snapshot, unit_price, quantity) VALUES
  (75, 33, 34, 'Stelze', 16.90, 1),
  (76, 33, 40, 'Mohnnudeln', 9.90, 1),
  (77, 34, 34, 'Stelze', 16.90, 2);

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
SELECT setval('order_order_id_seq', (SELECT COALESCE(MAX(order_id), 1) FROM "order"));
SELECT setval('order_item_order_item_id_seq', (SELECT COALESCE(MAX(order_item_id), 1) FROM order_item));
SELECT setval('opening_hours_opening_hours_id_seq', (SELECT COALESCE(MAX(opening_hours_id), 1) FROM opening_hours));

-- End of test data
