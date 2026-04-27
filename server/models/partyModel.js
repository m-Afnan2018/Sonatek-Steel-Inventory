const { default: mongoose } = require("mongoose");

const partySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        default: '',
    },
    owner: {
        type: String,
        default: '',
    },
    phone: {
        type: String,
        default: '',
        match: [/^\d{10,15}$/, 'Please provide a valid phone number']
    },
    address: {
        type: String,
        default: '',
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

module.exports = mongoose.model('Party', partySchema);