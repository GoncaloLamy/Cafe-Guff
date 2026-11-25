import { calculateTotal, findActiveOrder } from './orderService.js';

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

export default function createBillService(orderRepository, menuRepository) {
    return {
        closeBill: (id) => closeBill(orderRepository, id),
        splitOrder: (id, bills) =>
            splitOrder(orderRepository, menuRepository, id, bills),
    };
}