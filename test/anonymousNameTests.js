var assert = require('assert');
var mongoose = require('mongoose');
var assert = require('assert');
mongoose.Promise = require('bluebird');

var ObjectId = mongoose.Schema.Types.ObjectId;
var UserUtils = require('./userUtils');
var AnonymousName = require('../models/AnonymousName');
var Babble = require('../models/Babble');	
var Comment = require('../models/Comment')

/* 
 * tests for AnonymousName model
 * Author(s): alicejin, rachel18
 */
describe('AnonymousName Model', function() {
	
	var con;
	before(function(done) {
		con = mongoose.connect("mongodb://localhost/testdb", function() {
			done();
		});
	});

	beforeEach(function(done) {
		con.connection.db.dropDatabase(function(){done();})
	});

	
	describe('getNewAnonymousNameForBabble()', function(){

		it('should generate a random anonymous name for the existing user', function(done){
			UserUtils.register("xueqifan", "Xueqi Fan", "1234567", "1234567").then(function(currentUser){
				AnonymousName.getNewAnonymousNameForBabble(currentUser._id).then(function(currentAnonymousName) {
					assert.equal(false, currentAnonymousName == null);
					assert.equal(currentAnonymousName.user, currentUser._id);
					done();
				},  function(err) {
					assert.equal(true, false);
					done();
				});
			});
		});

		it('should generate another random anonymous name for the existing user', function(done){
			UserUtils.register("rachel18", "Rachel Lin", "1234567", "1234567").then(function(currentUser){
				AnonymousName.getNewAnonymousNameForBabble(currentUser._id).then(function(currentAnonymousName) {
					assert.equal(false, currentAnonymousName == null);
					assert.equal(currentAnonymousName.user, currentUser._id);
					done();
				},  function(err) {
					assert.equal(true, false);
					done();
				});
			});
		});
	}); //end describe #getNewAnonymousNameForBabble()


	describe('getNewAnonymousNameForComment()', function(){
		// testing strategy for getNewAnonymousNameForComment():
		//		different commenters have distinct anonymousNames under the same babble
		//		babble poster comments on his own post anonymously -> keeps his anonymousName
		//		Commenter comments under same babble multiple times -> keeps his anonymousName

		it('should generate a distinct anonymous name for the babble poster and a different commenter', function(done){
			UserUtils.register("rachel18", "Rachel Lin", "1234567", "1234567").then(function(currentUser){
				AnonymousName.getNewAnonymousNameForBabble(currentUser._id).then(function(currentAnonymousName) {
					Babble.addBabble("Hello, world",currentUser._id,currentAnonymousName._id).then(function(currentBabble){
						UserUtils.register("rachel19","Rachel Lin","0000000","0000000").then(function(commentUser){
							AnonymousName.getAnonymousNameForComment(currentBabble._id, commentUser._id).then(function(commentAnonymousName) {
								assert.equal(false,commentAnonymousName._id.toString()==currentAnonymousName._id.toString());
								done();
								}, function(err) {
									assert.equal(true, false);
									done();
								});
							});
						});
					});
				});
			});

		it('different commenters have distinct anonymousNames under the same babble', function(done){
			UserUtils.register("rachel00", "Rachel Lin", "1234567", "1234567").then(function(babbleUser){
				Babble.addBabble("Hello, world", babbleUser._id,null).then(function(currentBabble){
					UserUtils.register("alicejin", "Alice Jin", "1234567", "1234567").then(function(commentUser1){
						UserUtils.register("stacyho", "Stacy Ho", "1234567", "1234567").then(function(commentUser2){
							UserUtils.register("xueqifan", "Candice Fan", "1234567", "1234567").then(function(commentUser3){
								AnonymousName.getAnonymousNameForComment(currentBabble._id, commentUser1._id).then(function(commentAnonymousName1) {
									AnonymousName.getAnonymousNameForComment(currentBabble._id, commentUser2._id).then(function(commentAnonymousName2) {
										AnonymousName.getAnonymousNameForComment(currentBabble._id, commentUser3._id).then(function(commentAnonymousName3) {
											assert.equal(false, commentAnonymousName1._id.toString() == commentAnonymousName2._id.toString());
											assert.equal(false, commentAnonymousName1._id.toString() == commentAnonymousName3._id.toString());
											assert.equal(false, commentAnonymousName2._id.toString() == commentAnonymousName3._id.toString());
											done();
											}, function(err) {
												assert.equal(true, false);
												done();
											});
										});
									});
								});
							});
						});
					});
				});
			});

		it('babble poster comments on his own post anonymously -> keeps his posting anonymousName', function(done){
			UserUtils.register("rachel00", "Rachel Lin", "1234567", "1234567").then(function(babbleUser){
				AnonymousName.getNewAnonymousNameForBabble(babbleUser._id).then(function(babbleAnonymousName) {
					Babble.addBabble("Hello, world", babbleUser._id,babbleAnonymousName._id).then(function(currentBabble){
						AnonymousName.getAnonymousNameForComment(currentBabble._id, babbleUser._id).then(function(commentAnonymousName1) {
							AnonymousName.getAnonymousNameForComment(currentBabble._id, babbleUser._id).then(function(commentAnonymousName2) {
								AnonymousName.getAnonymousNameForComment(currentBabble._id, babbleUser._id).then(function(commentAnonymousName3) {
									AnonymousName.getAnonymousNameForComment(currentBabble._id, babbleUser._id).then(function(commentAnonymousName4) {
										assert.equal(commentAnonymousName1._id.toString(), babbleAnonymousName._id.toString());
										assert.equal(commentAnonymousName2._id.toString(), babbleAnonymousName._id.toString());
										assert.equal(commentAnonymousName3._id.toString(), babbleAnonymousName._id.toString());
										assert.equal(commentAnonymousName4._id.toString(), babbleAnonymousName._id.toString());
										done();
										}, function(err) {
											assert.equal(true, false);
											done();
										});
									});
								});
							});
						});
					});
				});
			});

		
		it('Commenter comments under same babble multiple times -> keeps his anonymousName', function(done){
			UserUtils.register("rachel00", "Rachel Lin", "1234567", "1234567").then(function(babbleUser){
				Babble.addBabble("Hello, world", babbleUser._id, null).then(function(currentBabble){
					UserUtils.register("alicejin", "Alice Jin", "1234567", "1234567").then(function(commentUser){
						AnonymousName.getAnonymousNameForComment(currentBabble._id, commentUser._id).then(function(commentAnonymousName1) {
							Comment.addComment("1", currentBabble._id, commentUser._id, commentAnonymousName1._id).then(function(comment1) {
								AnonymousName.getAnonymousNameForComment(currentBabble._id, commentUser._id).then(function(commentAnonymousName2) {
									Comment.addComment("2", currentBabble._id, commentUser._id, commentAnonymousName2._id).then(function(comment2) {
										AnonymousName.getAnonymousNameForComment(currentBabble._id, commentUser._id).then(function(commentAnonymousName3) {
											Comment.addComment("3", currentBabble._id, commentUser._id, commentAnonymousName3._id).then(function(comment3) {
												AnonymousName.getAnonymousNameForComment(currentBabble._id, commentUser._id).then(function(commentAnonymousName4) {
													Comment.addComment("4", currentBabble._id, commentUser._id, commentAnonymousName4._id).then(function(comment4) {
														assert.equal(commentAnonymousName1.anonymousName, commentAnonymousName2.anonymousName);
														assert.equal(commentAnonymousName1.anonymousName, commentAnonymousName3.anonymousName);
														assert.equal(commentAnonymousName1.anonymousName, commentAnonymousName4.anonymousName);
														done();
													}, function(err) {
														assert.equal(true, false);
														done();
													});
												});
											});
										});
									});
								});
							});
						});
					});
				});
			});
		});

		
	});//end describe #getAnonymousNameForComment




});//end describe AnonymousName Model
