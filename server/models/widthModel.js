const { default: mongoose } = require("mongoose");


const widthSchema = mongoose.Schema({
    width: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('Width', widthSchema);