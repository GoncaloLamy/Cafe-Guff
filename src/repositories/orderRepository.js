import Order from '../models/Order.js';

export default function createOrderRepository() {
    return {
        create: async ({ tableNumber, dishIds }) => {
            const created = await Order.create({ tableNumber, dishIds });
            return {
                id: String(created._id),
                tableNumber: created.tableNumber,
                dishIds: created.dishIds.map((dishId) => String(dishId)),
            };
        },
    };
}
