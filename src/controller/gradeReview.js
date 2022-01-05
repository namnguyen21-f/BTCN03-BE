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
                let allRequest= []
                reqs.map(ele=>{
                    const request= {garde: ele.grade, text: ele.text, assId: ele.assId, studentId: ele.studentId, assName: ele.assName}
                    allRequest.push(request)
                })
                return res.status(200).send(allRequest)
            }
        })
    }else{
        return res.status(400).json({
            message: "Please login",
        })
    }
}

exports.finalizeDecision= (req, res)=>{
    if(req.user){

    }else{
        return res.status(400).json({
            message: "Please login",
        })
    }
}