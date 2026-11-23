import {
    createOrder as createOrderInService,
    updateOrderItems as updateOrderItemsInService,
} from '../services/orderService.js';

function isValidItems(items) {
    return Array.isArray(items)
        && items.every((item) => (
            item
            && typeof item.name === 'string'
            && item.name.trim().length > 0
            && Number.isInteger(item.quantity)
            && item.quantity > 0
        ));
}

function isValidOrder(order) {
    if (!order) {
        return false;
    }

    if (typeof order.table !== 'number') {
        return false;
    }

    if (!Number.isInteger(order.table)) {
        return false;
    }

    if (!isValidItems(order.items)) {
        return false;
    }

    return order.status === undefined || typeof order.status === 'string';
}

export async function createOrder(req, res) {
    const order = req.body;

    if (!isValidOrder(order)) {
        return res.status(400).json({error: 'Invalid input'});
    }

    try {
        const createdOrder = await createOrderInService(order);
        return res.status(201).json(createdOrder);
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: 'Server error'});
    }
}

export async function updateOrderItems(req, res) {
    const orderId = req.params.id;
    const items = req.body?.items;

    if (!isValidItems(items)) {
        return res.status(400).json({error: 'Invalid input'});
    }

    try {
        const order = await updateOrderItemsInService(orderId, items);

        if (!order) {
            return res.status(404).json({error: 'Order not found'});
        }

        return res.status(201).json(order);
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: 'Server error'});
    }
}
