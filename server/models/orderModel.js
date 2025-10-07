const { default: mongoose } = require("mongoose");


const orderSchema = new mongoose.Schema({
    order_id: {
        type: String,
        required: true,
        unique: true,
    },
    items: [{
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item',
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
        }
    }],
    quantity: {
        type: Number,
        required: true,
    },
    requirement: {
        type: Number,
        required: true,
    },
    vehicleNumber: {
        type: String,
    },
    orderBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    deliveryDate: {
        type: Date,
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;