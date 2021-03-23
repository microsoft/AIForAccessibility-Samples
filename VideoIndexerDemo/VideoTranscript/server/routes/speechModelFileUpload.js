var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
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
const containerName = 'speechmodelfiles';
const hostName = 'https://aiaccessibility.blob.core.windows.net';
const getBlobName = originalName => {
    const identifier = Math.random().toString().replace(/0\./, ''); // remove "0." from start of string
    return `${identifier}-${originalName}`;
};

addNewSpeechModelFile = async (fileName, modelName, user, blobUrl) => {
    return new Promise((resolve, reject) => {
    var speechModel = new SpeechModel(
        {
            blobUrl: blobUrl,
            user: user._id,
            name:fileName,
            modelName:modelName,
            languageModelId:"test"
        });
        console.log(speechModel);
    speechModel.save(function(err) {
        if (err) {
            reject({status:false, message: err});
            //reject({err})
        }
    resolve({status: true, speechFileModel: speechModel});
    //resolve("success")
    })
    });
}

getUser = async(userId) =>{
    var user = await User.findOne({_id: ObjectId(userId)});
    return user;
}

router.post('/', uploadStrategy.single('file'), async (req, res, next) => {
    console.log("Speech Model File Upload Router");
    console.log(req.file);
    console.log(req.body);
    const
          blobName = getBlobName(req.body.fileName)
        , stream = getStream(req.file.buffer)
        , streamLength = req.file.buffer.length
    ;
    var user = await getUser(req.body.userId);
    //User.findOne({_id: ObjectId(req.body.userid)}, function(err, user){
    console.log("user is: " + user);
    console.log("Speech Model File Upload Router");
    if (user) {
        blobService.createBlockBlobFromStream(containerName, blobName, stream, streamLength,err => {
            if(err) {
                console.log(err);
                return;
            }
        });
    
        const blobUrl = blobService.getUrl(containerName, blobName, null, hostName);

        var result = await addNewSpeechModelFile(req.body.fileName, req.body.modelName, user,blobUrl);
        console.log("Result for add new" + result);
        if(result.status){
           res.status(200).json({result:true, message:"Your file has been uploaded and a speech model is being trained. Once the training is complete, you will see the model listed on the video upload page", speechModel:result.speechFileModel});
           //res.status(200).json({result:true, message:"File uploaded successfully"});
        }else{
            res.status(500).json({result:false, message:"error: " + result});
        }
        
    }
    //})
})

module.exports = router;