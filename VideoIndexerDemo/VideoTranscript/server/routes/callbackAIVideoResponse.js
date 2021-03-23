var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
const mongoose = require('mongoose');
var User = require('../models/User');
var VideoFileModel = require('../models/VideoFileModel');
const ObjectId = mongoose.Types.ObjectId;
var nodemailer = require('nodemailer');

getUserEmailfromId = async(userId) => {
    var user = await User.findOne({_id:ObjectId(userId)});
    console.log(user.email);
    return user.email;
}

router.post('/', async function(req, res, next) {
    console.log("recevied response from cvs.");
    console.log("Response body :" + res.body);
    console.log("Request body: " + JSON.stringify(req.body));
    console.log("Req hostname: " + req.hostname);
    console.log("Req content length: " + req.headers["content-length"]);
    console.log("Req content type: " + req.headers["content-type"]);
    var data = req.body.data;
    if(data !== null && data !== undefined && !data.error){
        var videoFileId = data.id;
        VideoFileModel.findOne({_id: ObjectId(videoFileId)}, function(err,videoFile){
            if(videoFile !== null && videoFile !== undefined) {
            //userVideo.cvsJobStatus = data.attributes.status;
            var userEmail = await getUserEmailfromId(videoFile.user);
            videoFile.captions = data.captions;
            videoFile.text = data.text;
            videoFile.descriptions = data.descriptions;
            videoFile.save(function(err){
                if(err){
                    res.status(200).send(err);
                }else{
                    //res.status(200);
                    let mailOptions = {
                        from: 'no-reply-AIAccessibility@outlook.com',
                        to: userEmail,
                        subject: 'AI - Uploaded video has been processed successfully!',
                        html: '<h4><b>Result</b></h4>' +
                        '<p>To view the result, follow this link:</p>' +
                        '<a href=' + process.env.CLIENT_PROD_URL + '/videoList> Videos List </a>' +
                        '<br><br>' +
                        '<p>--Team AI for Accessibility</p>'
                    }
                    var transporter = nodemailer.createTransport({
                        // host: "smtp.office365.com", // Office 365 server
                        // port:587,
                        // requireTLS:true,
                        // tls: {
                        //     ciphers:'SSLv3'
                        //     },
                        // secureConnection: false, // false for TLS - as a boolean not string - but the default is false so just remove this completely
                        // auth: {
                        //     user: 'xxxxxxxxxx',
                        //     pass: 'xxxxxxxxxx'
                        // }
                        service: 'Outlook',
                        auth: {
                            user: '',
                            pass: ''
                         }
                       });
    
                       transporter.verify(function(error, success) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Server is ready to take our messages');
                        }
                    });
                    
                       transporter.sendMail(mailOptions, function (err, info) {
                        if(err){
                            console.log(err);
                            res.json({status:500, message: "Error sending mail: " + err});
                        }
                        else{
                            // res.status(200)
                            // .send("Password reset mail sent successfully.");
                            res.json({status:200, message: "Password reset mail sent successfully."});
                        }
                     });
                }
            });
        }
        });
    }
    res.status(200).send("Callback AI video response received");
 });

module.exports = router;