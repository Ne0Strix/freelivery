-- =====================
-- USER & AUTH TABLES
-- =====================

CREATE TABLE IF NOT EXISTS role (
    role_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE IF NOT EXISTS "user" (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_data (
    user_id SERIAL PRIMARY KEY,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    salutation VARCHAR(50),
    phone_number VARCHAR(20),
    date_of_birth DATE,
    FOREIGN KEY (user_id) REFERENCES "user"(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS address (
    address_id SERIAL PRIMARY KEY,
    label VARCHAR(255),
    street_name VARCHAR(255) NOT NULL,
    house_number VARCHAR(10) NOT NULL,
    additional_info VARCHAR(255),
    city_name VARCHAR(255) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    country VARCHAR(255) NOT NULL,
    grid_x INT CHECK (grid_x BETWEEN -10 AND 10),
    grid_y INT CHECK (grid_y BETWEEN -10 AND 10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_address (
    user_id INT NOT NULL,
    address_id INT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    PRIMARY KEY (user_id, address_id),
    FOREIGN KEY (user_id) REFERENCES "user"(user_id) ON DELETE CASCADE,
    FOREIGN KEY (address_id) REFERENCES address(address_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_role (
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES "user"(user_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES role(role_id) ON DELETE CASCADE
);

-- =====================
-- ENUM TYPES
-- =====================
-- Enums mirror TypeScript enums in server/src/*/*.model.ts
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'restaurant_status') THEN
        CREATE TYPE restaurant_status AS ENUM ('NEW', 'ACTIVE', 'SUSPENDED');
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cuisine_type') THEN
        CREATE TYPE cuisine_type AS ENUM (
            'ITALIAN','CHINESE','INDIAN','MEXICAN','AMERICAN','FRENCH',
            'JAPANESE','MEDITERRANEAN','THAI','VIETNAMESE','AUSTRIAN'
        );
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        CREATE TYPE order_status AS ENUM ('PENDING','CONFIRMED','PREPARING','OUT_FOR_DELIVERY','DELIVERED','CANCELLED');
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
        CREATE TYPE payment_method AS ENUM ('CREDIT_CARD','PAYPAL','CASH_ON_DELIVERY');
    END IF;
END$$;

-- =====================
-- RESTAURANT TABLES
-- =====================

CREATE TABLE IF NOT EXISTS restaurant (
    restaurant_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status restaurant_status DEFAULT 'NEW',
    description TEXT,
    cuisine_type cuisine_type,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    address_id INT NOT NULL,
    owner_user_id INT NOT NULL,
    service_fee_percent DECIMAL(5,2) DEFAULT 0,
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    max_delivery_distance INT DEFAULT 5 CHECK (max_delivery_distance > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (address_id) REFERENCES address(address_id) ON DELETE RESTRICT,
    FOREIGN KEY (owner_user_id) REFERENCES "user"(user_id) ON DELETE RESTRICT
);

-- =====================
-- MENU / DISHES TABLES
-- =====================

CREATE TABLE IF NOT EXISTS category (
    category_id SERIAL PRIMARY KEY,
    restaurant_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurant(restaurant_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS dish (
    dish_id SERIAL PRIMARY KEY,
    restaurant_id INT NOT NULL,
    category_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(500),
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurant(restaurant_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES category(category_id) ON DELETE CASCADE
);

-- =====================
-- CART TABLES
-- =====================

CREATE TABLE IF NOT EXISTS cart (
    cart_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    restaurant_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "user"(user_id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurant(restaurant_id) ON DELETE CASCADE,
    UNIQUE(user_id, restaurant_id)
);

CREATE TABLE IF NOT EXISTS cart_item (
    cart_item_id SERIAL PRIMARY KEY,
    cart_id INT NOT NULL,
    dish_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES cart(cart_id) ON DELETE CASCADE,
    FOREIGN KEY (dish_id) REFERENCES dish(dish_id) ON DELETE CASCADE,
    UNIQUE(cart_id, dish_id)
);

-- =====================
-- ORDER TABLES
-- =====================

CREATE TABLE IF NOT EXISTS "order" (
    order_id SERIAL PRIMARY KEY,
    customer_user_id INT NOT NULL,
    restaurant_id INT NOT NULL,
    delivery_address_id INT NOT NULL,
    status order_status DEFAULT 'PENDING',
    subtotal_amount DECIMAL(10,2) NOT NULL,
    service_fee_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method payment_method,
    estimated_delivery_time TIMESTAMP,
    delivered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_user_id) REFERENCES "user"(user_id) ON DELETE RESTRICT,
    FOREIGN KEY (restaurant_id) REFERENCES restaurant(restaurant_id) ON DELETE RESTRICT,
    FOREIGN KEY (delivery_address_id) REFERENCES address(address_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS order_item (
    order_item_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL,
    dish_id INT NOT NULL,
    dish_name_snapshot VARCHAR(255) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES "order"(order_id) ON DELETE CASCADE,
    FOREIGN KEY (dish_id) REFERENCES dish(dish_id) ON DELETE RESTRICT
);

-- =====================
-- INDEXES FOR PERFORMANCE (TODO)
-- =====================
