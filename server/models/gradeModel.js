const { default: mongoose } = require("mongoose");

const gradeSchema = new mongoose.Schema({
    grade: {
        type: String, 
    }
})

model.exports = mongoose.model('Grade', gradeSchema);