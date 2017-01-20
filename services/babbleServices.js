/* 
 * Services for babbles
 * Author(s): stacyho
 */

const BASE_URL = process.env.NODE_ENV !== 'production' ? 'http://localhost:3000/babbles' : 'https://maga-finalproject.herokuapp.com/babbles';

  var request = require('request-promise-native');

  export default {
    getAllBabbles : () => {
      return request({
        uri : BASE_URL,
        method: 'GET',
        json : true
      });
    },

    getBabble : (babble_id) => {
      return request({
        uri : BASE_URL + '/' + babble_id,
        method: 'GET',
        json : true
      });
    },

    postBabble : (content, isAnonymous) => {
      return request({
        uri : BASE_URL,
        method: 'POST',
        body: {
          content: content,
          anonymous: isAnonymous
        },
        json : true
      });
    },

    getCommentsForBabble: (babble_id) => {
      return request({
        uri : BASE_URL + '/' + babble_id + '/comments',
        method: 'GET',
        json: true
      });
    },

    checkForNewBabbles: () => {
      return request({
        uri : BASE_URL + '/checkNew',
        method: 'GET',
        json : true
      });
    },

    goodVibeBabble: (babble_id) => {
      return request({
        uri : BASE_URL + '/' + babble_id + '/goodVibe',
        method: 'POST',
        json : true
      });
    },

    badVibeBabble: (babble_id) => {
      return request({
        uri : BASE_URL + '/' + babble_id + '/badVibe',
        method: 'POST',
        json : true
      });
    }

    
  }