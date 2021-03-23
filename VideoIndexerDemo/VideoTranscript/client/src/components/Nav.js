import React from "react";
import Person from './Person';
import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    Dropdown, DropdownToggle, DropdownMenu, DropdownItem
} from "reactstrap";
import { NavLink, Link } from 'react-router-dom';
import { PropTypes } from 'prop-types';
import cookie from "react-cookies";
import { withRouter } from 'react-router-dom';
import defaultProfileImg from './profile.svg';
//import cookie from 'react-cookies';

class TopNav extends React.Component {

    constructor(props) {
        super(props);
        this.toggle = this.toggle.bind(this);   
        this.dropDownMenu = React.createRef();
        this.toggleUserDropdown = this.toggleUserDropdown.bind(this);
        this.state = {
            isOpen: false,
            isDropdownOpen:false,
            show:false,
            defaultProfileImg:'profile.svg',
            userId:this.props.userId
        };
        this.style = {
            light: "ffffff"
        };
        // eslint-disable-next-line
        //this.personURL = `${process.env.PUBLIC_URL}/daniellebragg.jpg`;
        // this.personURL = this.props.profileImg;
        // this.handleClose = this.handleClose.bind(this);
        // this.deleteUserAccount = this.deleteUserAccount.bind(this);
        // this.handleShow = this.handleShow.bind(this);
        // this.showConfirmDeleteDialog = this.showConfirmDeleteDialog.bind(this);
    }


    componentDidMount(){
        var button = document.getElementById("userProfileDropdownMenu");
        if(button === undefined || button === null)
        {
            button = document.getElementsByClassName("nav-link btn btn-secondary");
            button[0].setAttribute("aria-label", "User Options");
        }else{
            button.setAttribute("aria-label", "User Options");
        }
        
    }
    componentWillReceiveProps(props){
        
    }

    logout = async () => {
        var url = process.env.REACT_APP_SERVER_URL + "/logout";
        const response = await fetch(url, {method: 'get', credentials:'include'});
        const body = await response;
        if (response.status !== 200){
            //console.log(response.status); 
            throw Error(body.message); 
        }
        return response;
    };


    toggle() {
        this.setState(prevState => ({
            isOpen: !prevState.isOpen
          }));
    }

    toggleUserDropdown() {
        this.setState(prevState => ({
            isDropdownOpen: !prevState.isDropdownOpen
          }));
    }
    

    handleClose() {
        this.setState({show:false});
    }

    handleShow() {
        this.setState({show:true});
    }

    showConfirmDeleteDialog() {
        this.setState({show:true});
    }

    
    getApplicationNode = () => {
        return document.getElementById('root');
      };
     
    render() {
        if(this.props.isLoggedIn)
        {
            this.links =  [
                {
                    text: "Home",
                    url: "/",
                    exact: true
                },
                {
                    text: "Speechmodel upload",
                    url: "/speechFileUpload"
                },
                {
                    text: "Video upload",
                    url: "/videoFileUpload"
                },
                {
                    text: "My videos",
                    url: "/videoList"
                },
                // {
                //     text:"Logout",
                //     url:"/logout"
                // },
                {
                    text: <Person img="" name="Anonymous User" size="small" alt="User options" loggedIn={this.props.isLoggedIn} userName={this.props.userName}/>,
                    url: '/profile',
                    className: 'userinfo',
                    user:true
                }
            ];
        }else{
            this.links =  [
            // {
            //     text: "Home",
            //     url: "/",
            //     exact: true
            // },
            // {
            //     text: "Speechmodel upload",
            //     url: "/speechFileUpload"
            // },
            // {
            //     text: "Video upload",
            //     url: `/videoFileUpload/`
            // },
            // {
            //     text: "List",
            //     url: "/list"
            // },
            // {
            //     text: "Explore",
            //     url: "/explore"
            // },
            {
                text: <Person img={this.props.profileImg} name="Danielle Bragg" size="small" alt="User options" loggedIn={this.props.isLoggedIn}/>,
                url: '/profile',
                className: 'userinfo',
                ananymousUser:true
            }
        ];
        }
        //const loginClass = this.props.disableLogin ? "nav-anchorLink disabled" : "nav-anchorLink";
        const navLinks = this.links.map((item, index) => {
            if(!item.user && !item.ananymousUser){
                return (
                    <NavItem key={index}>
                        <NavLink to={item.url} exact={item.exact} className='nav-link' activeclassname="active nav-link" aria-current="page">
                            {item.text}
                        </NavLink>
                    </NavItem>
                )
            }else if(item.user){
                return (<NavItem key={index+0.1}>
                <Dropdown ref={this.dropDownMenu} className="nav-item" key={index} isOpen={this.state.isDropdownOpen} toggle={this.toggleUserDropdown} aria-controls="userProfileMenu">
                    <DropdownToggle className="nav-link" id="userProfileDropdownMenu" activeclassname="active nav-link">
                        <Person img="" name="" size="small" alt="User options" loggedIn={this.props.isLoggedIn} userName={this.props.userName}/>
                    </DropdownToggle>
                    <DropdownMenu id="userProfileMenu">
                        <DropdownItem className="nav-anchorLink" tag={Link} to="/settings" aria-label="SettingsPageLink">
                                Settings Page
                        </DropdownItem>
                        <DropdownItem className="nav-anchorLink" tag={Link} to="/tpLogout" aria-label="Signoutlink">
                                Sign out
                        </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                  </NavItem>)
                }else if(item.ananymousUser){
                    return (<NavItem key={index + 0.1}>
                    <Dropdown className="nav-item" key={index} isOpen={this.state.isDropdownOpen} toggle={this.toggleUserDropdown}>
                    <DropdownToggle className="nav-link" activeclassname="active nav-link">
                        <Person img={defaultProfileImg} name="" size="small" alt="User Options" loggedIn={this.props.isLoggedIn} userName=""/>
                    </DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem className="nav-anchorLink" tag={Link} to="/tpLogin" aria-label="Login/Signup Link">
                                Login/Sign Up
                        </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                  </NavItem>)
                }              
            })
        return (
            <React.Fragment>
                <Navbar dark expand="md" className="bg-darknav">
                    <NavbarBrand href="/">
                        AI for Accesibility
                    </NavbarBrand>
                    <NavbarToggler onClick={this.toggle} />
                    <Collapse isOpen={this.state.isOpen} navbar>
                        <Nav className="ml-auto" navbar>
                            
                            {navLinks}
                            {/* <NavItem key="999">
                        <FacebookLogin
                            appId="2048718998563151"
                            autoLoad={true}
                            fields="name,email,picture, username"
                            callback={this.responseFacebook}
                            cssClass="my-facebook-button-class"
                            icon="fa-facebook"s
                        />
                    </NavItem> */}
                        </Nav>
                    </Collapse>
                </Navbar>
                {/* <Modal show={this.state.show} onHide={this.handleClose} backdrop="static" style={{top:"30%"}} aria-hidden="false">
                    <Modal.Header closeButton>
                    <Modal.Title>Delete Account</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>Are you sure you want to delete your account? All of your videos and other data will be deleted, and will not be recoverable. Click yes to continue.</Modal.Body>
                    <Modal.Footer>
                    <button className="btn btn-primary mt-3" onClick={this.deleteUserAccount} aria-label="Click button to continue deleting the user account">Yes</button>
                    <button className="btn btn-secondary mt-3" onClick={this.handleClose} aria-label="Click button to Cancel user account deletion">No</button>
                    </Modal.Footer>
                </Modal> */}
                

            </React.Fragment>
        );
    }
}

export default withRouter(TopNav);

TopNav.propTypes = {
    video: PropTypes.object
}
