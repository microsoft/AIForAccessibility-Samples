import React, { Component } from "react";
import { Row, Col, Button, Input } from 'reactstrap';
import ApiClient from "./ApiClient";
import Select from 'react-select';
import ClipLoader from "react-spinners/ClipLoader";
import { css } from "@emotion/core";
import { Ellipsis } from 'react-awesome-spinners';


const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

class VideoFileUpload extends Component {
    constructor(props){
        super(props);

        this.apiClient = new ApiClient();
        this.state = {
            // Initially, no file is selected 
            selectedFile: null,
            responseToPost:'',
            videoBlobURL:'',
            stayOpen: false,
            selectedOption:null,
            speechModelsList:[],
            userId:this.props.userId,
            uploadFileMsg:'',
            loading:false
        }
        this.video = null;
        // preserve the initial state in a new object
        this.baseState = this.state
    }

    componentDidMount(){
      this.loadAllSpeechModels(this.props.userId);
    }

    selectStyles = {
      width:"500px",
      height:"38px",
      borderRadius:"5px"
    }

    labelDisplay = {
      fontWeight:"bold",
      marginBottom:"0rem",
      paddingLeft:"0px"
  }

  loginMsgStyling={
    marginTop: "15px",
    fontSize: "18px",
    fontWeight: "bold"
}

    componentWillReceiveProps(props){
      if(props.userId !==""){
      this.setState({userId:props.userId});
      this.loadAllSpeechModels(props.userId);
      }
    }

    handleChange = selectedOption => {
      this.setState({ selectedOption });
      console.log(`Option selected:`, selectedOption);
   };
   handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    this.video=null;
    this.setState({
    [name]: value,
    errors:{},
    videoBlobURL:'',
    responseToPost:''
    });
}

    loadAllSpeechModels = (userId) => {
      if(userId !== ""){
      this.get('getAllSpeechModels','userId=' + userId).then((res) =>{
        if(res){
            var allSpeechModels=[];
            if(res.speechModels){
                res.speechModels.forEach(speechModel => {
                    allSpeechModels.push({value:speechModel._id, label:speechModel.modelName})
                });
                this.setState({speechModelsList:allSpeechModels});
            }
        }
    });
  }
    }

    get = async ( apiCall, query ) => {
      var url = process.env.REACT_APP_SERVER_URL + "/" + apiCall + "?" + query;
      const response = await fetch(url);
      const body = await response.json();
      if (response.status !== 200) throw Error(body.message);
      return body;
  };

    // On file select (from the pop up) 
    onFileChange = event => { 
     
        // Update the state 
        this.setState({ selectedFile: event.target.files[0], uploadFileMsg:'', responseToPost:'', videoBlobURL:''}); 
        this.video=null;
      }; 

      // On file upload (click the upload button) 
    onFileUpload = async () => { 
     
      if (this.state.selectedFile) { 
        this.setState({loading:true});
        // Create an object of formData 
        const formData = new FormData(); 
       
        // Update the formData object 
        // formData.append( 
        //   "myFile", 
        //   this.state.selectedFile, 
        //   this.state.selectedFile.name 
        // ); 
        formData.append('fileName', this.state.selectedFile.name);
        formData.append('userId', this.props.userId);
        formData.append('file', this.state.selectedFile);
        formData.append('speechModelId', this.state.selectedOption !== null ? this.state.selectedOption : "5fa97a5276d0991f842afd0e");
       
        // Details of the uploaded file 
        console.log(this.state.selectedFile); 
       
        // Request made to the backend api 
        // Send formData object 
        //axios.post("api/uploadfile", formData); 
        const response = await fetch(process.env.REACT_APP_SERVER_URL + '/videoFileUploadtoBlob', {
            method: 'POST',
            body: formData
        });
        const body = await response.json();
        this.setState({ responseToPost: body.message, selectedFile:null, videoBlobURL:body.blobURL, loading:false, selectedOption:"" });
        if (this.fileInput !== null){
           this.fileInput.value="";
        }
        if(body.result){
          let parent = this;
          //setTimeout(async function() {
          var result = await parent.apiClient.postJSON('/processVideoCallBack', 
          JSON.stringify({
            videoId:body.videoId
          }));
          console.log(result);
        //}, 300000);
           
        }else{
          console.log("Error");
        }
      }else{
        this.setState({uploadFileMsg:"Please choose a video file before pressing the Upload button."})
      } 
      }; 

       // File content to be displayed after 
    // file upload is complete 
    fileData = () => { 
     
        if (this.state.selectedFile) { 
            
          return ( 
            <div> 
              <h2>File Details:</h2> 
              <p>File Name: {this.state.selectedFile.name}</p> 
              <p>File Type: {this.state.selectedFile.type}</p> 
              <p> 
                Last Modified:{" "} 
                {this.state.selectedFile.lastModifiedDate.toDateString()} 
              </p> 
            </div> 
          ); 
        } 
        // else { 
        //   return ( 
        //     <div> 
        //       <br /> 
        //       <h4>Choose before Pressing the Upload button</h4> 
        //     </div> 
        //   ); 
        // } 
      }; 

      render() { 
        if (this.props.userId !== ""){
        const { stayOpen } = this.state;
        document.title = "Video Upload - Video Transcripts"
        let speechModels = this.state.speechModelsList;
        let optionItems = speechModels.map((speechModel) =>
                <option value={speechModel.value}>{speechModel.label}</option>
            );
        return ( 
          <div role="main"> 
            <Row className="pt-4">
              <h1 className="h1font">
                Video File Upload 
              </h1>
            </Row>  
            <Row className="pt-4">
              <Col xs="3" className="nopadding"><label htmlFor="react-select-2-input" style={this.labelDisplay}>Associate a speech model</label><span><i> (Optional)</i></span> :</Col>
              <Col xs="6" style={this.displayhtml}>
                {/* <Select
                    id="speechModels"
                    className="dropdownCSS"
                    closeOnSelect={!stayOpen}
                    onChange={this.handleChange}
                    value = {this.state.selectedOption}
                    options={this.state.speechModelsList}
                    styles={this.selectStyles}
                    /> */}
                    <select id="speechModels" style={this.selectStyles} name="selectedOption" value={this.state.selectedOption} onChange={this.handleInputChange} placeholder="Select...">
                      <option key="">Standard</option>
                      {optionItems}
                    </select>
                </Col>
            </Row>
            {/* <ClipLoader
          css={override}
          size={150}
          color={"#123abc"}
          loading={this.state.loading}
          /> */}
            <Row className="pt-2">
              <label htmlFor="fileUpload" className="h2font"> 
                Upload a video file <i className="italicFont"> (Note: Please upload video files less than 15 MB for better experience)</i>
              </label>
            </Row>
            <Row className="pt-4">
                <Col xs="6" style={{paddingLeft:"0px"}}>
                  <input id="fileUpload" type="file" onChange={this.onFileChange} ref={ref=> this.fileInput = ref}/> 
                </Col>
                <Col xs="6">
                  <button className="btn btn-primary btnFont" onClick={this.onFileUpload}> 
                    Upload
                  </button> 
                </Col>
            </Row>
            {this.state.loading && <Ellipsis aria-live="polite" aria-label="Please wait, we are saving the video"/>}
            <Row className="pt-2">
              {this.fileData()} 
            </Row>
            <Row>
                <p aria-live="assertive" className="errorMsg h3font pt-4">{this.state.uploadFileMsg}</p>
              </Row> 
              <Row>      
                <p aria-live="assertive" className="successText h3font pt-4">{this.state.responseToPost}</p>
              </Row> 
            {this.state.videoBlobURL && <div className="videoplaceholder">  
                <video id="ai-vid" ref={vid => (this.video = vid)} key={this.state.videoBlobURL} controls loop preload='auto' style={this.video} key={this.state.videoBlobURL}>
                    <track id="enTrack" src="/videos/cc.vtt" label="English" kind="subtitles" srcLang="en" />
                        {/* eslint-disable-next-line */}
                        <source src={this.state.videoBlobURL} type="video/mp4" />
                        Your browser does not support HTML5 video.
                </video>
            </div>
      }
          </div> 
        ); 
    }else{
      return(<div><p style={this.loginMsgStyling}>Please <a href="tpLogin">login or create an account</a></p></div>)}
  }
}

export default VideoFileUpload;