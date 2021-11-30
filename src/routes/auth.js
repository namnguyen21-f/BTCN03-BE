const express = require("express");

const router = express.Router();

const {createNewClass, getAllClass,getSpecificClass , generateLink, decodeLink
        , sendInvitationLink,readInvitationLink, joininClass, getClassAtendance, classDetail,
             gradeNew, newAssignment , removeAssignment, updateAssignment, getExcelStudentList,
             getExcelAssignment ,uploadExcelStudentList ,getTemplateStudentList , getTemplateAsGrade,
             uploadExcelAssignmentGrade, uploadSpecificAssignmentGrade } = require("../controller/classroom");
const {signin,signup, facebookLogin, googleLogin, manageProfile} = require("../controller/auth");


// const {addStock ,getStockList, getStockStatistic ,getStockProfit , getUserCurrentStock, getStockTransactionMonth} = require("../controller/stock");

function atc (req,res){
    if (req.user != undefined){
        return res.status(200).json({
            message: "Token validated",
        })
    }else{
        return res.status(200).json({
            message: "Token failed",   
        })
    }
}

router.post('/atc' , atc);
router.post('/signin' , signin);
router.post('/signup' , signup);
router.post('/changeProfile' , manageProfile);
router.post('/class/new' , createNewClass);
router.get('/class/:id/getClassAte' , getClassAtendance);
router.get('/class/getAll' , getAllClass);
router.get('/class/:id' , getSpecificClass);
router.post('/facebookLogin', facebookLogin);
router.post('/googleLogin', googleLogin);

router.get('/class/:classId/invite/:id' , readInvitationLink);
router.post('/class/:id/invite' , sendInvitationLink);

router.post('/class/:id/join' , joininClass);

router.post('/class/:id/inviteUrl' , generateLink);
router.get('/class/:id/inviteUrl' , decodeLink);

router.get('/class/:id/classDetail', classDetail);




router.post('/class/:id/newAssignment', newAssignment);
router.post('/class/:classId/:assId/remove', removeAssignment);
router.post('/class/:classId/:assId/update', updateAssignment);

//Map Student Id with Student account in grade board : alreaddy upload
router.post('/class/:classId/:assId/upload/grade', uploadExcelAssignmentGrade);

//Input grade for a student at a specific assignment
router.post('/class/:classId/:assId/:studentId/update/grade', uploadSpecificAssignmentGrade);



router.get('/class/:id/getSL/xlsx', getExcelStudentList);
router.get('/class/:classId/:assId/download/xlsx', getExcelAssignment);
router.post('/class/:id/uploadSL/xlsx', uploadExcelStudentList);

router.get('/class/:id/getGrade', getTotalGrade);

router.get('/class/grade/template', getTemplateAsGrade);
router.get('/class/sl/template', getTemplateStudentList);



// router.post('/addStock' , addStock);



module.exports = router;