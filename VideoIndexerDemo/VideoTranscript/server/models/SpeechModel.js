const mongoose = require('mongoose');

const SpeechModelSchema = new mongoose.Schema({
    blobUrl: { type: String},
    name:{ type: String},
    modelName:{ type:String },
    languageModelId: { type: String},
    user: {type:mongoose.Schema.Types.ObjectId, ref:"User"},
    date: {type: Date, default:Date.now}
});

module.exports = mongoose.model('SpeechModel', SpeechModelSchema);