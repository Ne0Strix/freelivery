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
        string: pronouns
        string: phone_number
        datetime: date_of_birth
    }

    class user_address {
        number: user_id* ~FK~
        number: address_id* ~FK~
        boolean: is_default
    }

    class role {
        number: role_id*
        string: name          %% e.g. "SITE_MANAGER", "RESTAURANT_OWNER", "CUSTOMER"
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

        string: zone_code       %% for distance / delivery simulation

        datetime: created_at
        datetime: updated_at
    }

    class delivery_zone {
        number: delivery_zone_id*
        string: code           %% e.g. "A1", "B2"
        string: name
        string: description
        number: base_eta_min   %% base estimated time in minutes
        number: extra_eta_per_zone_step
    }
}

%% =====================
%% RESTAURANT & OPENING HOURS
%% =====================
namespace Restaurant {
    class restaurant {
        number: restaurant_id*
        string: name
        string: status         [new, active, suspended]
        string: description
        string: cuisine_type
        string: contact_email
        string: contact_phone

        number: address_id ~FK~
        number: owner_user_id ~FK~
        number: delivery_zone_id ~FK~

        number: service_fee_percent
        number: min_order_amount

        datetime: created_at
        datetime: updated_at
    }

    class restaurant_owner {
        number: restaurant_id* ~FK~
        number: user_id* ~FK~
    }

    class restaurant_opening_hours {
        number: opening_hours_id*
        number: restaurant_id* ~FK~
        number: day_of_week        %% 0=Sunday .. 6=Saturday
        time: opens_at
        time: closes_at
        boolean: is_closed
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
        number: sort_order
    }

    class dish {
        number: dish_id*
        number: restaurant_id* ~FK~
        number: category_id* ~FK~
        string: name
        string: description
        number: price
        string: image_url
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
        number: delivery_zone_id* ~FK~

        string: status [pending, accepted, rejected, preparing, ready, dispatched, delivered, cancelled]

        number: subtotal_amount
        number: service_fee_amount
        number: discount_amount
        number: total_amount

        string: payment_method     %% "cash", "card", "online"
        string: voucher_code       %% snapshot of applied code

        number: estimated_eta_min
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
        number: line_total
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
    }
}

%% =====================
%% VOUCHERS / PROMOS
%% =====================
namespace Voucher {
    class voucher {
        number: voucher_id*
        string: code*              %% unique
        string: description
        string: discount_type [percent, fixed]
        number: discount_value
        datetime: valid_from
        datetime: valid_to
        boolean: is_active
        number: max_uses
        number: max_uses_per_user
    }

    class order_voucher {
        number: order_id* ~FK~
        number: voucher_id* ~FK~
        number: discount_amount
    }
}

%% =====================
%% FEEDBACK / RATING
%% =====================
namespace Feedback {
    class restaurant_review {
        number: review_id*
        number: restaurant_id* ~FK~
        number: user_id* ~FK~
        number: order_id ~FK~
        number: rating         %% 1-5
        string: comment
        datetime: created_at
    }

    class dish_review {
        number: review_id*
        number: dish_id* ~FK~
        number: user_id* ~FK~
        number: order_item_id ~FK~
        number: rating         %% 1-5
        string: comment
        datetime: created_at
    }
}

%% =====================
%% RELATIONSHIPS
%% =====================

%% User
User.user "1" -- "1" User.user_data : has
User.user "1" -- "many" User.user_address : has
User.user "1" -- "many" User.user_role : has
User.user_role "many" -- "1" User.role : maps_to

%% Address / Zones
User.user_address "many" -- "1" Location.address : refers_to
Restaurant.restaurant "1" -- "1" Location.address : located_at
Restaurant.restaurant "many" -- "1" Location.delivery_zone : in
Order.order "many" -- "1" Location.address : delivered_to
Order.order "many" -- "1" Location.delivery_zone : uses_zone

%% Restaurant ownership / opening hours
Restaurant.restaurant "many" -- "many" User.user : owned_by
Restaurant.restaurant_owner "many" -- "1" Restaurant.restaurant : for
Restaurant.restaurant_owner "many" -- "1" User.user : owner
Restaurant.restaurant "1" -- "many" Restaurant.restaurant_opening_hours : has

%% Menu
Restaurant.restaurant "1" -- "many" Menu.category : has
Menu.category "1" -- "many" Menu.dish : has
Restaurant.restaurant "1" -- "many" Menu.dish : offers

%% Orders
User.user "1" -- "many" Order.order : places
Restaurant.restaurant "1" -- "many" Order.order : receives
Order.order "1" -- "many" Order.order_item : contains
Menu.dish "1" -- "many" Order.order_item : ordered_as

%% Cart
User.user "1" -- "many" Order.cart : has
Restaurant.restaurant "1" -- "many" Order.cart : used_for
Order.cart "1" -- "many" Order.cart_item : contains
Menu.dish "1" -- "many" Order.cart_item : in_cart

%% Vouchers
Voucher.voucher "1" -- "many" Order.order_voucher : applied_in
Order.order "1" -- "many" Order.order_voucher : has_voucher

%% Feedback
Restaurant.restaurant "1" -- "many" Feedback.restaurant_review : reviewed_by_users
User.user "1" -- "many" Feedback.restaurant_review : writes
Menu.dish "1" -- "many" Feedback.dish_review : reviewed
User.user "1" -- "many" Feedback.dish_review : writes
Order.order "1" -- "many" Feedback.restaurant_review : based_on
Order.order_item "1" -- "many" Feedback.dish_review : based_on


```
