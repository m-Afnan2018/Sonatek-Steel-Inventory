const { default: mongoose } = require("mongoose");

const cutterSchema = new mongoose.Schema({
    name: {
        type: String, 
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

module.exports = mongoose.model('Cutter', cutterSchema);