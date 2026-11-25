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

async function closeBill(orderRepository, id) {
    const bill = await orderRepository.findBillById(id);
    if (!bill) {
        return { error: 'bill-not-found' };
    }
    if (bill.paid) {
        return { error: 'bill-paid' };
    }

    return { bill: await orderRepository.closeBill(id) };
}

function isCompleteSplit(orderDishIds, bills) {
    const remainingDishes = orderDishIds.map(String);
    for (const dishId of bills.flat().map(String)) {
        const index = remainingDishes.indexOf(dishId);
        if (index === -1) {
            return false;
        }
        remainingDishes.splice(index, 1);
    }
    return remainingDishes.length === 0;
}

async function splitOrder(orderRepository, menuRepository, id, bills) {
    const result = await findActiveOrder(orderRepository, id);
    if (result.error) {
        return result;
    }

    if (!isCompleteSplit(result.order.dishIds, bills)) {
        return { error: 'invalid-split' };
    }

    const pricedBills = await Promise.all(bills.map(async (bill) => ({
        dishIds: bill.map(String),
        price: await calculateTotal(bill.map(String), menuRepository),
    })));
    return { bills: await orderRepository.split(id, pricedBills) };
}

export default function createOrderService(orderRepository, menuRepository) {
    return {
        createOrder: (tableNumber, dishIds) =>
            createOrder(orderRepository, menuRepository, tableNumber, dishIds),
        updateOrder: (id, dishIds) =>
            updateOrder(orderRepository, menuRepository, id, dishIds),
        closeOrder: (id) => closeOrder(orderRepository, id),
        closeBill: (id) => closeBill(orderRepository, id),
        splitOrder: (id, bills) =>
            splitOrder(orderRepository, menuRepository, id, bills),
    };
}
