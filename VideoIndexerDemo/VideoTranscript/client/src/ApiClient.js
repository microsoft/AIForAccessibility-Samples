export default class ApiClient{
    
    get = async (routeName, queryString) => {
        var url = process.env.REACT_APP_SERVER_URL + routeName + queryString;
        const response = await fetch(url);
        if (response.status !== 200){
            throw Error(response.message);  
        } 
        return response;
    }

    getJSON = async (routeName, queryString) => {
        var url = process.env.REACT_APP_SERVER_URL + routeName + queryString;
        const response = await fetch(url);
        const json = await response.json();
        if (response.status !== 200){
            throw Error(json.message);
        } 
        return json;
    }

    post = async (routeName, body) => {
        var url = process.env.REACT_APP_SERVER_URL + routeName
        const response = await fetch(url, {
            method: 'POST',
            body: body,
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
        });
        const res = await response;
        if (res.status !== 200){
            throw Error(body.message); 
        }
        return res;
    }

    postJSON = async (routeName, body) => {
        var url = process.env.REACT_APP_SERVER_URL + routeName;
        const response = await fetch(url, {
            method: 'POST',
            body: body,
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
        });
        const json = await response.json();
        if (json.status !== 200){
            //console.log(json.status); 
        }
        return json;
    }

}