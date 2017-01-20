/* 
 * Services for comments
 * Author(s): stacyho
 */

const BASE_URL = process.env.NODE_ENV !== 'production' ? 'http://localhost:3000/comments' : 'https://maga-finalproject.herokuapp.com/comments';

  var request = require('request-promise-native');

  export default {

    postComment : (babble_id, content, isAnonymous) => {
      return request({
        uri : BASE_URL,
        method: 'POST',
        body: {
          content: content,
          anonymous: isAnonymous,
          babbleId: babble_id
        },
        json : true
      });
    },

    goodVibeComment: (comment_id) => {
      return request({
        uri : BASE_URL + '/' + comment_id + '/goodVibe',
        method: 'POST',
        json : true
      });
    },

    badVibeComment: (comment_id) => {
      return request({
        uri : BASE_URL + '/' + comment_id + '/badVibe',
        method: 'POST',
        json : true
      });
    },

  }