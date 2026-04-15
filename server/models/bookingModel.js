const { default: mongoose } = require("mongoose");
const getNextIndex = require("../utils/counerHandler");

// Snapshot schema for item details so bookings keep a copy even if the original Item is deleted/modified
const itemSnapshotSchema = new mongoose.Schema({
    item_id: {
        type: mongoose.Schema.Types.ObjectId
    }, // original item id (if available)
    type: {
        type: String
    },
    grade: {
        _id: {
            type: mongoose.Schema.Types.ObjectId
        },
        name: {
            type: String
        },
    },
    formType: {
        type: String
    },
    width: {
        _id: {
            type: mongoose.Schema.Types.ObjectId
        },
        name: {
            type: String
        },
    },
    thickness: {
        _id: {
            type: mongoose.Schema.Types.ObjectId
        },
        name: {
            type: String
        },
    },
    wagonNumber: {
        type: String
    },
    challan: {
        challanDate: {
            type: Date
        },
        challanNumber: {
            type: String
        }
    },
    currentStatus: {
        type: String
    },
    quantity: {
        type: Number
    }, // original item quantity at time of snapshot
    takenQuantity: {
        type: Number
    },
    warehouse: {
        _id: {
            type: mongoose.Schema.Types.ObjectId
        },
        name: {
            type: String
        }
    },
    createdAt: {
        type: Date
    },
    updatedAt: {
        type: Date
    }
}, { _id: false });

// Snapshot schema for bookedBy (user) details so the booking retains who booked it even if user is removed
const bookedBySnapshotSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId
    },
    name: {
        type: String
    },
    email: {
        type: String
    },
    phone: {
        type: String
    },
    role: {
        type: String
    }
}, { _id: false });

const partySnapshotSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    party_id: {
        type: mongoose.Schema.Types.ObjectId
    }
}, { _id: false })

const bookingSchema = new mongoose.Schema({
    booking_id: {
        type: String,
        required: true,
        unique: true
    },
    order_id: {
        type: Number,
        unique: true,
    },
    type: {
        type: String,
        enum: ['Hot Rolled', 'Cold Rolled']
    },
    items: [{
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item'
        },
        itemSnapshot: {
            type: itemSnapshotSchema,
            required: true
        },
        formType: {
            type: String,
            enum: ['Sheet', 'Coil'],
            required: true
        },
        quantity: {
            type: Number,
            required: true
        }
    }],

    quantity: {
        type: Number,
        required: true
    },
    requirement: {
        type: Number
    }, // optional now
    vehicleNumber: {
        type: String
    },
    bookedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    bookedBySnapshot: {
        type: bookedBySnapshotSchema,
        required: true
    },
    party: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Party'
    },
    partySnapshot: {
        type: partySnapshotSchema,
        required: true
    },
    shipTo: {
        type: String,
    },
    status: {
        type: String,
        enum: ['Processing', 'Shipped', 'Cancelled'],
        default: 'Processing'
    },
    description: {
        type: String,
        default: ''
    },
    reason: {
        type: String,
        default: ''
    },
    deliveryDate: {
        type: Date
    },
}, { timestamps: { createdAt: 'bookingDate', updatedAt: 'updatedAt' } });

// Static helpers to create snapshots from documents. Call these when creating/updating bookings.
bookingSchema.statics.makeItemSnapshot = function (itemDoc) {
    if (!itemDoc) return {};

    return {
        item_id: itemDoc._id || null,
        type: itemDoc.type || null,

        // ✅ grade now stores full object {_id, name}
        grade: itemDoc.grade ? {
            _id: itemDoc.grade._id || null,
            name: itemDoc.grade.name || null
        } : { _id: null, name: null },

        // ✅ width now stores {_id, name}
        width: itemDoc.width ? {
            _id: itemDoc.width._id || null,
            name: itemDoc.width.name || null
        } : { _id: null, name: null },

        // ✅ thickness now stores {_id, name}
        thickness: itemDoc.thickness ? {
            _id: itemDoc.thickness._id || null,
            name: itemDoc.thickness.name || null
        } : { _id: null, name: null },

        wagonNumber: itemDoc.wagonNumber || null,

        challan: {
            challanDate: itemDoc.challan?.challanDate || null,
            challanNumber: itemDoc.challan?.challanNumber || null
        },

        currentStatus: itemDoc.currentStatus || null,
        quantity: itemDoc.quantity ?? null,

        warehouse: itemDoc.warehouse ? {
            _id: itemDoc.warehouse._id || null,
            name: itemDoc.warehouse.name || null
        } : { _id: null, name: null },

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

bookingSchema.statics.makePartySnapshot = function (partyDoc) {
    if (!partyDoc) return {};
    return {
        party_id: partyDoc._id || null,
        name: partyDoc.name || null,
    };
}

bookingSchema.pre("save", async function (next) {
    if (this.isNew) {
        this.order_id = await getNextIndex("order_index");
    }
    console.log("Here: ", this.order_id);
    next();
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;