const mongoose = require('mongoose');

const ckSchema = new mongoose.Schema({ 
    classId: {
        type: String,
        require: true,
    },
    className: {
        type: String,
        require: true,
    },
    teacher: {
        type: String,
        require: true,
    },
    quantity: {
        type: Number,
        default: 0,
    },
},{timestamps: true});

module.exports = mongoose.model("Classroom", ckSchema);