const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const userSchema = new mongoose.Schema({ 
    firstName: {
        type: String,
        required : true,
        trim: true,
        min: 2,
        max: 20,
    },
    lastName: {
        type: String,
        required : true,
        trim: true,
        min: 2,
        max: 20,
    },
    userName: {
        type: String,
        required : true,
        trim: true,
    },
    email: {
        type: String,
        required : true,
        trim: true,
        index:true,
        unique: true,
    },
    address: {
        type: String,
        trim: true,
    },
    phone: {
        type: Number,
        trim: true,
    },
    password: {
        type: String,
        required : true,
    },
    role: {
        type: String,
        enum: ['user','teacher','admin'],
        default: "user"
    },
    profileImageUrl: {
        type: String,
        trim: true,
    },
    status: {
        type: String,
        trim: true,
    },
    studentId: {
        type: String,
        trim: true,
    }
},{timestamps: true});


userSchema.pre('save', async function save(next){
    var user = this;
    if (!this.isModified("password")) return next();
    try {
        const salt = await bcrypt.genSalt(saltRounds);
        this.password = await bcrypt.hash(this.password, salt);
        return next();
    } catch (err) {
        return next(err);
    }
})

// userSchema.virtual('password').set((password) => {
//     bcrypt.hash(password, saltRounds, function(err, hash) {
//         this.hass_password = hash;
//     });
// })


userSchema.methods = {
    authenticate: async function(password){
        let result = await bcrypt.compare(password, this.password);
        return result;
    }
}

module.exports = mongoose.model("User", userSchema);