/* 
 * Services for user
 * Author(s): stacyho
 */
const BASE_URL = process.env.NODE_ENV !== 'production' ? 'http://localhost:3000/user' : 'https://maga-finalproject.herokuapp.com/user';

  var request = require('request-promise-native');

  export default {
    register : (fullName, kerberos, password, confirmPassword) => {
      return request({
        uri : BASE_URL + '/signup',
        method: 'POST',
        body : {
          fullName: fullName,
          kerberos : kerberos,
          password : password,
          confirmPassword: confirmPassword
        },
        json : true
      });
    },

    verify : (token) => {
      return request({
        uri : BASE_URL + '/verify/',
        method: 'POST',
        body : {
          token: token
        },
        json : true
      });
    },

    login : (kerberos, password) => {
      return request({
        uri : BASE_URL + '/login',
        method: 'POST',
        body : {
          kerberos : kerberos,
          password : password
        },
        json : true
      });
    },

    logout : () => {
      return request({
        uri : BASE_URL + '/logout',
        method: 'PUT',
        json : true
      });
    },

    getCurrentUser: () => {
      return request({
        uri : BASE_URL + '/current',
        method: 'GET',
        json : true
      });
    }, 

    getTopUsers: () => {
      return request({
        uri : BASE_URL + '/topTen',
        method: 'GET',
        json : true
      });
    }

  }