/**
 * Singleton repository registry.
 * Each getter function returns a cached instance on first call, then reuses it.
 * This ensures all services share the same repository instances.
 */

import { CustomerRepository } from '../../modules/customer/customer.repository.js';
import { AddressRepository } from '../location/address.repository.js';
import { OrderRepository } from '../order/order.repository.js';
import {
    CategoryRepository,
    DishRepository,
} from '../restaurant/menu/menu.repository.js';
import { OpeningHoursRepository } from '../restaurant/opening-hours/opening-hours.repository.js';
import { RestaurantRepository } from '../restaurant/restaurant.repository.js';
import { UserRepository } from '../user/user.repository.js';
import { StatisticsRepository } from './statistics.repository.js';

// Cached instances
let userRepositoryInstance: UserRepository | null = null;
let addressRepositoryInstance: AddressRepository | null = null;
let restaurantRepositoryInstance: RestaurantRepository | null = null;
let categoryRepositoryInstance: CategoryRepository | null = null;
let dishRepositoryInstance: DishRepository | null = null;
let orderRepositoryInstance: OrderRepository | null = null;
let openingHoursRepositoryInstance: OpeningHoursRepository | null = null;
let statisticsRepositoryInstance: StatisticsRepository | null = null;
let customerRepositoryInstance: CustomerRepository | null = null;

export function getUserRepository(): UserRepository {
    if (!userRepositoryInstance) {
        userRepositoryInstance = new UserRepository();
    }
    return userRepositoryInstance;
}

export function getAddressRepository(): AddressRepository {
    if (!addressRepositoryInstance) {
        addressRepositoryInstance = new AddressRepository();
    }
    return addressRepositoryInstance;
}

export function getRestaurantRepository(): RestaurantRepository {
    if (!restaurantRepositoryInstance) {
        restaurantRepositoryInstance = new RestaurantRepository();
    }
    return restaurantRepositoryInstance;
}

export function getCategoryRepository(): CategoryRepository {
    if (!categoryRepositoryInstance) {
        categoryRepositoryInstance = new CategoryRepository();
    }
    return categoryRepositoryInstance;
}

export function getDishRepository(): DishRepository {
    if (!dishRepositoryInstance) {
        dishRepositoryInstance = new DishRepository();
    }
    return dishRepositoryInstance;
}

export function getOrderRepository(): OrderRepository {
    if (!orderRepositoryInstance) {
        orderRepositoryInstance = new OrderRepository();
    }
    return orderRepositoryInstance;
}

export function getOpeningHoursRepository(): OpeningHoursRepository {
    if (!openingHoursRepositoryInstance) {
        openingHoursRepositoryInstance = new OpeningHoursRepository();
    }
    return openingHoursRepositoryInstance;
}

export function getStatisticsRepository(): StatisticsRepository {
    if (!statisticsRepositoryInstance) {
        statisticsRepositoryInstance = new StatisticsRepository();
    }
    return statisticsRepositoryInstance;
}

export function getCustomerRepository(): CustomerRepository {
    if (!customerRepositoryInstance) {
        customerRepositoryInstance = new CustomerRepository();
    }
    return customerRepositoryInstance;
}
