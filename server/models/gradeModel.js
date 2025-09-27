const { default: mongoose } = require("mongoose");

const gradeSchema = new mongoose.Schema({
    grade: {
        type: String, 
        required: true,
    }
})

module.exports = mongoose.model('Grade', gradeSchema);