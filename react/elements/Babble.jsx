import { Component } from 'react';
import React from 'react';
import moment from 'moment';
import Services from '../../services';
import Comment from './Comment.jsx';
import CommentForm from './CommentForm.jsx';
import CommentModal from './CommentModal.jsx';

/* 
 * React component for babble
 * Author(s): stacyho
 */

export default class Babble extends Component {
    constructor(props){
        super(props);
        this.state = {
            gaveGoodVibe: false,
            gaveBadVibe: false,
            isHidden: false
        };
        this.getVibesUserGave = this.getVibesUserGave.bind(this);
        this.handleClickGoodVibe = this.handleClickGoodVibe.bind(this);
        this.handleClickBadVibe = this.handleClickBadVibe.bind(this);
        this.viewRedactedBabble = this.viewRedactedBabble.bind(this);
        this.hideRedactedBabble = this.hideRedactedBabble.bind(this);
        this.openCommentModal = this.openCommentModal.bind(this);
    }

    componentDidMount(){
        this.getVibesUserGave(this.props.babble); 

        if (this.props.babble.shouldBeRedacted) {
            this.setState({
                isHidden: true
            });
        } 
    }

    componentWillReceiveProps(nextProps){
        this.getVibesUserGave(nextProps.babble);
        if (nextProps.babble.shouldBeRedacted) {
            this.setState({
                isHidden: true
            });
        } else {
            this.setState({
                isHidden: false
            });
        } 
    }

    getVibesUserGave(babble){
        var userId = this.props.user._id;
        if (babble.goodVibeUsers.indexOf(userId) != -1){
            this.setState({
                gaveGoodVibe: true
            });
        } else {
            this.setState({
                gaveGoodVibe: false
            });
        }
        if (babble.badVibeUsers.indexOf(userId) != -1){
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
        Services.babble.goodVibeBabble(this.props.babble._id).then((res) => {
            if (res.success){
                this.props.onVibeBabble(this.props.babble._id);
            }
        }).catch((err) => {
            if (err.statusCode == 403){
                alert("Your session has expired. Please log in again.")
            }
          });
    }

    handleClickBadVibe(){
        Services.babble.badVibeBabble(this.props.babble._id).then((res) => {
            if (res.success){
                this.props.onVibeBabble(this.props.babble._id);
            }
        }).catch((err) => {
            if (err.statusCode == 403){
                alert("Your session has expired. Please log in again.")
            }
          });
    } 

    viewRedactedBabble(){
        this.setState({
            isHidden: false
        });
    }

    hideRedactedBabble(){
        this.setState({
            isHidden: true
        });
    }

    openCommentModal(){
        this.refs.commentModal.openModal();
    }

    render(){

        var babble = this.props.babble;

        var goodVibeImg = this.state.gaveGoodVibe ? <img src='/img/good_vibe_given.png' alt="Good vibes" className='vibe-icon'/>
            : <img src='/img/good_vibe.png' alt="Good vibes" className='vibe-icon'/>;
        var badVibeImg = this.state.gaveBadVibe ? <img src="/img/bad_vibe_given.png" alt="Bad vibes" className='vibe-icon'/>
            : <img src="/img/bad_vibe.png" alt="Bad vibes" className='vibe-icon'/>; 

        var babbleContent = this.state.isHidden ? null : 
                <p className='babble-content'>{ babble.content }</p>;
        var commentThread = this.state.isHidden ? null : 
                babble.comments.map((comment,key) => 
                { return <Comment comment={comment} key={key} onVibeComment={this.props.onVibeComment} babble={babble} user={this.props.user}/>});
        var commentForm = this.state.isHidden ? null : 
                <CommentForm onPostComment={this.props.onPostComment} babble={babble}/>;

        var hideOrViewBabbleButton = this.state.isHidden ? 
            <button className="btn btn-default" onClick={this.viewRedactedBabble}> Click to view </button>
            : <button className="btn btn-default" onClick={this.hideRedactedBabble}> Hide content </button>
        var redactedMessage = babble.shouldBeRedacted ? 
            <div className="alert alert-warning"> Warning: This babble gives off too many bad vibes.
                {hideOrViewBabbleButton}
            </div> : null

        return (
            <div className='babble-thread'>
                <div className='babble-number'>{ '#' + babble.babbleNumber}
                </div>
                <div className='babble'>
                    <p className='display-name'>{ babble.displayName}</p>
                    {redactedMessage}
                    {babbleContent}
                    <button type='click' className='btn btn-default' onClick={this.handleClickGoodVibe}> {goodVibeImg} </button> 
                    <span className="vibes-count">{babble.goodVibeUsers.length}</span>
                    <button type='click' className='btn btn-default' onClick={this.handleClickBadVibe}> {badVibeImg} </button> 
                    <span className="vibes-count">{babble.badVibeUsers.length}</span> 
                    <button type='click' className='btn btn-default' onClick={this.openCommentModal}> Comment </button>  
                    <span className='timestamp'>{ moment(babble.timestamp).format('LLLL') }</span>
                </div>  
                <CommentModal ref="commentModal" onPostComment={this.props.onPostComment} babble={babble}/>           
                {commentThread}
                {commentForm}
            </div>
        )
    }
}

Babble.propTypes = {
    babble : React.PropTypes.shape({
        _id: React.PropTypes.string.isRequired,
        babbleNumber : React.PropTypes.number.isRequired,
        displayName: React.PropTypes.string.isRequired,
        timestamp : React.PropTypes.any.isRequired,
        content : React.PropTypes.string.isRequired
    }).isRequired
};