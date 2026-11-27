export async function calculateTotal(dishIds, menuRepository) {
    const menuItems = await menuRepository.findAll();
    return dishIds.reduce((sum, dishId) => {
        const menuItem = menuItems.find((item) => String(item.id) === dishId);
        return sum + menuItem.price;
    }, 0);
}

async function createOrder(orderRepository, menuRepository, orderInput) {
    const { tableNumber, dishIds, notes } = orderInput;
    const validDishIds = await menuRepository.filterValidIds(dishIds);
    if (validDishIds.length !== dishIds.length) {
        return null;
    }

    const total = await calculateTotal(validDishIds, menuRepository);
    return orderRepository.create({
        tableNumber,
        dishIds: validDishIds,
        notes: notes ?? validDishIds.map(() => ''),
        total,
        createdAt: new Date().toISOString(),
    });
}

async function sendOrder(orderRepository, id) {
    const order = await orderRepository.send(id);
    if (!order) {
        return { error: 'order-not-found' };
    }
    if (order.error) {
        return order;
    }
    return { order };
}

async function getKitchenOrders(orderRepository) {
    return orderRepository.findSent();
}

export async function findActiveOrder(orderRepository, id) {
    const order = await orderRepository.findById(id);
    if (!order) {
        return { error: 'order-not-found' };
    }
    if (order.paid) {
        return { error: 'order-paid' };
    }
    return { order };
}

async function getValidDishIds(menuRepository, dishIds, currentDishIds) {
    if (dishIds === undefined) {
        return currentDishIds;
    }

    const validDishIds = await menuRepository.filterValidIds(dishIds);
    if (validDishIds.length !== dishIds.length) {
        return null;
    }
    return validDishIds;
}

function getUpdatedNotes(notes, dishIds, order) {
    if (notes !== undefined) {
        return notes;
    }
    if (dishIds !== undefined) {
        return dishIds.map(() => '');
    }
    return order.notes ?? order.dishIds.map(() => '');
}

async function updateOrder(orderRepository, menuRepository, orderInput) {
    const { id, dishIds, notes } = orderInput;
    const result = await findActiveOrder(orderRepository, id);
    if (result.error) {
        return result;
    }

    const currentOrder = result.order;
    const validDishIds = await getValidDishIds(
        menuRepository,
        dishIds,
        currentOrder.dishIds,
    );
    if (validDishIds === null) {
        return { error: 'dish-not-found' };
    }
    if (notes !== undefined && notes.length !== validDishIds.length) {
        return { error: 'invalid-order' };
    }

    const total = dishIds === undefined
        ? currentOrder.total
        : await calculateTotal(validDishIds, menuRepository);
    const updatedOrder = await orderRepository.update(id, {
        dishIds: validDishIds,
        notes: getUpdatedNotes(notes, dishIds, currentOrder),
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
        createOrder: (tableNumber, dishIds, notes) =>
            createOrder(orderRepository, menuRepository, {
                tableNumber,
                dishIds,
                notes,
            }),
        sendOrder: (id) => sendOrder(orderRepository, id),
        getKitchenOrders: () => getKitchenOrders(orderRepository),
        updateOrder: (id, dishIds, notes) =>
            updateOrder(orderRepository, menuRepository, {
                id,
                dishIds,
                notes,
            }),
        closeOrder: (id) => closeOrder(orderRepository, id),
    };
}