import Order from '../models/Order.js';

function calculateTotal(items) {
    return items.reduce((total, item) => {
        const price = typeof item.price === 'number' ? item.price : 0;
        return total + price * item.quantity;
    }, 0);
}

export async function createOrder(order) {
    const items = order.items.map((item) => ({
        name: item.name.trim(),
        quantity: item.quantity,
        price: typeof item.price === 'number' ? item.price : 0,
    }));

    const createdOrder = await Order.create({
        _id: order.id,
        table: order.table,
        items,
        status: order.status,
        total: typeof order.total === 'number' ? order.total : calculateTotal(items),
    });

    return createdOrder;
}

export async function updateOrderItems(orderId, incomingItems) {
    const order = await Order.findById(orderId);

    if (!order) {
        return null;
    }

    const items = incomingItems.map((incomingItem) => {
        const existingItem = order.items.find(
            (item) => item.name === incomingItem.name.trim(),
        );

        return {
            name: incomingItem.name.trim(),
            quantity: incomingItem.quantity,
            price: typeof incomingItem.price === 'number'
                ? incomingItem.price
                : existingItem?.price ?? 0,
        };
    });

    order.items = items;
    order.total = calculateTotal(items);
    await order.save();

    return order;
}
