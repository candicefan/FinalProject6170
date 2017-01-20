var assert = require('assert');
var mongoose = require('mongoose');
var Comment = require('../models/Comment.js');
var Babble = require('../models/Babble.js');
var ObjectId = mongoose.Schema.Types.ObjectId;
var UserUtils = require('./userUtils');
var TopTen = require('../models/TopTen');
var TopTenSchema = require('../schemas/TopTenSchema');


/* 
 * tests for TopTen model
 * Author(s): rachel18, xueqifan
 */
describe("TopTen Model", function() {
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


  describe("#updateTopTenUser(currentTime, updateThreshold)", function() {
    // partitions for updateTopTenUsers:
    //    time to update: yes, no, 
    //    number of users: <=10, >10
    //    already a top ten in database: yes, no

    it('not time to update, already a top ten in database, <=10 users', function (done) {
      UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(user){
        var currentTime = new Date();
        var currentTopTen = new TopTenSchema({
          updatedTime: currentTime, 
          topUsers: [user._id]
        });
        currentTopTen.save().then(function(currentTopTen) {
          TopTen.updateTopTenUsers(new Date(), 60000).then(function(updateTimeAndTopTen){
            assert.equal(currentTime.toString(), updateTimeAndTopTen.updateTime.toString());
            assert.equal(1, updateTimeAndTopTen.topTen.length);
            assert.equal(user._id.toString(), updateTimeAndTopTen.topTen[0]._id.toString());
            done(); 
          }, function(err){
            assert.equal(true, false);
            done();
          });
        });
      });
    });

    it('need to update because there is no top ten in database', function (done) {
      UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser){
        UserUtils.register("rachel11", "Rachel Lin", "123456789", "123456789").then(function(babbleUser2){
          Babble.addBabble("hello world",babbleUser2._id,null).then(function(babble){
            var currentTime = new Date();
            TopTen.updateTopTenUsers(new Date(), 1).then(function(updateTimeAndTopTen){
              assert.equal(currentTime.toString(), updateTimeAndTopTen.updateTime.toString());
              assert.equal(2, updateTimeAndTopTen.topTen.length);
              assert.equal(babbleUser2._id.toString(), updateTimeAndTopTen.topTen[0]._id.toString());
              done(); 
            },function(err){
              assert.equal(true, false);
              done();
            });
          })
        });
      });
    });

    it('time to update, already a top 10 in the database, >10 users', function(done){
      UserUtils.register("rachel1","Rachel Lin","1234567","1234567").then(function(user1){
        UserUtils.register("rachel2","Rachel Lin","1234567","1234567").then(function(user2){
          UserUtils.register("rachel3","Rachel Lin","1234567","1234567").then(function(user3){
            UserUtils.register("rachel4","Rachel Lin","1234567","1234567").then(function(user4){
              UserUtils.register("rachel5","Rachel Lin","1234567","1234567").then(function(user5){
                UserUtils.register("rachel6","Rachel Lin","1234567","1234567").then(function(user6){
                  UserUtils.register("rachel7","Rachel Lin","1234567","1234567").then(function(user7){
                    UserUtils.register("rachel8","Rachel Lin","1234567","1234567").then(function(user8){
                      UserUtils.register("rachel9","Rachel Lin","1234567","1234567").then(function(user9){
                        UserUtils.register("rachel10","Rachel Lin","1234567","1234567").then(function(user10){
                          UserUtils.register("rachel11","Rachel Lin","1234567","1234567").then(function(user11){
                            var currentTime = new Date();
                            var currentTopTen = new TopTenSchema({
                              updatedTime: currentTime, 
                              topUsers: [user1._id,user2._id,user3._id,user4._id,user5._id,
                                         user6._id,user7._id,user8._id,user9._id,user10._id,user11._id]
                            });  
                            Babble.addBabble("hello",user1._id,null).then(function(babble1ByUser1){
                              Babble.addBabble("hello2",user1._id,null).then(function(babble2ByUser1){
                                Babble.addBabble("hello3",user2._id,null).then(function(babble1ByUser2){
                                  currentTopTen.save().then(function(currentTopTen){
                                    TopTen.updateTopTenUsers(currentTime,1).then(function(updateTimeAndTopTen){
                                      assert.equal(currentTime.getTime(), updateTimeAndTopTen.updateTime.getTime());
                                      assert.equal(11, updateTimeAndTopTen.topTen.length);
                                      assert.equal(user1._id.toString(), updateTimeAndTopTen.topTen[0]._id.toString());
                                      assert.equal(user2._id.toString(), updateTimeAndTopTen.topTen[1]._id.toString());
                                      done(); 
                                    },function(err){
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
          })
        })        
      })
    })

  });

});
