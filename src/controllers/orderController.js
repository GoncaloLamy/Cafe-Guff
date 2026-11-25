function formatOrder(order) {
    return {
        id: order.id,
        table: order.tableNumber,
        dishIds: order.dishIds,
        notes: order.notes,
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
    if (result.error === 'invalid-order') {
        return res.status(400).json({ error: 'Invalid order' });
    }
    return null;
}

async function createOrder(orderService, req, res) {
    const { table, dishIds, notes } = req.body;
    const order = await orderService.createOrder(table, dishIds, notes);
    if (!order) {
        return res.status(404).json({ error: 'Menu item not found' });
    }

    return res.status(201).json(formatOrder(order));
}

async function updateOrder(orderService, req, res) {
    const { dishIds, notes } = req.body;
    const result = await orderService.updateOrder(
        req.params.id,
        dishIds,
        notes,
    );
    const errorResponse = sendOrderError(res, result);
    if (errorResponse) {
        return errorResponse;
    }
    return res.status(200).json(formatOrder(result.order));
}

async function closeOrder(orderService, req, res) {
    const result = await orderService.closeOrder(req.params.id);
    const errorResponse = sendOrderError(res, result);
    if (errorResponse) {
        return errorResponse;
    }
    return res.status(200).json(formatOrder(result.order));
}

export default function createOrderController(orderService) {
    return {
        create: (req, res) => createOrder(orderService, req, res),
        update: (req, res) => updateOrder(orderService, req, res),
        close: (req, res) => closeOrder(orderService, req, res),
    };
}
