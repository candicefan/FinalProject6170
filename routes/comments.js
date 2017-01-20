var express = require('express');
var router = express.Router();

var Utils = require('../utils/utils');
var User = require("../models/User");
var Comment = require("../models/Comment");
var Babble = require("../models/Babble");
var AnonymousName = require("../models/AnonymousName");


/* 
 * routes for /comments
 * Author(s): alicejin, xueqifan, stacyho
 */

/*
  Require authentication on ALL access to /comments/*
  Clients which are not logged in will receive a 403 error code.
*/
var requireAuthentication = function(req, res, next) {
  if (!req.currentUser) {
    Utils.sendErrorResponse(res, 403, 'Please log in to use this feature.');
  } else {
    next();
  }
};

/*
  For create requests, require that the request body
  contains a 'content' field. Send error code 400 if not.
*/
var requireContent = function(req, res, next) {
  if (!req.body.content) {
    Utils.sendErrorResponse(res, 400, 'content required in request body.');
  } else {
    next();
  }
};

/*
  For create requests, require that the request body
  contains a 'anonymous' field. Send error code 400 if not.
*/
var requireAnonymous = function(req, res, next) {
  if (req.body.anonymous === null) {
    Utils.sendErrorResponse(res, 400, 'anonymous required in request body.');
  } else {
    next();
  }
};

// Register the middleware handlers above.
router.all('*', requireAuthentication);
router.post('/', requireContent);
router.post('/', requireAnonymous);

var updateLimitForUser = function(authorname){
  return User.getUser(authorname).then(function(user) {
    return User.getReputation(user._id).then(function(rep) {
      User.updateLimit(user._id,rep);
    });
  });
}

/*
  GET /comments/:commentId
  Request parameter
    commentId: {ObjectId} - the unique ID of the comment.
  Response
    success: {boolean} - whether or not the server succeeded in getting the comment
      if true
        content: {
          comment: {[Comment Object]} - a list of Comment Objects, each with below fields: 
            user: {Object}, anonymousName: {Object}, content: {String}, babble: {Object}, timestamp: {Date}, goodVibeUsers: [{ObjectId}], badVibeUsers: [{ObjectId}]     
        }
      else
        err: {String} - error message
*/
router.get('/:commentId', function(req, res) {
  Comment.getComment(req.params.commentId).then(function(result) {
    if(result) {
      Utils.sendSuccessResponse(res, {comment: result});
    } else {
      Utils.sendErrorResponse(res, 404, 'No such comment.');
    }
  }, function(err) {
    Utils.sendErrorResponse(res, 500, 'An error occurred. Please try again later.');
  });
});

/*
  POST /comments
  Request body
    content: {String} - the content of the comment
    babbleId: {ObjectId} - the unique ID of the babble that the comment is under
  Response
    success: {boolean} - whether or not the server succeeded in posting the comment 
      if true
        content: {Comment Object} - a Comment Object with below fields: 
          user: {Object}, anonymousName: {Object}, content: {String}, babble: {Object}, timestamp: {Date}, goodVibeUsers: [{ObjectId}], badVibeUsers: [{ObjectId}]     
      else
        err: {String} - error message
*/
router.post('/', function(req, res) { 
  var babbleId = req.body.babbleId;
  if(req.body.anonymous == false) {
    Comment.addComment(req.body.content, babbleId, req.currentUser._id, null).then(function(newComment) {
        updateLimitForUser(req.currentUser.kerberos).then(function() {
          Utils.sendSuccessResponse(res, newComment);
        });
    }, function(err) {
      Utils.sendErrorResponse(res, 500, 'An error occurred. Please try again later.');
    });
  } else {
    AnonymousName.getAnonymousNameForComment(babbleId, req.currentUser._id).then(function(newAnonymousName) {
      Comment.addComment(req.body.content, babbleId, req.currentUser._id, newAnonymousName).then(function(newComment) {
          updateLimitForUser(req.currentUser.kerberos).then(function(){
            Utils.sendSuccessResponse(res, newComment);
          });
      });
    }, function(err) {
      Utils.sendErrorResponse(res, 500, 'An error occurred. Please try again later.');
    });
  }   
});

/*
  POST /comments/:commentId/goodVibe
  Request parameter
    commentId: {ObjectId} - the unique ID of the babble.
  Response
    success: {boolean} - whether or not the server succeeded in posting the good vibe 
      if true
        content: {}
      else
        err: {String} - error message
*/
router.post('/:commentId/goodVibe', function(req, res) {
  Comment.goodVibe(req.params.commentId, req.currentUser._id).then(function(result) {
    Comment.getComment(req.params.commentId).then(function(currentComment) {
      var authorname = currentComment.user.kerberos;
      updateLimitForUser(authorname).then(function() {
        Utils.sendSuccessResponse(res, {});
      });
    });
  }, function(err) {
    Utils.sendErrorResponse(res, 500, 'An error occurred. Please try again later.');
  });
});

/*
  POST /comments/:commentId/badVibe
  Request parameter
    commentId: {ObjectId} - the unique ID of the babble.
  Response
    success: {boolean} - whether or not the server succeeded in posting the bad vibe 
      if true
        content: {}
      else
        err: {String} - error message
*/
router.post('/:commentId/badVibe', function(req, res) {
  Comment.badVibe(req.params.commentId, req.currentUser._id).then(function(result) {
    Comment.getComment(req.params.commentId).then(function(currentComment) {
      var authorname = currentComment.user.kerberos;
      updateLimitForUser(authorname).then(function() {
        Utils.sendSuccessResponse(res, {});
      });
    });
  }, function(err){
    Utils.sendErrorResponse(res, 500, 'An error occurred. Please try again later.');
  });
});

module.exports = router;
