import { Component } from 'react';
import React from 'react';
import moment from 'moment';
import Services from '../../services';

/* 
 * React component for comment
 * Author(s): stacyho
 */

export default class Comment extends Component {
    constructor(props){
        super(props);
        this.state = {
            gaveGoodVibe: false,
            gaveBadVibe: false
        };
        this.getVibesUserGave = this.getVibesUserGave.bind(this);
        this.handleClickGoodVibe = this.handleClickGoodVibe.bind(this);
        this.handleClickBadVibe = this.handleClickBadVibe.bind(this);
    }

    componentDidMount(){
        this.getVibesUserGave(this.props.comment);  
    }

    componentWillReceiveProps(nextProps){
        this.getVibesUserGave(nextProps.comment);
    }

    getVibesUserGave(comment){
        var userId = this.props.user._id;
        if (comment.goodVibeUsers.indexOf(userId) != -1){
            this.setState({
                gaveGoodVibe: true
            });
        } else {
            this.setState({
                gaveGoodVibe: false
            });
        }
        if (comment.badVibeUsers.indexOf(userId) != -1){
            this.setState({
                gaveBadVibe: true
            });
        } else {
            this.setState({
                gaveBadVibe: false
            });
        }
    }

    handleClickGoodVibe(){
        Services.comment.goodVibeComment(this.props.comment._id).then((res) => {
            if (res.success){
                this.props.onVibeComment(this.props.babble._id);
            }
        }).catch((err) => {
            if (err.statusCode == 403){
                alert("Your session has expired. Please log in again.")
            }
          });
    }

    handleClickBadVibe(){
        Services.comment.badVibeComment(this.props.comment._id).then((res) => {
            if (res.success){
                this.props.onVibeComment(this.props.babble._id);
            }
        }).catch((err) => {
            if (err.statusCode == 403){
                alert("Your session has expired. Please log in again.")
            }
          });
    } 

    render(){

        var comment = this.props.comment;
        var goodVibeImg = this.state.gaveGoodVibe ? <img src="/img/good_vibe_given.png" alt="Good vibes" className='vibe-icon'/>
            : <img src="/img/good_vibe.png" alt="Good vibes" className='vibe-icon'/>;
        var badVibeImg = this.state.gaveBadVibe ? <img src="/img/bad_vibe_given.png" alt="Bad vibes" className='vibe-icon'/>
            : <img src="/img/bad_vibe.png" alt="Bad vibes" className='vibe-icon'/>;

        return (
            <div className='comment'>  
                <span className='display-name'>{ comment.displayName}</span>             
                <span className='comment-content'>{ comment.content }</span>
                <div className='comment-vibe-info'>
                    <button type='click' className='btn btn-default' onClick={this.handleClickGoodVibe}> {goodVibeImg} </button> 
                    <span className="vibes-count">{comment.goodVibeUsers.length}</span>
                    <button type='click' className='btn btn-default' onClick={this.handleClickBadVibe}> {badVibeImg} </button> 
                    <span className="vibes-count">{comment.badVibeUsers.length}</span>
                    <span className='timestamp'>{ moment(comment.timestamp).format('LLLL') }</span>     
                </div>
            </div>
        )
    }
}

Comment.propTypes = {
    comment : React.PropTypes.shape({
        _id: React.PropTypes.string.isRequired,
        displayName: React.PropTypes.string.isRequired,
        timestamp : React.PropTypes.any.isRequired,
        content : React.PropTypes.string.isRequired
    }).isRequired
};