import Services from '../services';
import { Component } from 'react';
import React from 'react';
import moment from 'moment';
import { withRouter } from 'react-router';

class App extends Component {
    constructor(props){
        super(props);
    }

    render(){
        return (
            <div id='reactRoot'>
                {React.cloneElement(this.props.children, {
                })}
            </div>
        );
    }
};

App.propTypes = {
    children : React.PropTypes.any.isRequired
};

export default withRouter(App);