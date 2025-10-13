const { default: mongoose } = require("mongoose");


const transportSchema = new mongoose.Schema({
    vehicle: {
        type: String,
    },
    loader: {
        type: String,
    },
    transporterName: {
        type: String,
    }
})

module.exports = mongoose.model('Transport', transportSchema);