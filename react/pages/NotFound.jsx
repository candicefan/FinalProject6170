import { Component } from 'react';
import React from 'react';

/* 
 * 404 page
 * Author(s): stacyho
 */
export default class NotFound extends Component {
    constructor(props){
        super(props);
    }


    render(){
        return (
            <div className='404-page'>
                <h1> 404 Oops, this page does not exist. </h1>
            </div>
        )
    }
}