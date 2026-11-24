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
    };
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
            if (result.error === 'order-not-found') {
                return res.status(404).json({ error: 'Order not found' });
            }
            if (result.error === 'dish-not-found') {
                return res.status(404).json({ error: 'Menu item not found' });
            }

            return res.status(200).json(formatOrder(result.order));
        },
    };
}
