var mongoose = require('mongoose');
mongoose.Promise = require("bluebird");
var ObjectId = mongoose.Schema.Types.ObjectId;

/* 
 * Model representing temporary user before verified
 * Author(s): alicejin
 */
var tempUserSchema = mongoose.Schema({
	name: {type: String, required: true},
	password: {type: String, required: true},
	kerberos: {type: String, required: true},	
	email: {type: String, required: true},
	babbleLimit: {type: Number, required: true},
	GENERATED_VERIFYING_URL: {type: String, required: true}, 
	createdAt: {
        type: Date,
        expires: 86400,
        default: Date.now
    }
}); 

module.exports = mongoose.model('TempUser', tempUserSchema);