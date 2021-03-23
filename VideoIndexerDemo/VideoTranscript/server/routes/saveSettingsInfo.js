var express = require('express');
var router = express.Router();
const User = require('../models/User');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
router.post('/', (req, res, next) => {
  console.log(req.body);
  console.log("user info" + req.body.userId);
  User.findOne({_id: ObjectId(req.body.userId)}, function(err, user) {
      console.log("User found");
      if(user){
        user.settingsValue = req.body.settingsValue;
        user.videoPlayModeSettings = req.body.playModeValue;
        user.save(function(err, savedThirdPartyUser){
            if(err){
              console.log(err);
              res.status(500).json({status:500, message:"Error saving settings info."})
            }else{
              res.status(200).json({status:200, message:"Settings info updated successfully", userInfo:savedThirdPartyUser})
            }
        });
    }
  })     
});
module.exports = router;