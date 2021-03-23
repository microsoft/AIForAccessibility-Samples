import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
export default class Logout extends Component {
    constructor(props) {
      super(props)
      this.state = {
        isLoggedOut: false
      };
    }
    
    componentDidMount() {
        this.props.logout();
        this.setState({isLoggedOut:true});
      }

    
    render(){
        const { isLoggedOut } = this.state;
      if (isLoggedOut) {
        return <Redirect to="/tpLogin" />;
      }else{
          return null;
      }
    }
}