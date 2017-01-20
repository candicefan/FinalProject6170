var mongoose = require('mongoose');
mongoose.Promise = require("bluebird");
var ObjectId = mongoose.Schema.Types.ObjectId;

/* 
 * Model representing User
 * Author(s): rachel18
 */
var userSchema = mongoose.Schema({
	name: {type: String, required: true},
	password: {type: String, required: true},
	kerberos: {type: String, required: true}, 
	email: {type: String, required: true},
	babbleLimit: {type: Number, required: true, default: 5}
}); 

module.exports = mongoose.model('User', userSchema);