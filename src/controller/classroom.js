const Classroom = require("../models/classroom");

exports.createNewClass = (req, res) => {
    const {
        className,
        teacher
    } = req.body;
    
    const newClassrome = new Classroom({
        className: className,
        teacher: teacher,
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


exports.getAllClass = (req, res) => {
    Classroom.find().sort({"createdAt": -1})
    .exec((err, classList) => {
        classList.map(ele => ele.updatedAt = null);
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



