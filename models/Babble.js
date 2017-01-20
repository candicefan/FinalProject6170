var Promise = require("bluebird");

var BabbleSchema = require("../schemas/BabbleSchema");

/* 
 * ADT representing Babbles
 * Author(s): alicejin, xueqifan, rachel18
 */
var Babble = (function(babbleSchema) {

	var that = {};

	/**
	* Creates a new babble and stores it in database, then return the new babble
	* @param {String} content - the content of the babble
	* @param {ObjectId} userId - existing valid ObjectId of the user who posted this babble
	* @param {ObjectId} anonymousNameId - existing valid ObjectId of the AnonymousName if the user posts anonymously 
										- or null if the user is posting non anonymously
	* @return {Promise} - a promise containing the newly created babble
	*/
	that.addBabble = function(content, userId, anonymousNameId) {
		var babble = new babbleSchema({
			content: content, 
			user: userId, 
			anonymousName: anonymousNameId,
			goodVibeUsers: [],
			badVibeUsers: []
		});
		return babble.save();
	}
	
	/**
	* Gets the babble with the specified babbleId 
	* @param {ObjectId} userId - existing valid ObjectId of the babble to be searched for
	* @return {Promise} - a promise for the get operation
	*/
	that.getBabble = function(babbleId) {
		return babbleSchema.findOne({_id: babbleId})
				   .populate("user")
				   .populate("anonymousName")
				   .populate("comments")
	}

	/**
	* Gets a list of all babbles sorted by their posting time (the most recent one first)
	* that have fields "user", "anonymousName", and "comments" populated.
	* @return {Promise}  - a promise for the get operation
	*/
	that.getAllBabbles = function() {
		return babbleSchema.find({})
				   .sort("-timestamp")
				   .populate("user")
				   .populate("anonymousName")
				   .populate("comments")
				   .then(function(result) {
				   		return result;
				   });
	}

	/**
	* Adds a comment to a babble and return the updated babble object that reflects the addition
	* @param {ObjectId} babbleId - existing valid ObjectId of the babble that the comment belong to
	* @param {ObjectId} commentId - existing valid ObjectId of the comment to be added
	* @return {Promise} - a promise for the addComment operation
	*/

	that.addComment = function(babbleId, commentId) {
		return babbleSchema.findOne({_id: babbleId}).then(function(babble) {
		   	babble.comments.push(commentId);
		   	return babble.save();
		}); 
	}

	/**
	* get the displayName of a babble
	* if the babble is posted anonymously, return the anonymous name as display name
	* otherwise, return the author's kerberos as display name
	* @param {ObjectId} babbleId - existing valid ObjectId of the babble that we want to get the display name of
	* @return {Promise} - a promise for the getDisplayName operation
	*/

	that.getDisplayName = function(babbleId) {
		return that.getBabble(babbleId).then(function(result) {
			if(result.anonymousName) {
				return result.anonymousName.anonymousName;
			} else{
				return result.user.kerberos;
			}
		});
	}

	/**
	* get the total number of babbles in the database
	* @return {Promise} - a promise for the getBabbleCount operation
	*/

	that.getBabbleCount = function() {
		return babbleSchema.count({});
	}

	/**
	* get the total number of babbles posted by an user on the date the method is being called.
	* and return that number
	* @param {ObjectId} userId - existing valid ObjectId of the user in interest
	* @return {Promise} - a promise for the getBabbleCountByUser operation
	*/
	that.getBabbleCountByUserToday = function(userId) {
		var today = new Date();
		return babbleSchema.find({user:userId}).then(function(result) {
			if(result){
				return Promise.filter(result, function(babble){
					var sameDay = false;
					var babbleDay = babble.timestamp;
					if (babbleDay.getDate()==today.getDate() && 
						babbleDay.getMonth()==today.getMonth() && 
						babbleDay.getFullYear()==today.getFullYear()){
						sameDay = true;
					}
					return sameDay;
				}).then(function(todaysBabbles){
					return todaysBabbles.length;
				});
			} else{
				return 0;
			}
		});
	}

	/**
	* to make an user goodvibe a babble
	* if the user has previously goodvibbed the babble -> the goodvibe gets cancelled and the user no longer goodvibes the babble
	* if the user has previously badvibbed the babble -> the badvibe gets cancelled and changes to a goodvibe instead
	* if the user has not reacted to the babble previously -> the babble gets goodvibbed by the user
	* then return the updated babble
	* @param {ObjectId} babbleId - existing valid ObjectId of the babble the user wants to goodvibe
	* @param {ObjectId} userId - existing valid ObjectId of the user
	* @return {Promise} - a promise containing the updated babble
	*/
	that.goodVibe = function(babbleId, userId) {
		return that.getBabble(babbleId)
		.then(function(result) {
			var index = result.goodVibeUsers.indexOf(userId);
			//if the babble has not been goodVibbed by user
			if (index === -1) {
				if (result.badVibeUsers.indexOf(userId) > -1){
					//the post has been badVibbed by the same user -> flip the vibe
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
	* to make an user badvibe a babble
	* if the user has previously badvibbed the babble -> the badvibe gets cancelled and the user no longer badvibes the babble
	* if the user has previously goodvibbed the babble -> the goodvibe gets cancelled and changes to a badvibe instead
	* if the user has not reacted to the babble previously -> the babble gets badvibbed by the user
	* then return the updated babble
	* @param {ObjectId} babbleId - existing valid ObjectId of the babble the user wants to badvibe
	* @param {ObjectId} userId - existing valid ObjectId of the user
	* @return {Promise} - a promise containing the updated babble
	*/
	that.badVibe = function(babbleId, userId) {
		return that.getBabble(babbleId)
		.then(function(result) {
			var index = result.badVibeUsers.indexOf(userId);
			//if the babble has not been badVibbed by user
			if (index === -1) {
				if (result.goodVibeUsers.indexOf(userId) > -1){
					//the post has been goodVibbed by the same user -> flip the vibe
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
	* get the reputation associated with an user's babbles and return it
	* the reputation is directly related to how many babbles the user has posted
	* and the number of goodvibes and badvibes that he received on those babbles
	* @param {ObjectId} userId - existing valid ObjectId of the user whose reputation we want to get
	* @return {Promise} - a promise for the get operation 
	*/
	that.getReputation = function(userId) {
		return babbleSchema.find({user: userId})
		.then(function(babbleArray) {
			var reputation = babbleArray.reduce(function(total, babble){
				total += babble.goodVibeUsers.length;
				total -= babble.badVibeUsers.length;
				return total;
			},babbleArray.length);
			return reputation;
		})
	};

	/**
	* to see if a babble should be redacted
	* returns true if the babble has received more than countThreshold of vibes 
	* and has reached the badvibes to total vibes threshold (80%)
	* otherwise returns false
	* @param {ObjectId} babbleId - existing valid ObjectId of the babble of interest
	* @param {Number} countThreshold - we will only consider redacting a babble after this threshold
										of total vibes has been reached
	* @return {Promise} - a promise for the shouldBeRedacted operation 
	*/
	that.shouldBeRedacted = function(babbleId, countThreshold) {
		return that.getBabble(babbleId).then(function(result){
			var goodCount = result.goodVibeUsers.length;
			var badCount = result.badVibeUsers.length;
			var totalCount = goodCount + badCount;
			if (totalCount > countThreshold){
				if (badCount * 1.0/totalCount > 0.8){
					return true;
				} else{
					return false;
				}
			} else{
				return false;
			}
		})
	}

	Object.freeze(that);
  	return that;

})(BabbleSchema);

module.exports = Babble;