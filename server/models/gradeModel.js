const { default: mongoose } = require("mongoose");

const gradeSchema = new mongoose.Schema({
    name: {
        type: String, 
    }
})

model.exports = mongoose.model('Grade', gradeSchema);