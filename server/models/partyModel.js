const { default: mongoose } = require("mongoose");

const partySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
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