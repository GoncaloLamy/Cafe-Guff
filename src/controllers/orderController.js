function isValidOrderInput(tableNumber, dishIds) {
    return Number.isInteger(tableNumber)
        && tableNumber > 0
        && Array.isArray(dishIds)
        && dishIds.length > 0;
}

export default function createOrderController(orderService) {
    return {
        create: async (req, res) => {
            const { bordNummer, retter } = req.body ?? {};
            if (!isValidOrderInput(bordNummer, retter)) {
                return res.status(400).json({ error: 'Invalid order' });
            }

            const order = await orderService.createOrder(bordNummer, retter);
            if (!order) {
                return res.status(404).json({ error: 'Menu item not found' });
            }

            return res.status(201).json({
                id: order.id,
                bordNummer: order.tableNumber,
                retter: order.dishIds,
            });
        },
    };
}
