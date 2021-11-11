const Classroom = require("../models/classroom");
const User = require("../models/user");
var nodemailer = require("nodemailer");

var smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "proitem123@gmail.com",
        pass: "proitem123"
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
        const to = req.body.email;
        const link = 'https://dashboard.heroku.com/apps/btcn03-18127160/' + req.params.id + '/invite';
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
    }else{
        return res.status(400).json({
            err: "err",
        })
    }
    
}



