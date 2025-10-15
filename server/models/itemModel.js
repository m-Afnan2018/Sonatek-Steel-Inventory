const { default: mongoose } = require("mongoose");


const challanSchema = new mongoose.Schema({
    challanDate: {
        type: Date,
    },
    challanNumber: {
        type: String,
    },
});


const transportSchema = new mongoose.Schema({
    vehicleNumber: {
        type: String,
    },
    loader: {
        type: String,
    },
    transporterName: {
        type: String,
    }
})

const itemSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Hot Rolled', 'Cold Rolled', 'Galvanized', 'Color Coated', 'Stainless Steel', 'Aluminum'],
        required: true,
    },
    grade: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Grade',
        required: true,
    },
    form: {
        type: String,
        enum: ['Sheet', 'Coil'],
        default: 'Coil'
    },
    width: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Width',
        required: true
    },
    thickness: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Thickness',
        required: true
    },
    wagonNumber: {
        type: String,
        default: null,
    },
    challan: {
        type: challanSchema,
    },
    currentStatus: {
        type: String,
        enum: ['In Stock', 'Sold', 'Reserved', 'Cancelled'],
        default: 'In Stock',
    },
    originalQuanity: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
    },
    shipTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cutter',
    },
    transport: {
        type: transportSchema,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Item', itemSchema);