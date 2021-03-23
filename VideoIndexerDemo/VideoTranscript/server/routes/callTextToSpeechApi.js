var express = require('express');
var router = express.Router();
var https = require('https');
var fs = require('fs');
const { v4: uuidv4 } = require('uuid');

getAccessToken = async() => {
    return new Promise((resolve, reject) => {
        var postOptions = {
            host: 'westus2.api.cognitive.microsoft.com',
            path:'/sts/v1.0/issueToken',
            method:'POST',
            port:443,
            headers: {
                'Ocp-Apim-Subscription-Key': 'f4e164edba134618b7fff7323dd69e92'
                }
        }
        var req = https.request(postOptions, (res) => {
            var body = '';
            res.on('data', function (chunk) {
                body = body + chunk;
            });
            res.on('end', function(){
                console.log(body);
                resolve(body);
            });
            res.on('error', (error) => {
                reject({status:false, message: error.message});
            });
        });
        req.on('error', (e) => {
            reject(`problem with request: ${e.message}`);
          });
        req.write('');
        req.end();  
    });
}

textToSpeech = async(accessToken, text, fileName) => {
    return new Promise((resolve, reject) => {
        console.log(accessToken);
        console.log(text);
        text = text.replace('\n', '');
        var postData = "<speak version='1.0' xml:lang='en-US'><voice xml:lang='en-US' xml:gender='Female' name='en-US-AriaNeural'>" + text + "</voice></speak>";
        console.log(postData);
        var postOptions = {
            host: 'westus2.tts.speech.microsoft.com',
            path:'/cognitiveservices/v1',
            method:'POST',
            port:443,
            headers: {
                'X-Microsoft-OutputFormat': 'audio-16khz-64kbitrate-mono-mp3',
                'Content-Type': 'application/ssml+xml',
                'Authorization': 'Bearer ' + accessToken,
                'User-Agent': 'NeuralTTSAPI'
                }
        }
        console.log(postOptions);
        var audioStream = fs.createWriteStream(fileName);
        var req = https.request(postOptions, (res) => {
            // console.log(res);
            res.pipe(audioStream);
            audioStream.on('finish', function() {
                audioStream.close();
                console.log('audio stream closed!');
                resolve(audioStream);
            });
        });
        req.on('error', (e) => {
            fs.unlink(fileName);
            reject(`problem with request: ${e.message}`);
          });
        req.write(postData);
        req.end();  
    });
}

router.post('/', async (req, res, next) => {
    var text = req.body.text;
    console.log(text);
    var accessToken = await getAccessToken();
    var fileName = uuidv4() + '.mp3';
    var audioData = await textToSpeech(accessToken, text, fileName);
    console.log(audioData);
    res.header({
        'Content-Disposition': 'attachment; filename=' + fileName
    }).status(200).download(fileName);
});
module.exports = router;
