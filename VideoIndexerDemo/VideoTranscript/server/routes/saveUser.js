var express = require('express');
var router = express.Router();
const User = require('../models/User');
router.post('/', (req, res, next) => {
  console.log(req.body);
  User.findOne({thirdPartyUserId: req.body.thirdPartyUserId}, function(err, user) {
      if(user){
        res.status(500).json({status:500, message: "User with this id already exists in the system."});
      }else{
        const newUser = new User({
            thirdPartyUserId:req.body.thirdPartyUserId,
            email:req.body.email,
            accountType:req.body.accountType,
            token:req.body.token,
            fullName:req.body.userName
        });
        newUser.save(function(err, savedThirdPartyUser){
            if(err){
              console.log(err);
              res.status(500).json({status:500, message:"Error saving third party user."})
            }else{
              res.status(200).json({status:200, userCreated:true, email:savedThirdPartyUser.email, userId:savedThirdPartyUser._id, settingsValue:savedThirdPartyUser.settingsValue, userObject:savedThirdPartyUser, message:"Third party user successfully saved."})
            }
        });
    }
  })     
});
module.exports = router;