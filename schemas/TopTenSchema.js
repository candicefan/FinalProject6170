var mongoose = require('mongoose');
mongoose.Promise = require("bluebird");
var ObjectId = mongoose.Schema.Types.ObjectId;

/* 
 * Model representing Top Ten Users
 * Author(s): rachel18
 */
var topTenSchema = mongoose.Schema({
	updatedTime: {type: Date, required: true},
	topUsers: [{type: ObjectId, ref: 'User'}]
});

module.exports = mongoose.model('TopTen', topTenSchema);