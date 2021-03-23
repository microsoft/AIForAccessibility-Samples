var express = require('express');
var router = express.Router();
const VideoFileModel = require('../models/VideoFileModel');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
router.get('/', function(req, res, next) {
    var userId = req.query.UserId;
    var query = 
        {
            $or : 
            [
                {
                    $and:
                    [
                        { 
                            $or : 
                            [
                                {
                                    captions: 
                                    { 
                                        $ne:"WEBVTT\n\nNOTE\nlanguage:en-US\n\n" 
                                    }
                                }, 
                                {
                                    text: 
                                    { 
                                        $ne:{} 
                                    }
                                },
                                {
                                    descriptions: 
                                    { 
                                        $ne:{} 
                                    }
                                }
                            ]
                        }, 
                        { 
                            user:ObjectId(userId) 
                        }
                    ]
                },
                {
                    $and:
                    [
                        {
                            captions:
                            {
                                $ne:"WEBVTT\n\nNOTE\nlanguage:en-US\n\n"
                            }
                        } ,
                        {
                            text:
                            {
                                $ne:{}
                            }
                        },
                        {
                            descriptions:
                            {
                                $ne:{}
                            }
                        },
                        {
                            user:ObjectId(userId)
                        }
                    ]
                }
            ]
        };
        
    VideoFileModel.find(query, function(err, videos) {
        if (err) throw err;
        console.log(req.query.UserId);
        console.log(videos);
        res.json({videos: videos});
    });
});
module.exports = router;