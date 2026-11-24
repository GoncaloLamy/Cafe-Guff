export default function createInMemoryOrderRepository() {
    const orders = [];
    let nextId = 1;

    return {
        create: async ({ tableNumber, dishIds, total, createdAt }) => {
            const order = {
                id: String(nextId),
                tableNumber,
                dishIds: [...dishIds],
                total,
                createdAt,
                paid: false,
            };
            nextId += 1;
            orders.push(order);
            return order;
        },
        findById: async (id) => orders.find((order) => order.id === String(id)) ?? null,
        update: async (id, { dishIds, total }) => {
            const order = orders.find((item) => item.id === String(id));
            if (!order) {
                return null;
            }

            order.dishIds = [...dishIds];
            order.total = total;
            return order;
        },
        close: async (id) => {
            const order = orders.find((item) => item.id === String(id));
            if (!order) {
                return null;
            }

            order.paid = true;
            return order;
        },
    };
}
