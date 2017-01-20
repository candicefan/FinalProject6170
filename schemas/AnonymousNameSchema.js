var mongoose = require('mongoose');
mongoose.Promise = require("bluebird");
var ObjectId = mongoose.Schema.Types.ObjectId;

/* 
 * Model representing Anonymous Names
 * Author(s): alicejin
 */
var anonymousNameSchema = mongoose.Schema({
	anonymousName: {type: String, required: true},
	user: {type: ObjectId, ref: 'User', required: true}
});

module.exports = mongoose.model('AnonymousName', anonymousNameSchema);
