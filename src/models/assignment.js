const mongoose = require('mongoose');

const assignment = new mongoose.Schema({ 
    classId: {
        type: String,
        require: true,
    },
    name: {
        type: String,
        require: true
    },
    fieldArray: {
        type: Array,
        require: true
    },
    createdBy: {
        type: String,
        require: true,
    },
},{timestamps: true});

module.exports = mongoose.model("Assignment", assignment);