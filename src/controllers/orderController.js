function isValidOrderInput(tableNumber, dishIds) {
    return Number.isInteger(tableNumber)
        && tableNumber > 0
        && Array.isArray(dishIds)
        && dishIds.length > 0;
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

            return res.status(201).json({
                id: order.id,
                table: order.tableNumber,
                dishIds: order.dishIds,
            });
        },
    };
}
