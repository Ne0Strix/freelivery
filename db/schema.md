https://mermaid.js.org/syntax/classDiagram.html

```mermaid
---
title: DB Diagram
---
classDiagram

%% =====================
%% USER & AUTH
%% =====================
namespace User {
    class user {
        number: user_id*
        string: username
        string: email
        string: password_hash
        string: salt
        boolean: is_active
        datetime: created_at
        datetime: updated_at
    }

    class user_data {
        number: user_id* ~FK~
        string: first_name
        string: last_name
        string: salutation
        string: phone_number
        date: date_of_birth
    }

    class user_address {
        number: user_id* ~FK~
        number: address_id* ~FK~
        boolean: is_default
    }

    class role {
        number: role_id*
        string: name
        string: description
    }

    class user_role {
        number: user_id* ~FK~
        number: role_id* ~FK~
    }
}

%% =====================
%% LOCATION / ZONES
%% =====================
namespace Location {

    class address {
        number: address_id*
        string: label
        string: street_name
        string: house_number
        string: additional_info

        string: city_name
        string: zip_code
        string: country

        datetime: created_at
        datetime: updated_at
    }
}

%% =====================
%% RESTAURANT
%% =====================
namespace Restaurant {
    class restaurant {
        number: restaurant_id*
        string: name
        string: status         [NEW, ACTIVE, SUSPENDED]
        string: description
        string: cuisine_type
        string: contact_email
        string: contact_phone

        number: address_id ~FK~
        number: owner_user_id ~FK~

        number: service_fee_percent
        number: min_order_amount

        datetime: created_at
        datetime: updated_at
    }
}

%% =====================
%% MENU / DISHES
%% =====================
namespace Menu {
    class category {
        number: category_id*
        number: restaurant_id* ~FK~
        string: name
        string: description

        datetime: created_at
        datetime: updated_at
    }

    class dish {
        number: dish_id*
        number: restaurant_id* ~FK~
        number: category_id* ~FK~
        string: name
        string: description
        number: price
        boolean: is_available
        datetime: created_at
        datetime: updated_at
    }
}

%% =====================
%% ORDERS / CART
%% =====================
namespace Order {
    class order {
        number: order_id*
        number: customer_user_id* ~FK~
        number: restaurant_id* ~FK~
        number: delivery_address_id* ~FK~

        string: status [PENDING, CONFIRMED, PREPARING, OUT_FOR_DELIVERY, DELIVERED, CANCELLED]

        number: subtotal_amount
        number: service_fee_amount
        number: discount_amount
        number: total_amount

    string: payment_method     %% CREDIT_CARD, PAYPAL, CASH_ON_DELIVERY

        datetime: estimated_delivery_time
        datetime: delivered_at

        datetime: created_at
        datetime: updated_at
    }

    class order_item {
        number: order_item_id*
        number: order_id* ~FK~
        number: dish_id* ~FK~

        string: dish_name_snapshot
        number: unit_price
        number: quantity

        datetime: created_at
    }

    class cart {
        number: cart_id*
        number: user_id* ~FK~
        number: restaurant_id* ~FK~
        datetime: created_at
        datetime: updated_at
    }

    class cart_item {
        number: cart_item_id*
        number: cart_id* ~FK~
        number: dish_id* ~FK~
        number: quantity

        datetime: created_at
        datetime: updated_at
    }
}

%% =====================
%% RELATIONSHIPS
%% =====================

%% User
User.user "1" -- "1" User.user_data : has
User.user "1" -- "*" User.user_address : has
User.user "1" -- "*" User.user_role : has
User.user_role "*" -- "1" User.role : maps_to

%% Address
User.user_address "*" -- "1" Location.address : refers_to
Restaurant.restaurant "*" -- "1" Location.address : located_at
Order.order "*" -- "1" Location.address : delivered_to

%% Restaurant ownership
Restaurant.restaurant "*" -- "1" User.user : owned_by

%% Menu
Restaurant.restaurant "1" -- "*" Menu.category : has
Menu.category "1" -- "*" Menu.dish : has
Restaurant.restaurant "1" -- "*" Menu.dish : offers

%% Orders
User.user "1" -- "*" Order.order : places
Restaurant.restaurant "1" -- "*" Order.order : receives
Order.order "1" -- "*" Order.order_item : contains
Menu.dish "1" -- "*" Order.order_item : ordered_as

%% Cart
User.user "1" -- "*" Order.cart : has
Restaurant.restaurant "1" -- "*" Order.cart : used_for
Order.cart "1" -- "*" Order.cart_item : contains
Menu.dish "1" -- "*" Order.cart_item : in_cart


```
