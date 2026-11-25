function isValidOrderInput(tableNumber, dishIds) {
    return Number.isInteger(tableNumber)
        && tableNumber > 0
        && Array.isArray(dishIds)
        && dishIds.length > 0;
}

function formatOrder(order) {
    return {
        id: order.id,
        table: order.tableNumber,
        dishIds: order.dishIds,
        total: order.total,
        createdAt: order.createdAt,
        paid: order.paid,
    };
}

function sendOrderError(res, result) {
    if (result.error === 'order-not-found') {
        return res.status(404).json({ error: 'Order not found' });
    }
    if (result.error === 'dish-not-found') {
        return res.status(404).json({ error: 'Menu item not found' });
    }
    if (result.error === 'order-paid') {
        return res.status(409).json({ error: 'Order already paid' });
    }
    return null;
}

function isValidBills(bills) {
    return Array.isArray(bills)
        && bills.length >= 2
        && bills.every((bill) => Array.isArray(bill) && bill.length > 0);
}

async function splitOrder(orderService, req, res) {
    const { bills } = req.body ?? {};
    if (!isValidBills(bills)) {
        return res.status(400).json({ error: 'Invalid bills' });
    }

    const result = await orderService.splitOrder(req.params.id, bills);
    if (result.error === 'invalid-split') {
        return res.status(400).json({ error: 'Invalid bills' });
    }

    const errorResponse = sendOrderError(res, result);
    if (errorResponse) {
        return errorResponse;
    }

    return res.status(201).json({
        bills: result.bills.map((bill) => ({
            id: bill.id,
            table: bill.tableNumber,
            dishIds: bill.dishIds,
            price: bill.price,
            paid: bill.paid,
        })),
    });
}

async function closeBill(orderService, req, res) {
    const result = await orderService.closeBill(req.params.billId);
    if (result.error === 'bill-not-found') {
        return res.status(404).json({ error: 'Bill not found' });
    }
    if (result.error === 'bill-paid') {
        return res.status(409).json({ error: 'Bill already paid' });
    }

    const { bill } = result;
    return res.status(200).json({
        id: bill.id,
        table: bill.tableNumber,
        dishIds: bill.dishIds,
        price: bill.price,
        paid: bill.paid,
    });
}

export default function createOrderController(orderService) {
    return {
        create: async (req, res) => {
            const { table, dishIds } = req.body ?? {};
            if (!isValidOrderInput(table, dishIds)) {
                return res.status(400).json({ error: 'Invalid order' });
            }

            const order = await orderService.createOrder(table, dishIds);
            if (!order) {
                return res.status(404).json({ error: 'Menu item not found' });
            }

            return res.status(201).json(formatOrder(order));
        },
        update: async (req, res) => {
            const { dishIds } = req.body ?? {};
            if (!Array.isArray(dishIds) || dishIds.length === 0) {
                return res.status(400).json({ error: 'Invalid order' });
            }

            const result = await orderService.updateOrder(req.params.id, dishIds);
            const errorResponse = sendOrderError(res, result);
            if (errorResponse) {
                return errorResponse;
            }
            return res.status(200).json(formatOrder(result.order));
        },
        close: async (req, res) => {
            const result = await orderService.closeOrder(req.params.id);
            const errorResponse = sendOrderError(res, result);
            if (errorResponse) {
                return errorResponse;
            }
            return res.status(200).json(formatOrder(result.order));
        },
        split: (req, res) => splitOrder(orderService, req, res),
        closeBill: (req, res) => closeBill(orderService, req, res),
    };
}
