import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        default: 0,
    },
}, {_id: false});

const orderSchema = new mongoose.Schema({
    table: {
        type: Number,
        required: true,
    },
    items: {
        type: [orderItemSchema],
        required: true,
    },
    status: {
        type: String,
        default: 'pending',
    },
    total: {
        type: Number,
        default: 0,
    },
});

export default mongoose.model('Order', orderSchema);
