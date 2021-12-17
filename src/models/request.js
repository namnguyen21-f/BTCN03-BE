const mongoose = require('mongoose');


const ckSchema = new mongoose.Schema({ 
    assId: {
        type: String,
        require: true,
    },
    grade: {
        type: String,
        require: true,
    },
    text: {
        type: String,
        require: true,
    },
    classId: {
        type: String,
        require: true,
    },
    createdBy: {
        type: String,
        require: true,
    },
    studentId: {
        type: String,
    },
    status: {
        type: String,
        require: true,
    },
    comment: [],
},{timestamps: true});


module.exports = mongoose.model("Request", ckSchema);