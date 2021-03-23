// eslint-disable-next-line
import React, { Component } from "react";
// eslint-disable-next-line
import { Route, Switch } from "react-router-dom";
import { Container, Row, Col } from "reactstrap";
import TopNav from "./components/Nav";
import "./App.css";
import defaultProfileImg from './components/profile.svg';

import Home from "./Home";
import cookie from 'react-cookies';
import ApiClient from "./ApiClient";
import AuthService from './AuthService';
import SpeechModelsUpload from './SpeechModelsUpload';
import VideoFileUpload from './VideoFileUpload';
import VideoListing from './VideoListing';

import ThirdPartyLogin from "./components/ThirdPartyLogin";
import ThirdPartyLogout from "./components/ThirdPartyLogout";
import Settings from "./Settings";

class App extends Component {
    
    constructor() {
        super();
    //var cookieConsent = cookie.load("CookieConsent");
    this.apiClient = new ApiClient();
        this.state = {
            isOpen: false,
            isUserLoggedIn:false,
            loggedInAccountType:'',
            loggedInUser:'',
            loggedInUserName:'',
            loggedInUserId:'',
            loggedInThirdPartyUserId:'',
            loggedInUserEmail:'',
            settingsValue:"",
            videoPlayModeSettingsValue:"",
            video: null,
            selectedEmail:'',
            selectedUserId:'',
            defaultProfileImg:'profile.svg'
        };
        require('dotenv').config();
        this.updateSelectedUserDetails = this.updateSelectedUserDetails.bind(this);
        }

    onLoggedInChanged = (isLoggedIn, loggedInUser, userInfo, loggedInUserId, loggedInUserName, loggedInThirdPartyUserId) => {
        // if(isLoggedIn){
        //     userAccess = this.state.userAccessLevels.filter(x => x.name === loggedInUserLevel)[0];
        // }       
        this.setState({
            isUserLoggedIn: isLoggedIn,
            loggedInUser: loggedInUser,
            loggedInUserId: loggedInUserId,
            loggedInThirdPartyUserId: loggedInThirdPartyUserId,
            loggedInUserName: loggedInUserName,
            settingsValue: userInfo.settingsValue,
            videoPlayModeSettingsValue: userInfo.videoPlayModeSettings
        });
    if(isLoggedIn){         
        // this.apiClient.getJSON("/loadProfile", "?thirdPartyUserId="+loggedInThirdPartyUserId)
        // .then((lpRes) => {
        //     if(lpRes.profile !== null){
        //         if(lpRes.profile.img != null && lpRes.profile.img !== "")
        //         {
        //             this.setState({
        //                 profileImg:lpRes.profile.img
        //             });
        //         }else{
        //             this.setState({profileImg:defaultProfileImg});
        //         }
        //     }else{
        //         this.setState({profileImg:defaultProfileImg});
        //     }
        // })
        // .catch(err => {
        // console.error(err);
        // this.setState({ isLoggedOut: false });
        // }); 
        
        //this.updateVideoState(this.state.loggedInUser);
    }
    //console.log("userEmail: "+ loggedInUser + " - " + isLoggedIn);
    }
    loadUser = (userid, email) =>{
        this.apiClient.getJSON('/getUser', '?thirdPartyUserId='+userid+'&email='+email).then((res) => {
            if(res){
                if(res.user !== null){
                    this.updateUserId(res.user._id);
                    // var userAccess = this.state.userAccessLevels.filter(x => x.name === res.user.level)[0];
                    // this.setState({loggedInUserLevel:userAccess});
                    //this.getGroups(res.user._id);
                }
            }
        });
    }
   
    updateUserId = (id) => {
        this.setState({loggedInUserId: id});
        // this.getGroups(id);
        // this.updateVideoState();       
        //this.checkIfVerifyStudyCodeExists(id);
        // this.getRecordingsCount(id).then(res => {
        //     this.setState({totalUserRecordings : res.totalRecordedVideos, studyCompleted: res.studyCompleted})
        // });
    }
    updateUserAccountType = (type) => {
        this.setState({loggedInAccountType: type});
    }
    updateUserToken = (token) => {
        this.setState({userToken: token});
    }
    updateUserEmail = (email) => {
        this.setState({loggedInUser:email});
    }
    updateUserName = (name) => {
        this.setState({loggedInUserName:name});
    }
    logout = () => {
        new AuthService().logOut(this.state.loggedInAccountType);
        //var publicUserLevel = this.state.userAccessLevels.filter(x => x.name === 'public')[0];
        this.setState({
            isUserLoggedIn:false,
            loggedInAccountType:'',
            loggedInUser:'',
            loggedInUserId:'',
            loggedInThirdPartyUserId:'',
            loggedInUserName:'',
            loggedInUserEmail:''
        })
        this.onLoggedInChanged(false, '', '', '', '', 'public');
      }

        // updateLoggedInUserName = (userName) => {
        //     this.setState({
        //         loggedInUserName:userName
        //     });
        // }
        updateLoggedInThirdPartyUserId = (userid) => {
            this.setState({
                loggedInThirdPartyUserId:userid
            });
        }

        updateSelectedUserDetails = (email, userId) =>{
            this.setState({selectedEmail: email, selectedUserId: userId});
        }

        updateSettingsInfo = (name) => {
            this.setState({settingsValue:name});
        }

        updatePlayModeSettingsInfo = (name) => {
            this.setState({videoPlayModeSettingsValue:name});
        }

       
    componentDidMount() {
        cookie.remove("NID");
        cookie.remove("G_ENABLED_IDPS");
        this.loadThirdPartyScripts();
        //this.updateVideoState();
        //this.checkForCookieConsent();
    }
    loadThirdPartyScripts = () =>{
                //this.setState({disableLogin:false});
                var aScript = document.createElement('script');
                aScript.type = 'text/javascript';
                aScript.src = "https://apis.google.com/js/platform.js";
                document.head.appendChild(aScript);
                var thisApp = this;
                aScript.onload = function(){
                var user = thisApp.updateMSUserAuthStatus();
        if(user !== null){
            //var tpUserid = user.userId;
            thisApp.apiClient.getJSON('/getUser', '?userid='+user.userId+'&email='+user.email)
            .then((res) => {
                if(res.user){
                    thisApp.onLoggedInChanged(true, res.user.email, res.user, '', res.user.fullName, res.user.thirdPartyUserId);
                    thisApp.updateUserAccountType('ms');
                    //this.updateUserId(res.user._id);
                    thisApp.loadUser(res.user.thirdPartyUserId, res.user.email);
                    //thisApp.getGroups(res.user._id);
                }
                
            });
        }
        thisApp.updateUserAuthStatus().then((res) => {
            if(res){
                //var tpUserid = res.userId;
                var accountType = res.accountType;
                thisApp.apiClient.getJSON('/getUser', '?userid='+res.userId+'&email='+res.email)
                .then((res) => {
                    if(res.user){
                    thisApp.onLoggedInChanged(true, res.user.email, res.user, '', res.user.fullName, res.user.thirdPartyUserId);
                    thisApp.updateUserAccountType(accountType);
                    //this.updateUserId(res.user._id);
                    thisApp.loadUser(res.user.thirdPartyUserId, res.user.email);
                    }
                });
            }
        });
                    cookie.remove("NID"); 
                    cookie.remove("G_ENABLED_IDPS");
	};
    }

    get = async ( apiCall, query ) => {
        // eslint-disable-next-line
        var url = process.env.REACT_APP_SERVER_URL + "/" + apiCall + "?" + query;
        //var url = "http://locahost:5000/" + apiCall;
        const response = await fetch(url);
        const body = await response.json();
        if (response.status !== 200) throw Error(body.message);
        return body;
    };


    updateMSUserAuthStatus = () =>{
        return new AuthService().isAuthenticatedUsingMS();
    }
    updateUserAuthStatus = () =>{
        return new Promise(function(resolve, reject){
            new AuthService().isAuthenticated().then((res) =>{
                if(res){
                    resolve(res);
                }else{
                    reject('User not logged in');
                }
            });
        });
    }
    // getRecordingsCount = async (loggedInUserId) => {
    //     return await this.apiClient.getJSON('/getRecordingsCount', '?userid='+loggedInUserId);
    // }

// checkForCookieConsent = () => {
//         this.get("getCookieConsent", "").then((msccResponse) => {
//             // console.log("msccResponse");
//             // console.log(msccResponse);
//             if(msccResponse && msccResponse.IsConsentRequired){
//                 this.setState({bannerHtml:msccResponse.Markup})
//                 var html = document.createElement('div');
//                 html.innerHTML =  msccResponse.Markup;
//                 document.body.insertBefore(html, document.body.childNodes[0]);
//                 var script = document.createElement('script');
//                 script.src = msccResponse.Js;
//                 document.head.appendChild(script);
//                 var me = this;
//                 script.onload = function(){
//                     var mscc = window.mscc;
//                     if(mscc){
//                         if(mscc.hasConsent()){
//                             me.loadThirdPartyScripts();
//                             me.setUserCookieConsent(true);                           
//                         }else{
//                             mscc.on('consent', function(){
//                                 me.loadThirdPartyScripts();
//                                 me.setUserCookieConsent(true);
//                             });
//                         }
//                     }
//                 }
//                 var sheet = document.createElement('link');
//                 sheet.rel = 'stylesheet';
//                 sheet.href = msccResponse.Css;
//                 sheet.type = 'text/css';
//                 document.head.appendChild(sheet);
               
//             }else{
//                 this.loadThirdPartyScripts();
//             }
//         });
//     }
    render() {
        return (
            <Container>
                <Row>
                    <Col sm="12" className="pl-0 pr-0">
                        <TopNav logOut={this.logout} profileImg={defaultProfileImg} isLoggedIn = {this.state.isUserLoggedIn} userName={this.state.loggedInUserName} userId={this.state.loggedInUserId} onLoggedInChanged={(isLoggedIn, loggedInUser) => this.onLoggedInChanged(isLoggedIn, loggedInUser)} />
                    </Col>
                </Row>
                <Switch>
                   {/* <Route exact path="/" component={Authorize(Home,{userName:this.state.loggedInUserName, userId:this.state.loggedInUserId}, this.onLoggedInChanged)} > */}
                        {/* <Route render={props => <Home {...props} />} /> */}
                    {/* </Route> */}
                    <Route exact path="/" render={props => <Home setCookieConsent={(cookieConsent) => this.setUserCookieConsent(cookieConsent)} updatePlayModeSettingsInfo = {(name) => this.updatePlayModeSettingsInfo(name)} isLoggedIn = {this.state.isUserLoggedIn} userName={this.state.loggedInUserName} userId={this.state.loggedInUserId} settingsValue={this.state.settingsValue} onLoggedInChanged={(isLoggedIn, loggedInUser, settingsValue, loggedInUserId, loggedInUserName, loggedInThirdPartyUserId) => this.onLoggedInChanged(isLoggedIn,loggedInUser, settingsValue, loggedInUserId, loggedInUserName, loggedInThirdPartyUserId)} {...props}/>}>
                    </Route>
                    <Route path="/tpLogin" render={props => <ThirdPartyLogin updateUserId={(id) => this.updateUserId(id)} updateUserName={(name) => this.updateUserName(name)} updateLoggedInThirdPartyUserId = {(userid) => this.updateLoggedInThirdPartyUserId(userid)} updateUserEmail={(email) => this.updateUserEmail(email)} updateUserAccountType={(type) => this.updateUserAccountType(type)} updateUserToken={(token) => this.updateUserToken(token)} onLoggedInChanged={(isLoggedIn, loggedInUser, settingsValue, loggedInUserId, loggedInUserName, loggedInThirdPartyUserId) => this.onLoggedInChanged(isLoggedIn,loggedInUser, settingsValue, loggedInUserId, loggedInUserName, loggedInThirdPartyUserId)} {...props}/>}>
                    </Route>
                    <Route path="/speechFileUpload" render={props => <SpeechModelsUpload isLoggedIn = {this.state.isUserLoggedIn} userName={this.state.loggedInUserName} userId={this.state.loggedInUserId} onLoggedInChanged={(isLoggedIn, loggedInUser, settingsValue, loggedInUserId, loggedInUserName, loggedInThirdPartyUserId) => this.onLoggedInChanged(isLoggedIn,loggedInUser, settingsValue, loggedInUserId, loggedInUserName, loggedInThirdPartyUserId)} {...props}/>}>
                    </Route>
                    <Route path="/videoFileUpload" render={props => <VideoFileUpload isLoggedIn = {this.state.isUserLoggedIn} userName={this.state.loggedInUserName} userId={this.state.loggedInUserId} onLoggedInChanged={(isLoggedIn, loggedInUser, settingsValue, loggedInUserId, loggedInUserName, loggedInThirdPartyUserId) => this.onLoggedInChanged(isLoggedIn,loggedInUser, settingsValue, loggedInUserId, loggedInUserName, loggedInThirdPartyUserId)} {...props}/>}>
                    </Route>
                    <Route path="/tpLogout" render={props => <ThirdPartyLogout logout={this.logout} {...props}/>}></Route>
		            <Route path="/videoList" render={props => <VideoListing UserId={this.state.loggedInUserId} settingsValue={this.state.settingsValue} playModeValue={this.state.videoPlayModeSettingsValue} {...props}/>}>
                    </Route>
                    <Route path="/settings" render={props => <Settings isLoggedIn = {this.state.isUserLoggedIn} userId={this.state.loggedInUserId} settingsValue={this.state.settingsValue} playModeValue={this.state.videoPlayModeSettingsValue} updateSettingsInfo = {(name) => this.updateSettingsInfo(name)} playModeValue={this.state.videoPlayModeSettingsValue} updatePlayModeSettingsInfo = {(name) => this.updatePlayModeSettingsInfo(name)} {...props}/>}>
                    </Route>
                </Switch>
                
                
            </Container>
        )};
}

export default App;
