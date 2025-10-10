const { default: mongoose } = require("mongoose");

// Snapshot schema for item details so bookings keep a copy even if the original Item is deleted/modified
const itemSnapshotSchema = new mongoose.Schema({
    item_id: { type: mongoose.Schema.Types.ObjectId }, // original item id (if available)
    type: { type: String },
    grade: { type: String },
    formType: { type: String },
    width: { type: String },
    thickness: { type: String },
    wagonNumber: { type: String },
    challan: {
        challanDate: { type: Date },
        challanNumber: { type: String }
    },
    currentStatus: { type: String },
    quantity: { type: Number }, // original item quantity at time of snapshot
    shipTo: { // store basic shipTo/cutter info to avoid losing it
        shipTo_id: { type: mongoose.Schema.Types.ObjectId },
        name: { type: String }
    },
    createdAt: { type: Date },
    updatedAt: { type: Date }
}, { _id: false });

// Snapshot schema for bookedBy (user) details so the booking retains who booked it even if user is removed
const bookedBySnapshotSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId },
    name: { type: String },
    email: { type: String },
    phone: { type: String },
    role: { type: String }
}, { _id: false });

const bookingSchema = new mongoose.Schema({
    booking_id: {
        type: String,
        required: true,
        unique: true,
    },
    order_id: {
        type: String,
    },
    // Keep the original reference for join/lookup convenience, but also store a full snapshot
    items: [{
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item'
        },
        itemSnapshot: {
            type: itemSnapshotSchema,
            required: true
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
    // Keep the original ref so existing code still works, and add a snapshot
    bookedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    bookedBySnapshot: {
        type: bookedBySnapshotSchema,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Delivered', 'Shipped', 'Cancelled'],
        default: 'Pending'
    },
    bookingDate: {
        type: Date,
        default: Date.now
    },
    description: {
        type: String,
        default: '',
    },
    deliveryDate: {
        type: Date,
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Static helpers to create snapshots from documents. Call these when creating/updating bookings.
bookingSchema.statics.makeItemSnapshot = function (itemDoc) {
    if (!itemDoc) return {};
    return {
        item_id: itemDoc._id || null,
        type: itemDoc.type || null,
        grade: (itemDoc.grade && (typeof itemDoc.grade === 'string' || itemDoc.grade.name)) ? (itemDoc.grade.name || itemDoc.grade) : (itemDoc.grade ? String(itemDoc.grade) : null),
        formType: itemDoc.formType || null,
        width: (itemDoc.width && itemDoc.width.name) ? itemDoc.width.name : (itemDoc.width ? String(itemDoc.width) : null),
        thickness: (itemDoc.thickness && itemDoc.thickness.name) ? itemDoc.thickness.name : (itemDoc.thickness ? String(itemDoc.thickness) : null),
        wagonNumber: itemDoc.wagonNumber || null,
        challan: {
            challanDate: itemDoc.challan && itemDoc.challan.challanDate ? itemDoc.challan.challanDate : null,
            challanNumber: itemDoc.challan && itemDoc.challan.challanNumber ? itemDoc.challan.challanNumber : null
        },
        currentStatus: itemDoc.currentStatus || null,
        quantity: itemDoc.quantity != null ? itemDoc.quantity : null,
        shipTo: itemDoc.shipTo ? {
            shipTo_id: itemDoc.shipTo._id || itemDoc.shipTo || null,
            name: itemDoc.shipTo.name || null
        } : { shipTo_id: null, name: null },
        createdAt: itemDoc.createdAt || null,
        updatedAt: itemDoc.updatedAt || null
    };
};

bookingSchema.statics.makeBookedBySnapshot = function (userDoc) {
    if (!userDoc) return {};
    return {
        user_id: userDoc._id || null,
        name: userDoc.name || userDoc.fullName || null,
        email: userDoc.email || null,
        phone: userDoc.phone || null,
        role: userDoc.role || null
    };
};

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;