var express = require('express');
var router = express.Router();
var https = require('https');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var SpeechModel = require('../models/SpeechModel');
const { uuid } = require('uuidv4');

trainCustomSpeech = async(modelName, fileName, url) => {
    return new Promise((resolve, reject) => {
        var apiUrl = process.env.VIDEO_INDEXER_API_URL;
        var postData = JSON.stringify({
            "name":modelName,
            "fileName":fileName,
            "fileUrl":url
        });
        console.log(postData);
        var postOptions = {
            host: 'aipythonapi.azurewebsites.net',
            path:'/api/v1/customspeech',
            method:'POST',
            port:443,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': postData.length
                }
        }
        var req = https.request(postOptions, (res) => {
            var body = '';
            res.on('data', function (chunk) {
                body = body + chunk;
            });
            res.on('end', function(){
                console.log(body);
                var json = JSON.parse(body)
                resolve(json);
            });
            res.on('error', (error) => {
                reject({status:false, message: error.message});
            });
        });
        req.on('error', (e) => {
            reject(`problem with request: ${e.message}`);
          });
        req.write(postData);
        req.end();  
    });
}

router.post('/', async (req, res, next) => {
    var modelName = req.body.modelName;
    var fileName = req.body.fileName;
    var fileUrl = req.body.fileUrl;
    var speechFileId = req.body.speechFileId;
    console.log(req.body);
    var result = await trainCustomSpeech(modelName, fileName, fileUrl);
    if(!result.error)
    {
        SpeechModel.findOne({_id:ObjectId(speechFileId)}, function(err, speechModel){
            if(speechModel){
                speechModel.languageModelId = result.languageModelId;
                speechModel.save(function(err) {
                    if (err) {
                        res.status(500)
                          .send("Error updating speechModel please try again. - " + err);
                      } else {
                          //sendEmailToAdmin(req.body.userVideoId, res);
                        res.status(200).send("SpeechModel updated successfully!");
                      }
                    });
            }
        });
    }
    // console.log(result);
    // res.status(200).json({result: result});
    else{
        res.status(500).send("Error updating speechModel please try again.");
    }
});
module.exports = router;