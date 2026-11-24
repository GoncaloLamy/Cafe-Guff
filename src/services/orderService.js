export default function createOrderService(orderRepository, menuRepository) {
    return {
        createOrder: async (tableNumber, dishIds) => {
            const validDishIds = await menuRepository.filterValidIds(dishIds);
            if (validDishIds.length !== dishIds.length) {
                return null;
            }

            return orderRepository.create({
                tableNumber,
                dishIds: validDishIds,
            });
        },
        updateOrder: async (id, dishIds) => {
            const order = await orderRepository.findById(id);
            if (!order) {
                return { error: 'order-not-found' };
            }

            const validDishIds = await menuRepository.filterValidIds(dishIds);
            if (validDishIds.length !== dishIds.length) {
                return { error: 'dish-not-found' };
            }

            const menuItems = await menuRepository.findAll();
            const total = validDishIds.reduce((sum, dishId) => {
                const menuItem = menuItems.find((item) => String(item.id) === dishId);
                return sum + menuItem.price;
            }, 0);

            const updatedOrder = await orderRepository.update(id, {
                dishIds: validDishIds,
                total,
            });

            return { order: updatedOrder };
        },
    };
}
