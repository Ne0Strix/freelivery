# Project Overview

## Platform Description

## System Architecture Diagram

The repository-root contains three folders containing the Angular frontend (`client`), the database migrations (`db`) and the backend (`server`). The Customer uses the frontend to communicate with the server. Data on the database is exclusively accessed via the server.

```mermaid
architecture-beta

group proj[freelivery]

service db(mdi:storage)[Database] in proj
service client(mdi:accounts)[Frontend] in proj
service server(mdi:server)[Server] in proj

client:T -- B:server
server:R -- L:db
```

### Frontend

```
.
├── src
│   ├── app
│   ├── commons
│   │   ├── guards
│   │   ├── interceptors
│   │   ├── model
│   │   ├── pipes
│   │   └── services
│   ├── layout
│   └── modules
│       ├── customer
│       ├── profile
│       ├── restaurant-manager
│       └── site-manager
```

### Backend

```
.
├── src
│   ├── domains
│   │   ├── commons
│   │   ├── location
│   │   ├── order
│   │   ├── restaurant
│   │   └── user
│   ├── middleware
│   ├── modules
│   │   ├── customer
│   │   ├── restaurant-owner
│   │   └── site-manager
│   └── routes
└── uploads
```

### Database

Note: the datatypes given in the diagram are the ones used in the backend; `DECIMAL` and `TIME` types are parsed as strings.

#### User

```mermaid
classDiagram

    class user {
        number: user_id*
        string: username
        string: email
        string: password_hash
        boolean: is_active
        date: created_at
        date: created_by
    }

    class role {
        number: role_id
        string: name
        string: description
    }

    class user_data {
        number: user_id* ~FK~
        string: first_name
        string: last_name
        string: salutation
        string: phone_number
        date: date_of_birth
    }

    class address {
        number: address_id*
        string: label
        string: street_name
        string: house_number
        string: additional_info
        string: city_name
        string: zip_code
        string: country
        number: grid_x
        number: grid_y
        date: created_at
        date: created_by
    }

    class user_address {
        number: user_id* ~FK~
        number: address_id* ~FK~
        boolean: is_default
    }

    class user_role {
        number: user_id* ~FK~
        number: role_id* ~FK~
    }
```

#### Restaurant

Order data contains redundant data for historic reasons.

```mermaid
classDiagram
    class restaurant {
        number: restaurant_id*
        string: name
        status: restaurant_status
        string: description
        cuisine_type: cuisine_type
        string: contact_email
        string: contact_phone
        number: address_id ~FK~
        number: owner_user_id ~FK~
        string: service_fee_percent
        string: min_order_amount
        number: max_delivery_distance
        date: created_at
        date: updated_at
    }

    class category {
        number: category_id*
        number: restaurant_id ~FK~
        string: name
        string: description
        date: created_at
        date: updated_at
    }

    class dish {
        number: dish_id*
        number: restaurant_id ~FK~
        number: category_id ~FK~
        string: name
        string: description
        string: price
        string: image_url
        boolean: is_available
        date: created_at
        date: updated_at
    }

    class opening_hours {
        number: opening_hours_id*
        number: restaurant_id ~FK~
        number: day_of_week
        string: open_time
        string: close_time
        date: created_at
        date: updated_at
    }
```

```mermaid
classDiagram

    class order {
        number: order_id*
        number: customer_user_id ~FK~
        number: restaurant_id ~FK~
        number: delivery_address_id ~FK~
        order_status: status
        string: subtotal_amount
        string: service_fee_amount
        string: discount_amount
        string: total_amount
        payment_method: payment_method
        date: estimated_delivery_time
        date: delivered_at
        date: created_at
        date: updated_at
    }

    class order_item {
        number: order_item_id*
        number: order_id ~FK~
        number: dish_id ~FK~
        string: dish_name_snapshot
        string: unit_price
        number: quantity
        date: created_at
    }
```

```mermaid
classDiagram

    user_role "1" -- "1" role
    user_role "1" -- "1" user
    user_data "1" -- "1" user
    address "1" -- "1" user_address
    user "1" -- "*" user_address
    restaurant "1" -- "1" address
    restaurant "1" -- "1" user
    category "*" -- "1" restaurant
    dish "*" -- "1" category
    dish "*" -- "1" restaurant
    order "*" -- "1" user
    order "*" -- "1" restaurant
    order "1" -- "1" address
    order_item "*" -- "1" order
    order_item "1" -- "*" dish
    opening_hours "1" -- "*" restaurant

```

# Module Responsibilities

## Restaurant Owner

### REST API

## Shared Components and Backend Services

### User Registration & Authentication

Related code-parts:

- `server/src/routes/auth.routes.ts`
- `server/src/middleware/auth.ts`
- `client/src/commons/interceptors/authenticator.interceptor.ts`
- `client/src/commons/guards/auth.guard.ts`
- `client/src/commons/services/authentication.service.ts`
- `client/src/layout/login/*`
- `client/src/layout/signup/*`

### Profile Management

### Responsive UI

### Error Handling

Related code-parts:

- `server/src/middleware/not-found.ts`
- `server/src/domains/commons/errors.ts`
- `client/src/commons/interceptors/serverError.interceptor.ts`

### Async Handler

Related code-parts:

- `server/src/middleware/async-handler.ts`

### Navigation & Routing

- `client/src/layout/navbar/*`
- `server/index.ts`

### Distance Simulation

# Extra Tasks

# Setup Instructions
