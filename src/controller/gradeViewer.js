const Classroom = require("../models/classroom");
const User = require("../models/user");
const Assignment = require("../models/assignment");


exports.getGradeUser= (req, res)=>{
    if(req.user){
        User.findOne({_id: req.user._id})
        .exec((err, user)=>{
            if(user.role=="teacher"){
                return res.status(400).json({
                    message: "Teacher does not have permisson",
                })
            }else{
                Classroom.findOne({_id: req.params.classId}).sort({"createdAt": -1})
                .exec((err, cls)=>{
                    if (err){
                        return res.status(400).json({
                            err: err,
                        })
                    }else{
                        let gradeEachAss= []
                        let overall= 0
                        for(let i=0;i<cls.assignmentList.length;i++){
                            Assignment.findOne({_id: cls.assignmentList[i]._id}).sort({"createdAt": -1})
                            .exec((err, ass)=>{
                                if (err){
                                    return res.status(400).json({
                                        err: err,
                                    })
                                }else{
                                    if(ass.mark){
                                        for(let j=0;j<ass.studentGrade.length;j++){
                                            if(user.studentId == ass.studentGrade[j].studentId){
                                                overall += ass.studentGrade[j].grade * (parseFloat(ass.grade)/10)
                                                gradeEachAss.push([cls.assignmentList[i]._id ,ass.studentGrade[j].grade])
                                                break
                                            }
                                        }
                                    }
                                    if(i==cls.assignmentList.length-1){
                                        return res.status(200).json({
                                            studentId: user.studentId,
                                            gradeAss: gradeEachAss,
                                            overall: overall
                                        })
                                    }
                                }
                            })
                        }

                    }
                })
            }
        })
    }else{
        return res.status(400).json({
            err: "error",
        })
    }
}