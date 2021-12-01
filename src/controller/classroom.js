const Classroom = require("../models/classroom");
const User = require("../models/user");
const Invitation = require("../models/invitation");
const Assignment = require("../models/assignment");
var nodemailer = require("nodemailer");
const excel = require("exceljs");
const excelToJson = require('convert-excel-to-json');
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
                    attendantList: [user],
                    structGrade: [],
                    studentList: [],
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
    // return res.status(200).json({req});
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
                    return res.status(200).json({
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

exports.getExcelStudentList = (req, res) => {
    // return res.status(200).json({req});
    if (req.user){
        Classroom.findOne({_id: req.params.id}).sort({"createdAt": -1})
        .exec((err, cls) => {
            if (err){
                return res.status(400).json({
                    err: err,
                })
            }else{
                let flag = 1;
                if (flag == 1){
                    let workbook = new excel.Workbook();
                    let worksheet = workbook.addWorksheet("StudentList");

                    worksheet.columns = [
                        { header: "Student Id", key: "studentId", width: 20 },
                        { header: "Full Name", key: "fullName", width: 35 },
                    ];

                    worksheet.addRows(cls.studentList);

                    res.setHeader(
                        "Content-Type",
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    );
                    res.setHeader(
                        "Content-Disposition",
                        "attachment; filename=" + "StudentList.xlsx"
                    );

                    return workbook.xlsx.write(res).then(function () {
                        res.status(200).end();
                    });
                    
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

exports.uploadExcelStudentList = async (req, res) => {
    if(!req.files) {
        res.send({
            status: 400,
            message: 'No file uploaded'
        });
    } else {
        if (req.user){
            Classroom.findOne({_id: req.params.id}).sort({"createdAt": -1})
            .exec( async (err, cls) => {
                if (err){
                    return res.status(400).json({
                        err: err,
                    })
                }else{
                    if (cls.createdBy !== req.user._id){
                        return res.status(400).json({
                            message: "You do not have permisstion",
                        })
                    }else{
                        const order = req.files.files;
                        const name = './uploads/' + order.name + Math.random() * 123456789 ;
                        await order.mv(name);
                        // Process your file
                        var file = excelToJson({
                            sourceFile: name,
                        });
                        var result = file.StudentList;
                        if (result[0].A.trim() != "StudentId" || result[0].B.trim() != "FullName"){
                            res.status(400).json({
                                message: 'Excel is not valid'
                            });
                        }
                        let arrtmp = [];
                        for (let i=1 ; i < result.length ; i++ ){
                            let tmp = {
                                studentId : result[i].A, 
                                fullName: result[i].B,
                            };
                            await User.findOne({ studentId: result[i].A }, function (err, doc) {
                                if (doc){
                                    tmp.user = {
                                        studentId: doc.studentId,
                                        userName : doc.userName,
                                        email: doc.email,
                                        id: doc._id,
                                    }
                                }
                            });
                            arrtmp.push(tmp)
                        }
                        // You can also use the mv() method to place the file in a upload directory (i.e. 'uploads')
                        // Send response
                        cls.studentList = arrtmp;

                        cls.save( function(err){
                            if(err) return res.status(500).send(err);
                            return res.status(200).send({message: "OK"})
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
   
    // return res.status(200).json({req});
    
}

exports.uploadExcelAssignmentGrade = async (req, res) => {
    if(!req.files) {
        res.send({
            status: 400,
            message: 'No file uploaded'
        });
    } else {
        if (req.user){
            Classroom.findOne({_id: req.params.classId}).sort({"createdAt": -1})
            .exec((err, cls) => {
                if (err){
                    return res.status(400).json({
                        err: err,
                    })
                }else{
                    Assignment.findOne({_id: req.params.assId}).sort({"createdAt": -1})
                    .exec(async (err, ass) => {
                        if (err){
                            return res.status(400).json({
                                err: err,
                            })
                        }else{
                            if (ass.createdBy !== req.user._id){
                                return res.status(400).json({
                                    message: "You do not have permisstion",
                                })
                            }else{
                                const order = req.files.files;
                                const name = './uploads/' + order.name + Math.random() * 123456789 ;
                                await order.mv(name);
                                // Process your file
                                var file = excelToJson({
                                    sourceFile: name,
                                });
                                var result = file.StudentList;
                                if (result[0].A.trim() != "StudentId" || result[0].B.trim() != "Grade"){
                                    res.status(400).json({
                                        message: 'Excel is not valid'
                                    });
                                }
                                let arrtmp = [];
                                for (let i=1 ; i < result.length ; i++ ){
                                    let tmp = {
                                        studentId : result[i].A, 
                                        grade: result[i].B,
                                    };
                                    await User.findOne({ studentId: result[i].A }, function (err, doc) {
                                        if (doc){
                                            tmp.user = {
                                                studentId: doc.studentId,
                                                userName : doc.userName,
                                                email: doc.email,
                                                id: doc._id,
                                            }
                                        }
                                    });
                                    arrtmp.push(tmp)
                                }
                                // You can also use the mv() method to place the file in a upload directory (i.e. 'uploads')
                                // Send response
                                ass.studentGrade = arrtmp;
        
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
   
    // return res.status(200).json({req});
    
}

exports.uploadSpecificAssignmentGrade = async (req, res) => {
    var grade = req.body.grade;
    if (req.user){
        Classroom.findOne({_id: req.params.classId}).sort({"createdAt": -1})
        .exec((err, cls) => {
            if (err){
                return res.status(400).json({
                    err: err,
                })
            }else{
                Assignment.findOne({_id: req.params.assId}).sort({"createdAt": -1})
                .exec(async (err, ass) => {
                    if (err){
                        return res.status(400).json({
                            err: err,
                        })
                    }else{
                        if (ass.createdBy !== req.user._id){
                            return res.status(400).json({
                                message: "You do not have permisstion",
                            })
                        }else{
                            let result = ass.studentGrade;
                            let flag = 0;

                            for (let i=0 ; i < result.length ; i++ ){
                                if (result[i].studentId == req.params.studentId){
                                    flag = 1;
                                 
                                    
                                    result[i].grade = parseInt(req.body.grade);
                               
                                    break;
                                }
                            }
                            
                            if (flag == 1){
                                ass.studentGrade = [];
                                ass.studentGrade = result;
                                ass.save( function(err){
                                    if(err) return res.status(500).send(err);
                                    return res.status(200).send({message: "OK"})
                                })
                            }else{
                                return res.status(400).json({
                                    message: "Request Failed",
                                })
                            }
                            // You can also use the mv() method to place the file in a upload directory (i.e. 'uploads')
                            // Send response
                            
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
    // return res.status(200).json({req});
    
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
                        const link = 'https://midtermproject160220-fe.herokuapp.com/class/' + req.params.id + '/invite/' + data._id;
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
        const link = 'https://midtermproject160220-fe.herokuapp.com/class/' + req.params.id + '/inviteUrl';
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


exports.newAssignment= (req, res)=>{
    if (req.user){
        User.findOne({_id: req.user._id})
        .exec((err,user) => {
            if (user.role == "user"){
                return res.status(400).json({
                    message: "Student does not have permisson",
                })
            }else{
                const {
                    fieldArray,
                    name,
                    grade
                } = req.body;

                //fieldArray:  [{name: "Final term" , grade: "2"}]
                
                const newAssignment = new Assignment({
                    classId: req.params.id,
                    name: name,
                    grade: grade,
                    fieldArray: fieldArray,
                    createdBy: user._id
                })

                newAssignment.save((err,data) => {
                    if (err){
                        return res.status(400).json({
                            message: "Something Wrong",
                            err: err,
                        })
                    }else{
                        Classroom.findOne({_id : req.params.id})
                        .exec((err, cls) => {
                            cls.assignmentList.push(data);
                            cls.save( function(err){
                                if(err) return res.status(500).send(err);
                                return res.status(200).send({message: "OK"})
                            })
                        })
                    } 
                })
            }
        })
    }else{
        return res.status(400).json({
            err: "Error",
        })
    }
    
}

exports.removeAssignment= (req, res)=>{
    if (req.user){
        User.findOne({_id: req.user._id})
        .exec((err,user) => {
            if (user.role == "user"){
                return res.status(400).json({
                    message: "Student does not have permisson",
                })
            }else{
                Assignment.findOneAndRemove({_id: req.params.assId})
                .exec((err, ass) => {
                    if (err){
                        return res.status(400).json({
                            message: "Something Wrong",
                            err: err,
                        })
                    }else{
                        Classroom.findOne({_id : req.params.classId})
                        .exec((err, cls) => {
                            cls.assignmentList = cls.assignmentList.filter(data => data._id != req.params.assId);
                            cls.save( function(err){
                                if(err) return res.status(500).send(err);
                                return res.status(200).send({message: "OK"})
                            })
                        })
                    } 
                })
            }
        })
    }else{
        return res.status(400).json({
            err: "Error",
        })
    }
    
}

exports.updateAssignment= (req, res)=>{
    if (req.user){
        User.findOne({_id: req.user._id})
        .exec((err,user) => {
            if (user.role == "user"){
                return res.status(400).json({
                    message: "Student does not have permisson",
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
                            fieldArray,
                            name,
                        } = req.body;
                        ass.name = name;
                        ass.fieldArray = fieldArray;

                        ass.save( function(err){
                            if(err) return res.status(500).send(err);
                            return res.status(200).send({message: "OK"})
                        })
                    } 
                })
            }
        })
    }else{
        return res.status(400).json({
            err: "Error",
        })
    }
    
}

exports.getExcelAssignment= (req, res)=>{
    if (req.user){
        User.findOne({_id: req.user._id})
        .exec((err,user) => {
            Assignment.findOne({_id: req.params.assId})
            .exec((err, ass) => {
                if (err){
                    return res.status(400).json({
                        message: "Something Wrong",
                        err: err,
                    })
                }else{
                    let workbook = new excel.Workbook();
                    let worksheet = workbook.addWorksheet("StudentList");

                    worksheet.columns = [
                        { header: "Task", key: "gradeText", width: 35 },
                        { header: "Grade", key: "grade", width: 15 },
                    ];

                    worksheet.addRows(ass.fieldArray);

                    res.setHeader(
                        "Content-Type",
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    );
                    res.setHeader(
                        "Content-Disposition",
                        "attachment; filename=" + `Assignment ${ass.name}.xlsx`
                    );

                    return workbook.xlsx.write(res).then(function () {
                        res.status(200).end();
                    });
                } 
            })
        })
    }else{
        return res.status(400).json({
            err: "Error",
        })
    }
    
}


exports.getTemplateStudentList = (req, res) => {
    // return res.status(200).json({req});
    if (req.user){
        let workbook = new excel.Workbook();
        let worksheet = workbook.addWorksheet("StudentList");

        worksheet.columns = [
            { header: "StudentId", key: "studentId", width: 20 },
            { header: "FullName", key: "fullName", width: 35 },
        ];

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=" + "StudentList.xlsx"
        );

        return workbook.xlsx.write(res).then(function () {
            res.status(200).end();
        });
    }else{
        return res.status(400).json({
            message: "Please login",
        })
    }
}

exports.getTemplateAsGrade = (req, res) => {
    // return res.status(200).json({req});
    if (req.user){
        let workbook = new excel.Workbook();
        let worksheet = workbook.addWorksheet("StudentList");

        worksheet.columns = [
            { header: "StudentId", key: "studentId", width: 20 },
            { header: "Grade", key: "grade", width: 35 },
        ];

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=" + "StudentList.xlsx"
        );

        return workbook.xlsx.write(res).then(function () {
            res.status(200).end();
        });
    }else{
        return res.status(400).json({
            message: "Please login",
        })
    }
}

//uploadExcelStudentList


exports.getTotalGrade = async (req, res) => {
    if (req.user){
        Classroom.findOne({_id: req.params.classId}).sort({"createdAt": -1})
        .exec(async (err, cls) => {
            if (err){
                return res.status(400).json({
                    err: err,
                })
            }else{
                var sg_arr = [];

                if (!cls.assignmentList){
                    return res.status(200).json({
                        data: [],
                        message: "Assignment is empty"
                    })
                }

                for (let i=0 ;i < cls.assignmentList.length ; i++ ){
                    await Assignment.findOne({_id: cls.assignmentList[i]._id}).sort({"createdAt": -1})
                    .exec((err, ass) => {
                        let result = ass.studentGrade;
                        for (let i=0 ; i < result.length ; i++ ){
                            let tmp = sg_arr.findIndex(x => x.studentId == result[i].studentId);
                            if (tmp != -1) {
                                
                                if (!sg_arr[tmp].grade){
                                    sg_arr[tmp].grade = [];
                                }
                               
                                sg_arr[tmp].grade.push({
                                    name: ass.name,
                                    grade: result[i].grade,
                                })
                             
                                sg_arr[tmp].mean = sg_arr[tmp].mean + parseFloat((result[i].grade / ass.grade).toFixed(2));
                            
                            }else{
                                sg_arr.push({
                                    studentId: result[i].studentId,
                                    grade: [{
                                        name: ass.name,
                                        grade: result[i].grade,
                                    }],
                                    mean: parseFloat((result[i].grade / ass.grade).toFixed(2)),
                                })
                            }
                            
                        }
                        if (i == cls.assignmentList.length - 1){
                                
                            return res.status(200).json({
                                data: sg_arr,
                            })
                        }
                        // You can also use the mv() method to place the file in a upload directory (i.e. 'uploads')
                        // Send response
                    })
                   
                }
             
            }
        })
    }else{
        return res.status(400).json({
            message: "Please login",
        })
    }
    // return res.status(200).json({req});
    
}






