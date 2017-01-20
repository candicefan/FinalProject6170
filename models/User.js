var Promise = require("bluebird");
var Bcrypt = require('bcryptjs');

var mongoose = require('mongoose');
mongoose.Promise = Promise;

var UserSchema = require('../schemas/UserSchema.js');
var TempUserSchema = require('../schemas/TempUserSchema.js');
var Babble = require('../models/Babble.js');
var Comment = require('../models/Comment.js');

var hashingFunction = function(password, tempUserData, insertTempUser, callback) {
  Bcrypt.genSalt(8, function(err, salt) {
    Bcrypt.hash(password, salt, function(err, hash) {
      return insertTempUser(hash, tempUserData, callback);
    });
  });
};

var Nev = Promise.promisifyAll(require("email-verification")(mongoose), {
  filter: function(name) {
    return name === "createTempUser";
  }, multiArgs: true});
Nev = Promise.promisifyAll(Nev);
Nev.configureAsync({
  persistentUserModel: UserSchema, 
  tempUserModel: TempUserSchema, 
  verificationURL: process.env.NODE_ENV !== 'production' ? 
		// development 
		"http://localhost:3000/user/verify/${URL}" : 
		// production
		"https://maga-finalproject.herokuapp.com/user/verify/${URL}" ,
  transportOptions: {
  	service: 'gmail', 
  	auth: {
  		user: 'babble.mit@gmail.com', 
  		pass: 'vahidisthebest'
  	}
  },
  verifyMailOptions: {
        from: '"Babble - Do Not Reply" <babble@mit.edu>',
        subject: 'Confirm your Babble account',
        html: '<p>Please verify your account in 24 hours by clicking <a href="${URL}">this link</a>. If you are unable to do so, copy and ' +
                'paste the following link into your browser:</p><p>${URL}</p>',
        text: 'Please verify your account by clicking the following link, or by copying and pasting it into your browser: ${URL}'
  },
  shouldSendConfirmation: true,
  confirmMailOptions: {
        from: '"Babble - Do Not Reply" <babble@mit.edu>',
        subject: 'Successfully verified on Babble!',
        html: '<p>Your account has been successfully verified.</p>',
        text: 'Your account has been successfully verified.'
  },
  hashingFunction: hashingFunction
});

/**
* ADT representing users, that is, MIT students who are uniquely identified by their MTI kerberos
* Author(s): alicejin, xueqifan, rachel18
*/
var User = (function(userSchema) { 
	var that = {};

	/**
	* Send a verification that is valid for 24 hours to the email address associated with the specified kerberos.
	* @param {String} kerberos - kerberos of the user whose associated email is kerberos+'@mit.edu'
	* @param {String} name - full name of the user 
	* @param {String} password - password of the user
	* @return {Promise} - a promise for the operation
	* @throw "An account with this kerberos already exists." - if a user is already registered using this kerberos
	* @throw "A verification email has already been sent." - if a verification email has been sent to the email address associated with the specified kerberos within the past 24 hours
	*/
	that.sendVerification = function(kerberos, name, password) {
	    var user = new userSchema({
	      name: name,
	      password: password,
	      kerberos: kerberos, 
	      email: kerberos+"@mit.edu",
	      babbleLimit: 5
	    });
	    return Nev.createTempUserAsync(user).spread(function(existingPersistentUser, newTempUser) {
	          if (existingPersistentUser) { 
	            throw "An account with this kerberos already exists.";
	          } else if (newTempUser) {
	            return Nev.sendVerificationEmailAsync(newTempUser.email, newTempUser[Nev.options.URLFieldName]);
	          } else { 
	            throw "A verification email has already been sent.";
	          }
	    });
	}

	/**
	* Verify the user's email address with the specified token
	* @param {String} token - verification token to confirm the user's email address
	* @return {Promise} - a promise for the operation
	*/
	that.verify = function(token) {
	    return Nev.confirmTempUserAsync(token);
	}

	/**
	* To return an already registered user with the specified kerberos if the password matches
	* else throw error messages if the user is not registered or the password does not match
	* @param {String} kerberos - the kerberos of the user we want to find
	* @param {String} password - the password associated with the user's account
	* @return {Promise} - a promise for the operation
	* @throw "Wrong username or password. Please try again." - if the kerberos is not in the system or password does not match
	*/
	that.login = function(kerberos, password){
		return userSchema.findOne({kerberos: kerberos}).then(function(result){
     		if (!result){
        		throw 'Wrong username or password. Please try again.';
     		} else {
          		return Bcrypt.compare(password, result.password).then(function(res) {
           			if (res){
              			return result;
            		} else {
              			throw 'Wrong username or password. Please try again. ';
            		}
          		});
      		}
	  });
  }
  	/**
  	* To get the user document with the specified authorName/kerberos
  	* or null if such user does not exist
  	* @param {String} authorName - the kerberos of the user
  	* @return {Promise} - a promise for the get operation
  	*/
	that.getUser = function(authorName) {
		return userSchema.findOne({kerberos: authorName});
	}

	/**
	* Get a list of all users in the database
	* @return {Promise} - a promise for the get operation
	*/
	that.getAllUsers = function(){
		return userSchema.find({});
	}

	/**
	* To update the babble limit of a user based on his reputation.
	* If the reputation is positive update the posting limit based on the threshold
	* else set the limit to 1
	* and then return the updated user object
	* @param {ObjectId} userId - existing valid ObjectId of the user of interest
	* @param {Number} reputation - the current reputation of the user
	* @return {Promise} - a promise containing the updated user object
	*/
	that.updateLimit = function(userId, reputation){
		var newLimit = Math.floor(reputation / 50);
		return userSchema.findOne({_id:userId}).then(function(user){
			if (reputation > 0){
				user.babbleLimit = newLimit + 5;
				return user.save();
			} else {
				user.babbleLimit = 1;
				return user.save();
			}
		}) 
	}

	/**
	* get the total reputation associated with an user and return it
	* the reputation is directly related to how many comments and babbles the user has posted
	* and the number of goodvibes and badvibes that he received on those
	* @param {ObjectId} userId - exisiting valid ObjectId of the user whose reputation we want to get
	* @return {Promise} - a promise for the get operation 
	*/
	that.getReputation = function(userId) {
		return Babble.getReputation(userId).then(function(babbleRep){
	        return Comment.getReputation(userId).then(function(commentRep){
	            return commentRep + babbleRep;
	        });
	    });
	}

	

	Object.freeze(that);
  	return that;
  	
})(UserSchema);

module.exports = User;