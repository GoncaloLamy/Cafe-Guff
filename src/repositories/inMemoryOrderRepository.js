function splitOrder(orders, id, bills, firstBillId) {
    const order = orders.find((item) => item.id === String(id));
    if (!order) {
        return { bills: null, nextBillId: firstBillId };
    }

    order.bills = bills.map((bill, index) => ({
        id: String(firstBillId + index),
        tableNumber: order.tableNumber,
        dishIds: [...bill.dishIds],
        price: bill.price,
        paid: false,
    }));
    return { bills: order.bills, nextBillId: firstBillId + bills.length };
}

function findBill(orders, id) {
    return orders.flatMap((order) => order.bills ?? [])
        .find((bill) => bill.id === String(id)) ?? null;
}

function markBillPaid(orders, id) {
    const bill = findBill(orders, id);
    if (!bill) {
        return null;
    }
    bill.paid = true;
    return bill;
}

function createOrder(id, { tableNumber, dishIds, notes, total, createdAt }) {
    return {
        id: String(id),
        tableNumber,
        dishIds: [...dishIds],
        notes: [...notes],
        total,
        createdAt,
        paid: false,
    };
}

export default function createInMemoryOrderRepository() {
    const orders = [];
    let nextId = 1;
    let nextBillId = 1;

    return {
        create: async (data) => {
            const order = createOrder(nextId, data);
            nextId += 1;
            orders.push(order);
            return order;
        },
        findById: async (id) => orders.find((order) => order.id === String(id)) ?? null,
        findBillById: async (id) => findBill(orders, id),
        update: async (id, { dishIds, notes, total }) => {
            const order = orders.find((item) => item.id === String(id));
            if (!order) {
                return null;
            }

            order.dishIds = [...dishIds];
            order.notes = [...notes];
            order.total = total;
            return order;
        },
        close: async (id) => {
            const order = orders.find((item) => item.id === String(id));
            if (!order) {
                return null;
            }

            order.paid = true;
            return order;
        },
        closeBill: async (id) => markBillPaid(orders, id),
        split: async (id, bills) => {
            const result = splitOrder(orders, id, bills, nextBillId);
            nextBillId = result.nextBillId;
            return result.bills;
        },
    };
}