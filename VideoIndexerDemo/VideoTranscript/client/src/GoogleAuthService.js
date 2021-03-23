import config from "./Config";
export default class GoogleAuthService{
    //constructor(){
        // window.gapi.load('auth2', function() {
        //     window.gapi.auth2.init({
        //         client_id:config.googleAuthConfig.clientId,
        //         scope:'https://www.googleapis.com/auth/userinfo.profile'
        //     });
        // });
    //}
    getGoogleAccount = () =>{
        return new Promise(function(resolve, reject){
            window.gapi.load('auth2', function() {
                window.gapi.auth2.init({
                    client_id:config.googleAuthConfig.clientId,
                    scope:'https://www.googleapis.com/auth/userinfo.profile'
                }).then(function(){
                    var auth = window.gapi.auth2.getAuthInstance();
                    var user = auth.currentUser.get().getBasicProfile();
                    if(user){
                        resolve(user);
                    }
                    else{
                        //reject("no google auth instance found.");
                    }
                });
            });
        });
    }
    logOut = () => {
        //window.gapi.auth2.getAuthInstance().signOut();
        window.gapi.auth2.getAuthInstance().disconnect();
    }
}