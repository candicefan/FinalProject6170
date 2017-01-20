import { Component } from 'react';
import React from 'react';
import moment from 'moment';
import Services from '../../services';
import { Popover, OverlayTrigger } from 'react-bootstrap';

/* 
 * React component for leaderboard
 * Author(s): stacyho
 */

export default class RankingTable extends Component {
    constructor(props){
        super(props);
        this.state = {
            topUsers : [],
            lastUpdated: moment().format('LLLL')
        };
        this.getTopUsers = this.getTopUsers.bind(this);
    }

    componentDidMount(){
        this.getTopUsers();   
    }

    getTopUsers(){
        Services.user.getTopUsers().then((res) => {
            if (res.success){
              this.setState({
                topUsers: res.content.topTen,
                lastUpdated: res.content.updateTime
              });
            } else {
              console.log(res.err);
            }
        });
    }

    render(){  

        var leaderboardPopover = 
                <Popover id="leaderboard-popover" placement="right" positionLeft={200} positionTop={50} title="Babble Leaderboard">
                    The leaderboard is updated weekly to show the users with the highest reputations.
                    Every user starts out with a reputation of 0. Your reputation increases by 1 each time
                    you post a babble or a comment, and each time your babble / comment is upvoted. 
                    Your reputation decreases by 1 each time your babble / comment is downvoted.
                </Popover>;

        return (
            <div className='ranking-board'> 
                <img className="leaderboard-img" src="img/leaderboard.png" alt=""/>
                <h3> Babble Leaderboard </h3>
                <p className="last-updated"> Last Updated at {moment(this.state.lastUpdated).format('LLLL')} </p>
                <OverlayTrigger trigger={['hover', 'focus']} placement="right" overlay={leaderboardPopover}>
                  <button className="btn btn-default" type="click">
                    <span className="glyphicon glyphicon-info-sign"></span> What is this?
                  </button>
                </OverlayTrigger>

                <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Ranking</th>
                        <th>User</th>
                      </tr>
                    </thead>
                    <tbody>
                    { this.state.topUsers.map((user,index) => 
                        { return <RankingTableRow user={user} key={index} ranking={index+1} />})
                    }
                    </tbody>
                </table>
            </div>
        )
    }
}

class RankingTableRow extends React.Component {
    constructor(props){
        super(props);
    }

    render() {
        return (
          <tr>
            <td>{this.props.ranking}</td>
            <td>{this.props.user.kerberos}</td>
          </tr>
        );
    }
}