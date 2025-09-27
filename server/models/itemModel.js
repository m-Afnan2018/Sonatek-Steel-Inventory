const { default: mongoose } = require("mongoose");


const challanSchema = new mongoose.Schema({
    challanDate: {
        type: Date,
        required: true,
    },
    challanNumber: {
        type: String,
        required: true,
    },
});

const itemSchema = new mongoose.Schema({
    type:{
        type: String,
        enum: ['Hot Rolled', 'Cold Rolled', 'Galvanized', 'Color Coated', 'Stainless Steel', 'Aluminum'],
        required: true,
    },
    grade: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Grade',
        required: true,
    },
    formType: {
        type: String,
        required: true,
        enum: ['Sheet', 'Coil']
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
    weight: {
        type: Number, 
        required: true
    },
    wagonNumber: {
        type: String,
        required: true,
    },
    challan: {
        type: challanSchema,
        required: true,
    },
    currentStatus: {
        type: String,
        enum: ['In Stock', 'Sold', 'Reserved', 'Cancelled'],
        default: 'In Stock',
    },
    quantity: {
        type: Number,
        required: true,
    },
    remaining:{
        type: Number,
        required: true,
        default: function() { return this.quantity; }
    },
    pricePerUnit: {
        type: Number,
        required: true,
    },
    shipTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cutter',
        required: true
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