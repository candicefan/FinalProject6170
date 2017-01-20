import { Component } from 'react';
import React from 'react';
import { Link, withRouter } from 'react-router';
import Services from '../../services';

/* 
 * Sign up page
 * Author(s): stacyho
 */

class SignUp extends Component {
    constructor(props){
        super(props);
        this.state = {
            fullName: '',
            kerberos : '',
            password : '',
            confirmPassword: '',
            errorMsg: '',
            successMsg: ''
        };
        this.updateFormVal = this.updateFormVal.bind(this);
        this.registerUser = this.registerUser.bind(this);
    }

    updateFormVal(event){
        var updatedField = event.target.name;
        var updatedValue = event.target.value;
        this.setState((prevState) => {
            prevState[updatedField] = updatedValue;
            return prevState;
        })
    }

    registerUser(event){
        event.preventDefault();
        if (this.state.password.length < 6){
          this.setState({
            errorMsg: 'Password must be at least 6 characters!'
          });
          return;
        } 
        if (this.state.password != this.state.confirmPassword){
          this.setState({
            errorMsg: 'The passwords do not match!'
          });
          return;
        }
        if (this.state.kerberos.length < 3 || this.state.kerberos.length > 8){
          this.setState({
            errorMsg: 'The kerberos must be between 3 to 8 characters long.'
          }); 
          return;
        }
        if (! this.state.kerberos.match(/^[0-9a-z_]+$/)) {
          this.setState({
            errorMsg: 'The kerberos must only contain lowercase letters, numbers, and underscores.'
          });
          return;
        }
        Services.user.register(this.state.fullName, this.state.kerberos, this.state.password, this.state.confirmPassword)
          .then((res) => {
              if (res.success){
                var email = this.state.kerberos + '@mit.edu';
                this.setState({
                  successMsg: 'A verification email has been sent to ' + email + '. Please check your email.',
                  errorMsg: ''
                });
              } 
          }).catch((err) => {
                this.setState({
                  errorMsg: err.error.err,
                  successMsg: ''
                });
          });
    }

    render(){
        var signupError = this.state.errorMsg ? 
            <div id="error-msg" className="alert alert-danger">{this.state.errorMsg}</div>
            : null;
        var signupSuccess = this.state.successMsg ? 
            <div id="success-msg" className="alert alert-success">{this.state.successMsg}</div>
            : null;

        return (
            <div className='signup-page'>
              <h1>babble</h1>
              <form onSubmit={this.registerUser} id='signup-form'>
                  <h3> Sign up </h3>
                  <div className='form-group'>
                        <label htmlFor='full-name'>Full Name</label>
                        <input className='form-control' id='full-name' type='text' name='fullName' 
                        placeholder='Full name' value={this.state.fullName} onChange={this.updateFormVal} required/> 
                  </div>
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
                  <div className='form-group'>
                      <label htmlFor='confirm-password'>Confirm password</label>
                      <input className='form-control' id='confirm-password' type='password' name='confirmPassword'
                      placeholder='Confirm password' value={this.state.confirmPassword} onChange={this.updateFormVal} required/>
                  </div>
                  <button className='btn signup-btn' type='submit'>Sign Up</button>
                  {signupError}
                  {signupSuccess}
              </form>
              <p className="login-link"> Already have an account? 
                  <Link className="link" to={'/login'}>Log In</Link>
              </p>
            </div>
        )
    }
}

export default withRouter(SignUp);