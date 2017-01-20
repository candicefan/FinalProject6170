var Promise = require("bluebird");

var express = require('express');
var router = express.Router();

var Utils = require('../utils/utils');
var Babble = require("../models/Babble");
var Comment = require("../models/Comment");
var User = require("../models/User");
var AnonymousName = require("../models/AnonymousName");

var countThreshold = 50;

/* 
 * routes for /babbles
 * Author(s): alicejin, rachel18, stacyho, xueqifan
 */

/*
  Require authentication on ALL access to /babbles/*
  Clients which are not logged in will receive a 403 error code.
*/
var requireAuthentication = function(req, res, next) {
  if (!req.currentUser) {
    Utils.sendErrorResponse(res, 403, 'Must be logged in to use this feature.');
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
  if (req.body.anonymous == null) {
    Utils.sendErrorResponse(res, 400, 'anonymous required in request body.');
  } else {
    next();
  }
};

// Register the middleware handlers above.
router.all('*', requireAuthentication);
router.post('/', requireContent);
router.post('/', requireAnonymous);


/**
* Repackage a Babble document into an object
* @param {Babble document} babble - a Babble documents
* @return {Promise} - a promise containing the newly created object with below fields: 
*   displayName: String , timestamp: Date, content: String, comments: [Object], babbleNumber: Number, _id: ObjectId, goodVibeUsers: [Object], badVibeUsers: [Object], shouldBeRedacted: boolean
*/
var repackageBabble = function(babble) {
  return Babble.getDisplayName(babble._id).then(function(result) {
    return Babble.shouldBeRedacted(babble._id, countThreshold).then(function(shouldBeRedacted){
      return {"displayName": result, "timestamp": babble.timestamp, "content": babble.content, 
      "comments": babble.comments, "babbleNumber": babble.babbleNumber, "_id": babble._id, 
      "goodVibeUsers" : babble.goodVibeUsers, "badVibeUsers" : babble.badVibeUsers, "shouldBeRedacted": shouldBeRedacted};
    });
  });
}

/**
* Repackaged a list of Babble documents into a list of objects
* @param {[Babble document]} babbles - a list of Babble documents
* @return {Promise} - a promise containing the newly created list of objects, each with below fields: 
*   displayName: String , timestamp: Date, content: String, comments: [ObjectId], babbleNumber: Number, _id: ObjectId, goodVibeUsers: [ObjectId], badVibeUsers: [ObjectId], shouldBeRedacted: boolean
*/
var repackageBabbles = function(babbles) {
  return Promise.map(babbles, function(babble) {
    return repackageBabble(babble);
  });
}

/**
* Repackage a Comment document into an object
* @param {Comment document} comment - a Comment document
* @return {Promise} - a promise containing the newly created object with below fields: 
*   displayName: String , timestamp: Date, content: String, comments: [ObjectId], _id: ObjectId, goodVibeUsers: [ObjectId], badVibeUsers: [ObjectId]
*/
var repackageComment = function(comment) {
  return Comment.getDisplayName(comment._id).then(function(result) {
    return {"displayName": result, "timestamp": comment.timestamp, "content": comment.content, 
    "comments": comment.comments, "_id": comment._id, "goodVibeUsers" : comment.goodVibeUsers, 
    "badVibeUsers" : comment.badVibeUsers};
  });
}

/**
* Repackage a list of Comment documents into a list of objects
* @param {[Comment document]} comments - a list of Comment documents
* @return {Promise} - a promise containing the newly created list of objects, each with below fields: 
*   displayName: String , timestamp: Date, content: String, comments: [ObjectId], _id: ObjectId, goodVibeUsers: [ObjectId], badVibeUsers: [ObjectId]
*/
var repackageComments = function(comments) {
  return Promise.map(comments, function(comment) {
    return repackageComment(comment);
  });
}

/**
* Fill in the list of ObjectIDs in a Babble Object with a list of Comment Objects
* @param {[Babble document]} babble - a Babble document
* @return {Promise} - a promise containing the repackaged object with below fields: 
*   displayName: String , timestamp: Date, content: String, comments: [Comment Object], babbleNumber: Number, _id: ObjectId, goodVibeUsers: [Object], badVibeUsers: [Object], shouldBeRedacted: boolean
*/
var repackageCommentsForBabble = function(babble){
  return repackageComments(babble.comments).then(function(result){
    babble.comments = result;
    return babble;
  });
}

/**
* Fill in the list of ObjectIDs in every Babble Object of the specified babbles list with a list of Comment Objects
* @param {[Babble document]} babbles - a list of Babble documents
* @return {Promise} - a promise containing a list of the repackaged object with below fields: 
*   displayName: String , timestamp: Date, content: String, comments: [Comment Object], babbleNumber: Number, _id: ObjectId, goodVibeUsers: [Object], badVibeUsers: [Object], shouldBeRedacted: boolean
*/
var repackageCommentsForAllBabbles = function(babbles){
  return Promise.map(babbles, function(babble) {
    return repackageComments(babble.comments).then(function(result){
      babble.comments = result;
      return babble;
    });
  });
}

/**
* Update the posting limit for the user with specified authorname
* @param {String} authorname - the full name of the user
* @return {Promise} - a promise for the operation
*/
var updateLimitForUser = function(authorname){
  return User.getUser(authorname).then(function(user) {
    return User.getReputation(user._id).then(function(rep){
      User.updateLimit(user._id,rep);
    });
  });
}

/**
* Return whether or not there is update of comments posted under the babble with specified babbleId
* Sets the current number of comments posted under the babble in req.session.commentsCount[babbleId.toString()]
* @param {ObjectId} babbleId - the ObjectId of babble
* @param {req} req - the current request
* @return {Promise} - a promise for the boolean result
*/
var isCommentUpdated = function(babbleId, req) {
  return Comment.getCommentCountForBabble(babbleId).then(function(newCount) {
    var oldCount = -1;
    oldCount = req.session.commentsCount[babbleId.toString()];    
    req.session.commentsCount[babbleId.toString()] = newCount;
    if(newCount == 0) {
      return false;
    } else {
      return !(oldCount==newCount);
    }
  });
}

/**
* Gets the number of comments posted under each of the babble in the specified babbles list
* @param {[ObjectId]} babbles - the list of babbles
* @return {Promise} - a promise for an Object where the field is the ObjectId.toString of a babble and its corresponding value is the number of comments posted under the babble
*/
var getCommentsCount = function(babbles) {
  var commentsCount = {}
  return Promise.each(babbles, function(babble) {
    commentsCount[babble._id] = babble.comments.length;
  }).then(function() {
    return commentsCount;
  });
}

/**
* GET /babbles/checkNew
* Response:
*   babbleUpdate: {boolean} - true iff new babbles have been posted since the user last got babbles
*   babblesToUpdate: {[ObjectId]} - list of the ObjectId of babbles with updated comments
*/
router.get('/checkNew', function(req, res) {
  Babble.getBabbleCount().then(function(newCount) {
    var oldCount = -1; 
    if(req.session.babbleCount) {
      oldCount = req.session.babbleCount;
    } 
    req.session.babbleCount = newCount;
    if(newCount == 0) {
      Utils.sendSuccessResponse(res, {babbleUpdate: false, babblesToUpdate: []});
    } else {
      Babble.getAllBabbles().then(function(babbles) {
        var loadedBabbles = babbles.slice(oldCount-newCount); 
        Promise.filter(loadedBabbles, function(babble) {
          return isCommentUpdated(babble._id, req);
        }).then(function(babblesToUpdate) {
          Promise.map(babblesToUpdate, function(babble) {
            return babble._id.toString();
          }).then(function(babblesToUpdateId) {
            Utils.sendSuccessResponse(res, {babbleUpdate: !(oldCount==newCount), babblesToUpdate: babblesToUpdateId});
          })
        });
      });
    }
  }, function(err) {
    Utils.sendErrorResponse(res, 500, 'An error occurred. Please try again later');
  });
});

/**
  GET /babbles
  Response
    success: {boolean} - whether or not the server succeeded in posting the babble
      if true
        content: {
          babbles: {[Babble Object]} - a list of Babble Objects, each with below fields: 
            displayName: String , timestamp: Date, content: String, comments: [Comment Object], babbleNumber: Number, _id: ObjectId, goodVibeUsers: [Object], badVibeUsers: [Object], shouldBeRedacted: boolean
        }
      else
        err: {String} - error message
*/
router.get('/', function(req, res) {
  Babble.getAllBabbles().then(function(babbles) {
    repackageBabbles(babbles).then(function(repackagedBabbles) {
      repackageCommentsForAllBabbles(repackagedBabbles).then(function(repackagedComments) {
        Babble.getBabbleCount().then(function(babbleCount) {
          req.session.babbleCount = babbleCount;
            getCommentsCount(babbles).then(function(commentsCount) {
              req.session.commentsCount = commentsCount;
              Utils.sendSuccessResponse(res, { babbles: repackagedComments});
            });
        }, function(countErr) {
          Utils.sendSuccessResponse(res, { babbles: repackagedComments});
        });
      });
    });
  }, function(err) {
      Utils.sendErrorResponse(res, 500, 'An error occurred. Please try again later');
  });
});

/**
  POST /babbles
  Request body
    content: {String} - the content of the babble
  Response
    success: {boolean} - whether or not the server succeeded in getting the all of the babbles
      if true
        content: {
          {Babble Object} - the newly added Babble Object with below fields: 
            displayName: String , timestamp: Date, content: String, comments: [Comment Object], babbleNumber: Number, _id: ObjectId, goodVibeUsers: [Object], badVibeUsers: [Object], shouldBeRedacted: boolean
        }
      else
        err: {String} - error message
*/
router.post('/', function(req, res) {  
  var limit = req.currentUser.babbleLimit;
  Babble.getBabbleCountByUserToday(req.currentUser._id).then(function(babbleCount) {
    if(babbleCount < limit) {
      if(req.body.anonymous === true) {
        AnonymousName.getNewAnonymousNameForBabble(req.currentUser._id).then(function(newAnonymousName) {
          Babble.addBabble(req.body.content, req.currentUser._id, newAnonymousName._id).then(function(newBabble) { 
            repackageBabble(newBabble).then(function(repackagedBabble) {
              updateLimitForUser(req.currentUser.kerberos).then(function() {
                Babble.getBabbleCount().then(function(newBabbleCount) {
                  req.session.babbleCount = newBabbleCount;
                  Utils.sendSuccessResponse(res, repackagedBabble);
                }, function(countErr) {
                  Utils.sendSuccessResponse(res, repackagedBabble);
                });
              });              
            });
          });
        }, function(err) {
          Utils.sendErrorResponse(res, 500, 'An error occurred. Please try again later.');
        });
      } else {
        Babble.addBabble(req.body.content, req.currentUser._id, null).then(function(newBabble) {
          repackageBabble(newBabble).then(function(repackagedBabble) {
            updateLimitForUser(req.currentUser.kerberos).then(function() {
              Babble.getBabbleCount().then(function(newBabbleCount) {
                req.session.babbleCount = newBabbleCount;
                Utils.sendSuccessResponse(res, repackagedBabble);
              }, function(countErr) {
                Utils.sendSuccessResponse(res, repackagedBabble);
              });
            });                
          });
        }, function(err) {
          Utils.sendErrorResponse(res, 500, 'An error occurred. Please try again later.');
        });
      } 
    } else {
      Utils.sendErrorResponse(res, 500, 'Sorry, you have reached your babble posting limit for today!');
    }
  }, function(err) {
    Utils.sendErrorResponse(res, 500, 'An error occurred. Please try again later.');
  });
});

/**
  GET /babbles/:babbleId
  Request parameter
    babbleId: {ObjectId} - the unique ID of the babble.
  Response
    success: {boolean} - whether or not the server succeeded in getting the babble
      if true
        content: {
          {Babble Object} - Babble Object with below fields: 
            displayName: String , timestamp: Date, content: String, comments: [Comment Object], babbleNumber: Number, _id: ObjectId, goodVibeUsers: [Object], badVibeUsers: [Object], shouldBeRedacted: boolean
        }
      else
        err: {String} - error message
*/
router.get('/:babbleId', function(req, res) {
  Babble.getBabble(req.params.babbleId).then(function(babble) {
    repackageBabble(babble).then(function(repackagedBabble){
      repackageCommentsForBabble(repackagedBabble).then(function(result) {
        Utils.sendSuccessResponse(res, result);
      });
    });
  }, function(err) {
      Utils.sendErrorResponse(res, 500, 'An error occurred. Please try again later');
  });
});

/*
  GET /babbles/:babbleId/comments
  Request parameter
    babbleId: {ObjectId} - the unique ID of the babble.
  Response
    success: {boolean} - whether or not the server succeeded in getting the comments of this babble
      if true
        content: {
          comments: {[Comment Object]} - a list of Comment Objects, each with below fields: 
            displayName: String , timestamp: Date, content: String, comments: [ObjectId], _id: ObjectId, goodVibeUsers: [ObjectId], badVibeUsers: [ObjectId]
        }
      else
        err: {String} - error message
*/
router.get('/:babbleId/comments', function(req, res) {
  var babbleId = req.params.babbleId;
  Comment.getAllCommentsForBabble(babbleId).then(function(comments) {
    if(comments) {
      repackageComments(comments).then(function(result){
        Utils.sendSuccessResponse(res, {comments: result});
      });
    } 
  }, function(err) {
    Utils.sendErrorResponse(res, 500, 'An error occurred.');
  });
});

/*
  POST /babbles/:babbleId/goodVibe
  Request parameter
    babbleId: {ObjectId} the unique ID of the babble.
  Response
    success: {boolean} - whether or not the server succeeded in posting the good vibe
      if true
        content: {
          shouldBeRedacted: {boolean} - whether or not this babble should be redacted 
        }
      else
        err: {String} - error message
*/
router.post('/:babbleId/goodVibe', function(req, res){
  Babble.goodVibe(req.params.babbleId, req.currentUser._id).then(function(result){
    Babble.shouldBeRedacted(req.params.babbleId, countThreshold).then(function(redacted){
      Babble.getBabble(req.params.babbleId).then(function(currentBabble){
        var authorname = currentBabble.user.kerberos;
        updateLimitForUser(authorname).then(function(){
          Utils.sendSuccessResponse(res, {shouldBeRedacted: redacted});
        })
      })
    })
  }, function(err){
    Utils.sendErrorResponse(res, 500, 'An error occurred. Please try again later.');
  });
});

/*
  POST /babbles/:babbleId/badVibe
  Request parameter
    babbleId: {ObjectId} the unique ID of the babble.
  Response
    success: {boolean} - whether or not the server succeeded in posting the bad vibe
      if true
        content: {
          shouldBeRedacted: {boolean} - whether or not this babble should be redacted 
        }
      else
        err: {String} - error message
*/
router.post('/:babbleId/badVibe', function(req, res){
  Babble.badVibe(req.params.babbleId, req.currentUser._id).then(function(result){
    Babble.shouldBeRedacted(req.params.babbleId, countThreshold).then(function(redacted){
      Babble.getBabble(req.params.babbleId).then(function(currentBabble){
        var authorname = currentBabble.user.kerberos;
        updateLimitForUser(authorname).then(function(){
          Utils.sendSuccessResponse(res, {shouldBeRedacted: redacted});
        })
      })
    })
  }, function(err){
    Utils.sendErrorResponse(res, 500, 'An error occurred. Please try again later.');
  });
});

module.exports = router;