const User = require("../models/user");
const jwt = require('jsonwebtoken');
const {OAuth2Client} = require('google-auth-library');
// const { response } = require("express");
// const fetch= require("node-fetch");
const axios = require('axios');

const client= new OAuth2Client("405769286115-ccpu4vsplvrfttij8im3r7hbhsoupg1h.apps.googleusercontent.com");

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
            phone,
            role
        } = req.body;
        const newUser = new User({
            firstName : firstName,
            lastName : lastName,
            email: email,
            password : password,
            userName: userName,
            phone: phone,
            role: role,
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

exports.googleLogin= (req, res)=>{
    const {tokenId}= req.body;
    client.verifyIdToken({idToken: tokenId, audience: "405769286115-ccpu4vsplvrfttij8im3r7hbhsoupg1h.apps.googleusercontent.com"}).then(response=>{
        const {email_verified, name, email}= response.payload;
        if(email_verified){
            User.findOne({email: email}).exec((err, user)=>{
                
                if(err){
                    return res.status(400).json({
                        error: 'Something went wrong...'
                    })
                }
                else{
                    //process.env.JWT_SIGNIN_KEY RESTFULAPIs"
                    
                    if(user){
                        console.log("p2l");
                        const token= jwt.sign({_id: user._id}, "RESTFULAPIs", {expiresIn: '2h'});
                        const {_id, name, email}= user;
                        res.json({
                            token,
                            user: {_id, name, email}
                        })
                    }
                    else{
                        
                        const password= email + "RESTFULAPIs";
                        const newUser= new User({
                            firstName: "Unknown", lastName: "Unknown",
                            userName: name, email, password
                        });
                        newUser.save((err, data)=>{
                            console.log("pl1");
                            if(err){
                                return res.status(400).json({
                                    error: 'Something went wrong...'
                                })
                            }
                            const token= jwt.sign({_id: data._id}, "RESTFULAPIs", {expiresIn: '2h'});
                            const {_id, name, email}= newUser;
                            res.json({
                                token,
                                user: {_id, name, email}
                            })
                        })

                    }
                }
            })
        }
        // console.log(response.payload);
    })
}

exports.facebookLogin= async (req, res)=>{
    const {userID, accessToken}= req.body;
    let urlGraphFacebook= `https://graph.facebook.com/v2.11/${userID}/?fields=id,name,email&access_token=${accessToken}`;
    await axios({
        method: 'GET',
        url: urlGraphFacebook
    })
    .then(response=> {
        const {email, name}= response.data;
        User.findOne({email}).exec((err, user)=> {
            if(err){
                return res.status(400).json({
                    error: 'Something went wrong...'
                })
            }
            else{
                if(err){
                    return res.status(400).json({
                        error: 'Something went wrong...'
                    })
                }
                else{
                    if(user){
                        const token= jwt.sign({_id: user._id}, "RESTFULAPIs", {expiresIn: '2h'});
                        const {_id, name, email}= user;
                        res.json({
                            token,
                            user: {_id, name, email}
                        })
                    }
                    else{
                        const password= email + "RESTFULAPIs";
                        const newUser= new User({
                            firstName: "Unknown", lastName: "Unknown",
                            userName: name, email, password});
                        newUser.save((err, data)=>{
                            if(err){
                                return res.status(400).json({
                                    error: 'Something went wrong...'
                                })
                            }
                            const token= jwt.sign({_id: data._id}, "RESTFULAPIs", {expiresIn: '2h'});
                            const {_id, name, email}= data;
                            res.json({
                                token,
                                user: {_id, name, email}
                            })
                        })

                    }
                }
            }
        })
    });
}


exports.manageProfile = (req,res) =>{
    const {
        firstName,
        lastName,
        password,
        userName,
        phone,
        role
    } = req.body;

    if (req.user){
        User.findOne({_id: req.user._id})
        .exec((err,user) => {
            if (err){
                return res.status(400).json({
                    err: err,
                })
            }
            if (!user){
                return res.status(400).json({
                    message: "User is not valid",
                })
            }else{
                user.firstName = firstName;
                user.lastName = lastName;
                user.password = password;
                user.userName = userName;
                user.phone = phone;
                //user.role = role;         
                user.save((err,data) => {
                    if (err){
                        return res.status(400).json({
                            message: "Something Wrong",
                            err: err,
                        })
                    }else{
                        return res.status(201).json({
                            message: "Done",
                        })
                    } 
                })
                
            }
        })
    }else{
        return res.status(400).json({
            message: "Request Failed",
        })
    }
    
}





