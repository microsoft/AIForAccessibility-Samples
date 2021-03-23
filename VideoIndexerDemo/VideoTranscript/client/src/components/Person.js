import React from "react";

export default class Person extends React.Component {
    constructor(props) {
        super(props);
    }
    imgcontainer={
        height:40,
        width:40
    }
    textStyle={
        textTransform:"capitalize"
    }
    render() {
        return (
            <div>
            { this.props.loggedIn && <div className="person">
              <span style={this.textStyle}>Hi, {this.props.userName}</span>
                
            </div>
            }
            
           {!this.props.loggedIn && <div className="person" style={this.person} size={this.props.size}>
            <span style={this.imgcontainer}><img className="userimg" src={this.props.img} height="30" alt={this.props.alt} /></span>
        </div>}
        </div>
        )
    }
}