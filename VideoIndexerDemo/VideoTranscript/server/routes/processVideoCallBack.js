var express = require('express');
var router = express.Router();
var https = require('https');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var VideoModel = require('../models/VideoFileModel');
const { uuid } = require('uuidv4');
var User = require('../models/User');
var nodemailer = require('nodemailer');

getUserEmailfromId = async(userId) => {
    var user = await User.findOne({_id:ObjectId(userId)});
    console.log(user.email);
    return user.email;
}

processVideoCallBack = async(videoId) => {
    return new Promise((resolve, reject) => {
        var apiUrl = process.env.VIDEO_INDEXER_API_URL;
        var postData = JSON.stringify({
            // "name":name,
            // "fileName":name,
            // "fileUrl":url
        });
        console.log(postData);
        var postOptions = {
            host: 'aipythonapi.azurewebsites.net',
            path:'/api/v1/vc/callback?id=' + videoId ,
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
                if (body !== null && body !== undefined) {
                var json = JSON.parse(body)
                resolve(json);
                }
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
async function wait(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
}

router.post('/', async function (req, res, next) {
    var videoreqId = req.body.videoId;
    console.log("videoId is" + videoreqId);
    await wait(540000);
    var result = await processVideoCallBack(videoreqId);
    if(!result.error && result !== undefined)
    {
        VideoModel.findOne({videoId:videoreqId}, async function(err, videoModel){
            if(videoModel){
                var userEmail = await getUserEmailfromId(videoModel.user);
                videoModel.captions = result.captions;
                videoModel.text = result.text;
                videoModel.descriptions = result.descriptions;
                videoModel.save(function(err) {
                    if (err) {
                        res.status(500)
                          .send("Error updating videoFileModel please try again. - " + err);
                      } else {
                          //sendEmailToAdmin(req.body.userVideoId, res);
                        //res.status(200).send("Video File Model updated successfully!");
                        let mailOptions = {
                            from: 'no-reply-AI@outlook.com',
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
                                user: 'no-reply-AI@outlook.com',
                                pass: 'AIAccessibility!'
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
    // console.log(result);
    // res.status(200).json({result: result});
    else{
        res.status(500).send("Error updating videoFileModel please try again.");
    }
});
module.exports = router;