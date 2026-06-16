package com.rtech.agrolink.entity;

public enum OrderStatus {
    PENDING,
    APPROVED,
    REJECTED,
    SHIPPED,
    DELIVERED,
    CANCELLED;

    /**
     * Domain logic to validate if an order can transit from current status to target status 
     * based on the security role of the authenticated caller.
     */
    public static boolean isValidTransition(OrderStatus current, OrderStatus target, String role) {
        if ("ADMIN".equals(role)) {
            return true;
        }

        if (current == target) {
            return true;
        }

        // Final terminal states cannot be changed
        if (current == DELIVERED || current == REJECTED || current == CANCELLED) {
            return false;
        }

        if ("FARMER".equals(role)) {
            if (current == PENDING) {
                return target == APPROVED || target == REJECTED;
            }
            if (current == APPROVED) {
                return target == SHIPPED;
            }
            if (current == SHIPPED) {
                return target == DELIVERED;
            }
            return false;
        }

        if ("BUYER".equals(role)) {
            if (current == PENDING) {
                return target == CANCELLED;
            }
            return false;
        }

        return false;
    }
}
