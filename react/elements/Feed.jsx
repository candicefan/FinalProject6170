import { Component } from 'react';
import React from 'react';
import Babble from './Babble.jsx';

/* 
 * React component for feed
 * Author(s): stacyho
 */

export default class Feed extends Component {
    constructor(props){
        super(props);
    }

    render(){
        return (
            <div className='feed'>
                { this.props.babbles.map((babble,key) => 
                    { return <Babble babble={babble} key={key} onPostComment={this.props.onPostComment}
                      onVibeBabble={this.props.onVibeBabble} onVibeComment={this.props.onVibeComment} 
                      onCheckForNewComments={this.props.onCheckForNewComments} user={this.props.user} />})
                }
            </div>
        )
    }
}

Feed.propTypes = {
    babbles : React.PropTypes.arrayOf(React.PropTypes.shape({
        _id: React.PropTypes.string.isRequired,
        babbleNumber : React.PropTypes.number.isRequired,
        displayName: React.PropTypes.string.isRequired,
        timestamp : React.PropTypes.any.isRequired,
        content : React.PropTypes.string.isRequired
    })).isRequired
};