import React, { Component } from 'react';
import { Row, Col } from "reactstrap";
import FacebookLogin from "react-facebook-login";
import GoogleLogin from "react-google-login";
import MicrosoftAuthService from "../MicrosoftAuthService";
import { MicrosoftLoginButton } from "react-social-login-buttons";
import ApiClient from "../ApiClient";

export default class ThirdPartyLogin extends Component {
    constructor(props){
        super(props);
        this.apiClient = new ApiClient();
        this.state={
            thirdPartyUserId:'',
            email:'',
            show:false,
            userName:'',
            firstTimeUser:true
        }
        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);
    }
    componentWillReceiveProps(props){
        //this.setState({userCookieConsent:props.userCookieConsent});
    }

    marginBottom = {
        marginBottom:"20px"
    }

    googleStyling = {
        border:"1px solid grey"
    }

    video = {
        width: "100%",
        position: "relative",
        display: "block",
        margin: "0 auto"
    }

    videoplaceholder = {
        maxWidth:"350px"
    }

    cookieText = {
        fontSize: "30px",
        fontWeight: "500"
    }

    handleShow() {
        this.setState({ show: true });
    }

    handleClose() {
        this.setState({ show: false });
    }

    // authHandler = (err, data) => {
    //     //console.log("ms-auth-handler: ", err, data);
    //     if(err){
    //         throw err;
    //     }
    //     this.setState({thirdPartyUserId:data.account.userName});
    //     this.apiClient.postJSON("/verifyThirdParty", JSON.stringify(this.state)).then((res) => {
    //         if(res.userExists){
    //             this.props.onLoggedInChanged(true, data.account.userName, data.account.userName, '', data.account.name);
    //             this.props.updateUserAccountType("ms");
    //             this.props.updateUserId(res.userId);
    //             this.props.history.push('/');
    //         }else{
    //             this.props.onLoggedInChanged(true, data.account.userName, data.account.userName, '', data.account.name, "noob");
    //             this.props.updateUserToken(data.idToken.rawIdToken);
    //             // this.props.history.push('/tpSignup');
    //             this.apiClient.postJSON("/saveProfile", JSON.stringify(this.state)).then((res) => {
    //                 if(res.userCreated){
    //                     this.props.onLoggedInChanged(true, data.account.userName, data.account.userName, '', data.account.name);
    //                     this.props.updateUserId(res.userId);
    //                     this.props.history.push('/');
    //                 }
    //             })
    //         }
    //     });
        
    // };
    responseFacebook = (data, err) => {
        //console.log(err, data);
        if(err){
            throw err;
        }
        if (data.status !== "unknown"){
        //this.props.onLoggedInChanged(true, data.userID, data.email, '', data.name, "noob");
        this.setState({thirdPartyUserId:data.userID, email:data.email, userName:data.name});
        //console.log('fb login response: '+ JSON.stringify(data));
        this.apiClient.postJSON("/verifyThirdParty", JSON.stringify(this.state)).then((res) => {           
            if(res.userExists){
                this.props.onLoggedInChanged(true, res.email, res.userObject, '', res.userName, res.uniqueId);
                this.props.updateUserAccountType("fb");
                this.props.updateUserId(res.userId);
                this.props.history.push('/');
            }else{
                this.props.updateUserEmail(data.email);
                this.props.updateUserName(data.name);
                this.props.updateLoggedInThirdPartyUserId(data.userID);
                this.apiClient.postJSON("/saveUser", JSON.stringify(this.state)).then((res) => {
                    if(res.userCreated){
                        this.props.onLoggedInChanged(true, res.email, res.userObject, '', data.name, data.userId);
                        this.props.updateUserId(res.userId);
                        //this.props.history.push('/');
                        this.props.history.push({
                            pathname:"/",
                            state:{firstTimeUser:true}
                          });
                    }
                })
            }
        });
    }
    };
    responseGoogle = (response) => {
        //console.log('google login response: ' + JSON.stringify(response));
        // if(err){
        //     throw err;
        // }
        if(response.error === "idpiframe_initialization_failed" || response.error === "popup_closed_by_user")
        {
            this.handleShow();
        }
        if(response.profileObj !== undefined){
        //this.props.onLoggedInChanged(true, response.profileObj.email, '', response.profileObj.name, "noob");
        this.setState({thirdPartyUserId:response.profileObj.googleId, email:response.profileObj.email, userName:response.profileObj.name});
        this.apiClient.postJSON("/verifyThirdParty", JSON.stringify(this.state)).then((res) => {
            if(res.userExists){
                this.props.onLoggedInChanged(true, res.email, res.userObject, '', res.userName, res.uniqueId);
                this.props.updateUserAccountType("google");
                this.props.updateUserId(res.userId);
                this.props.history.push('/');
            }else{
                this.props.updateUserEmail(response.profileObj.email);
                this.props.updateUserName(response.profileObj.name);
                this.props.updateLoggedInThirdPartyUserId(response.profileObj.googleId);
                //this.props.onLoggedInChanged(true, response.profileObj.email, '', response.profileObj.name, "noob");
                this.props.updateUserAccountType("google");
                this.apiClient.postJSON("/saveUser", JSON.stringify(this.state)).then((res) => {
                    if(res.userCreated){
                        this.props.onLoggedInChanged(true, res.email, res.userObject, '', response.profileObj.name, response.profileObj.googleId);
                        this.props.updateUserId(res.userId);
                        //this.props.history.push('/');
                        this.props.history.push({
                            pathname:"/",
                            state:{firstTimeUser:true}
                          });
                    }
                })
            }
        })
    }
    };

    onMSLogin = () =>{
        new MicrosoftAuthService().logIn().then((data, err) => {
            if(err){
                throw err;
            }
            //console.log('google login response: ' + JSON.stringify(data));
            //this.props.onLoggedInChanged(true, data.account.userName, '', data.account.name, "noob");
            this.setState({thirdPartyUserId:data.account.accountIdentifier, email:data.account.userName, userName:data.account.name});
            this.apiClient.postJSON("/verifyThirdParty", JSON.stringify(this.state)).then((res) => {
                if(res.userExists){
                    this.props.onLoggedInChanged(true, res.email, res.userObject, '', res.userName, res.uniqueId);
                    this.props.updateUserAccountType("ms");
                    this.props.updateUserId(res.userId);
                    this.props.history.push('/');
                }else{
                    this.props.updateUserEmail(data.account.userName);
                    this.props.updateUserName(data.account.name);
                    this.props.updateLoggedInThirdPartyUserId(data.account.accountIdentifier);
                    this.apiClient.postJSON("/saveUser", JSON.stringify(this.state)).then((res) => {
                        if(res.userCreated){
                            this.props.onLoggedInChanged(true, res.email, res.userObject, '', data.account.name, data.account.accountIdentifier);
                            this.props.updateUserId(res.userId);
                            //this.props.history.push('/');
                            this.props.history.push({
                                pathname:"/",
                                state:{firstTimeUser:true}
                              });
                        }
                    })
                }
            });
        });
    }
    render(){
        //const howitWorksVideo = `${process.env.PUBLIC_URL}/asl_interpretationVideos/You_use_ASL.mp4`;
        return(
            <div>
                <Row style={this.h1marginTop}>
                    <h1>Sign in to create an account</h1>
                    </Row>
                    
                 <Row>
                    <Col md="12" className="signIn-Div margin-top padding-left">
                    <h2 className="signInHeader">SIGN IN</h2>
                    <p>Please sign in to the site using one of the following accounts. If this is your first time visiting this site, signing in will create your account.</p>
                  <Row style={this.marginBottom}>
                    {/* <MicrosoftLogin graphScopes={["user.read"]} withUserData={true} clientId={"1a7c088b-05a0-49f3-8059-f994518ccfec"} redirectUri={"http://localhost:3000"} authCallback={this.authHandler} /> */}
                    <MicrosoftLoginButton onClick={this.onMSLogin} style={{width:'250px'}} />
                  </Row>
                  <Row style={this.marginBottom}>
                    <FacebookLogin appId="503338286890805" autoLoad={true} fields="name,email,picture" callback={this.responseFacebook} cssClass="my-facebook-button-class" icon="fa-facebook"/>
                  </Row>
                  <Row className="googleIcon" style={this.marginBottom}>
                    <GoogleLogin autoLoad={false} style={this.googleStyling} clientId="525097466554-840kfhbnpgm1ebno21hh0usjjmsmiusr.apps.googleusercontent.com" buttonText="LOGIN WITH GOOGLE" onSuccess={this.responseGoogle} onFailure={this.responseGoogle}/>
                  </Row>
                  </Col>
                  </Row>
                  {/* <Modal show={this.state.show} onHide={this.handleClose} backdrop="static" style={{top:"30%"}}>
                        <Modal.Header closeButton>
                            <Modal.Title>Cookies Warning</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>Please enable third-party cookies on your browser settings for the login functionality to work! <b>For Chrome instructions, click <a href="https://support.google.com/accounts/answer/61416?co=GENIE.Platform%3DDesktop&hl=en">here</a>.</b></Modal.Body>
                        </Modal>       */}
            </div>
        );
    }
}