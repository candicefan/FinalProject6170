var mongoose = require('mongoose');
mongoose.Promise = require("bluebird");
var ObjectId = mongoose.Schema.Types.ObjectId;
var autoIncrement = require('mongoose-auto-increment');
var connection = mongoose.createConnection(process.env.MONGOLAB_URI || 'mongodb://localhost/mymongodb');
autoIncrement.initialize(connection);

/* 
 * Model representing Babbles
 * Author(s): alicejin, rachel18
 */
var babbleSchema = mongoose.Schema({
	content: {type: String, required: true},
	user: {type: ObjectId, ref: 'User', required: true}, 
	anonymousName: {type: ObjectId, ref: 'AnonymousName', default: null},
	comments: [{type: ObjectId, ref: 'Comment'}],
	timestamp: {type: Date, default: Date.now},
	goodVibeUsers: [{type: ObjectId, ref: 'User'}],
	badVibeUsers: [{type: ObjectId, ref: 'User'}]
});

//autoincrementhing the babbleNumber field of Babble starting at the number 1
babbleSchema.plugin(autoIncrement.plugin, {
	model: 'Babble',
	field: 'babbleNumber',
	startAt: 1,
	incrementBy: 1
});

module.exports = mongoose.model("Babble", babbleSchema);