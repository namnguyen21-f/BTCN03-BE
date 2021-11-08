const express = require("express");

const router = express.Router();
const {signin,signup} = require("../controller/auth");
const {createNewClass, getAllClass,getSpecificClass} = require("../controller/classroom");
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
router.get('/class/getAll' , getAllClass);
router.get('/class/:id' , getSpecificClass);

// router.post('/addStock' , addStock);



module.exports = router;