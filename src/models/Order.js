import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    tableNumber: {
        type: Number,
        required: true,
        min: 1,
        validate: Number.isInteger,
    },
    dishIds: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MenuItem',
            required: true,
        }],
        required: true,
        validate: {
            validator: (dishIds) => dishIds.length > 0,
            message: 'At least one dish is required',
        },
    },
});

export default mongoose.models.Order
    || mongoose.model('Order', orderSchema);
