import React, { Component } from "react";
import ApiClient from "./ApiClient";
import { Row, Col } from 'reactstrap';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import AriaModal from 'react-aria-modal';
//import VideoThumbnail from 'react-video-thumbnail';
import moment from 'moment';
import ReactHtmlParser from 'react-html-parser';

class VideoListing extends Component {
    constructor(props){
        super(props);
        this.apiClient = new ApiClient();
        this.state = {
            videos: [],
            currentVideo: null,
            openVideoModal : false,
            openDescriptionModal : false,
            currentVideoUrl : "",
            currentVideoText : null,
            currentVideoDescriptions : null,
            currentVideoCaptions : "",
            currentFrameDescription : "",
            show: false,
            settingsValue:this.props.settingsValue,
            interactiveMode:this.props.playModeValue === "interactive" ? true: false,
            lastSpeechTime:''
        }
        this.previousTtsTime = '';
        this.videoPlayer = null;
        this.video = null;
        this.keys = [];
        this.style = {
            light: "ffffff"
        };
        this.handleClose = this.handleClose.bind(this);
        this.handleShow = this.handleShow.bind(this);
        this.ping = new Audio("aiaccessibility_ping.mp3");
    }

    video = {
        width: "100%",
        position: "relative",
        display: "block",
        margin: "0 auto"
    }
    margin = {
        margin: "15px 0 0 20px"
    }

    loginMsgStyling={
        marginTop: "15px",
        fontSize: "18px",
        fontWeight: "bold"
    }
    setStateAsync(state) {
        return new Promise((resolve) => {
          this.setState(state, resolve)
        });
      }

    toggleVideoPopup = (event) => {
        event.preventDefault();
        this.setState(prevState => ({
            openVideoModal: !prevState.openVideoModal
        }));
    }

    toggleDescriptionPopup = (event) => {
        event.preventDefault();
        this.setState(prevState => ({
            openDescriptionModal: !prevState.openDescriptionModal
        }));
       
    }
    onPlayVideo = (video) => {
        this.setState({currentVideoUrl : video.blobUrl, currentVideoText : video.text, currentVideoCaptions : video.captions, currentVideoDescriptions : video.descriptions, show: true});
       
    }

    handleClose() {
        this.setState({show:false});
        if(!this.state.interactiveMode){
        window.audio.pause();
        }
    }

    handleShow() {
        this.setState({show:true});
    }

    getApplicationNode = () => {
        return document.getElementById('root');
      };

    downloadTxtFile = (video) => {
        //const videoText = JSON.stringify(video.text);
        var downloadText = "";
        var videoText = this.convertToSRT(video.text);
        var videoDescriptions = this.convertToSRTDesc(video.descriptions);
        if (videoText !== ""){
             videoText = "Text Descriptions \n\n" + videoText;
        }
        if (videoDescriptions !== ""){
             videoDescriptions = "Image Descriptions \n\n" + videoDescriptions;
        }
        if (this.state.settingsValue === "Text" && videoText !== "") {
            downloadText = videoText;
        }else if (this.state.settingsValue === "Description" && videoDescriptions !== "") {
            downloadText = videoDescriptions;
        }else if (this.state.settingsValue === "both") {
            downloadText = videoText + "\n\n" + videoDescriptions;
        }else {
            downloadText = videoText + "\n\n" + videoDescriptions;
        }
        //const downloadText = videoText + "\n\n" + videoDescriptions;
        const videoName = video.name.slice(0, -4) + ".txt";
        const element = document.createElement("a");
        const file = new Blob([downloadText],    
                    {type: 'text/plain;charset=utf-8'});
        element.href = URL.createObjectURL(file);
        element.download = videoName;
        document.body.appendChild(element);
        element.click();
    }

    downloadCaptionsFile = (video) => {
        // const videoCaptions = "WEBVTT\n\n" +  video.captions;
        const videoCaptions = video.captions;
        const videoName = video.name.slice(0, -4) + ".vtt";
        const element = document.createElement("a");
        const file = new Blob([videoCaptions],    
                    {type: 'text/vtt;charset=utf-8'});
        element.href = URL.createObjectURL(file);
        element.download = videoName;
        document.body.appendChild(element);
        element.click();
    }
    async componentDidMount(){
        var json = await this.apiClient.getJSON("/getVideos", "?UserId="+this.props.UserId);
        await this.setStateAsync({videos: json.videos});
        if(this.state.interactiveMode){
        document.addEventListener("keydown", this.describeVideo, false);
        document.addEventListener("keyup", function (e) {
            this.keys = (this.keys || []);
            this.keys[e.keyCode]=false;
            //stop();
        }, false);
        }
    }

    async componentWillReceiveProps(props){
       if(props.UserId !== "") {
        this.setState({settingsValue: props.settingsValue});
        var interactiveModeValue = props.playModeValue === "interactive" ? true:false;
        var json = await this.apiClient.getJSON("/getVideos", "?UserId="+props.UserId);
        //await this.setStateAsync({videos: json.videos});
        await this.setStateAsync({videos: json.videos, interactiveMode:interactiveModeValue});
        if(interactiveModeValue){
        document.addEventListener("keydown", this.describeVideo, false);
        document.addEventListener("keyup", function (e) {
            this.keys = (this.keys || []);
            this.keys[e.keyCode]=false;
            //stop();
        }, false);
        }
       }
    }
    onOpened = (event) => {
        this.setState({openDescriptionModal:false, currentFrameDescription:""});
       // this.videoPlayer.addEventListener("onLoadedData", function() {
           var source = event.target || event.srcElement;
           var track = document.createElement("track");
           track.kind = "captions";
           track.label = "English";
           track.srclang = "en";
           var vid = this;
           track.addEventListener("load", function() {
             this.mode = "showing";
             source.textTracks[0].mode = "showing";
           });
           //var vttText = "WEBVTT\n\n" +  this.state.currentVideoCaptions;
           var vttText = this.state.currentVideoCaptions;
           var vttBlob = new Blob([vttText], {
             type: 'text/vtt'
           });
           track.src = URL.createObjectURL(vttBlob);
           source.appendChild(track);
           source.focus();
         //});
   }
   playSpeechFromText = async(text) => {
        var audioData = await this.apiClient.post('/getSpeechFromText', JSON.stringify({text:text}));
        audioData.blob().then((value) => {
            var url = window.URL.createObjectURL(value)
            window.audio = new Audio();
            window.audio.src = url;
            window.audio.play();
            var me = this;
            window.audio.onended = function(){
                if(me.videoPlayer){
                    me.videoPlayer.play();
                }
            }
        });
   }
//    readAudioDataFromStream = (reader, data) => {
//     reader.read().then((result) => {
//         if(result.done){
//             var blob = new Blob([data], { type: 'audio/mpeg' });
//             var url = window.URL.createObjectURL(blob)
//             window.audio = new Audio();
//             window.audio.src = url;
//             window.audio.play();
//         }else{
//             data += result.value;
//             this.readAudioDataFromStream(reader, data);
//         }
//       });
//    }

   describeVideo = (event) => {
        var key1 = 16;
        var key2 = 17;
        var key3 = 18;
        var frameDescription = "";
        var description = "";
        this.keys = (this.keys || []);
        this.keys[event.keyCode]=true;
        if(this.keys[key1] && this.keys[key2] && this.keys[key3]){
            this.videoPlayer.pause();
            var currentTimeInSeconds = this.videoPlayer.currentTime;
            var currentTimeInHours;
            if (parseInt(currentTimeInSeconds)/60>=1) {
                var h = Math.floor(currentTimeInSeconds / 3600);
                currentTimeInSeconds = currentTimeInSeconds - h * 3600;               
                var m = Math.floor(currentTimeInSeconds / 60);
                var s = Math.floor(currentTimeInSeconds % 60);
                if(h.toString().length<2){h='0'+h;}
                if(m.toString().length<2){m='0'+m;}
                if(s.toString().length<2){s='0'+s;}
                currentTimeInHours = h+':'+m+':'+s;
            } else {
                var m = Math.floor(currentTimeInSeconds / 60);
                var s = Math.floor(currentTimeInSeconds % 60);
                if(m.toString().length<2){m='0'+m;}
                if(s.toString().length<2){s='0'+s;}
                currentTimeInHours = '00:'+m+':'+s
            }
            var currentTime = moment(currentTimeInHours, "hh:mm:ss");
            var previousIntervalText = "";
            var previousIntervalDescription = "";
            var descriptionsList = this.state.currentVideoDescriptions;
            if(this.state.settingsValue !== "Text") {
            if(JSON.stringify(descriptionsList) !== '{}') {
                //if(descriptionsList !== undefined) {
            var sortedDescList = descriptionsList.sort((a,b) => {
                var sourceStartTime = moment(a.startTime, "hh:mm:ss");
                var destStartTime = moment(b.startTime, "hh:mm:ss");
                if(sourceStartTime.isAfter(destStartTime))
                {
                    return 1;
                }
                if(destStartTime.isAfter(sourceStartTime))
                {
                    return -1;
                }
                return 0;
            }) 
            var desc = sortedDescList.filter((value, index) => {
                var startTime = moment(value.startTime, "hh:mm:ss");
                var endTime = moment(value.endTime, "hh:mm:ss");
                if(currentTime.isBetween(startTime, endTime, undefined, [])){
                    return true;
                }else{
                    if(currentTime.isAfter(startTime)){
                        var descResults = [];
                        if(value && value.description && typeof value.description === "string"){
                            descResults.push(value.description.replace(/(?:\r\n|\r|\n)/g, '<br aria-hidden="true"/>'));
                        }else {
                            value.description.forEach((item, index) => {
                                item.forEach((txt, i) => {
                                    descResults.push(txt.replace(/(?:\r\n|\r|\n)/g, '<br aria-hidden="true"/>'));
                                });
                            });
                        }
                        
                        previousIntervalDescription = descResults.join('');
                        return false;
                    }else{
                        return false;
                    }
                }
            });
            if(desc.length > 0){
                var currentDescResults = [];
                if(desc[0].description && typeof desc[0].description === "string"){
                    currentDescResults.push(desc[0].description.replace(/(?:\r\n|\r|\n)/g, '<br aria-hidden="true"/>'));
                }else {
                    desc[0].description.forEach((item, index) => {
                        if(typeof item === "string"){
                            currentDescResults.push(item.replace(/(?:\r\n|\r|\n)/g, '<br aria-hidden="true"/>'));
                        }else {
                            item.forEach((txt, i) => {
                                currentDescResults.push(txt.replace(/(?:\r\n|\r|\n)/g, '<br aria-hidden="true"/>'));
                        });
                    }
                });
            }
            var currentIntervalDesc = currentDescResults.join('');
                frameDescription = "Image description <br aria-hidden='true'/>" + currentIntervalDesc;
            }else{
                frameDescription =  "Image description <br aria-hidden='true'/> No description at this interval.<br>" + previousIntervalDescription;
            }
            //}
        }
    }
            var textList = this.state.currentVideoText;
            if(this.state.settingsValue !== "Description"){
            if(JSON.stringify(textList) !== '{}') {
                var sortedTextList = textList.sort((a,b) => {
                var sourceStartTime = moment(a.startTime, "hh:mm:ss");
                var destStartTime = moment(b.startTime, "hh:mm:ss");
                if(sourceStartTime.isAfter(destStartTime)) {
                    return 1;
                }
                if(destStartTime.isAfter(sourceStartTime)) {
                    return -1;
                }
                return 0;
            }) 
            var text = sortedTextList.filter((value, index) => {
                var startTime = moment(value.startTime, "hh:mm:ss");
                var endTime = moment(value.endTime, "hh:mm:ss");
                if(currentTime.isBetween(startTime, endTime, undefined, [])){
                    return true;
                }else{
                    if(currentTime.isAfter(startTime)){
                        var results = [];
                        if(value && value.results && typeof value.results === "string"){
                            results.push(value.results.replace(/(?:\r\n|\r|\n)/g, '<br aria-hidden="true"/>'));
                        }else {
                            value.results.forEach((item, index) => {
                                item.forEach((txt, i) => {
                                    results.push(txt.replace(/(?:\r\n|\r|\n)/g, '<br aria-hidden="true"/>'));
                                });
                            });
                        }
                        previousIntervalText = results.join('');
                        return false;
                    }else{
                        return false;
                    }
                }
            });
            if(text.length > 0){
                var currentResults = [];
                if(text[0].results && typeof text[0].results === "string"){
                    currentResults.push(text[0].results.replace(/(?:\r\n|\r|\n)/g, '<br aria-hidden="true">'));
                }else {
                    text[0].results.forEach((item, index) => {
                        if(typeof item === "string"){
                            currentResults.push(item.replace(/(?:\r\n|\r|\n)/g, '<br aria-hidden="true">'));
                        }else {
                            item.forEach((txt, i) => {
                                currentResults.push(txt.replace(/(?:\r\n|\r|\n)/g, '<br aria-hidden="true">'));
                            });
                        }
                    });
                }
                var currentIntervalText = currentResults.join('');
                description = "Text Description <br aria-hidden='true'/>" + currentIntervalText;
            }else{
                description =  "Text Description <br aria-hidden='true'/> No text at this interval.<br>" + previousIntervalText;
            }
            //description = description + '<br>' + frameDescription;
        }
    }
            if (this.state.settingsValue === "Text") {
                description = description;
            }else if (this.state.settingsValue === "Description") {
                description = frameDescription;
            }else if (this.state.settingsValue === "both") {
                description = description + '<br aria-hidden="true"/><br>' + frameDescription;
            }else {
                description = description + '<br aria-hidden="true"/><br>' + frameDescription;
            }
            this.setState({currentFrameDescription: description, openDescriptionModal:true});
                setTimeout(()=>{
                    this.textDescription && this.textDescription.focus();
                    this.textDescription && this.textDescription.click();
                }, 1);
            
            this.keys[key1] = false;
            this.keys[key2] = false;
            this.keys[key3] = false;
        }
   }

   getCurrentFrameTime = () =>{
    var currentTimeInSeconds = this.videoPlayer.currentTime;
    var currentTimeInHours;
    if (parseInt(currentTimeInSeconds)/60>=1) {
        var h = Math.floor(currentTimeInSeconds / 3600);
        currentTimeInSeconds = currentTimeInSeconds - h * 3600;               
        var m = Math.floor(currentTimeInSeconds / 60);
        var s = Math.floor(currentTimeInSeconds % 60);
        if(h.toString().length<2){h='0'+h;}
        if(m.toString().length<2){m='0'+m;}
        if(s.toString().length<2){s='0'+s;}
        currentTimeInHours = h+':'+m+':'+s;
    } else {
        var m = Math.floor(currentTimeInSeconds / 60);
        var s = Math.floor(currentTimeInSeconds % 60);
        if(m.toString().length<2){m='0'+m;}
        if(s.toString().length<2){s='0'+s;}
        currentTimeInHours = '00:'+m+':'+s
    }
    var currentTime = moment(currentTimeInHours, "hh:mm:ss");
    return currentTime;
   }

   convertToSRT = (list) => {
        var srtText = '';
        if(list !== null && list !== undefined && JSON.stringify(list) !== '{}'){
        list.forEach(text => {
            srtText = srtText + text.startTime + ' to ' + text.endTime;
            srtText = srtText + '\n' + this.joinText(text.results);
        });
    }
        return srtText;
   }

   convertToSRTDesc = (list) => {
    var srtText = '';
    if(list !== null && list !== undefined && JSON.stringify(list) !== '{}'){
    list.forEach(text => {
        srtText = srtText + text.startTime + ' to ' + text.endTime;
        srtText = srtText + '\n' + this.joinText(text.description);
    });
    }
    return srtText;
   }

   joinText = (textArr) => {
        var text = '';
        if (textArr !== undefined){
        if (typeof textArr === "string"){
            text = textArr;
        }else{
        textArr.forEach( txt => {
            text = text + txt;
        });
    }
        text = text + '\n\n';
}
        return text;
   }
   getCurrentText = (list) =>{
        var currentTime = this.getCurrentFrameTime();
        var result = list.filter((value, index) => {
            var startTime = moment(value.startTime, "hh:mm:ss");
            if(currentTime.isSame(startTime)){
                return true;
            }
            return false;
        });
        return result;
   }
   onTextDescriptionLoaded = (event) => {
       this.textDescription.focus();
       
   }
   onPlay = () => {
       this.setState({openDescriptionModal : false, currentFrameDescription:""});
       this.videoPlayer.focus();
   }
   onTimeUpdate = async() =>{
       var text = [];
       var description = [];
        var currentTime = String(this.videoPlayer.currentTime);
        var currentSecond = currentTime.split('.')[0];
        if(currentSecond !== this.previousTtsTime){
            this.previousTtsTime = currentTime.split('.')[0];
       this.videoPlayer.setAttribute("controls", "controls");
       if(this.state.currentVideoText !== null && this.state.currentVideoText !== undefined && JSON.stringify(this.state.currentVideoText) !== '{}'){
            text = this.getCurrentText(this.state.currentVideoText);
       }
       if(this.state.currentVideoDescriptions !== null && this.state.currentVideoDescriptions !== undefined && JSON.stringify(this.state.currentVideoDescriptions) !== '{}'){
            description = this.getCurrentText(this.state.currentVideoDescriptions);
       }
       if (this.state.settingsValue === "Text" && text.length > 0){
                if(this.state.interactiveMode){
           this.ping.play();
                }else{
                    if(!this.isCurrentTime(this.state.lastSpeechTime, currentTime)){
                        this.videoPlayer.pause();
                        await this.playSpeechFromText(this.joinText(text[0].results));
                        this.setState({lastSpeechTime : currentTime});
                        //this.videoPlayer.play();
       }
                }
            }
       if (this.state.settingsValue === "Description" && description.length > 0) {
                if(this.state.interactiveMode){
            this.ping.play();
                }else{
                    if(!this.isCurrentTime(this.state.lastSpeechTime, currentTime)){
                        this.videoPlayer.pause();
                        await this.playSpeechFromText(this.joinText(description[0].description));
                        this.setState({lastSpeechTime : currentTime});
                        //this.videoPlayer.play();
        }
                }
            }
        if (this.state.settingsValue === "both" && (text.length > 0 || description.length > 0)) {
                if(this.state.interactiveMode){
            this.ping.play();
                }else{
                    if(!this.isCurrentTime(this.state.lastSpeechTime, currentTime)){
                        this.videoPlayer.pause();
                        var speechText = '';
                        if(text.length > 0){
                            speechText += this.joinText(text[0].results);
        }
                        if(description.length > 0){
                            speechText += '\n' + this.joinText(description[0].description);
                        }
                        await this.playSpeechFromText(speechText);
                        this.setState({lastSpeechTime : currentTime});
                        //this.videoPlayer.play();
                    }
                }
            }
       }
   }
   isCurrentTime(lastSpeechTime, actualCurrentTime){
        var lastSpeechSecond = lastSpeechTime.split('.')[0];
        var actualCurrentSecond = actualCurrentTime.split('.')[0];
        return lastSpeechSecond === actualCurrentSecond;
   }
    render() { 
        if (this.props.UserId !== ""){
        document.title = "Video List - Video Transcripts";
        var videosList = this.state.videos.map((video, index) => {
            return(
                <div key={video.blobUrl}>
                <Row className="pt-2" key={video.blobUrl}>
                    <Col xs="4" aria-label="video thumbnail image">
                        {/* <img src={process.env.PUBLIC_URL + '/no-image-1.jpg'} alt="no image" height="100"/> */}
                        {/* <VideoThumbnail 
                            cors={true}
                            videoUrl={video.blobUrl}
                            thumbnailHandler={(thumbnail) => console.log(thumbnail)}
                            snapshotAtTime = {1}
                            width={120}
                            height={100}
                            /> */}
                            {/* <VideoPlayer videoUrl={video.blobUrl} snapshotAt={1} controls={false}/> */}
                    <video key={video.blobUrl} id="video" style={{pointerEvents:"none"}} width="300" height="200">
                        <source src={video.blobUrl} type="video/mp4" />
                    </video>
                    </Col>
                    <Col xs="4" className="pt-2">
                        <p className="pt-4">{video.name}</p>
                    </Col>
                    <Col xs="1" className="pt-2">
                        <button className="btn btn-primary btnFont mt-4" onClick={() => this.onPlayVideo(video)} aria-label="Click this button to play the video file">Play</button>
                    </Col>
                    <Col xs="3" className="pt-2">
                        <div className="pt-4 pl-4">Download </div>
                            <span>
                        <button className="btn btn-link linkFont" aria-label="Click this link download to .VTT version of the file" disabled = {video.captions === "WEBVTT\n\nNOTE\nlanguage:en-US\n\n"} onClick={() => this.downloadCaptionsFile(video)}>.VTT file</button>
                        <span>|</span>
                        <button className="btn btn-link linkFont" aria-label="Click this link to download the text file which contains text and image descriptions" disabled = {JSON.stringify(video.text) === '{}' && JSON.stringify(video.descriptions) === '{}'} onClick={() => this.downloadTxtFile(video)}>TEXT file</button>
                            </span>
                    </Col>
                </Row>
                <hr />
                </div>
            );
        });
        return(
        <div>
            <Row className="pt-4">
                <Col md="11" className="explore-pb-2 mh-100" style={this.paddingBottomGrid}>
                    <div className="bg-light border-dark border mh-100">
                        <div className="p-2 explore">
                            <h2 className="h2font">List of Video Submissions</h2>
                        {this.state.videos.length > 0 && <Row>
                            <Col md="12" className="pb-2 max-h-75">
                                <div className="overflow-y bg-white border-dark border mh-100" style={{width:'100% !imporant'}} onScroll={this.handleClick}>
                                    <div className="p-2 explore">
                                        {videosList}
                                    </div>
                                </div>
                            </Col> 
                        </Row> }
                        {this.state.videos.length === 0 && <Row>
                            <p style={this.margin}>No videos available.</p>
                            </Row>}
                        </div>
                    </div>
                </Col>
            </Row>
            
            {/* <Modal isOpen={this.state.openVideoModal} toggle={this.toggleVideoPopup} className="modal-lg" role="dialog">
                <ModalHeader toggle={this.toggleVideoPopup}>Play Video</ModalHeader>
                <ModalBody>
                    <Row>
                        <Col xs="12">
                            <div>
                        <p>Please pause the video at any time and get the visual text description using the Ctrl+Shift+Alt combo.</p>
                        
                        <video ref={vid => (this.videoPlayer = vid)} onLoadedData={this.onOpened} controls loop preload="auto" key={this.state.currentVideoUrl} id="video" width="752" height="423">
                            <source src={this.state.currentVideoUrl} type="video/mp4" />
                        </video>
                        <button tabIndex="-1" className="btn mt-3 mr-2 d-table-cell"></button>                   
                    </div>
                        </Col>
                    </Row>
                </ModalBody>
                <ModalFooter>
                </ModalFooter>
            </Modal> */}

                {this.state.show && <AriaModal
                    titleText="Play Video"
                    onExit={this.handleClose}
                    verticallyCenter={true}
                    initialFocus="#videoPlaceHolder"
                    getApplicationNode={this.getApplicationNode}
                    underlayStyle={{ paddingTop: '2em' }}>
                        <div className="aria-modal">
                            <header>
                                <h3 style={this.textDecoration}>
                                    Play Video
                                </h3>
                            </header>
                            <div tabIndex="0" id="message-content">
                                <p tabIndex="0" id="message">To get the visual text and image description, please pause the video using the Ctrl+Shift+Alt combo.</p>
                            </div>
                            {/* <button className="btn mt-3 mr-2 d-table-cell" id="hideButton"></button> */}
                            <div tabIndex="0" id="videoPlaceHolder" aria-label="Play Video modal is opened and to get the visual text and image description, please pause the video using the Ctrl+Shift+Alt combo">
                                <video tabIndex="0" ref={vid => (this.videoPlayer = vid)} onTimeUpdate={this.onTimeUpdate} onPlay={this.onPlay} onLoadedData={this.onOpened} controls loop preload="auto" key={this.state.currentVideoUrl} id="videoPlayer" width="752" height="423">
                                    <source tabIndex="0" src={this.state.currentVideoUrl} type="video/mp4" />
                                </video>
                                {/* <button tabIndex="-1" className="btn mt-3 mr-2 d-table-cell"></button> */}
                            </div>

                            <div className="pt-4">
                                <p aria-live="assertive">{ReactHtmlParser(this.state.currentFrameDescription)}</p>
                            </div>

                            {/* {this.state.openDescriptionModal && <div aria-live="assertive">
                            <textarea ref={vid => (this.textDescription = vid)} aria-live="assertive" style={{height:"100px", width:"752px"}}>{this.state.currentFrameDescription}</textarea>
                            </div>} */}
                            <button className="btn mt-3 mr-2 d-table-cell" id="hideButton"></button>
                        </div>
                </AriaModal>}
            {/* <Modal autoFocus isOpen={this.state.openDescriptionModal} toggle={this.toggleVideoPopup} className="modal-lg" role="dialog">
                <ModalHeader toggle={this.toggleDescriptionPopup}>Text and Image descriptions</ModalHeader>
                <ModalBody>
                    <textarea ref={vid => (this.textDescription = vid)} aria-live="rude" role="alert" autoFocus style={{height:"100px", width:"500px"}}>{this.state.currentFrameDescription}</textarea>
                </ModalBody>
                <ModalFooter>
                </ModalFooter>
            </Modal> */}
        </div>);
    }else{
        return(<div><p style={this.loginMsgStyling}>Please <a href="tpLogin">login or create an account</a></p></div>)}
    } 
}

export default VideoListing 