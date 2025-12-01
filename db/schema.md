https://mermaid.js.org/syntax/classDiagram.html

```mermaid
---
title: DB Diagram
---
classDiagram
    class Restaurant {
        number: restaurant_id*
        string: name
    }

    class Order {
        number: order_id*
    }

    class User {
        number: user_id*
        string: username
        string: first_name
        string: last_name
    }

    class Address {
        number: address_id*
        string: street_address
        string: zip
        string: city_name
    }

    class Customer {
        number: customer_id*
        string: first_name
        string: last_name
    }

    class RestaurantOwner {
        number: restaurant_owner_id*
        number: restaurant_id ~FK~
    }

    User <|-- Customer
    User <|-- RestaurantOwner
    User "*" --> "*" Address
    Restaurant "*" --> "1" Address
    Order "*" --> "1" Address

```
