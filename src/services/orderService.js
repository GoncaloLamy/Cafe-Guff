async function calculateTotal(dishIds, menuRepository) {
    const menuItems = await menuRepository.findAll();
    return dishIds.reduce((sum, dishId) => {
        const menuItem = menuItems.find((item) => String(item.id) === dishId);
        return sum + menuItem.price;
    }, 0);
}

async function createOrder(orderRepository, menuRepository, tableNumber, dishIds) {
    const validDishIds = await menuRepository.filterValidIds(dishIds);
    if (validDishIds.length !== dishIds.length) {
        return null;
    }

    const total = await calculateTotal(validDishIds, menuRepository);
    return orderRepository.create({
        tableNumber,
        dishIds: validDishIds,
        total,
        createdAt: new Date().toISOString(),
    });
}

async function findActiveOrder(orderRepository, id) {
    const order = await orderRepository.findById(id);
    if (!order) {
        return { error: 'order-not-found' };
    }
    if (order.paid) {
        return { error: 'order-paid' };
    }
    return { order };
}

async function updateOrder(orderRepository, menuRepository, id, dishIds) {
    const result = await findActiveOrder(orderRepository, id);
    if (result.error) {
        return result;
    }

    const validDishIds = await menuRepository.filterValidIds(dishIds);
    if (validDishIds.length !== dishIds.length) {
        return { error: 'dish-not-found' };
    }

    const total = await calculateTotal(validDishIds, menuRepository);
    const updatedOrder = await orderRepository.update(id, {
        dishIds: validDishIds,
        total,
    });
    return { order: updatedOrder };
}

async function closeOrder(orderRepository, id) {
    const result = await findActiveOrder(orderRepository, id);
    if (result.error) {
        return result;
    }

    const closedOrder = await orderRepository.close(id);
    return { order: closedOrder };
}

export default function createOrderService(orderRepository, menuRepository) {
    return {
        createOrder: (tableNumber, dishIds) =>
            createOrder(orderRepository, menuRepository, tableNumber, dishIds),
        updateOrder: (id, dishIds) =>
            updateOrder(orderRepository, menuRepository, id, dishIds),
        closeOrder: (id) => closeOrder(orderRepository, id),
    };
}
