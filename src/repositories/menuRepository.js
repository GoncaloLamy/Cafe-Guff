import mongoose from 'mongoose';
import MenuItem from '../models/MenuItem.js';

export default function createMenuRepository() {
    return {
        findAll: async () => {
            const menuItems = await MenuItem.find().lean();
            return menuItems.map((item) => ({
                id: String(item._id),
                name: item.name,
                price: item.price,
                allergies: item.allergies,
            }));
        },
        filterValidIds: async (dishIds) => {
            const objectIds = dishIds.filter((id) =>
                typeof id === 'string' && mongoose.isValidObjectId(id));
            const menuItems = await MenuItem.find({ _id: { $in: objectIds } })
                .select('_id')
                .lean();
            const validIds = new Set(menuItems.map((item) => String(item._id)));

            return dishIds.filter((id) =>
                typeof id === 'string' && validIds.has(id));
        },
    };
}
