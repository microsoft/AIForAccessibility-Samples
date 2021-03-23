var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var VideoFileModel = require('../models/VideoFileModel');
var SpeechModel = require('../models/SpeechModel');
var User = require('../models/User');
var https = require('https');
const multer = require("multer");
const inMemoryStorage = multer.memoryStorage();
const uploadStrategy = multer({storage: inMemoryStorage });
const azureStorage = require('azure-storage');
const blobService = azureStorage.createBlobService();
const getStream = require('into-stream');
var fs = require('fs');
const containerName = 'videofiles';
const hostName = 'https://aiaccessibility.blob.core.windows.net';
const getBlobName = originalName => {
    const identifier = Math.random().toString().replace(/0\./, ''); // remove "0." from start of string
    return `${identifier}-${originalName}`;
};

addNewVideoFile = async (videoName, user, blobUrl, videoId, speechModelId) => {
    return new Promise((resolve, reject) => {
    var videoModel = new VideoFileModel(
        {
            blobUrl: blobUrl,
            user: user._id,
            name:videoName,
            videoId:videoId,
            speechModel:speechModelId
        });
        console.log(videoModel);
        videoModel.save(function(err) {
        if (err) {
                reject(err);
        }
            resolve("success");
    })
    });
}

submitVideoContent = async(url, languageModelId, name) => {
    return new Promise((resolve, reject) => {
        var apiUrl = process.env.VIDEO_INDEXER_API_URL;
        //pass externalId - which is saved entry id and will be returned to callback method
        var postData = JSON.stringify({
            "name":name,
            "url":url,
            "languageModelId":languageModelId
        });
        console.log(postData);
        var postOptions = {
            host: 'aipythonapi.azurewebsites.net',
            path:'/api/v1/vc',
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

getUser = async(userId) =>{
    var user = await User.findOne({_id: ObjectId(userId)});
    return user;
}

getLanguageModelId = async(speechModelId) => {
    var speechModel = await SpeechModel.findOne({_id:ObjectId(speechModelId)});
    console.log(speechModel.languageModelId);
    if(speechModel !== null){
    return speechModel.languageModelId;
    }else{
        return "";
    }
}

router.post('/', uploadStrategy.single('file'), async (req, res, next) => {
    console.log("Video File Upload Router");
    console.log(req.file);
    console.log(req.body);
    console.log("SpeechModelId" + req.body.speechModelId);
    const
          blobName = getBlobName(req.body.fileName)
        , stream = getStream(req.file.buffer)
        , streamLength = req.file.buffer.length
    ;
    var user = await getUser(req.body.userId);
    //hard-coded req.body.speechModelId value - we can make it to null if Standard option is selected in UI
    if(req.body.speechModelId !== "5fa97a5276d0991f842afd0e"){
    var speechModelLanguageId = await getLanguageModelId(req.body.speechModelId);
    }else{
        speechModelLanguageId === "";
    }
    //User.findOne({_id: ObjectId(req.body.userid)}, function(err, user){
    console.log("user is: " + user);
    console.log("Speech Model File Upload Router");
    if (user) {
        blobService.createBlockBlobFromStream(containerName, blobName, stream, streamLength, async err => {
            if(err) {
                console.log(err);
                return;
            }
    
        const blobUrl = blobService.getUrl(containerName, blobName, null, hostName);
        var videoSubmitResponse = await submitVideoContent(blobUrl, speechModelLanguageId, req.body.fileName);

        if(!videoSubmitResponse.error){
            var result = await addNewVideoFile(req.body.fileName, user,blobUrl, videoSubmitResponse.videoId, req.body.speechModelId);
            if(result === "success"){
                //getJobStatus(verifyResponse.jobId);
                res.status(200).json({result:true, message:"Your video is being uploaded and will then be processed. We will send you an email when it is ready", blobURL:blobUrl, videoId:videoSubmitResponse.videoId});
            }else{
                res.status(500).json({result:false, message:"error: " + result});
            }
        }else{
            res.status(500).json({result:false, message:verifyResponse.message});
        }
    }); 
    }
    //})
})

module.exports = router;