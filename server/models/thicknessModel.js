const { default: mongoose } = require("mongoose");


const thicknessSchema = mongoose.Schema({
    thickness: {
        type: Number,
        required: true
    }
})

module.exports = mongoose.model('Thickness', thicknessSchema);