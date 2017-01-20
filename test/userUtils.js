var promise = require("bluebird");
var mongoose = require('mongoose');
mongoose.Promise = promise;
var userModel = require('../schemas/UserSchema.js');

/* 
 * util method for creating an user
 * Author(s): rachel18
 */
var UserUtils = (function(userModel) {

	var that = {};

	that.register = function(kerberos, name, password, pwConfirmation){
			//not checking kerberos
			return userModel.findOne({kerberos: kerberos}).then(function(result){
				//the account already exists
				if (result != null) {
					throw 'user already registered in the system!'
				}
				else {
					if (password.length < 6) {
						throw 'the password is too short! please have a stronger one!';
					}
					else if (password != pwConfirmation){
						throw 'the passwords do not match, try again!';
					}
					else {
						var user = new userModel({
							name: name,
							password: password,
							kerberos: kerberos,
							email: kerberos+"@mit.edu",
							babbleLimit: 5
						});
						return user.save();
					}
				}
			})
		}

	Object.freeze(that);
  	return that;
})(userModel);

module.exports = UserUtils;