const User = require("../models/user");
const jwt = require('jsonwebtoken');

exports.signup = (req,res) =>{
    User.findOne({email: req.body.email})
    .exec((err,user) => {
        if (user){
            return res.status(400).json({
                message: "User has already exists",
            })
        }
        const {
            firstName,
            lastName,
            email,
            password,
            userName,
            phone
        } = req.body;
        const newUser = new User({
            firstName : firstName,
            lastName : lastName,
            email: email,
            password : password,
            userName: userName,
            phone: phone,
        })
        newUser.save((err,data) => {
            if (err){
                return res.status(400).json({
                    message: "Something Wrong",
                    err: err,
                })
            }else{
                return res.status(201).json({
                    user: data
                })
            } 
        })
        if (err){
            return res.status(400).json({
                error: err,
            })
        }

    })
}

exports.signin = (req,res) =>{
    const {
        email,
        password
    } = req.body;

    User.findOne({email: email})
    .exec((err,user) => {
        if (err){
            return res.status(400).json({
                err: err,
            })
        }
        if (!user){
            return res.status(400).json({
                message: "User is not registered",
            })
        }else{
            //authenticate is a async funtion
            user.authenticate(password).then(result => {
                if (result){
                    return res.status(200).json({
                        message: "Login Successful",
                        token: jwt.sign({_id: user._id}, 'RESTFULAPIs' , { expiresIn: '2h'}),
                    })
                }else{
                    return res.status(400).json({
                        message: "Password is not correct",
                    })
                } 
            })
            
            
        }
        

    })
}





