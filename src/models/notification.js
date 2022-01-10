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
        type: String,
        default: 0,
    },
    toList:{
        type: [String]
    },
    createdBy: {
        type: String,
        require: true,
    },
},{timestamps: true});


module.exports = mongoose.model("Notification", ckSchema);