import React, { Component } from "react";
import { Row, Col, Button, Input } from 'reactstrap';
import ApiClient from "./ApiClient";
import PlayModeSettings from "./components/PlayModeSettings";

class Settings extends Component {
    constructor(props){
        super(props);

        this.apiClient = new ApiClient();
        this.state = {
            userId:this.props.userId,
            textSettings:true,
            descSettings:false,
            textandDescSettings:false,
            settingsValue:"",
            errorMsg:"",
            interactiveMode:true,
            nonInteractiveMode:false,
            playModeValue:this.props.playModeValue !== undefined ? this.props.playModeValue:"",
            playModeValueUpdated:false,
            modeErrorMsg:""
        }
        
    }

componentDidMount(){
     if(this.props.settingsValue === "Text"){
         this.setState({textSettings:true, descSettings:false, textandDescSettings:false});
     }else if (this.props.settingsValue === "Description"){
        this.setState({descSettings:true, textSettings:false, textandDescSettings:false});
     }else if (this.props.settingsValue === "both"){
        this.setState({descSettings:false, textSettings:false, textandDescSettings:true});
     }
}
   
componentWillReceiveProps(props){
    this.setState({userId: props.userId, playModeValue:props.playModeValue});
    if(props.settingsValue === "Text"){
        this.setState({textSettings:true, descSettings:false, textandDescSettings:false});
    }else if (props.settingsValue === "Description"){
       this.setState({descSettings:true, textSettings:false, textandDescSettings:false});
    }else if (props.settingsValue === "both"){
       this.setState({descSettings:false, textSettings:false, textandDescSettings:true});
    }
}

saveSettings = async () => {
    if (this.state.textSettings){
        //this.setState({settingsValue:"Text"});
        this.state.settingsValue = "Text";
    }else if (this.state.descSettings) {
        //this.setState({settingsValue:"Description"});
        this.state.settingsValue = "Description";
    }else if (this.state.textandDescSettings){
        //this.setState({settingsValue:"both"});
        this.state.settingsValue = "both";
    }
    if (this.state.interactiveMode){
        //this.setState({settingsValue:"Text"});
        this.state.playModeValue = "interactive";
    }else if (this.state.nonInteractiveMode) {
        //this.setState({settingsValue:"Description"});
        this.state.playModeValue = "non-interactive";
    }
    var url = process.env.REACT_APP_SERVER_URL + "/saveSettingsInfo";
        const payload = JSON.stringify(this.state);
        const response = await fetch(url, {
            method: 'POST',
            body: payload,
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
        });
        const body = await response.json();
        if (body.status !== 200){
            //console.log(response.status); 
            throw Error(body.message); 
        }
        this.props.updateSettingsInfo(this.state.settingsValue);
        this.props.updatePlayModeSettingsInfo(body.userInfo.videoPlayModeSettings);
        return response;
}

onSubmit = (event) => {
    if (this.handleValidation()){
    this.saveSettings()
    .then((res) => {
        if (res.status === 200) {
            this.props.history.push('/');
    } else {
    const error = new Error(res.error);
    throw error;
    }
})
}
};

updatePlaySettingsInfo = (name) => {
    if(name === "interactiveMode"){
      this.setState({interactiveMode:true, nonInteractiveMode:false, playModeValueUpdated:true});
    }else if (name === "nonInteractiveMode"){
    this.setState({nonInteractiveMode:true, interactiveMode:false, playModeValueUpdated:true});
    }
}

handleValidation(){
  let errors = {};
  let formIsValid = true;

  if((!this.state.textSettings) && (!this.state.descSettings) && (!this.state.textandDescSettings)){
     formIsValid = false;
     this.setState({errorMsg: "Please check any of the value, else text setting is default enabled"});
  }
  if((!this.state.interactiveMode) && (!this.state.nonInteractiveMode)){
    formIsValid = false;
    this.setState({errorMsg: "Please check any of the mode value, else interactive mode is default enabled"});
 }  
   return formIsValid;       
}

handleInputChange = async (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    this.setState({
    [name]: value,
    errorMsg : ''
    });

    if(name === "descSettings" && value === true){
        this.setState({textSettings:false, textandDescSettings:false});
    }else if(name === "textSettings" && value === true){
        this.setState({descSettings:false, textandDescSettings:false});
    }else if(name === "textandDescSettings" && value === true){
        this.setState({textSettings:false, descSettings:false});
    }

    // if(this.state.textSettings){
    //     this.setState({descSettings:false, textandDescSettings:false});
    // }else if (this.state.descSettings){
    //     this.setState({textSettings:false, textandDescSettings:false});
    // }else if (this.state.textandDescSettings){
    //     this.setState({textSettings:false, descSettings:false});
    // }
};
    // On file select (from the pop up) 
   
      render() { 
        if (this.props.userId !== ""){
        document.title = 'Speech Model Upload - Video Transcripts';
        return ( 
          <div role="main">
            <Row className="pt-4">
              <h1 className="h1font">
                Settings 
              </h1>
              </Row>
              <Row>
              <h2 className="h2font">
                Choose one of the settings below which applies to text and descriptions display on Video List page. 
              </h2>
            </Row> 
            <Row className="margin-left mt-2">
                    <input type="checkbox"
                           id="textRadioBtn"
                           name="textSettings"
                           checked={this.state.textSettings}
                           className="record margin"
                           value={this.state.textSettings}
                           onChange={this.handleInputChange}></input>
                    <label htmlFor="textRadioBtn">Text</label>
                </Row>
                <Row className="margin-left">
                    <input type="checkbox"
                           id="descRadioBtn"
                           name="descSettings"
                           checked={this.state.descSettings}
                           className="record margin"
                           value={this.state.descSettings}
                           onChange={this.handleInputChange}></input>
                    <label htmlFor="descRadioBtn">Descriptions</label>
                </Row>
                <Row className="margin-left">
                    <input type="checkbox"
                           id="textAndDescRadioBtn"
                           name="textandDescSettings"
                           checked={this.state.textandDescSettings}
                           className="record margin"
                           value={this.state.textandDescSettings}
                           onChange={this.handleInputChange}></input>
                    <label htmlFor="textAndDescRadioBtn">Both text and descriptions</label>
                </Row>
                <Row>
                    <p aria-live="assertive" className="errorMsg h3font pt-4">{this.state.errorMsg}</p>
                </Row>
                <Row>
                    <PlayModeSettings interactiveMode={this.state.interactiveMode} nonInteractiveMode={this.state.nonInteractiveMode} playModeValue={this.state.playModeValue} playModeValueUpdated={this.state.playModeValueUpdated} updatePlaySettingsInfo = {(name) => this.updatePlaySettingsInfo(name)}/>
                </Row>
                <Row>
                    <Col md="8">
                    </Col>
                    <Col md="4">
                        <button className="btn btn-primary mt-3 margin-left" onClick={this.onCancel} aria-label="Cancel saving Settings info">CANCEL</button>
                        <button className="btn btn-primary mt-3 margin-left" onClick={this.onSubmit} aria-label="Save settings info">SAVE</button>
                    </Col>
                </Row>
                {/* <Row>
                <input type="radio" 
                       name="site_name" 
                        value={result.SITE_NAME} 
                        checked={this.state.site === result.SITE_NAME} 
                        onChange={this.onSiteChanged} />{result.SITE_NAME}
                </Row>
                <Row>
                <input type="radio" 
                        name="site_name" 
                        value={result.SITE_NAME} 
                        checked={this.state.site === result.SITE_NAME} 
                        onChange={this.onSiteChanged} />{result.SITE_NAME}
                </Row> */}
          </div> 
        ); 
      }else{
          return(<div><p style={this.loginMsgStyling}>Please <a href="tpLogin">login or create an account</a></p></div>)}
      } 
}

export default Settings;