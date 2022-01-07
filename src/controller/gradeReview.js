const Classroom = require("../models/classroom");
const User = require("../models/user");
const Assignment = require("../models/assignment");
const Request = require("../models/request");

exports.getAllRequest= (req, res)=>{
    if(req.user){
        Request.find({classId: req.params.classId}).sort({"createdAt": -1})
        .exec((err, reqs)=>{
            if (err){
                return res.status(400).json({
                    err: err,
                })
            }else{
                return res.status(200).send(reqs)
            }
        })
    }else{
        return res.status(400).json({
            message: "Please login",
        })
    }
}

exports.getOldGrade= (req, res)=>{
    if(req.user){
        Assignment.findOne({_id: req.params.assId}).sort({"createdAt": -1})
        .exec((err, data)=>{
            if (err){
                return res.status(400).json({
                    err: err,
                })
            }else{
                for(let stu of data.studentGrade){
                    if(stu.studentId == req.params.studentId){
                        return res.status(200).send(stu.grade)
                    }
                }
            }
        })
    }else{
        return res.status(400).json({
            message: "Please login",
        })
    }
}

exports.finalizeStudent= (req, res)=>{
    if (req.user){
        Classroom.findOne({_id: req.params.classId}).sort({"createdAt": -1})
        .exec((err, cls) => {
            if (err){
                return res.status(400).json({
                    err: err,
                })
            }else{
                Assignment.findOne({_id: req.params.assId})
                        .exec((err, ass) => {
                            if (err){
                                return res.status(400).json({
                                    message: "Something Wrong",
                                    err: err,
                                })
                            }else{
                                const {
                                    mark,
                                }= req.body
                                let gradeTemp= ass.studentGrade
                                let flag=0
                                for(let i=0; i<gradeTemp.length; i++){
                                    if(gradeTemp[i].studentId == req.params.studentId){
                                        gradeTemp[i].mark= mark
                                        flag=1
                                        break
                                    }
                                }
                                if(flag==1){
                                    ass.studentGrade = [];
                                    ass.studentGrade= gradeTemp
                                    ass.save( function(err){
                                        if(err) return res.status(500).send(err);
                                        return res.status(200).send({message: "OK"})
                                    })
                                }
                            } 
                        })
            }
        })
    }else{
        return res.status(400).json({
            message: "Please login",
        })
    }
}

exports.getFinalStudent= (req, res)=>{
    if(req.user){
        Classroom.findOne({_id: req.params.classId}).sort({"createdAt": -1})
        .exec((err, cls)=>{
            if (err){
                return res.status(400).json({
                    err: err,
                })
            }
            else{
                if (!cls.assignmentList){
                    return res.status(200).json({
                        data: [],
                        message: "Assignment is empty"
                    })
                }
                var result= []
                for(let ass of cls.assignmentList){
                    Assignment.findOne({_id: ass._id}).sort({"createdAt": -1})
                    .exec((err, assObject)=>{
                        for(let student of assObject.studentGrade){
                            if(student.mark){
                                result= [...result, [ass._id, student.studentId]]
                            }
                        }
                        if(ass == cls.assignmentList[cls.assignmentList.length-1]){
                            return res.status(200).send(result)
                        }
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