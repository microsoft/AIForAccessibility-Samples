var express = require('express');
var router = express.Router();
const User = require('../models/User');
router.get('/', function(req, res, next) {
    User.findOne({$or:[{"thirdPartyUserId":req.query.thirdPartyUserId}, {"email":req.query.email}]}, function(err, user) {
        if (err) throw err;
        console.log(req.query.thirdPartyUserId);
        res.json({user: user});
    });
});
module.exports = router;

//{userid: req.query.userid}