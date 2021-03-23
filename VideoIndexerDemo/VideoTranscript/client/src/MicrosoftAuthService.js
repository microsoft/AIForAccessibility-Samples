import config from "./Config";
import { UserAgentApplication } from 'msal';
export default class MicrosoftAuthService{
    constructor(){
        this.userAgentApplication = new UserAgentApplication({
            auth: {
                clientId: config.msAuthConfig.clientId,
                redirectUri:config.msAuthConfig.redirectUri,
                postLogoutRedirectUri:config.msAuthConfig.redirectUri
            },
            cache: {
                cacheLocation: "localStorage",
                storeAuthStateInCookie: true
            }
        });
    }

    getMicrosoftAccount = () =>{
        return this.userAgentApplication.getAccount();
    }

    logOut = () => {
        this.userAgentApplication.logout();
    }

    logIn = () => {
        var agent = this.userAgentApplication;
        return new Promise(function(resolve, reject){
            const loginRequest = {
                scopes: ["https://graph.microsoft.com/User.Read"]
            }
            agent.loginPopup(loginRequest).then(function (loginResponse) {
                if(loginResponse){
                    resolve(loginResponse);
                }else{
                    reject("unable to login");
                }
                
            }).catch(function (error) {
                //console.log(error);
            });
        });
        
    }

}
