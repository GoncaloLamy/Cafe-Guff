const invalidTransitions = {
    in_progress: { in_progress: 'order-already-in-progress' },
    ready: {
        new: 'order-not-started',
        ready: 'order-already-ready',
    },
};

function getTransitionError(status, currentStatus) {
    return invalidTransitions[status]?.[currentStatus] ?? 'order-status-conflict';
}

async function transitionOrder(orderRepository, id, expectedStatus, status) {
    const order = await orderRepository.findById(id);
    if (!order) {
        return { error: 'order-not-found' };
    }
    if (order.status !== expectedStatus) {
        return { error: getTransitionError(status, order.status) };
    }
    return { order: await orderRepository.updateStatus(id, status) };
}

export default function createKitchenService(orderRepository) {
    return {
        startOrder: (id) => transitionOrder(orderRepository, id, 'new', 'in_progress'),
        markReady: (id) => transitionOrder(orderRepository, id, 'in_progress', 'ready'),
    };
}
