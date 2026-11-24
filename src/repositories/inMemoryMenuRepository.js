export default function createInMemoryMenuRepository() {
    const menuItems = [
        { id: '1', name: 'Soup of the day', price: 65, allergies: ['milk'] },
        { id: '2', name: 'Grilled sandwich', price: 85, allergies: ['gluten', 'milk'] },
    ];

    return {
        findAll: async () => menuItems,
        filterValidIds: async (dishIds) => {
            const validIds = new Set(menuItems.map((item) => String(item.id)));
            return dishIds
                .filter((id) => validIds.has(String(id)))
                .map((id) => String(id));
        },
    };
}
