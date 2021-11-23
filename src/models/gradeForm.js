const mongoose = require('mongoose');

const grade = new mongoose.Schema({ 
    classId: {
        type: String,
        require: true,
    },
    nameItem: {
        type: String,
        require: true
    },
    gradeItem: {
        type: Number,
        require: true 
    },
    createdBy: {
        type: String,
        require: true,
    },
},{timestamps: true});

module.exports = mongoose.model("GradeForm", grade);