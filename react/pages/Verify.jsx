import { Component } from 'react';
import React from 'react';
import { Link, withRouter } from 'react-router';
import Services from '../../services';

/* 
 * Verify account page
 * Author(s): stacyho
 */

class Verify extends Component {
    constructor(props){
        super(props);
        this.state = {
            successMsg : 'Your account has been successfully verified!',
            errorMsg: '',
            successfullyVerified: false
        };
        this.verifyUser = this.verifyUser.bind(this);
    }

    componentDidMount(){
        this.verifyUser();   
    }

    verifyUser(){
        Services.user.verify(this.props.params.token)
          .then((res) => {
            if (res.success){
                this.setState({
                    successfullyVerified: true
                });
            } 
          }).catch((err) => {
            this.setState({
                errorMsg: err.error.err 
              });
          });
    }

    render(){
        var successMsg = this.state.successfullyVerified ? 
            <div id="success-msg" className="alert alert-success">
                {this.state.successMsg}
                <div> Click <Link to={'/login'}>here</Link> to login </div>
            </div> : null;

        var errorMsg = this.state.successfullyVerified ?
            null : <div id="error-msg" className="alert alert-danger" >
                    {this.state.errorMsg} 
                    <div> Click <Link to={'/signup'}>here</Link> to signup </div>
                   </div>;

        return (
            <div className='verify-page'>
                {successMsg}
                {errorMsg}
            </div>
        )
    }
}

export default withRouter(Verify);