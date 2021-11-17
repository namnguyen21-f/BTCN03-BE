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
    console.log(req.user)
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
                    attendantList: [user],
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
        return res.status(400).json({
            err: "rror",
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

exports.getClassAtendance = (req, res) => {
    if (req.user){
        Classroom.findOne({_id: req.params.id}).sort({"createdAt": -1})
        .exec((err, cls) => {
            if (err){
                return res.status(400).json({
                    err: err,
                })
            }else{
                let flag = 0;
                for (let i=0; i < cls.attendantList.length ;i++){
                    if (cls.attendantList[i]._id == req.user._id){
                        flag = 1;
                        break;
                    }
                }
                if (flag == 1){
                    let t_arr = [];
                    let s_arr = [];
                    for (let i=0; i < cls.attendantList.length ;i++){
                        let {firstName, lastName, email} = cls.attendantList[i];
                        if (cls.attendantList[i].role == "teacher"){
                            t_arr.push({firstName, lastName, email})
                        }else if (cls.attendantList[i].role == "user"){
                            s_arr.push({firstName, lastName, email})
                        }
                    }
                    return res.status(400).json({
                        data: {s_arr, t_arr}
                    })
                }else{
                    return res.status(400).json({
                        message: "Request Failed"
                    })
                }
                
            }

        })
    }else{
        return res.status(400).json({
            message: "Please login",
        })
    }
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
                return res.status(200).json({
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
                        const link = 'https://midtermproject160220.herokuapp.com/class/' + req.params.id + '/invite/' + data._id;
                        var mailOptions = {
                            to: to,
                            subject: "Email for inviting user to class",
                            html: `<p> Your invitation link is: <a href='${link}'> ${link}</a>`
                        }
                
                        smtpTransport.sendMail(mailOptions, function(error, info) {
                            if (error) {
                                Invitation.deleteOne({_id: data._id} ,  function (err) {
                                    return res.status(400).json({
                                        message: "Request Failed",
                                        error : error,
                                    })
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

exports.generateLink = (req,res) => {
    if (req.user){
        const link = 'https://midtermproject160220.herokuapp.com/class/' + req.params.id + '/inviteUrl';
        return res.status(200).json({
            data : link,
        }) 
    }else{
        return res.status(400).json({
            err: "err",
        })
    }
    
}

exports.decodeLink = (req,res) => {
    if (req.user){
        Classroom.findOne({_id : req.params.id})
        .exec((err, cls) => {
            if (cls){
                for (let i=0; i < cls.attendantList.length ;i++){
                    if (cls.attendantList[i]._id == req.user._id){
                        return res.status(200).json({
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
            message: "Please login",
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
                    
                    for (let i=0; i < cls.attendantList.length ;i++){
                        if (cls.attendantList[i]._id == ivt.classId){
                            return res.status(200).json({
                                message: "User has been added",
                            })
                        }
                    }
                    User.findOne({email: ivt.toEmail})
                    .exec((err,user) => {
                        
                        if (user){
                            cls.attendantList.push(user);
                            cls.save( function(err){
                                if(err) return res.status(500).send(err);
                                return res.status(200).send({message: "OK"})
                            })
                        }else{
                            
                            const newUser = new User({
                                firstName : "xxxxxx",
                                lastName : "xxxxxx",
                                email: ivt.toEmail,
                                password : "xxxxxx",
                                userName: "xxxxxx",
                                phone: "009999999",
                            })
                            
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


exports.classDetail= (req, res)=>{
    Classroom.findOne({_id: req.params.id})
    .exec((err, cls) => {
        if(err){
            return req.status(400).send(err);
        }
        return res.status(200).send(cls);
    })
}



