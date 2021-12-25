const express = require("express");

const router = express.Router();

const {createNewClass, getAllClass,getSpecificClass , generateLink, decodeLink
        , sendInvitationLink,readInvitationLink, joininClass, getClassAtendance, classDetail,
             gradeNew, newAssignment , removeAssignment, updateAssignment, getExcelStudentList,
             getExcelAssignment ,uploadExcelStudentList ,getTemplateStudentList , getTemplateAsGrade,
             uploadExcelAssignmentGrade, uploadSpecificAssignmentGrade , getTotalGrade , getStudentGrade, getAssignment,
             getStudentGradeComposition, sendReviewRequest} = require("../controller/classroom");

const {signin,signup, facebookLogin, googleLogin, manageProfile , 
        banAccount, unbanAccount , atc , getAllAccount , getNotification} = require("../controller/auth");


// const {addStock ,getStockList, getStockStatistic ,getStockProfit , getUserCurrentStock, getStockTransactionMonth} = require("../controller/stock");



router.post('/atc' , atc);
router.post('/signin' , signin);
router.post('/signup' , signup);
router.post('/changeProfile' , manageProfile);
router.post('/admin/:userId/ban' , banAccount);
router.post('/admin/:userId/unban' , unbanAccount);
router.get('/admin/getAllAccount' , getAllAccount);
router.get('/notififcations' , getNotification);

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

//review grade from student
router.post('/class/:classId/:assId/review', sendReviewRequest);

router.get('/class/:id/getSL/xlsx', getExcelStudentList);
router.get('/class/:classId/:assId/download/xlsx', getExcelAssignment);//
router.post('/class/:id/uploadSL/xlsx', uploadExcelStudentList);

router.get('/class/:classId/getTotalGrade', getTotalGrade);

router.get('/class/:classId/:studentID/overall', getStudentGrade);
router.get('/class/:classId/:studentID/composition', getStudentGradeComposition);
router.get('/class/:classId/:studentId/overall', getStudentGrade);//

router.get('/class/grade/template', getTemplateAsGrade);
router.get('/class/sl/template', getTemplateStudentList);

router.get('/class/:classId/getAss', getAssignment);



// router.post('/addStock' , addStock);



module.exports = router;