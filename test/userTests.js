var assert = require('assert');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var ObjectId = mongoose.Schema.Types.ObjectId;
var User = require('../models/User');
var Babble = require('../models/Babble');
var Comment = require('../models/Comment');
var AnonymousName = require('../models/AnonymousName');
var UserUtils = require('./userUtils')

/* 
 * tests for AnonymousName model
 * Author(s): rachel18
 */
describe("User Model", function() {

    var con;
    before(function(done) {
    	con = mongoose.connect("mongodb://localhost/testdb", function() {
    		done();
    	});
    });

    beforeEach(function(done) {
    	con.connection.db.dropDatabase(function(){done();})
    });
        
        
	describe('#getUser', function () {
        //Partition for getUser:
        //                 user: exist, not exist
        it('successfully find the user', function (done) {
            UserUtils.register("stacyho", "Stacy Ho", "11111111", "11111111").then(function(newUser){
            	User.getUser("stacyho").then(function(user) {
            		assert.equal(user.name, "Stacy Ho");
            		assert.equal(user.password, "11111111");
                    assert.equal(user.kerberos, "stacyho");
            		done();
            	}, function(err) {
                    //not supposed to have errors
                    assert.equal(true, false);
                    done();
                });
            });
    	});

    	it('user doesnt exist', function (done) {
            User.getUser("stacyho").then(function(user) {
                assert.equal(null, user);
                done();
                }, function(err) {
                    assert.equal(true, false);
                    done();
                });
            });

    	it('user doesnt exist again', function (done) {
            UserUtils.register("stacyho", "Stacy Ho", "11111111", "11111111").then(function(newUser){
                User.getUser("stacy ho").then(function(user){
            	   assert.equal(null, user);
                    done();
                }, function(err) {
                    assert.equal(true, false);
                    done();
                });
            })
    	});

  });//End describe #getUser


    describe('#getAllUsers', function () {
        //Partition for getAllUser:
        //         number of users: 0, 1, >1

        it('No users', function (done) {
            User.getAllUsers().then(function(users) {
                assert.equal(0, users.length);
                done();
            }, function(err) {
                assert.equal(true, false);
                done();
            });
        });

        it('one user in the database', function (done) {
            UserUtils.register("stacyho", "Stacy Ho", "11111111", "11111111").then(function(newUser){
                User.getAllUsers().then(function(users) {
                    assert.equal(1, users.length);
                    assert.equal(users[0].name, "Stacy Ho");
                    assert.equal(users[0].password, "11111111");
                    assert.equal(users[0].kerberos, "stacyho");
                    done();
                }, function(err) {
                    //not supposed to have errors
                    assert.equal(true, false);
                    done();
                });
            });
        });

        it('multiple users in the database', function (done) {
            UserUtils.register("stacyho1", "Stacy Ho", "11111111", "11111111").then(function(newUser1){
                UserUtils.register("stacyho2", "Stacy Ho", "11111111", "11111111").then(function(newUser2){
                    UserUtils.register("stacyho3", "Stacy Ho", "11111111", "11111111").then(function(newUser3){
                        User.getAllUsers().then(function(users) {
                            assert.equal(3, users.length);
                            var usersKerberos = users.map(function(eachUser) {
                                return eachUser.kerberos;
                            });
                            assert.equal(true, usersKerberos.indexOf("stacyho1") != -1);
                            assert.equal(true, usersKerberos.indexOf("stacyho2") != -1);
                            assert.equal(true, usersKerberos.indexOf("stacyho3") != -1);
                            done();
                        }, function(err) {
                            //not supposed to have errors
                            assert.equal(true, false);
                            done();
                        });
                    });
                });
            });
        });
        

    });//end describe #getAllUsers


    describe('#updateLimit', function () {
        //Partition for updateLimit:
        //               reputation: positive, negative, 
        //            updated Limit: increases, decreases, stays the same

        it('negative reputation, decreases', function (done) {
            UserUtils.register("stacyho1", "Stacy Ho", "11111111", "11111111").then(function(newUser){
                assert.equal(5,newUser.babbleLimit);
                User.updateLimit(newUser._id, -3).then(function(updatedUser) {
                    assert.equal(1, updatedUser.babbleLimit);
                    done();
                }, function(err) {
                    assert.equal(true, false);
                    done();
                });
            });
        });

        it('positive reputation, increases the limit', function (done) {
            UserUtils.register("stacyho", "Stacy Ho", "11111111", "11111111").then(function(newUser){
                assert.equal(5, newUser.babbleLimit);
                User.updateLimit(newUser._id, 101).then(function(updatedUser) {
                    assert.equal(7, updatedUser.babbleLimit);
                    done();
                }, function(err) {
                    assert.equal(true, false);
                    done();
                });
            });
        });

        it('positive reputation, limit stays the same', function (done) {
            UserUtils.register("stacyho", "Stacy Ho", "11111111", "11111111").then(function(newUser){
                assert.equal(5, newUser.babbleLimit);
                User.updateLimit(newUser._id, 35).then(function(updatedUser) {
                    assert.equal(5, updatedUser.babbleLimit);
                    done();
                }, function(err) {
                    assert.equal(true, false);
                    done();
                });
            });
        });
        

    });//end describe #updateLimit


    describe('#getReputation(userId)', function () {
        //Partition for getReputation:
        //                   #babbles: 0, >0
        //                  #comments: 0 > 0
        //     goodvibes and badvibes: none, some, mix
        //                 reputation: positive, 0, negative

        it('no babbles, no comments, zero reputation', function (done) {
            UserUtils.register("stacyho1", "Stacy Ho", "11111111", "11111111").then(function(newUser){
                User.getReputation(newUser._id).then(function(rep) {
                    assert.equal(0, rep);
                    done();
                }, function(err) {
                    assert.equal(true, false);
                    done();
                });
            });
        });

        it('posted babbles only, only goodvibes, positive reputation', function (done) {
            UserUtils.register("stacyho", "Stacy Ho", "11111111", "11111111").then(function(babbleUser){
                Babble.addBabble("hello",babbleUser._id, null).then(function(newBabble){
                    UserUtils.register("stacy00", "Stacy Ho", "123456789", "123456789").then(function(goodvibeUser) {
                        Babble.goodVibe(newBabble._id, goodvibeUser._id).then(function(updatedBabble){
                            Babble.goodVibe(updatedBabble._id, babbleUser._id).then(function(updatedBabble){
                                User.getReputation(babbleUser._id).then(function(rep) {
                                    //1 babble, 2 goodvibes
                                    assert.equal(3, rep);
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

        it('posted comments only, only badvibes, negative reputation', function (done) {
            UserUtils.register("stacyho", "Stacy Ho", "11111111", "11111111").then(function(babbleUser){
                Babble.addBabble("hello",babbleUser._id, null).then(function(newBabble){
                    UserUtils.register("stacy00", "Stacy Ho", "123456789", "123456789").then(function(commentUser) {
                        Comment.addComment("how r u?", newBabble._id, commentUser._id, null).then(function(newComment) {
                            Comment.badVibe(newComment._id, commentUser._id).then(function(updatedComment){
                                Comment.badVibe(updatedComment._id, babbleUser._id).then(function(updatedComment){
                                    User.getReputation(babbleUser._id).then(function(babbleUserRep) {
                                    //1 babble, badvibbing other's stuff doesnt affect his reputation
                                        assert.equal(1, babbleUserRep);
                                    }, function(err) {
                                        assert.equal(true, false);
                                        done();
                                    });
                                    User.getReputation(commentUser._id).then(function(commentUserRep) {
                                    //1 comment, 2 badvibes
                                        assert.equal(-1, commentUserRep);
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

        it('posted comments and babbles, mix of good and bad vibes, zero reputation', function (done) {
            UserUtils.register("stacyho", "Stacy Ho", "11111111", "11111111").then(function(babbleUser){
                Babble.addBabble("hello",babbleUser._id, null).then(function(newBabble){
                    Babble.goodVibe(newBabble._id, babbleUser._id).then(function(updatedBabble){
                        UserUtils.register("stacy00", "Stacy Ho", "123456789", "123456789").then(function(user1) {
                            UserUtils.register("stacy11", "Stacy Ho", "123456789", "123456789").then(function(user2) {
                                Comment.addComment("how r u?", newBabble._id, babbleUser._id, null).then(function(comment1) {
                                    Comment.addComment("tired", newBabble._id, babbleUser._id, null).then(function(comment2) {
                                        Comment.badVibe(comment1._id, user1._id).then(function(updatedComment1){
                                            Comment.badVibe(comment1._id, user2._id).then(function(updatedComment1){
                                                Comment.badVibe(comment2._id, user1._id).then(function(updatedComment2){
                                                    Comment.badVibe(comment2._id, user2._id).then(function(updatedComment2){
                                                        User.getReputation(babbleUser._id).then(function(commentUserRep) {
                                                            //1 babble, 2 comments, 1 goodvibe, 4 badvibes
                                                            assert.equal(0, commentUserRep);
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
            });
        

    });//end describe #getReputation

})