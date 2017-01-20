import { Component } from 'react';
import React from 'react';
import Services from '../../services';
import { withRouter } from 'react-router';
import { Popover, OverlayTrigger } from 'react-bootstrap';

/* 
 * React component for posting babble form
 * Author(s): stacyho
 */

export default class BabbleForm extends Component {
    constructor(props){
        super(props);
        this.state = {
            babbleContent : '',
            isAnonymous: 'true',
            errorMsg: ''
        }
        this.updateFormVal = this.updateFormVal.bind(this);
        this.postBabble = this.postBabble.bind(this);
    }

    updateFormVal(event){
        var updatedField = event.target.name;
        var updatedValue = event.target.value;
        this.setState((prevState) => {
            prevState[updatedField] = updatedValue;
            return prevState;
        })
    }

    postBabble(event){
        event.preventDefault();
        var isAnonymous = this.state.isAnonymous == 'true' ? true : false;
        Services.babble.postBabble(this.state.babbleContent, isAnonymous)
          .then((res) => {
            if (res.success){
                this.setState({
                    babbleContent : '', 
                    isAnonymous: 'true'
                });
                this.props.onPostBabble();
            }
          }).catch((err) => {
            this.setState({
                errorMsg: err.error.err
            });
            if (err.statusCode == 403){
                alert("Your session has expired. Please log in again.")
            }
          });
    }

    render(){
        var postBabbleError = this.state.errorMsg ? 
            <div id="error-msg" className="alert alert-danger">{this.state.errorMsg}</div>
            : null;

        return (
            <form onSubmit={this.postBabble} className='babble-posting-form'>
                <div className='form-group'>
                    <textarea className='form-control babble-text' placeholder="What do you want to share?" name="babbleContent"
                           value={this.state.babbleContent} onChange={this.updateFormVal} rows='5' required/>
                </div>
                <div className='form-group identity-choice-buttons'>
                    <div className="radio">
                      <label>
                        <input type="radio" value="true" name="isAnonymous" checked={this.state.isAnonymous == "true"} 
                        onChange={this.updateFormVal} /> Anonymously
                      </label>
                    </div>  
                    <div className="radio">
                      <label>
                        <input type="radio" value="false" name="isAnonymous" checked={this.state.isAnonymous == "false"} 
                        onChange={this.updateFormVal} /> Not Anonymously
                      </label>
                    </div>
                </div>
                <button type='submit' className='btn post-babble-button'> Post</button>
                {postBabbleError}
            </form>
        );
    }
}