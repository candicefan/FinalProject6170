import { Component } from 'react';
import React from 'react';
import Services from '../../services';
import { Popover, OverlayTrigger } from 'react-bootstrap';

/* 
 * React component for posting comment form
 * Author(s): stacyho
 */

export default class CommentForm extends Component {
    constructor(props){
        super(props);
        this.state = {
            commentContent : '',
            isAnonymous: 'true'
        }
        this.updateFormVal = this.updateFormVal.bind(this);
        this.postComment = this.postComment.bind(this);
    }

    updateFormVal(event){
        var updatedField = event.target.name;
        var updatedValue = event.target.value;
        this.setState((prevState) => {
            prevState[updatedField] = updatedValue;
            return prevState;
        })
    }

    postComment(event){
        event.preventDefault();
        var isAnonymous = this.state.isAnonymous == 'true' ? true : false;
        Services.comment.postComment(this.props.babble._id, this.state.commentContent, isAnonymous)
          .then((res) => {
            if (res.success){
                this.setState({
                    commentContent : '', 
                    isAnonymous: 'true'
                });
                this.props.onPostComment(this.props.babble._id);
            } else {
                console.log(res.err);
            }
          }).catch((err) => {
            if (err.statusCode == 403){
                alert("Your session has expired. Please log in again.")
            }
          });
        if (this.props.closeModal){
            this.props.closeModal();
        }
    }

    render(){

        return (
            <form onSubmit={this.postComment} className="comment-posting-form">
                <div className='form-group'>
                    <textarea className='form-control' placeholder="What's on your mind? Post a comment here..." name="commentContent"
                           value={this.state.commentContent} onChange={this.updateFormVal} required/>
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
                <button type='submit' className='btn post-comment-button'> Post </button>
            </form>
        );
    }
}