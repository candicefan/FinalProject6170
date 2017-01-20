import { Component, PropTypes } from 'react';
import React from 'react';
import NavBar from '../Elements/NavBar.jsx';
import LiveUpdateNotif from '../Elements/LiveUpdateNotif.jsx';
import BabbleForm from '../Elements/BabbleForm.jsx';
import Feed from '../Elements/Feed.jsx';
import RankingTable from '../Elements/RankingTable.jsx';
import Services from '../../services';
import { withRouter } from 'react-router';
import { Popover, OverlayTrigger } from 'react-bootstrap';

/* 
 * Home page
 * Author(s): stacyho
 */

class Home extends Component {  
    constructor(props){
        super(props);
        this.state = {
            babbles : [],
            user : null
        }
        this.updateCurrentUser = this.updateCurrentUser.bind(this);
        this.onLogoutUser = this.onLogoutUser.bind(this);
        this.updateAllBabbles = this.updateAllBabbles.bind(this);
        this.updateBabble = this.updateBabble.bind(this);
        this.updateCommentsForBabble = this.updateCommentsForBabble.bind(this);
        this.updateSpecificBabbles = this.updateSpecificBabbles.bind(this);
    }

    componentDidMount(){
        this.updateCurrentUser();
        this.updateAllBabbles(); 
    }

    updateCurrentUser(){
        Services.user.getCurrentUser().then((res) => {
            if (res.success){     
                this.setState({
                    user: res.content.user
                });
            } else {
              console.log(res.err);
            }
        });
    }

    onLogoutUser(){
        this.setState({
            user: null
        });
    }

    updateAllBabbles(){
        Services.babble.getAllBabbles().then((res) => {
            if (res.success){
                this.setState((prevState) => {
                    prevState.babbles = res.content.babbles;
                    return prevState;
                });
                this.updateCurrentUser();
            } else {
              console.log(res.err);
            }
        });
    }

    updateSpecificBabbles(babblestoUpdateIds){
        Services.babble.getAllBabbles().then((res) => {
            if (res.success){
                var allBabbles = res.content.babbles;
                allBabbles.reverse();
                var updatedBabbles = this.state.babbles.map(function(babble){
                    if (babblestoUpdateIds.indexOf(babble._id) != -1) {
                        return allBabbles[babble.babbleNumber-1];
                    } else{
                        return babble;
                    }
                });
                this.setState({
                    babbles: updatedBabbles
                });
                this.updateCurrentUser();
            } else {
              console.log(res.err);
            }
        });
    }

    updateBabble(babbleId){
        Services.babble.getBabble(babbleId).then((res) => {
            if (res.success){
                var updatedBabbles = this.state.babbles.map(function(babble){
                    if (babble._id == babbleId){
                        return res.content;
                    } else{
                        return babble;
                    }
                });
                this.setState({
                    babbles: updatedBabbles
                });
                this.updateCurrentUser();
            } else {
              console.log(res.err);
            }
        });
    }

    updateCommentsForBabble(babbleId){
        Services.babble.getCommentsForBabble(babbleId).then((res) => {
            if (res.success){
                this.setState((prevState) => {
                    prevState.babbles.forEach(function(babble){
                        if (babble._id == babbleId){
                            babble.comments = res.content.comments;
                        }
                        return babble;
                    });
                    return prevState;
                });
                this.updateCurrentUser();
            } else {
              console.log(res.err);
            }
        });
    }


    render(){
        var limitPopover = 
            <Popover id="limit-popover" placement="right" positionLeft={200} positionTop={50} title="Posting limit">
                We limit each account to a certain number of babble posts per day.
                Your posting limit can increase or decrease depending on your reputation.
            </Popover>;

        var babbleLimitMessage = this.state.user ?
            <div className="alert alert-info limit-message">
                Daily babble posting limit: {this.state.user.babbleLimit} 
                <OverlayTrigger trigger={['hover', 'focus']} placement="right" overlay={limitPopover}>
                    <button className="btn btn-default" type="click">
                        <span className="glyphicon glyphicon-info-sign"></span>
                    </button>
                </OverlayTrigger>
            </div>
            : null; 

        var profileSection = this.state.user ?
            <div className="profile-section">
                <img className="profile-icon" src="/img/beaver.png" alt="" />
                <p className="profile-kerberos"> {this.state.user.kerberos} </p>
                <p className="profile-name"> {this.state.user.name} </p>
            </div> : null;       

        return (
            <div className='home-page'>
                <NavBar user={this.state.user} onLogoutUser={this.onLogoutUser} />
                <div className="container">
                    <div className="col-md-2">
                        {profileSection}
                    </div>
                    <div className="col-md-7">
                        <LiveUpdateNotif onNewBabbles={this.updateAllBabbles} onNewComments={this.updateSpecificBabbles}
                        user={this.state.user} onLogoutUser={this.onLogoutUser}/>
                        {babbleLimitMessage}
                        <BabbleForm onPostBabble={this.updateAllBabbles} onLogoutUser={this.onLogoutUser} />
                        <Feed babbles={this.state.babbles} onPostComment={this.updateCommentsForBabble}
                         onVibeBabble={this.updateBabble} onVibeComment={this.updateCommentsForBabble} 
                         user={this.state.user}/>
                    </div>
                    <div className="col-md-3">
                        <RankingTable />
                    </div>
                </div>
             </div>
        )
    }
}



export default Home;