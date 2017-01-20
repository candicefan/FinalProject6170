import { Component } from 'react';
import React from 'react';
import { Link, withRouter } from 'react-router';
import Services from '../../services';

/* 
 * Login page
 * Author(s): stacyho
 */

class LogIn extends Component {
    constructor(props){
        super(props);
        this.state = {
            kerberos : '',
            password : '',
            errorMsg: ''
        };
        this.updateFormVal = this.updateFormVal.bind(this);
        this.loginUser = this.loginUser.bind(this);
    }

    updateFormVal(event){
        var updatedField = event.target.name;
        var updatedValue = event.target.value;
        this.setState((prevState) => {
            prevState[updatedField] = updatedValue;
            return prevState;
        })
    }

    loginUser(event){
        event.preventDefault();
        Services.user.login(this.state.kerberos, this.state.password)
          .then((res) => {
            if (res.success){
                this.props.router.push('/home');
            }
          }).catch((err) => {
            this.setState({
                errorMsg: err.error.err
              });
          });
    }

    render(){
        var loginError = this.state.errorMsg ? 
            <div id="error-msg" className="alert alert-danger">{this.state.errorMsg}</div>
            : null;

        return (
            <div className='login-page'>
                <h1>babble</h1>
                <form onSubmit={this.loginUser} id='login-form'>
                    <h3> Login </h3>
                    <div className='form-group'>
                        <label htmlFor='kerberos'>Kerberos</label>
                        <div className="input-group">      
                          <input className="form-control" id='kerberos' type="text" name='kerberos' 
                          placeholder="Kerberos" value={this.state.kerberos} onChange={this.updateFormVal} required/>
                          <span className="input-group-addon" id="basic-addon2">@mit.edu</span>
                        </div>
                    </div>
                    <div className='form-group'>
                        <label htmlFor='password'>Password</label>
                        <input className='form-control' id='password' type='password' name='password'
                        placeholder='Password' value={this.state.password} onChange={this.updateFormVal} required/>
                    </div>
                    <button className='btn login-btn' type='submit'>Log In</button>
                    {loginError}
                </form>
                <p className="signup-link"> Don&#39;t have an account? 
                    <Link className="link" to={'/signup'}>Sign Up</Link>
                </p>
            </div>
        )
    }
}

export default withRouter(LogIn);