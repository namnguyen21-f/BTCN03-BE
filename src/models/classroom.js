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
    createdBy: {
        type: String,
        require: true,
    },
    createdByName: {
        type: String,
        require: true,
    }
},{timestamps: true});

module.exports = mongoose.model("Classroom", ckSchema);