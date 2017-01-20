import { Component } from 'react';
import React from 'react';
import ReactDOM from 'react-dom';
import Services from '../../services';
import { Modal } from 'react-bootstrap';
import CommentForm from './CommentForm.jsx';

/* 
 * React component for modal to post comment
 * Author(s): stacyho
 */

export default class CommentModal extends Component {
    constructor(props){
        super(props);
        this.state = {
            showModal: false
        };
        this.closeModal = this.closeModal.bind(this);
        this.openModal = this.openModal.bind(this);
    }

    closeModal() {
        this.setState({ showModal: false });
    }

    openModal() {
        this.setState({ showModal: true });
    }

    render(){
        return (
            <div>
                <Modal className="post-comment-modal" show={this.state.showModal} onHide={this.closeModal}>
                  <Modal.Header className="post-comment-modal__header" closeButton>
                    <p> Comment on Babble #{this.props.babble.babbleNumber}</p>
                  </Modal.Header>
                  <Modal.Body className="post-comment-modal__body">
                    <CommentForm onPostComment={this.props.onPostComment} babble={this.props.babble} 
                    closeModal={this.closeModal}/>
                  </Modal.Body>
                </Modal>
            </div>
        );
    }
}