export default function createMenuService(menuRepository) {
    return {
        getMenu: async () => menuRepository.findAll(),
    };
}
