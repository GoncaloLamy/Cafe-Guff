export default function createInMemoryOrderRepository() {
    const orders = [];
    let nextId = 1;

    return {
        create: async ({ tableNumber, dishIds }) => {
            const order = {
                id: String(nextId),
                tableNumber,
                dishIds: [...dishIds],
            };
            nextId += 1;
            orders.push(order);
            return order;
        },
    };
}
