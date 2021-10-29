const express = require("express");

const router = express.Router();
const {signin,signup} = require("../controller/auth");
const {createNewClass, getAllClass} = require("../controller/classroom");
// const {addStock ,getStockList, getStockStatistic ,getStockProfit , getUserCurrentStock, getStockTransactionMonth} = require("../controller/stock");

router.post('/signin' , signin);
router.post('/signup' , signup);
router.post('/class/new' , createNewClass);
router.get('/class/getAll' , getAllClass);

// router.post('/addStock' , addStock);



module.exports = router;