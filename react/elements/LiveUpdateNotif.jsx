import { Component } from 'react';
import React from 'react';
import Services from '../../services';

/* 
 * React component for live update notification
 * Author(s): stacyho
 */

export default class LiveUpdateNotif extends Component {
    constructor(props){
        super(props);
        this.state = {
            newBabbles: false,
            showNotif: false
        };
        this.checkForNewBabbles = this.checkForNewBabbles.bind(this);
        this.showNewBabbles = this.showNewBabbles.bind(this);
    }

    componentDidMount(){
        setInterval(() => {
            if (this.props.user){
                this.checkForNewBabbles();
            }
        }, 1000);
    }

    checkForNewBabbles(){
        Services.babble.checkForNewBabbles().then((res) => {
            if (res.success){
                // if new babbles have been posted
                if (res.content.babbleUpdate == true){
                    this.setState({
                        newBabbles: true,
                        showNotif: true
                    });
                }
                // if the loaded babbles have new comments
                if (res.content.babblesToUpdate.length > 0) {
                    this.props.onNewComments(res.content.babblesToUpdate);
                }
            }
        }).catch((err) => {
            if (err.statusCode == 403){
                this.props.onLogoutUser();
            }
          });;       
    }

    showNewBabbles(){
        this.props.onNewBabbles();
        this.setState({
            showNotif: false
        });
    }

    render(){
        var notifItem = this.state.showNotif ? 
            <div className='live-update-notification'>
                <div className="alert alert-success">
                    New babbles have been posted! 
                    <button className="btn btn-default" type="button" onClick={this.showNewBabbles}> 
                        See new babbles 
                    </button>
                </div>
            </div> : null;

        return (
            <div className='live-update-notification-box'>
                {notifItem}
            </div>
        )
    }
}