const Classroom = require("../models/classroom");
const User = require("../models/user");
const Invitation = require("../models/invitation");

var nodemailer = require("nodemailer");


var smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "lamngan2221@gmail.com",
        pass: "Handsome1"
    }
});

exports.createNewClass = (req, res) => {
    if (req.user){
        User.findOne({_id: req.user._id})
        .exec((err,user) => {
            if (user.role == "user"){
                return res.status(400).json({
                    message: "Student does not have permisson",
                })
            }else{
                const {
                    className,
                    teacher
                } = req.body;
                
                const newClassrome = new Classroom({
                    className: className,
                    teacher: teacher,
                    createdBy: req.user._id,
                    createdByName: req.user.userName,
                    attendantList: [],
                })
            
            
                newClassrome.save((err,data) => {
                    if (err){
                        return res.status(400).json({
                            message: "Something Wrong",
                            err: err,
                        })
                    }else{
                        return res.status(201).json({
                            classroom: data,
                            message: "Success"
                        })
                    } 
                })
            }
        })
    }else{
        return res.status(200).json({
            data: classList,
        })
    }
    
}


exports.getAllClass = (req, res) => {
    Classroom.find().sort({"createdAt": -1})
    .exec((err, classList) => {
        classList.map(ele => {
            ele.updatedAt = null;
            ele.createdBy = null;
            ele.createdByName = null;
        });
        if (err){
            return res.status(400).json({
                err: err,
            })
        }else{
            return res.status(200).json({
                data: classList,
            })
        }

    })
}

exports.getSpecificClass = (req, res) => {
    Classroom.findOne({_id: req.params.id}).sort({"createdAt": -1})
    .exec((err, class1) => {
        if (err){
            return res.status(400).json({
                err: err,
            })
        }else{
            class1.updatedAt = null;
            class1.createdBy = null;
            class1.createdByName = null;
            return res.status(200).json({
                data: class1,
            })
        }

    })
}

exports.searchClass = (req, res) => {
    Classroom.findOne()
    .exec((err, classList) => {
        if (err){
            return res.status(400).json({
                err: err,
            })
        }else{
            return res.status(200).json({
                data: classList,
            })
        }

    })
}

exports.sendInvitationLink = (req,res) => {
    if (req.user){
        Invitation.findOne({toEmail : req.body.email})
        .exec((err, ivt) => {
            if (ivt){
                return res.status(400).json({
                    message: "Invitation already been sent",
                })
            }else{
                const newInvitation = new Invitation({
                    classId: req.params.id,
                    toEmail: req.body.email,
                    fromId: req.user._id,
                    createdBy: req.user._id,  
                })
                newInvitation.save((err,data) => {
                    if (err){
                        return res.status(400).json({
                            message: "Something Wrong",
                            err: err,
                        })
                    }else{
                        const to = req.body.email;
                        const link = 'https://btcn03-18127160.herokuapp.com/api/class' + req.params.id + '/invite/' + data._id;
                        var mailOptions = {
                            to: to,
                            subject: "Email for inviting user to class",
                            html: `<p> Your invitation link is: <a href='${link}'> ${link}</a>`
                        }
                
                        smtpTransport.sendMail(mailOptions, function(error, info) {
                            if (error) {
                                return res.status(400).json({
                                    err: error,
                                })
                            } else {
                                return res.status(200).json({
                                    message: "Email has been sent",
                                })
                            }
                        });
                        
                    } 
                })
            }
        })
        
    }else{
        return res.status(400).json({
            err: "err",
        })
    }
    
}


exports.joininClass = (req,res) => {
    if (req.user){
        Classroom.findOne({_id : req.params.id})
        .exec((err, cls) => {
            if (cls){
                for (let i=0; i < cls.attendantList.length ;i++){
                    if (cls.attendantList[i]._id == req.user._id){
                        return res.status(400).json({
                            message: "User has been added",
                        })
                    }
                }
                User.findOne({_id: req.user._id})
                .exec((err,user) => {
                    cls.attendantList.push(user);
                    cls.save( function(err){
                        if(err) return res.status(500).send(err);
                        return res.status(200).send({message: "OK"})
                    })
                })
            }else{
                return res.status(400).json({
                    message: "Classrom does not exist",
                })
            }
        })
        
    }else{
        return res.status(400).json({
            err: "err",
        })
    }
    
}

exports.readInvitationLink = (req,res) => {
    Invitation.findOne({_id : req.params.id})
    .exec((err, ivt) => {
        if (ivt){
            Classroom.findOne({_id : ivt.classId})
            .exec((err, cls) => {
                if (cls){
                    console.log(cls)
                    for (let i=0; i < cls.attendantList.length ;i++){
                        if (cls.attendantList[i]._id == ivt.classId){
                            return res.status(200).json({
                                message: "User has been added",
                            })
                        }
                    }
                    User.findOne({email: ivt.toEmail})
                    .exec((err,user) => {
                        console.log(user)
                        if (user){
                            cls.attendantList.push(user);
                            cls.save( function(err){
                                if(err) return res.status(500).send(err);
                                return res.status(200).send({message: "OK"})
                            })
                        }else{
                            
                            const newUser = new User({
                                firstName : "",
                                lastName : "",
                                email: ivt.toEmail,
                                password : "",
                                userName: "",
                                phone: "",
                            })
                            console.log(newUser)
                            newUser.save((err,data) => {
                                if (err){
                                    return res.status(400).json({
                                        message: "Something Wrong",
                                        err: err,
                                    })
                                }else{
                                    cls.attendantList.push(data);
                                    cls.save( function(err){
                                        if(err) return res.status(500).send(err);
                                        return res.status(200).send({message: "OK"})
                                    })
                                } 
                            })
                        }
                    })
                }else{
                    return res.status(400).json({
                        message: "Classrom does not exist",
                    })
                }
            })
        }else{
            return res.status(400).json({
                message: "Invitation link is invalid",
            })
        }
    })

}






