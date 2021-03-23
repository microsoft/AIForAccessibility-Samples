var express = require('express');
var router = express.Router();
const User = require('../models/User');
router.post('/', (req, res, next) => {
  console.log(req.body);
    User.findOne({thirdPartyUserId: req.body.thirdPartyUserId}, function(err, user) {
      if(user){
        res.status(200).json({status:200, userExists:true, email:user.email, userId:user._id, uniqueId:user.thirdPartyUserId, userLevel:user.level, userName:user.fullName, settingsValue: user.settingsValue, userObject: user, message: "Third party user exists in the system."});
      }else{
        User.findOne({email: req.body.email}, function(err, userInfo) {
          if(userInfo){
            res.status(200).json({status:200, userExists:true, email:userInfo.email, userId:userInfo._id, uniqueId:userInfo.thirdPartyUserId, userLevel:userInfo.level, userName:userInfo.fullName, settingsValue: user.settingsValue, userObject: user, message: "Third party user exists in the system."});
          }else{
            res.status(200).json({status:200, userExists:false, message: "Third party user does not exists in the system."});
          }
        })
        //res.status(200).json({status:200, userExists:false, message: "Third party user does not exists in the system."});
    }
  })     
});
module.exports = router;