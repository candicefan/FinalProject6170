var TopTenSchema = require("../schemas/TopTenSchema");
var User = require("../models/User");
var Promise = require("bluebird");
/* 
 * ADT representing Top Ten users
 * Author(s): rachel18
 */
var TopTen = (function(topTenSchema) {

	var that = {};

	/**
	* According to the current time, if it has been some amount of time (default: a week) 
	* since the top ten was lastly updated, replace the old top ten with a new top ten 
	* document, containing the newly updated time and a new list of top users according 
	* to the current reputations of all users, and return the new list of top users and 
	* the new update time, otherwise return the current list of top ten users if no 
	* update is needed and the last updated time. If there is a tie between multiple users, 
	* there is a equal chance of any of them ranking in front of the other (ranking deicided randomly)
	* @param {Date} currentTime - the current time
	* @param {Number} updateThreshold - the number of miliseconds that need to have passed 
									  - in order to perform an update  
	* @return {Promise} - a promise containing the new/current top user documents, up to 10, and the update time
	*/
	that.updateTopTenUsers = function(currentTime, updateThreshold) {
  		return needUpdate(currentTime, updateThreshold).then(function(toUpdate){
    		if (toUpdate) {
      			return getNewTopTenUsers().then(function(newTopTen){
        			return replace(currentTime, newTopTen).then(function(result) {
          				return {updateTime: currentTime, topTen: newTopTen};
        				})
      				})
    			}
    		else {
      			return getCurrentTopTen();
    		}
  		})
	}

	/**
	* According to the current reputations of all users when this method is being called
	* return a new list of top users, up to 10 of them, sorted by their reputation
	* if there is a tie, there is a equal chance of either of them ranking in front of the other
	* @return {Promise} - a promise for the get operation
	*/

	var getNewTopTenUsers = function() {
	  	return User.getAllUsers().then(function(userList) {
	      	return Promise.map(userList, function(user) {
	        	return User.getReputation(user._id).then(function(reputation){
	        		return {user: user, reputation: reputation};
	        		})
		        }).then(function(userRepPairList){
			        userRepPairList.sort(function(pairA, pairB){
			          	if (pairA.reputation > pairB.reputation){
			            	return -1;
			          	}
			          	else if (pairA.reputation < pairB.reputation) {
			            	return 1;
			          	}
			          	else if (pairA.reputation < pairB.reputation) {
			            	return -1;
			          	}
			          	else {
			            	if (Math.random() >= 0.5) {
			              		return 1;
			            		}
			            	else {
			              		return -1
			            	}
			        	}
		        	});
		        	topTen = userRepPairList.slice(0,10);
		        	return topTen.map(function(pair) {
		          		return pair.user;
		        	});
		    	});
			});
		};

	/**
	* To check whether an update of the Top Ten leaderboard is necessary
	* returns true if there is currently no topTen document in the database
	* or it has been a week since the last update occurred
	* otherwise returns false
	* @param {Date} currentTime - the time we want to check whether it's necessary to update 
	* @param {Number} updateThreshold - the number of miliseconds that need to have passed 
									  - in order to perform an update 
	* @return {Promise} - a promise containing true/false depending whether we need to update
	*/
	var needUpdate = function(currentTime, updateThreshold) {
		return topTenSchema.find({}).then(function(resultList) {
			if (resultList.length == 0) {
				//no top ten document has ever been created, we need to create one
				return true;
			}
			else {
				//at any time there will be only one top ten document in the database
				var current = resultList[0];
				lastUpdatedTime = current.updatedTime
				timeSpanned = currentTime.valueOf() - lastUpdatedTime.valueOf();
				//if time spanned has been more than updateThreshold then we update
				return (timeSpanned >= updateThreshold);
			}
		})
	}



	/**
	* To replace the current top ten document in the database with a new top ten
	* document representing the new updated time and the new top ten users.
	* @param {Date} newUpdatedTime - the new update time of the top ten users
	* @param {Array} newTopTenUsers - an array of up to ten users representing the current top users
	* @return {Promise} - a promise containing the new topTen document
	*/
	var replace = function(newUpdatedTime, newTopTenUsers){
		return topTenSchema.remove({}).then(function(removed) {
			var currentTopTen = new topTenSchema({
				updatedTime: newUpdatedTime, 
				topUsers: newTopTenUsers
				});
			return currentTopTen.save();
		})
	}

	/**
	* To get the list of the current top ten users stored in the database
	* and the last updated time associated with the current top ten
	* @return {Promise} - a promise for the get operation
	*/
	var getCurrentTopTen = function() {
		return topTenSchema.find({})
			.populate("topUsers")
			.then(function(resultList){
				return {updateTime: resultList[0].updatedTime, topTen: resultList[0].topUsers};
		})
	};

	

	Object.freeze(that);
  	return that;

})(TopTenSchema);

module.exports = TopTen;