import React, { Component } from "react";
import { Row, Col, Button, Input } from 'reactstrap';
import ApiClient from "./ApiClient";

class SpeechModelsUpload extends Component {
    constructor(props){
        super(props);

        this.apiClient = new ApiClient();
        this.state = {
            // Initially, no file is selected 
            selectedFile: null,
            responseToPost:'',
            uploadFileMsg:'',
            fileName:'',
            speechModelName:'',
            errors:{}
        }
        this.textDescription='';
    }
   
    requiredFieldCSS = {
      fontSize:"15px",
      color:"#CA1916",
      fontWeight:"500"
  }

  inputFieldDisplay = {
    minWidth:"350px",
    margin:"0px 0px 12px 0px",
    height:"36px"
}

labelDisplay = {
    fontWeight:"bold",
    marginBottom:"0rem"
}

loginMsgStyling={
  marginTop: "15px",
  fontSize: "18px",
  fontWeight: "bold"
}

handleValidation(){
  let errors = {};
  let formIsValid = true;

  if(!this.state.speechModelName){
     formIsValid = false;
     errors["speechModelName"] = "Speech model name is required";
  }
   this.setState({errors: errors});
   return formIsValid;       
}

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    this.setState({
    [name]: value,
    errors:{}
    });
    this.setState({shouldBlockNavigation:true});
}
    // On file select (from the pop up) 
    onFileChange = event => { 
     
        // Update the state 
        this.setState({ selectedFile: event.target.files[0], fileName: event.target.files[0].name, uploadFileMsg:'', responseToPost:'' }); 
        this.textDescription.focus();
      }; 

      // On file upload (click the upload button) 
    onFileUpload = async () => { 

      if (this.state.selectedFile) {
        if (this.handleValidation()){
     
        // Create an object of formData 
        const formData = new FormData(); 
       
        // Update the formData object 
        // formData.append( 
        //   "myFile", 
        //   this.state.selectedFile, 
        //   this.state.selectedFile.name 
        // ); 
        formData.append('fileName', this.state.selectedFile.name);
        formData.append('modelName', this.state.speechModelName);
        formData.append('userId', this.props.userId);
        formData.append('file', this.state.selectedFile);
       
        // Details of the uploaded file 
        console.log(this.state.selectedFile); 
       
        // Request made to the backend api 
        // Send formData object 
        //axios.post("api/uploadfile", formData); 
        const response = await fetch(process.env.REACT_APP_SERVER_URL + '/speechModelFileUpload', {
            method: 'POST',
            body: formData
        });
        const body = await response.json();
        this.setState({ responseToPost: body.message, selectedFile:null, speechModelName:'', fileName:''});
        this.fileInput.value="";
        if(body.result){
          var result = await this.apiClient.postJSON('/trainCustomSpeech',
           JSON.stringify({
             modelName:body.speechModel.modelName,
             fileName: body.speechModel.name,
             fileUrl: body.speechModel.blobUrl,
             speechFileId:body.speechModel._id
           }));
           console.log(result);
          }
        }
      }else{
        this.setState({uploadFileMsg:"Please choose a file before pressing the Upload button."})
      }       
      }; 

       // File content to be displayed after 
    // file upload is complete 
    fileData = () => { 
      //this.setState({uploadFileMsg:''});
        if (this.state.selectedFile) { 
          return ( 
            <div> 
              <h2 className="h2font">File Details:</h2> 
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
        document.title = 'Speech Model Upload - Video Transcripts';
        return ( 
          <div role="main">
            <Row className="pt-4">
              <h1 className="h1font">
                Speech Model Upload 
              </h1>
            </Row> 
            {/* <Row className="pt-2">
              <h2 className="h2font"> 
                Upload a File <i className="italicFont"> (Note: Uploaded doc can be in any format docx, pdf etc)</i>
              </h2>
            </Row> */}
            <Row className="pt-4">
              <Col xs="2" className="nopadding">
                <label htmlFor="modelName" className="required" style={this.labelDisplay}>Speech Model Name</label>
              </Col>
              <Col xs="4">
                <input style={this.inputFieldDisplay}
                    id="modelName"
                    type="text"
                    name="speechModelName"
                    className=""
                    placeholder="Enter name"
                    value={this.state.speechModelName}
                    onChange={this.handleInputChange}
                    required ></input>
              </Col>
              <Col xs="4">
                <span aria-live="assertive" style={this.requiredFieldCSS}>{this.state.errors["speechModelName"]}</span>  
              </Col>
            </Row>
            <Row className="pt-4">
                <label htmlFor="fileupload" className="h2font"> Upload a File <i className="italicFont"> (Note: Uploaded doc should be in .txt format)</i></label>
            </Row>
            <Row className="pt-4">
              <Col xs="6" style={{paddingLeft:"0px"}}>
                <input id="fileupload" type="file" onChange={this.onFileChange} ref={ref=> this.fileInput = ref}/> 
                </Col>
            </Row>
                <p ref={vid => (this.textDescription = vid)} aria-live="assertive">{this.state.fileName}</p>
              <Row className="pt-4">
                  <button className="btn btn-primary btnFont" onClick={this.onFileUpload}> 
                    Upload
                  </button> 
              </Row>
              <Row>
                <p aria-live="assertive" className="errorMsg h3font pt-4">{this.state.uploadFileMsg}</p>
              </Row> 
              <Row>      
                <p aria-live="assertive" className="successText h3font pt-4">{this.state.responseToPost}</p>
              </Row> 
          </div> 
        ); 
      }else{
          return(<div><p style={this.loginMsgStyling}>Please <a href="tpLogin">login or create an account</a></p></div>)}
      } 
}

export default SpeechModelsUpload;