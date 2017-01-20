var Promise = require("bluebird");

var CommentSchema = require('../schemas/CommentSchema.js');
var Babble = require('../models/Babble.js');

/* 
 * ADT representing Comments
 * Author(s): rachel18, alicejin
 */
var Comment = (function(commentSchema) {
	var that = {};

	/**
	* Creates a new comment under a babble and stores it in database
	* @param {String} content - the content of the comment
	* @param {ObjectId} babbleId - existing valid ObjectId of the babble this comment is posted under
	* @param {ObjectId} userId - existing valid ObjectId of the user who posted this comment
	* @param {ObjectId} anonymousNameId - existing valid ObjectId of the user's AnonymousName if the user posts anonymously 
									 	- or null if the user is posting non anonymously
	* @return {Promise} - a promise containing the newly created comment
	*/
	that.addComment = function(content, babbleId, userId, anonymousNameId) {
		var comment = new commentSchema({
			user: userId,
			anonymousName: anonymousNameId,
			content: content,
			babble: babbleId,
			goodVibeUsers: [],
			badVibeUsers: []
		});
		return comment.save().then(function(newComment) {
			return Babble.addComment(babbleId, newComment._id).then(function(updatedBabble) {
				return newComment;
			});	
		});
	};

	/**
	* Get a list of all comments of a babble sorted by earliest first 
	* and with fields "user", "anonymousName", and "babble" populated
	* @param {ObjectId} babbleId - existing valid ObjectId of the babble of interest
	* @return {Promise} - a promise for the get operation
	*/
	that.getAllCommentsForBabble = function(babbleId) {
		return commentSchema.find({babble:babbleId})
			.sort("timestamp")
			.populate("user")
			.populate("anonymousName")
			.populate("babble");
	}

	/**
	* Get the number of comments of a babble and return it
	* @param {ObjectId} babbleId - existing valid ObjectId of the babble of interest
	* @return {Promise} - a promise for the get operation
	*/
	that.getCommentCountForBabble = function(babbleId) {
		return that.getAllCommentsForBabble(babbleId).then(function(comments) {
			return comments.length;
		});
	}

	/**
	* Get a list of all comments posted by a specific user 
	* with fields "user", "anonymousName", and "babble" populated
	* @param {ObjectId} userId - existing valid ObjectId of the user of interest
	* @return {Promise} - a promise for the get operation
	*/
	that.getAllCommentsByUser = function(userId) {
		return commentSchema.find({user:userId})
				.populate("user")
				.populate("anonymousName")
				.populate("babble");
	}


	/**
	* Gets the comment with the specified commentId 
	* @param {ObjectId} commentId - existing valid ObjectId of comment to be searched for
	* @return {Promise} - a promise for the get operation
	*/
	that.getComment = function(commentId) {
		return commentSchema.findOne({_id: commentId})
				.populate("user")
				.populate("anonymousName")
				.populate("babble");	
	};


	/**
	* get the displayName of a comment
	* if the comment is posted anonymously, return the anonymous name as display name
	* otherwise, return the author's kerberos as display name
	* @param {ObjectId} commentId - existing valid ObjectId of the comment that we want to get the display name of
	* @return {Promise} - a promise for the getDisplayName operation
	*/
	that.getDisplayName = function(commentId) {
		return that.getComment(commentId).then(function(result) {
		 	if(result.anonymousName) {
		 		return result.anonymousName.anonymousName;
		 	} else{
		 		return result.user.kerberos;
		 	}
		 });
	};

	/**
	* to make an user goodvibe a comment
	* if the user has previously goodvibbed the comment -> the goodvibe gets cancelled and the user no longer goodvibes the comment
	* if the user has previously badvibbed the comment -> the badvibe gets cancelled and changes to a goodvibe instead
	* if the user has not reacted to the comment previously -> the comment gets goodvibbed by the user
	* then return the updated comment
	* @param {ObjectId} commentId - existing valid ObjectId of the comment the user wants to goodvibe
	* @param {ObjectId} userId - existing valid ObjectId of the user
	* @return {Promise} - a promise containing the updated comment
	*/
	that.goodVibe = function(commentId, userId) {
		return that.getComment(commentId)
		.then(function(result) {
			var index = result.goodVibeUsers.indexOf(userId);
			//if the comment has not been goodvibed by user
			if (index === -1) {
				if (result.badVibeUsers.indexOf(userId) > -1){
					//the post has been badVibbed by the same user -> flip the Vibe
					result.badVibeUsers.splice(result.badVibeUsers.indexOf(userId), 1);
					result.goodVibeUsers.push(userId);
				}
				else {
					result.goodVibeUsers.push(userId);
				}
			}
			else {
				//the user wants to cancel the goodVibe 
				result.goodVibeUsers.splice(result.badVibeUsers.indexOf(userId), 1);
			}
			return result.save();
		})
	};


	/**
	* to make an user badvibe a comment
	* if the user has previously badvibbed the comment -> the badvibe gets cancelled and the user no longer badvibes the comment
	* if the user has previously goodvibbed the comment -> the goodvibe gets cancelled and changes to a badvibe instead
	* if the user has not reacted to the comment previously -> the comment gets badvibbed by the user
	* then return the updated comment
	* @param {ObjectId} commentId - existing valid ObjectId of the comment the user wants to badvibe
	* @param {ObjectId} userId - existing valid ObjectId of the user
	* @return {Promise} - a promise containing the updated comment
	*/
	that.badVibe = function(commentId, userId) {
		return that.getComment(commentId)
		.then(function(result) {
			var index = result.badVibeUsers.indexOf(userId);
			//if the comment has not been badvibed by user
			if (index === -1) {
				if (result.goodVibeUsers.indexOf(userId) > -1){
					//the post has been goodVibbed by the same user -> flip the Vibe
					result.goodVibeUsers.splice(result.badVibeUsers.indexOf(userId), 1);
					result.badVibeUsers.push(userId);
				}
				else {
					result.badVibeUsers.push(userId);
				}
			}
			else {
				//the user wants to cancel the badVibe
				result.badVibeUsers.splice(result.badVibeUsers.indexOf(userId), 1);
			}
			return result.save();

		})
	};

	/**
	* get the reputation associated with an user's comments and return it
	* the reputation is directly related to how many comments the user has posted
	* and the number of goodvibes and badvibes that he received on those comments
	* @param {ObjectId} userId - existing valid ObjectId of the user whose reputation we want to get
	* @return {Promise} - a promise for the get operation 
	*/
	that.getReputation = function(userId) {
		return commentSchema.find({user: userId})
		.then(function(commentArray) {
			var reputation = commentArray.reduce(function(total, comment){
				total += comment.goodVibeUsers.length;
				total -= comment.badVibeUsers.length;
				return total;
			},commentArray.length);
			return reputation;
		})
	};


	Object.freeze(that);
  	return that;

})(CommentSchema);

module.exports = Comment;