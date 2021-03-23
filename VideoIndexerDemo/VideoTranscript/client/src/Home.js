import React, { Component } from "react";
import { Row, Col, Button, Input } from 'reactstrap';
import AriaModal from 'react-aria-modal';

class Home extends Component {
    constructor(props) {
        super(props);
        //this.apiClient = new ApiClient();
        this.state = {
            userId:this.props.userId,
            interactiveMode:false,
            nonInteractiveMode:false,
            playModeValue:"",
            settingsValue:this.props.settingsValue,
            modeErrorMsg:"",
            firstTimeUser:(this.props.location.state !== undefined && this.props.location.state !== null) ? this.props.location.state.firstTimeUser : false,
            show:(this.props.location.state !== undefined && this.props.location.state !== null) ? this.props.location.state.firstTimeUser : false
        }
        this.handleClose = this.handleClose.bind(this);
        this.handleShow = this.handleShow.bind(this);
    }

    numberLabelfontSz = {
        fontSize:"2rem"
    }
    
    componentDidMount() {
        
      }
      componentWillReceiveProps(props){
          this.setState({userId:props.userId, settingsValue:props.settingsValue, firstTimeUser: (props.location.state !== undefined && props.location.state !== null) ? props.location.state.firstTimeUser : false, show:(props.location.state !== undefined && props.location.state !== null) ? props.location.state.firstTimeUser : false})
    }


      stopEventPropagation = (event) =>{
        event.stopPropagation();
    }

    handleClose() {
        this.setState({show:false, firstTimeUser:false});
    }

    handleShow() {
        this.setState({show:true});
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
    
        //this.props.updatePlaySettingsInfo(name);
    
        // if(this.state.textSettings){
        //     this.setState({descSettings:false, textandDescSettings:false});
        // }else if (this.state.descSettings){
        //     this.setState({textSettings:false, textandDescSettings:false});
        // }else if (this.state.textandDescSettings){
        //     this.setState({textSettings:false, descSettings:false});
        // }
    };

    saveSettings = async () => {
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
            this.props.updatePlayModeSettingsInfo(body.userInfo.videoPlayModeSettings);
            this.handleClose();
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

    handleValidation(){
        let errors = {};
        let formIsValid = true;
      
        if((!this.state.interactiveMode) && (!this.state.nonInteractiveMode)){
           formIsValid = false;
           this.setState({errorMsg: "Please check any of the value, else interactive mode is default enabled"});
        }
         return formIsValid;       
      }

    
    render() {
        document.title = 'Home - Video Transcripts';
        
        return (
            <React.Fragment>
            <div role="main">
                {!this.props.isLoggedIn && <Row>
                <p className="h1 pt-4" style={this.numberLabelfontSz}>Please <a href="tpLogin">login or create an account</a></p>;
                </Row>}
                <Row>
                    <h1 className="h1font">About</h1>
                </Row>
                <Row>
                    <p>A service that supplements the generated transcript with necessary visual information that provides context to help understand the contents of the video through the transcript.</p>
                </Row>
                <Row>
                    <h2 className="h2font">Components</h2>
                    </Row>
                    <Row>
                    <h3 className="h3font">Speech Model Upload</h3>
                    <p>The user can upload a custom speech recognition model which is then processed by Video Indexer, and the user can refer this to any of their uploaded videos.</p>
                    <h3 className="h3font">Video File Upload</h3>
                    <p>
                        An interface that allows he user to upload a video file which is then processed by OCR and Compter Vision Services and gives back captions file and a text file giving visual description at respective timestamps.
                    </p>
                    <h3 className="h3font">My Videos</h3>
                    <p> An interface where the user can see the list of their uploaded videos which have both captions and text file or either captions/text file. The following functionalities available when the user starts playing any video form the list.
                        <ul>
                            <li>When the video starts playing, the user can pause the video at any time interval - then shows the visual description of the respective video at that particular time window.</li>
                            <li>Also the user can toggle on captions button, for the captions to show up.</li>
                            <li>Option to download the captions (.VTT) file and text (.txt) file.</li>
                        </ul>
                    </p>
                </Row>

                {this.state.firstTimeUser && this.state.show && <AriaModal
                    titleText="Video Play Mode Settings"
                    onExit={this.handleClose}
                    verticallyCenter={true}
                    initialFocus="#interactiveRadioBtn"
                    getApplicationNode={this.getApplicationNode}
                    underlayStyle={{ paddingTop: '2em' }}>
                        <div className="aria-modal overflowY">                          
                         <header>
                            <h3 className="h3font">
                                Choose one of the settings below which applies to video play mode on Video Listing page. 
                            </h3>
                            </header> 
                            <Row className="margin-left mt-2 ml-2">
                                    <input type="checkbox"
                                        id="interactiveRadioBtn"
                                        name="interactiveMode"
                                        checked={this.state.interactiveMode}
                                        className="record margin"
                                        value={this.state.interactiveMode}
                                        onChange={this.handleInputChanges}></input>
                                    <label htmlFor="interactiveRadioBtn">Interactive mode</label>
                                </Row>
                                <Row className="margin-left ml-2">
                                    <input type="checkbox"
                                        id="nonInterativeRadioBtn"
                                        name="nonInteractiveMode"
                                        checked={this.state.nonInteractiveMode}
                                        className="record margin"
                                        value={this.state.nonInteractiveMode}
                                        onChange={this.handleInputChanges}></input>
                                    <label htmlFor="nonInterativeRadioBtn">Non-Interactive mode</label>
                                </Row>
                                <Row className="margin-left ml-2">
                                    <p aria-live="assertive" className="errorMsg h3font pt-4">{this.state.errorMsg}</p>
                                    <p className="mt-2">From next time, to change the video play mode settings please visit the <a href="/Settings">settings</a> page.</p>
                                </Row>
                                <Row>
                                    <Col xs="6"></Col>
                                    <Col xs="6">
                                        <button className="btn btn-primary mt-3 margin-left" onClick={this.onCancel} aria-label="Cancel saving Settings info">CANCEL</button>
                                        <button className="btn btn-primary mt-3 margin-left" onClick={this.onSubmit} aria-label="Save settings info">SAVE</button>
                                    </Col>
                                </Row>
                        </div> 
                </AriaModal>}
                    
                </div>
            </React.Fragment>
        )
    }
}

export default Home;
