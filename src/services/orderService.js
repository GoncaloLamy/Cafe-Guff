async function calculateTotal(dishIds, menuRepository) {
    const menuItems = await menuRepository.findAll();
    return dishIds.reduce((sum, dishId) => {
        const menuItem = menuItems.find((item) => String(item.id) === dishId);
        return sum + menuItem.price;
    }, 0);
}

export default function createOrderService(orderRepository, menuRepository) {
    return {
        createOrder: async (tableNumber, dishIds) => {
            const validDishIds = await menuRepository.filterValidIds(dishIds);
            if (validDishIds.length !== dishIds.length) {
                return null;
            }

            const total = await calculateTotal(validDishIds, menuRepository);

            return orderRepository.create({
                tableNumber,
                dishIds: validDishIds,
                total,
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

            const total = await calculateTotal(validDishIds, menuRepository);

            const updatedOrder = await orderRepository.update(id, {
                dishIds: validDishIds,
                total,
            });

            return { order: updatedOrder };
        },
    };
}
