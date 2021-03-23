//if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
  //}
  const mongoose = require('mongoose');
  var express = require("express");
  var path = require('path');
  var logger = require('morgan');
  var cookieParser = require('cookie-parser');
  const cors = require('cors');
  var createError = require('http-errors');
  // mongodb://ai-accessibility:19DqsXhcgkgAO1e159WlaajBSb7xy8vHrRs424F2G2tCnfA8iCyvPf8CCuG9PgV4b4K7mL79JnEt4Jv9ur8gZQ==@ai-accessibility.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@ai-accessibility@
  // mongoose.connect("mongodb://"+process.env.COSMOSDB_HOST+":"+process.env.COSMOSDB_PORT+"/"+process.env.COSMOSDB_DBNAME+"?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=ai-accessibility", { 
  // mongoose.connect("mongodb://ai-accessibility.mongo.cosmos.azure.com:10255/ai_videos?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=ai-accessibility", {   
  // auth: {
  //     user: process.env.COSMOSDB_USER,
  //     password: process.env.COSMOSDB_PASSWORD
  //   } 
  // }, function(err) {
  //   if (err) {
  //     throw err;
  //   } else {
  //     //console.log(`Successfully connected to ${mongo_uri}`);
  //   }
  // });

  //var connString1="mongodb://ai-accessibility:19DqsXhcgkgAO1e159WlaajBSb7xy8vHrRs424F2G2tCnfA8iCyvPf8CCuG9PgV4b4K7mL79JnEt4Jv9ur8gZQ==@ai-accessibility.mongo.cosmos.azure.com:10255/ai_videos?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@ai-accessibility@"
  var connString1=process.env.COSMOSDB_CONNECTION_STRING;
  //var connString="mongodb://ai-accessibility123:iKOd4kHGon7ZpBBh44wswTfxP3UgYIZ7saFy8n95lvUAwDyAkgLzVTqXPR1ppxLkOIIjapEkTsY3GmkhlS3rUQ==@ai-accessibility123.mongo.cosmos.azure.com:10255/ai_videos?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@ai-accessibility123@"
  mongoose.connect(connString1, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    auth: {
    user: process.env.COSMOSDB_USER,
    password: process.env.COSMOSDB_PASSWORD
    }
    })
    .then(() => console.log('Connection to CosmosDB successful'))
    .catch((err) => console.error(err));
//   mongoose.connect("mongodb://"+process.env.COSMOSDB_HOST+":"+process.env.COSMOSDB_PORT+"/"+process.env.COSMOSDB_DBNAME+"?ssl=true&replicaSet=globaldb", {
//   auth: {
//     user: process.env.COSMODDB_USER,
//     password: process.env.COSMOSDB_PASSWORD
//   },
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   retryWrites: false
// })
// .then(() => console.log('Connection to CosmosDB successful'))
// .catch((err) => console.error(err));

  // const mongo_uri = process.env.MONGO_DB_URL + process.env.DATABASE;
  
  // mongoose.connect(mongo_uri, { useNewUrlParser: true }, function(err) {
  //   if (err) {
  //     throw err;
  //   } else {
  //     //console.log(`Successfully connected to ${mongo_uri}`);
  //   }
  // });
  
  // const bodyParser = require("body-parser");
  var app = express();
  app.use(cookieParser());
  //app.use(cors());
  app.use(cors({credentials: true, origin: true}));
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');
  var bodyParser = require('body-parser');
  app.use(bodyParser.json({limit: '50mb'}));
  app.use(bodyParser.json({ type: 'application/*+json' }));
  app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
  
  //const port = process.env.PORT || 3001;
  app.use(logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(express.static(path.join(__dirname, 'public')));
  
  
  var indexRouter = require('./routes/index');
  var verifyThirdPartyRouter = require('./routes/verifyThirdPartyUser');
  var saveUserRouter = require('./routes/saveUser');
  var getUserRouter = require('./routes/getUser');
  var speechModelsUploadRouter = require('./routes/speechModelFileUpload');
  var videoFileUploadRouter = require('./routes/videoFileUploadtoBlob');
  var trainCustomSpeech = require('./routes/trainCustomSpeech');
  var getAllSpeechModelsRouter = require('./routes/getAllSpeechModels');
  var processVideoCallBackRouter = require('./routes/processVideoCallBack');
  var getVideosRouter = require('./routes/getVideos');
  var getSettingsInfo = require('./routes/saveSettingsInfo');
  var getSpeechFromText = require('./routes/callTextToSpeechApi');
  
  app.use('/', indexRouter);
  app.use('/verifyThirdParty', verifyThirdPartyRouter);
  app.use('/saveUser', saveUserRouter);
  app.use('/getUser', getUserRouter);
  app.use('/speechModelFileUpload', speechModelsUploadRouter);
  app.use('/videoFileUploadtoBlob', videoFileUploadRouter);
  app.use('/trainCustomSpeech', trainCustomSpeech );
  app.use('/getAllSpeechModels', getAllSpeechModelsRouter);
  app.use('/processVideoCallBack', processVideoCallBackRouter);
  app.use('/getVideos', getVideosRouter);
  app.use('/saveSettingsInfo', getSettingsInfo);
  app.use('/getSpeechFromText', getSpeechFromText);
  
  
  app.use(function(req, res, next) {
    // res.header("Access-Control-Allow-Origin", "*");
    // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next(createError(404));
  });
  
  
  app.use(function(err, req, res, next) {
    // set locals, only providing error in developmenta
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });
  
  //app.listen(3101, () => console.log(`Listening on port 3101`));
  module.exports = app;