var mongoose = require('mongoose');
mongoose.Promise = require("bluebird");
var ObjectId = mongoose.Schema.Types.ObjectId;

var commentSchema = mongoose.Schema({
  user: {type: ObjectId, ref: 'User', required: true},
  anonymousName: {type: ObjectId, ref: 'AnonymousName', default: null},
  content: {type: String, required: true},
  babble: {type: ObjectId, ref: 'Babble', required: true},
  timestamp: {type: Date, default: Date.now},
  goodVibeUsers: [{type: ObjectId, ref: 'User'}],
  badVibeUsers: [{type: ObjectId, ref: 'User'}]
});

module.exports = mongoose.model('Comment', commentSchema);
