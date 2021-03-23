const mongoose = require('mongoose');

const VideoFileModelSchema = new mongoose.Schema({
    blobUrl: { type: String},
    name:{ type: String},
    speechModel:{type:mongoose.Schema.Types.ObjectId, ref:"SpeechModel"},
    videoId: { type: String},
    user: {type:mongoose.Schema.Types.ObjectId, ref:"User"},
    captions:{type:String, default:"WEBVTT\n\nNOTE\nlanguage:en-US\n\n"},
    text:{type:mongoose.Schema.Types.Mixed, default: {}},
    descriptions:{type:mongoose.Schema.Types.Mixed, default: {}},
    date: {type: Date, default:Date.now}
}, { minimize: false });

module.exports = mongoose.model('VideoFileModel', VideoFileModelSchema);