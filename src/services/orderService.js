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
    };
}
