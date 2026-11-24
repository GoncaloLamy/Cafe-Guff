export default function createMenuController(menuService) {
    return {
        getMenu: async (req, res) => {
            const menu = await menuService.getMenu();
            res.status(200).json(menu);
        },
    };
}
