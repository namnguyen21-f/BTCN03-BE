const express = require("express");

const router = express.Router();

const {createNewClass, getAllClass,getSpecificClass , generateLink, decodeLink
        , sendInvitationLink,readInvitationLink, joininClass, getClassAtendance, classDetail} = require("../controller/classroom");
const {signin,signup, facebookLogin, googleLogin, manageProfile} = require("../controller/auth");


// const {addStock ,getStockList, getStockStatistic ,getStockProfit , getUserCurrentStock, getStockTransactionMonth} = require("../controller/stock");

function atc (req,res){
    console.log(req.user)
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
router.post('/class/new' , createNewClass);
router.post('/class/:id/getClassAte' , getClassAtendance);
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

// router.post('/addStock' , addStock);



module.exports = router;