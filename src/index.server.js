const express = require("express");
const app = express();
const env = require("dotenv");
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const fileUpload = require('express-fileupload');
var cors = require('cors')

//routers
const authRoutes = require('./routes/auth');
const bodyParser = require("body-parser");
//set up express applicaton
env.config();
app.use(cors()) // Use this after the variable declaration
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    createParentPath: true
}))


const uri = process.env.MONGODB_URI || "mongodb+srv://Admin:viH6ZogRwtSAW9tT@cluster0.mpci4.mongodb.net/Ecommerce?retryWrites=true&w=majority";
//|| 
//Database initialize
mongoose.connect(
    uri, 
    {
        useNewUrlParser: true, 
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    }).then(() => {
        console.log(process.env.DATABASE_URL);
        console.log(uri);
        console.log("Database Connected");
    })


app.use(function(req, res, next) {
    if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        jwt.verify(req.headers.authorization.split(' ')[1], 'RESTFULAPIs', function(err, decode) {
        if (err) req.user = undefined;
        req.user = decode;
        next();
        });
    } else {
        req.user = undefined;
        next(); 
    }
    });
    

app.get('/', (req,res,next) => {
})



app.use('/api', authRoutes);
// 
//
app.listen(process.env.PORT || 3000, () => {
    console.log("Server is running on port " + process.env.PORT)
})