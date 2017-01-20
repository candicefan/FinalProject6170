var Promise = require("bluebird");

var AnonymousNameSchema = require("../schemas/AnonymousNameSchema");
var Babble = require("../models/Babble");
var Actions = require("../data/actions"); 
var Fruits = require("../data/fruits"); 

/* 
 * ADT representing Anonymous Names
 * Author(s): alicejin
 */
var AnonymousName = (function(anonymousNameSchema) { 

	var that = {};

	/**
	* Generates a new, random name 
	* @return {String} a two word name separated by a space 
	*/
	var generate = function() {
		action = Actions[Math.floor(Math.random()*Actions.length)];
		fruit = Fruits[Math.floor(Math.random()*Fruits.length)];
		return action + " " + fruit;
	}

	/**
	* Gets a new AnonymousName for a Babble
	* @param {ObjectId} userId - existing valid ObjectId of the user for whom this new AnonymousName is created
	* @return {Promise} - a promise for the newly created AnonymousName document
	*/
	that.getNewAnonymousNameForBabble = function(userId) {
		var newName = generate();
		var anonymousName = new anonymousNameSchema({
			anonymousName: newName, 
			user: userId
		});
		return anonymousName.save();		
	}

	/**
	* Gets the AnonymousName of a user posting Comment 
	* If the user with specified userId has already anonymously posted a Comment under the Babble with the specified babbleId, 
	* then the AnonymousName previously used will be returned. 
	* Otherwise, a new AnonymousName is created and returned. 
	* @param {ObjectId} babbleId - existing valid ObjectId of the Babble under which the Comment is be posted
	* @param {ObjectId} userId - existing valid ObjectId of the user with whom this AnonymousName is associated
	* @return {Promise} - a promise for the AnonymousName document
	*/
	that.getAnonymousNameForComment = function(babbleId, userId) {
		var namesInBabble =  getAllAnonymousNamesInBabble(babbleId);
		return Promise.filter(namesInBabble, function(name) {
			return getAnonymousName(name).then(function(anonymousName) {
				if(anonymousName) {
					return anonymousName.user.equals(userId);
				} else {
					return false;
				}
			});
		}).then(function(filteredResult) {
			if(filteredResult.length == 0) {
				return getNewAnonymousNameForComment(babbleId, userId);
			} else {
				return filteredResult[0];
			}
		});
	}

	/**
	* Gets a new AnonymousName for a Comment
	* @param {ObjectId} babbleId - existing valid ObjectId of the Babble under which the Comment is be posted
	* @param {ObjectId} userId - existing valid ObjectId of the user with whom this new AnonymousName is associated
	* @return {Promise} - a promise for the new AnonymousName document
	*/
	var getNewAnonymousNameForComment = function(babbleId, userId) {
		var newName = generate(); 
		return containsName(babbleId, newName).then(function(result) {
			if(!result) {
				var anonymousName = new anonymousNameSchema({
					anonymousName: newName, 
					user: userId
				});
				return anonymousName.save();
			} else { 
				return getNewAnonymousNameForComment(babbleId, userId);
			}
		});
	}



	/**
	* Checks if a name is already used in a Babble and the Comments posted under this Babble
	* @param {ObjectId} babbleId - existing valid ObjectId of the Babble under which the Comment will be posted
	* @param {String} newName - the name to be checked if used already
	* @return {Promise} - a promise for a boolean that is true if newName is already in use, false otherwise
	*/
	var containsName = function(babbleId, newName) {
		return getAllAnonymousNamesInBabble(babbleId).then(function(allNames) {
			return Promise.filter(allNames, function(name) {
				if(name) {
					return name.anonymousName == newName;
				} else {
					return false;
				}
			}).then(function(sameNames) {
				return sameNames.length == 0 ? false : true;
			});
		});
	}

	/**
	* Gets all the AnonymousNames used in a Babble and the Comments posted under this Babble
	* @param {ObjectId} babbleId - existing valid ObjectId of the Babble under which Comments are posted
	* @return {Promise} - a promise for an Array of AnonymousNames
	*/
	var getAllAnonymousNamesInBabble = function(babbleId) {
		return Babble.getBabble(babbleId).then(function(babble) {
	   		return getAllAnonymousNamesInComments(babble).then(function(allNames) {
	   			return [babble.anonymousName].concat(allNames);
	   		})
	   });
	}

	/**
	* Gets all the AnonymousNames used in the Comments posted under a Babble
	* @param {ObjectId} babbleId - existing valid ObjectId of the babble under which Comments are posted
	* @return {Promise} - a promise for the array of AnonymousNames
	*/
	var getAllAnonymousNamesInComments = function(babble) {
		if(babble.comments) {
			return Promise.map(babble.comments, function(comment) {
				return getAnonymousName(comment.anonymousName);
			});
		} else {
			return [];
		}
	}

	/**
	* Gets the AnonymousName with the specified id
	* @param {ObjectId} id - existing valid ObjectId of the AnonymousName requested
	* @return {Promise} - a promise for the AnonymousName document with no field populated
	*/
	var getAnonymousName = function(id) {
		return anonymousNameSchema.findOne({"_id": id});
	}

	Object.freeze(that);
	return that;
	
})(AnonymousNameSchema);

module.exports = AnonymousName;

