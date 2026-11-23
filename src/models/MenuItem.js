import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    allergies: { type: [String], default: [] },
});

export default mongoose.models.MenuItem
    || mongoose.model('MenuItem', menuItemSchema);
