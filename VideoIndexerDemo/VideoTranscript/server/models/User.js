const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  thirdPartyUserId:{type:String},
  email: { type: String},
  fullName: {type: String},
  verified:{type:Boolean, default:false},
  settingsValue:{type: String, default:"Text"},
  videoPlayModeSettings:{type: String, default:"interactive"}
});

module.exports = mongoose.model('User', UserSchema);