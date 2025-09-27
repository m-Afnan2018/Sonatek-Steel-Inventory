const { default: mongoose } = require("mongoose");


const userSchema =  new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        minLength: 8,
        select: false
    },
    isVerified: {
        type: Boolean, 
        required: true, 
        default: false,
    }, 
    role: {
        type: String, 
        enum: ['admin', 'director', 'inventory_associate', 'agent', 'accountant'],
        default: 'agent'
    }, 
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default:Date.now
    }
})

module.exports = mongoose.model('User', userSchema);