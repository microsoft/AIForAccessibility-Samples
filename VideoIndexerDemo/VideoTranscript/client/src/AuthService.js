import MicrosoftAuthService from './MicrosoftAuthService';
import GoogleAuthService from './GoogleAuthService';
import FacebookAuthService from './FacebookAuthService';

export default class AuthService{
    constructor(){
        this.msAuthService = new MicrosoftAuthService();
        this.googleAuthService = new GoogleAuthService();
        this.fbAuthService = new FacebookAuthService();
    }
    isAuthenticatedUsingMS = () =>{
        var user = null;
        var msaccount = this.msAuthService.getMicrosoftAccount();
        if(msaccount !== null && msaccount !== undefined){
            //console.log('logged in ms user: '+ JSON.stringify(msaccount));
            user = {
                    userName: msaccount.userName,
                    email:msaccount.userName,
                    name: msaccount.name,
                    userId:msaccount.accountIdentifier,
                    accountType: 'ms'
                }
        }
        return user;
    }
    isAuthenticated = async() =>{
        var glAuth = this.googleAuthService;
        var bfAuth = this.fbAuthService;
        return new Promise(function(resolve,reject){
            glAuth.getGoogleAccount().then((glaccount) => {
                if(glaccount){
                    //console.log('logged in google user: ' + JSON.stringify(glaccount));
                    var gluser = {
                        userName: glaccount.getEmail(),
                        email: glaccount.getEmail(),
                        name: glaccount.getName(),
                        userId:glaccount.getId(),
                        accountType: 'google'
                    }
                    resolve(gluser);
                    return;
                }
            });
            bfAuth.getFacebookAccount().then((fbaccount) => {
                if(fbaccount){
                    //console.log('logged in fb user: ' + JSON.stringify(fbaccount));
                    var fbuser = {
                        userName: fbaccount.email,
                        email:fbaccount.email,
                        name: fbaccount.name,
                        userId:fbaccount.userID,
                        accountType: 'fb'
                    }
                    resolve(fbuser);
                    return;
                }
            });
            
        });
    }

    logOut = (accountType) =>{
        switch(accountType){
            case 'ms':{
                this.msAuthService.logOut();
                break;
            }
            case 'google':{
                this.googleAuthService.logOut();
                break;
            }
            case 'fb':{
                this.fbAuthService.logOut();
                break;
            }
        }
    }
}