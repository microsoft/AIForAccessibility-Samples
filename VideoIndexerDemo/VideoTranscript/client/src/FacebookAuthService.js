export default class FacebookAuthService{
    
    getFacebookAccount = () =>{
        return new Promise(function(resolve, reject){
            if (window.FB !== undefined && window.FB !== null) {
            window.FB.getLoginStatus(function(response){
                if(response.status === 'connected'){
                    //console.log(response);
                    var uid = response.authResponse.userID
                    var path = '/'+uid;
                    window.FB.api(path, { locale: 'en_US', fields: 'name, email' },
                        function(response) {
                            //console.log('fb current user profile: ' + response);
                            if(response){
                                response.userID = uid;
                                resolve(response);
                            }
                    });
                    //resolve(response)
                }else{
                    //reject('no fb user found');
                }
            })
        }
        });
    }
    logOut = () =>{
        window.FB.logout(function(response) {
        });
    }
}