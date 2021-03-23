var express = require('express');
var router = express.Router();
const SpeechModels = require('../models/SpeechModel');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
router.get('/', function(req, res, next) {
    console.log("userId" + req.query.userId);
    SpeechModels.find({user:ObjectId(req.query.userId)}, function(err, speechModels) {
        if (err){
            res.status(500).json({message:"Unable to retreive record- " + err});
        }
        res.status(200).json({speechModels: speechModels});
    });
});
module.exports = router;