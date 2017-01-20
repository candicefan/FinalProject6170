var assert = require('assert');
var mongoose = require('mongoose');
var Comment = require('../models/Comment.js');
var User = require('../models/User.js');
var AnonymousName = require('../models/AnonymousName.js');
var Babble = require('../models/Babble.js');
var ObjectId = mongoose.Schema.Types.ObjectId;
var UserUtils = require('./userUtils');


/* 
 * tests for Comment model
 * Author(s): rachel18, xueqifan
 */

describe('Comment Model', function() {

	// The mongoose connection object.
	var con;

	// Before running any test, connect to the database.
	before(function(done) {
		con = mongoose.connect("mongodb://localhost/testdb", function() {
			done();
		});
	});

	// Delete the database before each test.
	beforeEach(function(done) {
		con.connection.db.dropDatabase(function() { done(); });
	})

	describe("#addComment(content, babbleId, userId, anonymousNameId)", function(){
	  	// partitions for addComment():
	  	//		anonymous: yes, no, mixture(same user posting two comments using both)
	  	//		comment author is the babble author: yes, no
	  	//		same user posting multiple comments under same babble: yes, no

		it('post a comment with the real identity and comment author is the babble author', function (done) {
			UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser){
				Babble.addBabble("I love dinning hall food?", babbleUser._id, null).then(function(newBabble) {
					Comment.addComment("do you really tho?", newBabble._id,babbleUser._id,null).then(function(newComment){
						assert.equal(newComment.content,"do you really tho?");
						assert.equal(newComment.user,babbleUser._id);
						assert.equal(newComment.anonymousName, null);
						done();
					}, function(err){
						assert.equal(true, false);
						done();
					});
				});
			});
		});


		it('post a comment under anonymous name and comment author is not the babble author', function (done) {
			UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser){
				Babble.addBabble("I love dinning hall food?", babbleUser._id, null).then(function(newBabble) {
					UserUtils.register("candice","Candice Fan","1234567","1234567").then(function(commentUser){
						AnonymousName.getNewAnonymousNameForBabble(babbleUser._id).then(function(anonymousCommentUser) {
							Comment.addComment("do you really tho?", newBabble._id,commentUser._id,anonymousCommentUser._id).then(function(newComment){
								assert.equal(newComment.content,"do you really tho?");
								assert.equal(newComment.user,commentUser._id);
								assert.equal(newComment.anonymousName, anonymousCommentUser._id);
								done();
							}, function(err){
								assert.equal(true, false);
								done();
							});
						});
					});
				});
			});
		});


		it('a user posts multiple comments under same babble, mixed anonymity', function (done) {
			UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser) {
				AnonymousName.getNewAnonymousNameForBabble(babbleUser._id).then(function(anonymousBabbleUser){
					Babble.addBabble("I love dinning hall food?", babbleUser._id, anonymousBabbleUser._id).then(function(newBabble) {
						Comment.addComment("You are the only one that I know", newBabble._id,babbleUser._id, null).then(function(newComment1) {
							Comment.addComment("They are pretty good",newBabble._id, babbleUser._id,anonymousBabbleUser._id).then(function(newComment2){
								assert.equal(newComment1.content,"You are the only one that I know");
								assert.equal(newComment2.content,"They are pretty good");
								assert.equal(newComment1.user,babbleUser._id);
								assert.equal(newComment2.user,babbleUser._id);
								assert.equal(newComment1.anonymousName, null);
								assert.equal(newComment2.anonymousName, anonymousBabbleUser._id);
								assert.equal(newComment2.anonymousName, newBabble.anonymousName);
								done();
							}, function(err){
								assert.equal(true, false);
								done();
							});
						});
					});
				});
			});
		});

		it('a user posts multiple comments under different babbles, all anonymously', function(done) {
			UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser1) {
				UserUtils.register("candicefan", "Candice Fan", "123456789", "123456789").then(function(babbleUser2){
					UserUtils.register("alicejin", "Alice Jin", "123456789", "123456789").then(function(commentUser){
						Babble.addBabble("I love dinning hall food?", babbleUser1._id, null).then(function(newBabble1){
							AnonymousName.getNewAnonymousNameForBabble(commentUser._id).then(function(anonymousCommentUser1){
								Comment.addComment("You are the only one that I know", newBabble1._id,commentUser._id, anonymousCommentUser1._id).then(function(newComment1) {
									Babble.addBabble("I really like MIT", babbleUser2._id,null).then(function(newBabble2){
										AnonymousName.getNewAnonymousNameForBabble(commentUser._id).then(function(anonymousCommentUser2){
											Comment.addComment("Me too!!",newBabble2._id,commentUser._id,anonymousCommentUser2._id).then(function(newComment2){
												assert.equal(newComment1.content,"You are the only one that I know");
												assert.equal(newComment2.content,"Me too!!");
												assert.equal(newComment1.user,commentUser._id);
												assert.equal(newComment2.user,commentUser._id);
												assert.equal(newComment1.anonymousName, anonymousCommentUser1._id);
												assert.equal(newComment2.anonymousName, anonymousCommentUser2._id);
												assert.notEqual(newComment1.anonymousName, newComment2.anonymousName);
												done();
											}, function(err){
												assert.equal(true,false);
												done();
											})
										})
									})
								})
							})
						});
					})
				})
			});
		});


	}); //end describe #addComment


	describe('#getAllCommentsForBabble(babbleId)', function(){
		// partitions for getAllCommentsForBabble():
		//		number of comments for the babble: 0, 1, >1
		//		comment author is the same as the babble author: yes, no

		it('0 comments found for the babble', function(done){
			UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser) {
				Babble.addBabble("I love dinning hall food?", babbleUser._id, null).then(function(newBabble) {
					Comment.getAllCommentsForBabble(newBabble._id).then(function(allComments){
						assert.equal(allComments.length,0);
						done();
					}, function(err){
						assert.equal(true,false);
						done();
					})
				});
			});
		});

		it('1 comment found for the babble, and comment and babble wrote by the same person', function(done){
			UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser) {
				Babble.addBabble("I love dinning hall food?", babbleUser._id, null).then(function(newBabble) {
					Comment.addComment('are you serious?',newBabble._id, babbleUser._id,null).then(function(newComment){
						Comment.getAllCommentsForBabble(newBabble._id).then(function(allComments){
							assert.equal(allComments.length,1);
							assert.equal(allComments[0].content, 'are you serious?');
							assert.equal(allComments[0].user.kerberos, babbleUser.kerberos);
							done();
						}, function(err){
							assert.equal(true,false);
							done();
						})
					});
				});
			});
		});

		it('>1 comments found for the babble, and comments and babble wrote by different people', function(done){
			UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser) {
				UserUtils.register("candicefan", "Candice Fan", "123456789", "123456789").then(function(commentUser1) {
					UserUtils.register("alice", "Alice Jin", "123456789", "123456789").then(function(commentUser2) {
						Babble.addBabble("I love dinning hall food?", babbleUser._id, null).then(function(newBabble) {
							Comment.addComment('are you serious?',newBabble._id, commentUser1._id,null).then(function(newComment1){
								Comment.addComment('what in the world are you talking about??',newBabble._id, commentUser2._id,null).then(function(newComment2){
									Comment.addComment('I cannot believe this',newBabble._id,commentUser1,null).then(function(newComment3){
										Comment.getAllCommentsForBabble(newBabble._id).then(function(allComments){
											assert.equal(allComments.length,3);
											assert.equal(allComments[0].content,'are you serious?');
											assert.equal(allComments[1].content,'what in the world are you talking about??');
											assert.equal(allComments[2].content,'I cannot believe this');
											assert.equal(allComments[0].user.kerberos,commentUser1.kerberos);
											assert.equal(allComments[1].user.kerberos,commentUser2.kerberos);
											assert.equal(allComments[2].user.kerberos,commentUser1.kerberos);
											done();
										}, function(err){
											assert.equal(true,false);
											done();
										})
									})
								})
							});
						});
					})
				})
			});
		});


	});//end describe #getAllCommentsForBabble


	describe('#getCommentCountForBabble(babbleId)', function(){
		// partitions for getCommentCountForBabble():
		//		number of comments for the babble: 0, 1, >1

		it('0 comments found for the babble', function(done){
			UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser) {
				Babble.addBabble("I love dinning hall food?", babbleUser._id, null).then(function(newBabble) {
					Comment.getCommentCountForBabble(newBabble._id).then(function(commentsCount){
						assert.equal(commentsCount,0);
						done();
					}, function(err){
						assert.equal(true,false);
						done();
					})
				});
			});
		});

		it('1 comment found for the babble, and comment and babble wrote by the same person', function(done){
			UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser) {
				Babble.addBabble("I love dinning hall food?", babbleUser._id, null).then(function(newBabble) {
					Comment.addComment('are you serious?',newBabble._id, babbleUser._id,null).then(function(newComment){
						Comment.getCommentCountForBabble(newBabble._id).then(function(commentsCount){
							assert.equal(commentsCount,1);
							done();
						}, function(err){
							assert.equal(true,false);
							done();
						})
					});
				});
			});
		});

		it('>1 comments found for the babble, and comments and babble wrote by different people', function(done){
			UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser) {
				UserUtils.register("candicefan", "Candice Fan", "123456789", "123456789").then(function(commentUser1) {
					UserUtils.register("alice", "Alice Jin", "123456789", "123456789").then(function(commentUser2) {
						Babble.addBabble("I love dinning hall food?", babbleUser._id, null).then(function(newBabble) {
							Comment.addComment('are you serious?',newBabble._id, commentUser1._id,null).then(function(newComment1){
								Comment.addComment('what in the world are you talking about??',newBabble._id, commentUser2._id,null).then(function(newComment2){
									Comment.getCommentCountForBabble(newBabble._id).then(function(commentsCount){
										assert.equal(commentsCount,2);
										done();
									}, function(err){
										assert.equal(true,false);
										done();
									})
								})
							});
						});
					})
				})
			});
		});


	});//end describe #getCommentCountForBabble


	describe('#getAllCommentsByUser(userId)', function(){
		// partitions for getAllCommentsByUser():
		//		number of comments by the user: 0, 1, >1
		//		comments are anonymous: yes, no, mix of both
		//		comment and babble same author: yes, no

		it('no comments by this user', function(done){
			UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser) {
				Babble.addBabble("I love dinning hall food?", babbleUser._id, null).then(function(newBabble) {
					Comment.getAllCommentsByUser(babbleUser._id).then(function(allComments){
						assert.equal(allComments.length,0);
						done();
					}, function(err){
						assert.equal(true,false);
						done();
					})
				});
			});
		});

		it('1 anonymous comment by this user, comment and babble same author', function(done){
			UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser) {
				Babble.addBabble("I love dinning hall food?", babbleUser._id, null).then(function(newBabble) {
					AnonymousName.getNewAnonymousNameForBabble(babbleUser._id).then(function(anonymousCommentUser){
						Comment.addComment('are you serious?',newBabble._id, babbleUser._id,anonymousCommentUser._id).then(function(newComment){
							Comment.getAllCommentsByUser(babbleUser._id).then(function(allComments){
								assert.equal(allComments.length,1);
								assert.equal(allComments[0].user.kerberos,babbleUser.kerberos);
								assert.equal(allComments[0].content,'are you serious?');
								assert.equal(allComments[0].anonymousName.anonymousName,anonymousCommentUser.anonymousName);
								done();
							}, function(err){
								assert.equal(true,false);
								done();
							})
						});
					});
				})
			});
		});

		it('1 not anonymous comment by this user, comment and babble same author', function(done){
			UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser) {
				Babble.addBabble("I love dinning hall food?", babbleUser._id, null).then(function(newBabble) {
					Comment.addComment('are you serious?',newBabble._id, babbleUser._id,null).then(function(newComment){
						Comment.getAllCommentsByUser(babbleUser._id).then(function(allComments){
							assert.equal(allComments.length,1);
							assert.equal(allComments[0].user.kerberos,babbleUser.kerberos);
							assert.equal(allComments[0].content,'are you serious?');
							assert.equal(allComments[0].anonymousName,null);
							done();
						}, function(err){
							assert.equal(true,false);
							done();
						})
					});
				});
			});
		});

		it('multiple comments by this user, mixture of anonymity and non-anonymity, comment babble different authors', function(done){
			UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser) {
				UserUtils.register("candice", "Candice Fan", "123456789", "123456789").then(function(commentUser) {
					AnonymousName.getNewAnonymousNameForBabble(commentUser._id).then(function(anonymousCommentUser){
						Babble.addBabble("I love dinning hall food?", babbleUser._id, null).then(function(newBabble) {
							Comment.addComment('are you serious?',newBabble._id, commentUser._id,null).then(function(newComment1){
								Comment.addComment('what in the world!?',newBabble._id, commentUser._id,anonymousCommentUser._id).then(function(newComment2){
									Comment.getAllCommentsByUser(commentUser._id).then(function(allComments){
										assert.equal(allComments.length,2);
										assert.equal(allComments[0].user.kerberos,commentUser.kerberos);
										assert.equal(allComments[1].user.kerberos,commentUser.kerberos);
										assert.equal(allComments[0].content,'are you serious?');
										assert.equal(allComments[1].content,'what in the world!?');
										assert.equal(allComments[0].anonymousName,null);
										assert.equal(allComments[1].anonymousName.anonymousName,anonymousCommentUser.anonymousName);
										done();
									}, function(err){
										assert.equal(true,false);
										done();
									})
								})
							})
						})
					})
				})
			})
		})


	});//end describe #getAllCommentsByUser


	describe('#getComment(commentId)', function(){
		// partitions for getComment():
		//		comment type: anonymous, non-anonymous

		it('get an anonymous comment', function(done){
			UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser) {
				Babble.addBabble("I love dinning hall food?", babbleUser._id, null).then(function(newBabble) {
					AnonymousName.getNewAnonymousNameForBabble(babbleUser._id).then(function(anonymousCommentUser){
						Comment.addComment('are you serious?',newBabble._id, babbleUser._id,anonymousCommentUser._id).then(function(newComment){
							Comment.getComment(newComment._id).then(function(currentComment){
								assert.equal(currentComment.user.kerberos,babbleUser.kerberos);
								assert.equal(currentComment.content,'are you serious?');
								assert.equal(currentComment.anonymousName.anonymousName,anonymousCommentUser.anonymousName);
								done();
							}, function(err){
								assert.equal(true,false);
								done();
							})
						});
					});
				})
			});
		});

		it('get a non-anonymous comment', function(done){
			UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser) {
				Babble.addBabble("I love dinning hall food?", babbleUser._id, null).then(function(newBabble) {
					Comment.addComment('are you serious?',newBabble._id, babbleUser._id,null).then(function(newComment){
						Comment.getComment(newComment._id).then(function(currentComment){
							assert.equal(currentComment.user.kerberos,babbleUser.kerberos);
							assert.equal(currentComment.content,'are you serious?');
							assert.equal(currentComment.anonymousName,null);
							done();
						}, function(err){
							assert.equal(true,false);
							done();
						});
					});
				});
			});
		})


	}); //end describe #getComment

	describe('#getDisplayName(commentId)', function(){
		// partitions for getDisplayName():
		//		comment type: anonymous, non-anonymous

		it('get the display name of an anonymous comment',function(done){
			UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser) {
				Babble.addBabble("I love dinning hall food?", babbleUser._id, null).then(function(newBabble) {
					AnonymousName.getNewAnonymousNameForBabble(babbleUser._id).then(function(anonymousCommentUser){
						Comment.addComment('are you serious?',newBabble._id, babbleUser._id,anonymousCommentUser._id).then(function(newComment){
							Comment.getDisplayName(newComment._id).then(function(name){
								assert.equal(name,anonymousCommentUser.anonymousName);
								done();
							}, function(err){
								assert.equal(true,false);
								done();
							})
						});
					});
				})
			});
		});

		it('get the display name of a non-anonymous comment',function(done){
			UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser) {
				Babble.addBabble("I love dinning hall food?", babbleUser._id, null).then(function(newBabble) {
					Comment.addComment('are you serious?',newBabble._id, babbleUser._id,null).then(function(newComment){
						Comment.getDisplayName(newComment._id).then(function(name){
							assert.equal(name,"rachel00");
							done();
						}, function(err){
							assert.equal(true,false);
							done();
						})
					});
				});
			});
		});


	});//end describe #getDisplayName

	describe('#goodVibe(commentId, userId)', function(){
		// partitions for goodVibe():
		//		status: has not been goodvibbed by this user -> goodvibe
		//				has been goodvibbed by this user -> cancel the goodvide
		//				has been badvibbed by this user -> flip
		//		user: multiple users goodvibe -> make sure the count is right
		//			  user goodvibbed his own babble
		//			  a different user goodvibes

		it('has not been goodvibbed by this user -> goodvibe, and user goodvibbing his own post', function (done) {
			UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser) {
				Babble.addBabble("I love dinning hall food?", babbleUser._id, null).then( function(newBabble){
					Comment.addComment("seriously?", newBabble._id, babbleUser._id, null).then(function(newComment) {
						assert.equal(0,newComment.goodVibeUsers.length);
						Comment.goodVibe(newComment._id, babbleUser._id).then(function(updatedComment){
							assert.equal(1,updatedComment.goodVibeUsers.length);
							assert.equal(babbleUser._id,updatedComment.goodVibeUsers[0]);
							done();
						}, function(err) {
							assert.equal(true, false);
							done();
						});
					});
				});
			});
		});

		it('has been goodvibbed by this user -> cancel the goodvide, and a different user goodvibe', function (done) {
			UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then( function(babbleUser) {
				Babble.addBabble("I love dinning hall food?", babbleUser._id, null).then( function(newBabble){
					Comment.addComment("seriously?", newBabble._id, babbleUser._id, null).then( function(newComment) {
						UserUtils.register("stacy00", "Stacy Ho", "123456789", "123456789").then( function(goodvibeUser) {
							assert.equal(0,newComment.goodVibeUsers.length);
							Comment.goodVibe(newComment._id, goodvibeUser._id).then(function(updatedComment){
								assert.equal(1,updatedComment.goodVibeUsers.length);
								assert.equal(goodvibeUser._id,updatedComment.goodVibeUsers[0]);
								Comment.goodVibe(updatedComment._id, goodvibeUser._id).then(function(updatedComment){
									assert.equal(0,updatedComment.goodVibeUsers.length);
									done();
								},  function(err) {
									assert.equal(true, false);
									done();
								})
							}, function(err) {
								assert.equal(true, false);
								done();
							})
						})
					})
				})
			})
		});

		it('has been badvibbed by this user -> flip', function (done) {
			UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then( function(babbleUser) {
				Babble.addBabble("I love dinning hall food?", babbleUser._id, null).then( function(newBabble){
					Comment.addComment("seriously?", newBabble._id, babbleUser._id, null).then( function(newComment) {
						UserUtils.register("stacy00", "Stacy Ho", "123456789", "123456789").then( function(goodvibeUser) {
							assert.equal(0,newComment.goodVibeUsers.length);
							Comment.badVibe(newComment._id, goodvibeUser._id).then(function(updatedComment){
								assert.equal(0,updatedComment.goodVibeUsers.length);
								assert.equal(1,updatedComment.badVibeUsers.length);
								assert.equal(goodvibeUser._id,updatedComment.badVibeUsers[0]);
								Comment.goodVibe(updatedComment._id, goodvibeUser._id).then(function(updatedComment){
									assert.equal(1,updatedComment.goodVibeUsers.length);
									assert.equal(0,updatedComment.badVibeUsers.length);
									assert.equal(goodvibeUser._id,updatedComment.goodVibeUsers[0]);
									done();
								}, function(err) {
									assert.equal(true, false);
									done();
								})
							},  function(err) {
								assert.equal(true, false);
								done();
							})
						})
					})
				})
			})
		});


		it('multiple users goodvibe -> make sure the count is right', function (done) {
			UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then( function(babbleUser) {
				Babble.addBabble("I love dinning hall food?", babbleUser._id, null).then( function(newBabble){
					Comment.addComment("seriously?", newBabble._id, babbleUser._id, null).then( function(newComment) {
						UserUtils.register("stacy00", "Stacy Ho", "123456789", "123456789").then( function(goodvibeUser1) {
							UserUtils.register("stacy11", "Stacy Ho", "123456789", "123456789").then( function(goodvibeUser2) {
								assert.equal(0,newComment.goodVibeUsers.length);
								Comment.goodVibe(newComment._id, goodvibeUser1._id).then(function(updatedComment){
									assert.equal(1,updatedComment.goodVibeUsers.length);
									Comment.goodVibe(updatedComment._id, goodvibeUser2._id).then(function(updatedComment){
										assert.equal(2,updatedComment.goodVibeUsers.length);
										Comment.goodVibe(updatedComment._id, babbleUser._id).then(function(updatedComment){
											assert.equal(3,updatedComment.goodVibeUsers.length);
											done();
										},  function(err) {
											assert.equal(true, false);
											done();
										})
									})
								})
							})
						})
					})
				})
			});
		});


	});//end describe #goodVibe

	describe('#badVibe(commentId, userId)', function(done){
		// partitions of badVibe():
		// 		status: has not been badvibbed by this user -> goodvibe
		// 			 	has been badvibbed by this user -> cancel the goodvide
		// 			 	has been goodvibbed by this user -> flip
		// 		user: multiple users badvibe -> make sure the count is right
		// 			  user badvibbed his own comment
		// 			  a different user badvibe


		it('has not been badvibbed by this user -> badvibe, and user badvibbed his own post', function (done) {
			UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then( function(babbleUser) {
				Babble.addBabble("I love dinning hall food?", babbleUser._id, null).then( function(newBabble){
					Comment.addComment("seriously?", newBabble._id, babbleUser._id, null).then( function(newComment) {
						assert.equal(0,newComment.badVibeUsers.length);
						Comment.badVibe(newComment._id, babbleUser._id).then(function(updatedComment){
							assert.equal(1,updatedComment.badVibeUsers.length);
							assert.equal(babbleUser._id,updatedComment.badVibeUsers[0]);
							done();
						}, function(err) {
							assert.equal(true, false);
							done();
						});
					});
				});
			});
		});
	    

		it('has been badvibbed by this user -> cancel the goodvide, and a different user goodvibe', function (done) {
			UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then( function(babbleUser) {
				Babble.addBabble("I love dinning hall food?", babbleUser._id, null).then( function( newBabble){
					Comment.addComment("seriously?", newBabble._id, babbleUser._id, null).then( function( newComment) {
						UserUtils.register("stacy00", "Stacy Ho", "123456789", "123456789").then( function(badvibeUser) {
							assert.equal(0,newComment.badVibeUsers.length);
							Comment.badVibe(newComment._id, badvibeUser._id).then(function(updatedComment){
								assert.equal(1,updatedComment.badVibeUsers.length);
								assert.equal(badvibeUser._id,updatedComment.badVibeUsers[0]);
								Comment.badVibe(updatedComment._id, badvibeUser._id).then(function(updatedComment){
									assert.equal(0,updatedComment.badVibeUsers.length);
									done();
								},function(err) {
									assert.equal(true, false);
									done();
								})
							}, function(err) {
								assert.equal(true, false);
								done();
							})
						})
					})
				})
			})
		});

		it('has been goodvibbed by this user -> flip', function (done) {
			UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then( function(babbleUser) {
				Babble.addBabble("I love dinning hall food?", babbleUser._id, null).then(function(newBabble){
					Comment.addComment("seriously?", newBabble._id, babbleUser._id, null).then( function(newComment) {
						UserUtils.register("stacy00", "Stacy Ho", "123456789", "123456789").then( function(badvibeUser) {
							assert.equal(0,newComment.badVibeUsers.length);
							Comment.goodVibe(newComment._id, badvibeUser._id).then(function(updatedComment){
								assert.equal(0,updatedComment.badVibeUsers.length);
								assert.equal(1,updatedComment.goodVibeUsers.length);
								assert.equal(badvibeUser._id,updatedComment.goodVibeUsers[0]);
								Comment.badVibe(updatedComment._id, badvibeUser._id).then(function(updatedComment){
									assert.equal(1,updatedComment.badVibeUsers.length);
									assert.equal(0,updatedComment.goodVibeUsers.length);
									assert.equal(badvibeUser._id,updatedComment.badVibeUsers[0]);
									done();
								}, function(err) {
									assert.equal(true, false);
									done();
								})
							}, function(err) {
								assert.equal(true, false);
								done();
							})
						})
					})
				})
			})
		});

		it('multiple users goodvibe -> make sure the count is right', function (done) {
			UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then( function(babbleUser) {
				Babble.addBabble("I love dinning hall food?", babbleUser._id, null).then( function(newBabble){
					Comment.addComment("seriously?", newBabble._id, babbleUser._id, null).then( function( newComment) {
						UserUtils.register("stacy00", "Stacy Ho", "123456789", "123456789").then( function(badvibeUser1) {
							UserUtils.register("stacy11", "Stacy Ho", "123456789", "123456789").then( function(badvibeUser2) {
								assert.equal(0,newComment.badVibeUsers.length);
								Comment.badVibe(newComment._id, badvibeUser1._id).then(function(updatedComment){
									assert.equal(1,updatedComment.badVibeUsers.length);
									Comment.badVibe(updatedComment._id, badvibeUser2._id).then(function(updatedComment){
										assert.equal(2,updatedComment.badVibeUsers.length);
										Comment.badVibe(updatedComment._id, babbleUser._id).then(function(updatedComment){
											assert.equal(3,updatedComment.badVibeUsers.length);
											done();
										},function(err) {
											assert.equal(true, false);
											done();
										})
									})
								})
							})
						})
					})
				})
			})
		});


	});//end describe #badVibe


	describe('#getReputation(userId)', function(){
		// partitions for getReputation():
		//		number of comments posted by user: 0, >0
		//		reputation: positive, negative
		//		user has goodvibes and badvibes: yes, no

		it('no comments, no goodvibes/badvibes', function (done) {
			UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(user1) {
				Comment.getReputation(user1._id).then(function(result) {
					assert.equal(0, result);
					done();
				}, function(err) {
					assert.equal(true, false);
					done();
				})
			});
		});

		it('positive reputation, >0 comments, had goodvibes', function (done) {
			UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser) {
				Babble.addBabble("I love dinning hall food?", babbleUser._id, null).then(function(newBabble){
					Comment.addComment("say what?", newBabble._id,babbleUser._id, null).then(function(newComment1){
						Comment.addComment("I do not believe you", newBabble._id,babbleUser._id, null).then(function(newComment2){
							UserUtils.register("stacy00", "Stacy Ho", "123456789", "123456789").then(function(goodvibeUser1) {
								UserUtils.register("stacy11", "Stacy Ho", "123456789", "123456789").then(function(goodvibeUser2) {
									Comment.goodVibe(newComment1._id, goodvibeUser1._id).then(function(updatedComment1){
										Comment.goodVibe(newComment2._id, goodvibeUser2._id).then(function(updatedComment2){
											Comment.goodVibe(updatedComment1._id, goodvibeUser2._id).then(function(updatedComment1){
												Comment.getReputation(babbleUser._id).then(function(result) {
													assert.equal(5,result);
												},function(err) {
													assert.equal(true, false);
												});
												Comment.getReputation(goodvibeUser1._id).then(function(result) {
													//no gain in reputation for goodvibbing
													assert.equal(0,result);
													done();
												},  function(err) {
													assert.equal(true, false);
													done();
												})
											})
										})
									})
								})
							})
						})
					})
				})
			})
		})


		it('negative reputation, >0 comments, had goodvibes and badvibes', function (done) {
			UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser) {
				Babble.addBabble("I love dinning hall food?", babbleUser._id, null).then(function(newBabble){
					Comment.addComment("you are kidding!?", newBabble._id,babbleUser._id, null).then(function(newComment1){
						Comment.addComment("what!?!?", newBabble._id,babbleUser._id, null).then(function(newComment2){
							UserUtils.register("stacy00", "Stacy Ho", "123456789", "123456789").then(function(User1) {
								UserUtils.register("stacy11", "Stacy Ho", "123456789", "123456789").then(function(User2) {
									Comment.goodVibe(newComment1._id, User1._id).then(function(updatedComment1){
										Comment.badVibe(newComment2._id, User2._id).then(function(updatedComment2){
											Comment.badVibe(updatedComment1._id, User2._id).then(function(updatedComment1){
												Comment.badVibe(updatedComment1._id, babbleUser._id).then(function(updatedComment1){
													Comment.badVibe(updatedComment2._id, babbleUser._id).then(function(updatedComment2){
														Comment.getReputation(babbleUser._id).then(function(result) {
															assert.equal(-1,result);
														},function(err) {
															assert.equal(true, false);
														});
														Comment.getReputation(User2._id).then(function(result) {
															//no change in reputation for goodvibbing/badvibbing
															assert.equal(0,result);
															done();
														},function(err) {
															assert.equal(true, false);
															done();
														})
													})
												})
											})
										})
									})
								})
							})
						})
					})
				})
			})
		})

	});//end describe #getReputation

});//end describe Comment Model