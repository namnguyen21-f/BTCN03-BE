const mongoose = require('mongoose');


const ckSchema = new mongoose.Schema({ 
    title: {
        type: String,
        require: true,
    },
    text: {
        type: String,
        require: true,
    },
    to: {
        type: Number,
        default: 0,
    },
    createdBy: {
        type: String,
        require: true,
    },
},{timestamps: true});


module.exports = mongoose.model("Notification", ckSchema);