const { default: mongoose } = require("mongoose");


const thicknessSchema = mongoose.Schema({
    name: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['Both', 'Hot Rolled', 'Cold Rolled'],
        default: 'Both'
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

module.exports = mongoose.model('Thickness', thicknessSchema);