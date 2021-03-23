import React, { Component } from "react";
import { Row, Col, Button, Input } from 'reactstrap';

class Settings extends Component {
    constructor(props){
        super(props);

        this.state = {
            userId:this.props.userId,
            interactiveMode:true,
            nonInteractiveMode:false,
            playModeValue:this.props.playModeValue,
            modeErrorMsg:""
        }
        
    }

componentDidMount(){
     if(this.state.playModeValue === "interactive"){
         this.setState({interactiveMode:true, nonInteractiveMode:false});
     }else if (this.state.playModeValue === "non-interactive"){
        this.setState({interactiveMode:false, nonInteractiveMode:true});
     }
}
   
componentWillReceiveProps(props){
    this.setState({userId: props.userId});
    if(props.playModeValue === "interactive" && !props.playModeValueUpdated){
        this.setState({interactiveMode:true, nonInteractiveMode:false});
    }else if (props.playModeValue === "non-interactive" && !props.playModeValueUpdated){
        this.setState({interactiveMode:false, nonInteractiveMode:true});
    }
    if(props.playModeValueUpdated){
        this.setState({interactiveMode:props.interactiveMode, nonInteractiveMode:props.nonInteractiveMode, playModeValue: props.interactiveMode ? "interactive" : "non-interactive"});
    }
}

handleInputChanges = async (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    this.setState({
    [name]: value,
    errorMsg : ''
    });

    if(name === "interactiveMode" && value === true){
        this.setState({interactiveMode:true, nonInteractiveMode:false});
    }else if(name === "nonInteractiveMode" && value === true){
        this.setState({interactiveMode:false, nonInteractiveMode:true});
    }

    this.props.updatePlaySettingsInfo(name);

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
        //document.title = 'Speech Model Upload - Video Transcripts';
        return ( 
          <div className="pl-2">
              <Row>
              <h2 className="h2font">
                Choose one of the settings below which applies to video play mode on Video List page. 
              </h2>
            </Row> 
            <Row className="margin-left mt-2">
                    <input type="checkbox"
                           id="interactiveRadioBtn"
                           name="interactiveMode"
                           checked={this.state.interactiveMode}
                           className="record margin"
                           value={this.state.interactiveMode}
                           onChange={this.handleInputChanges}></input>
                    <label htmlFor="interactiveRadioBtn">Interactive mode</label>
                </Row>
                <Row className="margin-left">
                    <input type="checkbox"
                           id="nonInterativeRadioBtn"
                           name="nonInteractiveMode"
                           checked={this.state.nonInteractiveMode}
                           className="record margin"
                           value={this.state.nonInteractiveMode}
                           onChange={this.handleInputChanges}></input>
                    <label htmlFor="nonInterativeRadioBtn">Non-Interactive mode</label>
                </Row>
                <Row>
                    <p aria-live="assertive" className="errorMsg h3font pt-4">{this.state.errorMsg}</p>
                </Row>
          </div> 
        ); 
      }
    } 
}

export default Settings;