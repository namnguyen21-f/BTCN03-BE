const mongoose = require('mongoose');

const invitationSc = new mongoose.Schema({ 
    classId: {
        type: String,
        require: true,
    },
    fromId: {
        type: String,
        require: true,
    },
    toEmail: {
        type: String,
        require: true,
    },
    createdBy: {
        type: String,
        require: true,
    },
},{timestamps: true});

module.exports = mongoose.model("Invitation", invitationSc);