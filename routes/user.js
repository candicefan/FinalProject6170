var Promise = require("bluebird");

var express = require('express');
var router = express.Router();

var Utils = require('../utils/utils');
var User = require("../models/User");
var Babble = require("../models/Babble");
var Comment = require("../models/Comment");
var TopTen = require("../models/TopTen");

var oneWeek = 604800000; // number of miliseconds in 7 days

/* 
 * routes for /user
 * Author(s): alicejin, rachel18, stacyho
 */

/*
  Require authentication on requests to /user/logout
  Clients who are not logged in will receive a 403 error code.
*/
var requireAuthentication = function(req, res, next) {
  if (!req.currentUser) {
    Utils.sendErrorResponse(res, 403, 'Please log in to use this feature.');
  } else {
    next();
  }
};

/*
  For create requests at /user/signup, require that the request body
  contains a 'kerberos', 'password', and 'fullName' field. Send error code 400 if not.
*/
var requirePostBodyForSignUp = function(req, res, next) {
  if(!req.body.fullName || !req.body.kerberos || !req.body.password) {
    Utils.sendErrorResponse(res, 400, 'Kerberos and password are required to sign up.');
  } else {
    next();
  }
};

/*
  For create requests at /user/login, require that the request body
  contains a 'kerberos' and 'password' field. Send error code 400 if not.
*/
var requirePostBodyForLogin = function(req, res, next) {
  if(!req.body.kerberos || !req.body.password) {
    Utils.sendErrorResponse(res, 400, "Kerberos and password are required to login.");
  } else {
    next();
  }
}

// Register the middleware handlers above.
router.put('/logout', requireAuthentication);
router.post("/signup", requirePostBodyForSignUp);
router.post("/login", requirePostBodyForLogin);

/*
  POST /user/signup
  Request body
    kerberos: {String} - the kerberos of user
    fullName: {String} - the full name of user
    password: {String} - the password of user
  Response
    success: {boolean} - whether or not the server succeeded in sending a verification email to the user
      if false
        err: {String} - error message
*/

router.post("/signup", function(req, res) {
  User.sendVerification(req.body.kerberos, req.body.fullName, req.body.password).then(function(result) {
      Utils.sendSuccessResponse(res);
  }, function(err) {
    Utils.sendErrorResponse(res, 400, err);
  });
});

/*
  POST /user/verify
  Request body
    token: {ObjectId} - the unique ID of the comment.
  Response:
    success: {boolean} - whether or not the server succeeded in verifying the user
      if false
        err: {String} - error message
*/
router.post("/verify", function(req, res) {
  User.verify(req.body.token).then(function(result) {
    if(result) {
      Utils.sendSuccessResponse(res);
    } else {
      Utils.sendErrorResponse(res, 401, 'Verification link has expired. Please sign up again.');
    }
  }, function(err) {
      Utils.sendErrorResponse(res, 500, 'An error occurred. Please try again later.');
  });
});

/*
  POST /user/login
  Request body
    kerberos: {String} - the kerberos of user
    password: {String} - the password of user
  Response
    success: {boolean} - whether or not the server succeeded in logging in the user
      if true
        content: {
          kerberos: {String} - kerberos of the user
        }
      else: 
        err: {String} - error message
*/
router.post('/login', function(req, res) {
  User.login(req.body.kerberos, req.body.password).then(function(result) {
    req.session.kerberos = req.body.kerberos;
    Utils.sendSuccessResponse(res, {kerberos: req.body.kerberos});
  }, function(err) {
      Utils.sendErrorResponse(res, 500, err);
  });
});

/*
  POST /user/logout
  Response
    success: {boolean} - whether or not the server succeeded in logging out the user
      if false 
        err: {String} - error message
*/
router.put('/logout', function(req, res) {
  req.session.destroy();
  Utils.sendSuccessResponse(res);
});

/*
  GET /users/current
  Response
    success: {boolean} - whether or not the server succeeded in getting the user
      if true
        content: {
          loggedIn: {boolean} - whether or not the user is logged in
            if true
              user: {ObjectId} - ObjectId of the current user
        }
      else
        err: {String} - error message
*/
router.get('/current', function(req, res) {  
  if (req.currentUser) {
    Utils.sendSuccessResponse(res, { loggedIn: true, user: req.currentUser});
  } else {
    Utils.sendSuccessResponse(res, { loggedIn: false });
  }
});

/*
  GET /user/topTen
  Response
    success: {boolean} - whether or not the server succeeded in getting the ten users with top reputation
      if true
        content: {TopTen Ojbect} - a TopTen Objects with below fields
          updatedTime: {Date}, topUsers: {[User]}
      else
        err: {String} - error message
*/
router.get('/topTen', function(req,res) {
  TopTen.updateTopTenUsers(new Date(), oneWeek).then(function(timeAndUsers){
    Utils.sendSuccessResponse(res, timeAndUsers);
  }, function(err){
    Utils.sendErrorResponse(res, 500, 'An error occurred. Please try again later.');
  });
})

module.exports = router;