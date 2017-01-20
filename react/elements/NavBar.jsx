import { Component } from 'react';
import React from 'react';
import { withRouter } from 'react-router';
import Services from '../../services';

/* 
 * React component for navigation bar
 * Author(s): stacyho
 */

class NavBar extends Component {
    constructor(props){
        super(props);
        this.logout = this.logout.bind(this);
    }

    logout(){
        Services.user.logout().then((res) => {
            if (res.success){
                this.props.onLogoutUser();
                this.props.router.push('/login');
            }
        }).catch((err) => {
            if (err.statusCode == 403){
                this.props.router.push('/login');
            }
        });
    }

    render(){
        return (
            <nav className='navbar navbar-default'>
                <div className='navbar-header'>
                    babble
                </div>
                <ul className='nav navbar-nav navbar-right'>
                    <li>
                        <a onClick={this.logout} href="#">Log Out</a>
                    </li>
                </ul>
            </nav>
        )
    }
};

export default withRouter(NavBar);