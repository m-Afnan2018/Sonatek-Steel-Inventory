const { default: mongoose } = require("mongoose");


const orderSchema = new mongoose.Schema({
    order_id: {
        type: String,
        required: true,
        unique: true,
    },
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    vehicleNumber: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
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