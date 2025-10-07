const { default: mongoose } = require("mongoose");


const bookingSchema = new mongoose.Schema({
    booking_id: {
        type: String,
        required: true,
        unique: true,
    },
    order_id: {
        type: String,
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
    bookedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    bookingDate: {
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

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;