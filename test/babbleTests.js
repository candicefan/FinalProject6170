var assert = require('assert');
var mongoose = require('mongoose');
var Comment = require('../models/Comment.js');
var AnonymousName = require('../models/AnonymousName.js');
var Babble = require('../models/Babble.js');
var ObjectId = mongoose.Schema.Types.ObjectId;
var UserUtils = require('./userUtils');


/* 
 * tests for Babble model
 * Author(s): rachel18
 */

describe("Babble Model", function() {
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


  describe("#addBabble(content, userId, anonymousNameId)", function() {
    //partition for addBabble:
    //              anonymity: anonymously, not anonymously, same user doing both
    it('post a babble with the real identity', function (done) {
      UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser){
        Babble.addBabble("I love dinning hall food?", babbleUser._id, null).then(function(newBabble) {
          assert.equal(newBabble.content,"I love dinning hall food?");
          assert.equal(newBabble.user,babbleUser._id);
          assert.equal(newBabble.anonymousName, null);
          done();
        }, function(err){
          assert.equal(true, false);
          done();
        });
      });
    });


    it('post under anonymous name', function (done) {
      UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser) {
        AnonymousName.getNewAnonymousNameForBabble(babbleUser._id).then(function(anonymousRachel) {
          Babble.addBabble("I love dinning hall food?", babbleUser._id, anonymousRachel._id).then(function(newBabble) {
            assert.equal(newBabble.content,"I love dinning hall food?");
            assert.equal(newBabble.user,babbleUser._id);
            assert.equal(newBabble.anonymousName, anonymousRachel._id);
            done();
          }, function(err){
            assert.equal(true, false);
            done();
          });
        });
      });
    });


    it('a user posted multiple babbles, mixed', function (done) {
      UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser) {
        AnonymousName.getNewAnonymousNameForBabble(babbleUser._id).then(function(anonymousRachel){
          Babble.addBabble("I love dinning hall food?", babbleUser._id, anonymousRachel._id).then(function(newBabble) {
            Babble.addBabble("I hate this pset..", babbleUser._id, null).then(function(newBabble2) {
              assert.equal(newBabble.content,"I love dinning hall food?");
              assert.equal(newBabble2.content,"I hate this pset..");
              assert.equal(newBabble.user,babbleUser._id);
              assert.equal(newBabble2.user,babbleUser._id);
              assert.equal(newBabble.anonymousName, anonymousRachel._id);
              assert.equal(newBabble2.anonymousName, null);
              done();
            }, function(err){
              assert.equal(true, false);
              done();
            });
          }, function(err){
            assert.equal(true, false);
            done();
          });
        });
      });
    });


  }); // End describe #addBabble.

  describe("#getBabble(babbleId)", function() {
    // Partition for getBabble
    //    anonymity: anonymous, non-anonymous
    
    it('anonymous babble', function (done) {
      UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser) {
        AnonymousName.getNewAnonymousNameForBabble(babbleUser._id).then(function(anonymousRachel) {
            Babble.addBabble("I love dinning hall food?", babbleUser._id, anonymousRachel._id).then(function(newBabble){
              Babble.getBabble(newBabble._id).then(function(result){
                //testing the populated fields 
                assert.equal(result.user.name, "Rachel Lin");
                assert.equal(result.user.kerberos, "rachel00");
                assert.equal(result.content, "I love dinning hall food?");
                assert.equal(result.anonymousName.anonymousName, anonymousRachel.anonymousName);
                done();
              }, function(err){
                assert.equal(true, false);
                done();
              });
            })
          });
        });
      }); 
  

    it('non-anonymous babble', function (done) {
      UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser) {
        Babble.addBabble("seriously?", babbleUser._id, null).then(function(newBabble) {
          Babble.getBabble(newBabble._id).then(function(result){
            //testing the populated fields 
            assert.equal(result.user.name, "Rachel Lin");
            assert.equal(result.user.kerberos, "rachel00");
            assert.equal(result.content, "seriously?");
            assert.equal(result.anonymousName, null);
            done();
          }, function(err){
            assert.equal(true, false);
            done();
          })
        })
      });
    });

  

  }); // End describe #getBabble.

  describe("#getAllBabbles()", function() {
    //Partition for getAllBabbles: 
    //              Number of babbles: 0, 1, >1 (order matters)
    //                      anonymity: anonymous, non-anonymous
    //         authors of the babbles: same, different


    it('no babbles', function (done) {
      UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(user1) {
        Babble.getAllBabbles().then(function(result) {
          assert.equal(0, result.length);
          done();
          }, function(err) {
            assert.equal(true, false);
            done();
          })
        });
      });

    it('one anonymous babble found', function (done) {
      UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser) {
        AnonymousName.getNewAnonymousNameForBabble(babbleUser._id).then(function(anonymousRachel) {
          Babble.addBabble("I love dinning hall food?", babbleUser._id, anonymousRachel._id).then(function(newBabble){
            Babble.getAllBabbles().then(function(result){
              assert.equal(result.length, 1);
              b = result[0];
              assert.equal(b._id.toString(), newBabble._id.toString());
              assert.equal(b.user.kerberos, "rachel00");
              assert.equal(b.anonymousName.anonymousName, anonymousRachel.anonymousName);
              assert.equal(b.content, "I love dinning hall food?");
              done();
            }, function(err){
              assert.equal(true,false);
              done();
            })  
          });
        });
      });
    });


    it('one non-anonymous babble found', function (done) {
      UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser) {
        Babble.addBabble("I love dinning hall food?", babbleUser._id, null).then(function(newBabble){
          Babble.getAllBabbles().then(function(result){
            assert.equal(result.length, 1);
            b = result[0];
            assert.equal(b._id.toString(), newBabble._id.toString());
            assert.equal(b.user.kerberos, "rachel00");
            assert.equal(b.anonymousName, null);
            assert.equal(b.content, "I love dinning hall food?");
            done();
          }, function(err){
            assert.equal(true,false);
            done();
          }) 
        });
      });
    });

    it('multiple babbles found by same user, check to make sure it is reversed order', function (done) {
      UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser) {
          Babble.addBabble("I love dinning hall food?", babbleUser._id, null).then(function(Babble1) {
            Babble.addBabble("IT'S SOOO COLD", babbleUser._id, null).then(function(Babble2) {
              Babble.addBabble("psets are killing me", babbleUser._id, null).then(function(Babble3) {
                Babble.getAllBabbles().then(function(result){
                  assert.equal(result.length, 3);
                  assert.equal(result[0]._id.toString(), Babble3._id.toString());
                  assert.equal(result[1]._id.toString(), Babble2._id.toString());
                  assert.equal(result[2]._id.toString(), Babble1._id.toString());
                  done();
                }, function(err){
                  assert.equal(true,false);
                  done();
                })
              });
            });
          });
        });
      });

    it('multiple babbles found by different user, check to make sure it is reversed order', function (done) {
      UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser1) {
        UserUtils.register("rachel11", "Rachel Lin", "123456789", "123456789").then(function(babbleUser2) {
          UserUtils.register("rachel22", "Rachel Lin", "123456789", "123456789").then(function(babbleUser3) {
            Babble.addBabble("I love dinning hall food?", babbleUser3._id, null).then(function(Babble1) {
              Babble.addBabble("IT'S SOOO COLD", babbleUser2._id, null).then(function(Babble2) {
               Babble.addBabble("psets are killing me", babbleUser1._id, null).then(function(Babble3) {
                Babble.getAllBabbles().then(function(result){
                  //should be in reversed author of posting, so babble3 comes first
                  assert.equal(result.length, 3);
                  assert.equal(result[0]._id.toString(), Babble3._id.toString());
                  assert.equal(result[1]._id.toString(), Babble2._id.toString());
                  assert.equal(result[2]._id.toString(), Babble1._id.toString());
                  done();
                }, function(err){
                  assert.equal(true,false);
                  done();
                });
              });
            });
          });
        });
      });
    });
   });

    

  }); // End describe #getAllBabbles.


  describe("#addComment(babbleId, commentId)", function() {

    it('add one comment', function (done) {
      UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser) {
        Babble.addBabble("I love dinning hall food?", babbleUser._id, null).then(function(newBabble){
          commentId = ObjectId();
          assert.equal(0, newBabble.comments.length)
          Babble.addComment(newBabble._id, commentId).then(function(updatedBabble){
            assert.equal(1, updatedBabble.comments.length);
            assert.equal(commentId, updatedBabble.comments[0]);
            done();
          }, function(err){
            assert.equal(true,false);
            done();
          }) 
        });
      });
    });

    it('add another comment', function (done) {
      UserUtils.register("rachel18", "Rachel Lin", "123456789", "123456789").then(function(babbleUser) {
        Babble.addBabble("BANANA", babbleUser._id, null).then(function(newBabble){
          commentId = ObjectId();
          assert.equal(0, newBabble.comments.length)
          Babble.addComment(newBabble._id, commentId).then(function(updatedBabble){
            assert.equal(1, updatedBabble.comments.length);
            assert.equal(commentId, updatedBabble.comments[0]);
            done();
          }, function(err){
            assert.equal(true,false);
            done();
          }) 
        });
      });
    });

  }) //End describe #addComment

  describe('#getDisplayName(babbleId)', function () {
    //Partition for getDisplayName
    //                   anonymity: anomymous, non-anonymous
    
    it('nonanonymous babble', function (done) {
       UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser) {
        Babble.addBabble("I love dinning hall food?", babbleUser._id, null).then(function(newBabble){
          Babble.getDisplayName(newBabble._id).then(function(displayName){
            assert.equal("rachel00", displayName);
            done();
          }, function(err){
            assert.equal(true,false);
            done();
          }) 
        });
      });
    });

    it('anonymous babble', function (done) {
      UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser) {
        AnonymousName.getNewAnonymousNameForBabble(babbleUser._id).then(function(anonymousRachel) {
          Babble.addBabble("I love dinning hall food?", babbleUser._id, anonymousRachel._id).then(function(newBabble){
            Babble.getDisplayName(newBabble._id).then(function(displayName){
              assert.equal(anonymousRachel.anonymousName, displayName);
              done();
            }, function(err){
              assert.equal(true,false);
              done();
            })  
          });
        });
      });
    });

  }); //end describing #getDisplayName

  describe("#getBabbleCount()", function() {
    //Partition for getAllBabbles: 
    //          Number of babbles: 0, 1, >1
    //   anonymity of the babbles: yes, no, mix (shouldn't have effect on the count)
    //           author of babble: same, different


    it('no babbles', function (done) {
      UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(user1) {
        Babble.getBabbleCount().then(function(result) {
          assert.equal(0, result);
          done();
          }, function(err) {
            assert.equal(true, false);
            done();
          })
        });
      });

    it('one anonymous babble', function (done) {
      UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser) {
        AnonymousName.getNewAnonymousNameForBabble(babbleUser._id).then(function(anonymousRachel) {
          Babble.addBabble("I love dinning hall food?", babbleUser._id, anonymousRachel._id).then(function(newBabble){
            Babble.getBabbleCount().then(function(result){
              assert.equal(1, result);
              done();
            }, function(err){
              assert.equal(true,false);
              done();
            })  
          });
        });
      });
    });

    it('multiple mixed babbles found by same user', function (done) {
      UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser) {
        Babble.addBabble("I love dinning hall food?", babbleUser._id, null).then(function(Babble1) {
          Babble.addBabble("IT'S SOOO COLD", babbleUser._id, null).then(function(Babble2) {
            Babble.addBabble("psets are killing me", babbleUser._id, null).then(function(Babble3) {
              AnonymousName.getNewAnonymousNameForBabble(babbleUser._id).then(function(anonymousRachel) {
                Babble.addBabble("I love dinning hall food?", babbleUser._id, anonymousRachel._id).then(function(Babble4){
                  Babble.getBabbleCount().then(function(result){
                    assert.equal(4, result);
                    done();
                  }, function(err){
                    assert.equal(true,false);
                    done();
                  })
                });
              });
            });
          });
        });
      });
    });

    it('multiple babbles posted by same users', function (done) {
      UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser) {
        Babble.addBabble("I love dinning hall food?", babbleUser._id, null).then(function(Babble1) {
          Babble.addBabble("IT'S SOOO COLD", babbleUser._id, null).then(function(Babble2) {
            Babble.addBabble("psets are killing me", babbleUser._id, null).then(function(Babble3) {
              AnonymousName.getNewAnonymousNameForBabble(babbleUser._id).then(function(anonymousRachel) {
                Babble.addBabble("I love dinning hall food?", babbleUser._id, anonymousRachel._id).then(function(Babble4){
                  Babble.getBabbleCount().then(function(result){
                    assert.equal(4, result);
                    done();
                  }, function(err){
                    assert.equal(true,false);
                    done();
                  })
                });
              });
            });
          });
        });
      });
    });


    it('multiple babbles posted by different user', function (done) {
      UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser1) {
        UserUtils.register("rachel11", "Rachel Lin", "123456789", "123456789").then(function(babbleUser2) {
          UserUtils.register("rachel22", "Rachel Lin", "123456789", "123456789").then(function(babbleUser3) {
            Babble.addBabble("I love dinning hall food?", babbleUser3._id, null).then(function(Babble1) {
              Babble.addBabble("IT'S SOOO COLD", babbleUser2._id, null).then(function(Babble2) {
               Babble.addBabble("psets are killing me", babbleUser1._id, null).then(function(Babble3) {
                Babble.getBabbleCount().then(function(result){
                  //should be in reversed author of posting, so babble3 comes first
                  assert.equal(3, result);
                  done();
                }, function(err){
                  assert.equal(true,false);
                  done();
                });
              });
            });
          });
        });
      });
    });
   });

    
  }); // End describe #getBabbleCount.

  describe("#getBabbleCountByUserToday(userId)", function() {
    //Partition for getBabbleCountByUserToday:
    //                  No babble today, some babbles today
    it('no babbles today', function (done) {
      UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(user1) {
        Babble.getBabbleCountByUserToday(user1._id).then(function(result) {
          assert.equal(0, result);
          done();
          }, function(err) {
            assert.equal(true, false);
            done();
          })
        });
      });

    it('some babbles today out of all babbles', function (done) {
      UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser1) {
        UserUtils.register("rachel11", "Rachel Lin", "123456789", "123456789").then(function(babbleUser2) {
          Babble.addBabble("I love dinning hall food?", babbleUser1._id, null).then(function(newBabble1){
            Babble.addBabble("I", babbleUser2._id, null).then(function(newBabble2){
              Babble.addBabble("am", babbleUser1._id, null).then(function(newBabble3){
                Babble.addBabble("tired", babbleUser2._id, null).then(function(newBabble4){
                  Babble.addBabble("!", babbleUser1._id, null).then(function(newBabble5){
                    Babble.getBabbleCountByUserToday(babbleUser1._id).then(function(result){
                      assert.equal(3, result);
                      done();
                    }, function(err){
                      assert.equal(true,false);
                      done();
                    })  
                  });
                });
              });
            });
          });
        });
      });
    });


  }) //End describe #getBabbleCountByUserToday

  describe('#goodVibe', function(){
    //partition On:
    //    status: has not been goodvibbed by this user -> goodvibe
    //        has been goodvibbed by this user -> cancel the goodvide
    //        has been badvibbed by this user -> flip
    //    user:   multiple users goodvibe -> make sure the count is right
    //        user goodvibbed his own babble
    //        a different user goodvibe

    it('has not been goodvibbed by this user -> goodvibe, and user goodvibbing his own post', function (done) {
      UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser) {
        Babble.addBabble("I love dinning hall food?", babbleUser._id, null).then(function(newBabble){
          assert.equal(0,newBabble.goodVibeUsers.length);
            Babble.goodVibe(newBabble._id, babbleUser._id).then(function(updatedBabble){
              assert.equal(1,updatedBabble.goodVibeUsers.length);
              assert.equal(babbleUser._id,updatedBabble.goodVibeUsers[0]);
              done();
                  }, function(err) {
              assert.equal(true, false);
              done();
            });
          });
        });
      });
  
    

    it('has been goodvibbed by this user -> cancel the goodvide, and a different user goodvibe', function (done) {
      UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser) {
        Babble.addBabble("I love dinning hall food?", babbleUser._id, null).then(function(newBabble){
          UserUtils.register("stacy00", "Stacy Ho", "123456789", "123456789").then(function(goodvibeUser) {
            assert.equal(0,newBabble.goodVibeUsers.length);
              Babble.goodVibe(newBabble._id, goodvibeUser._id).then(function(updatedBabble){       
                assert.equal(1,updatedBabble.goodVibeUsers.length);
                assert.equal(goodvibeUser._id,updatedBabble.goodVibeUsers[0]);
                  Babble.goodVibe(updatedBabble._id, goodvibeUser._id).then(function(updatedBabble){
                    assert.equal(0,updatedBabble.goodVibeUsers.length);
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
              });

    it('has been badvibbed by this user -> flip', function (done) {
      UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser) {
        Babble.addBabble("I love dinning hall food?", babbleUser._id, null).then(function(newBabble){
          UserUtils.register("stacy00", "Stacy Ho", "123456789", "123456789").then(function(goodvibeUser) {
            assert.equal(0,newBabble.goodVibeUsers.length);
            Babble.badVibe(newBabble._id, goodvibeUser._id).then(function(updatedBabble){       
              assert.equal(1,updatedBabble.badVibeUsers.length);
              assert.equal(0,updatedBabble.goodVibeUsers.length);
              assert.equal(goodvibeUser._id,updatedBabble.badVibeUsers[0]);
              Babble.goodVibe(updatedBabble._id, goodvibeUser._id).then(function(updatedBabble){       
                assert.equal(1,updatedBabble.goodVibeUsers.length);
                assert.equal(0,updatedBabble.badVibeUsers.length);
                assert.equal(goodvibeUser._id,updatedBabble.goodVibeUsers[0]);
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

    it('multiple users goodvibe -> make sure the count is right', function (done) {
      UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser) {
        Babble.addBabble("I love dinning hall food?", babbleUser._id, null).then(function(newBabble){
          UserUtils.register("stacy00", "Stacy Ho", "123456789", "123456789").then(function(goodvibeUser1) {
            UserUtils.register("stacy11", "Stacy Ho", "123456789", "123456789").then(function(goodvibeUser2) {
              assert.equal(0,newBabble.goodVibeUsers.length);
                Babble.goodVibe(newBabble._id, goodvibeUser1._id).then(function(updatedBabble){
                  assert.equal(1,updatedBabble.goodVibeUsers.length);
                    Babble.goodVibe(updatedBabble._id, goodvibeUser2._id).then(function(updatedBabble){
                      assert.equal(2,updatedBabble.goodVibeUsers.length);
                        Babble.goodVibe(updatedBabble._id, babbleUser._id).then(function(updatedBabble){
                          assert.equal(3,updatedBabble.goodVibeUsers.length);
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


  }); //End descriobe #goodVibe
    

  describe('#badVibe', function(){
    //partition On:
    //    status: has not been badvibbed by this user -> goodvibe
    //        has been badvibbed by this user -> cancel the goodvide
    //        has been goodvibbed by this user -> flip
    //    user:   multiple users badvibe -> make sure the count is right
    //        user badvibbed his own babble
    //        a different user badvibe
    //   failure:   userId and babbleId invalid
    it('has not been badvibbed by this user -> goodvibe, and user badvibbing his own post', function (done) {
      UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser) {
        Babble.addBabble("I love dinning hall food?", babbleUser._id, null).then(function(newBabble){
          assert.equal(0,newBabble.badVibeUsers.length);
            Babble.badVibe(newBabble._id, babbleUser._id).then(function(updatedBabble){
              assert.equal(1,updatedBabble.badVibeUsers.length);
              assert.equal(babbleUser._id,updatedBabble.badVibeUsers[0]);
              done();
            }, function(err) {
              assert.equal(true, false);
              done();
            });
          });
        });
      });
  
    

  it('has been badvibbed by this user -> cancel the badvide, and a different user badvibe', function (done) {
    UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser) {
      Babble.addBabble("I love dinning hall food?", babbleUser._id, null).then(function(newBabble){
        UserUtils.register("stacy00", "Stacy Ho", "123456789", "123456789").then(function(badvibeUser) {
          assert.equal(0,newBabble.badVibeUsers.length);
            Babble.badVibe(newBabble._id, badvibeUser._id).then(function(updatedBabble){       
              assert.equal(1,updatedBabble.badVibeUsers.length);
              assert.equal(badvibeUser._id,updatedBabble.badVibeUsers[0]);
                Babble.badVibe(updatedBabble._id, badvibeUser._id).then(function(updatedBabble){
                  assert.equal(0,updatedBabble.badVibeUsers.length);
                  assert.equal(0,updatedBabble.goodVibeUsers.length);
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
            });

  it('has been goodvibbed by this user -> flip', function (done) {
    UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser) {
      Babble.addBabble("I love dinning hall food?", babbleUser._id, null).then(function(newBabble){
        UserUtils.register("stacy00", "Stacy Ho", "123456789", "123456789").then(function(badvibeUser) {
          assert.equal(0,newBabble.badVibeUsers.length);
          Babble.goodVibe(newBabble._id, badvibeUser._id).then(function(updatedBabble){       
            assert.equal(0,updatedBabble.badVibeUsers.length);
            assert.equal(1,updatedBabble.goodVibeUsers.length);
            assert.equal(badvibeUser._id,updatedBabble.goodVibeUsers[0]);
            Babble.badVibe(updatedBabble._id, badvibeUser._id).then(function(updatedBabble){       
              assert.equal(1,updatedBabble.badVibeUsers.length);
              assert.equal(0,updatedBabble.goodVibeUsers.length);
              assert.equal(badvibeUser._id,updatedBabble.badVibeUsers[0]);
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

  it('multiple users badvibe -> make sure the count is right', function (done) {
    UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser) {
      Babble.addBabble("I love dinning hall food?", babbleUser._id, null).then(function(newBabble){
        UserUtils.register("stacy00", "Stacy Ho", "123456789", "123456789").then(function(badvibeUser1) {
          UserUtils.register("stacy11", "Stacy Ho", "123456789", "123456789").then(function(badvibeUser2) {
            assert.equal(0,newBabble.badVibeUsers.length);
              Babble.badVibe(newBabble._id, badvibeUser1._id).then(function(updatedBabble){
                assert.equal(1,updatedBabble.badVibeUsers.length);
                  Babble.badVibe(updatedBabble._id, badvibeUser2._id).then(function(updatedBabble){
                    assert.equal(2,updatedBabble.badVibeUsers.length);
                      Babble.badVibe(updatedBabble._id, babbleUser._id).then(function(updatedBabble){
                        assert.equal(3,updatedBabble.badVibeUsers.length);
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
  

}); //End describe #badVide

describe("getReputation(userId)", function() {
    //Partition for getReputation:
    //            Number of babbles posted by user: 0, >0
    //            reputation: positive, negative
    //            goodvibes and badvibes: has, doesnt have

  it('no babbles, no goodvibes/badvibes', function (done) {
    UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(user1) {
      Babble.getReputation(user1._id).then(function(result) {
        assert.equal(0, result);
        done();
        }, function(err) {
          assert.equal(true, false);
          done();
        })
      });
    });

  it('positive reputation, >0 babble, had goodvibes', function (done) {
    UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser) {
      Babble.addBabble("I love dinning hall food?", babbleUser._id, null).then(function(newBabble1){
        Babble.addBabble("Winter is coming", babbleUser._id, null).then(function(newBabble2){
          UserUtils.register("stacy00", "Stacy Ho", "123456789", "123456789").then(function(goodvibeUser1) {
            UserUtils.register("stacy11", "Stacy Ho", "123456789", "123456789").then(function(goodvibeUser2) {
              Babble.goodVibe(newBabble1._id, goodvibeUser1._id).then(function(updatedBabble1){
                Babble.goodVibe(newBabble2._id, goodvibeUser2._id).then(function(updatedBabble2){
                  Babble.goodVibe(updatedBabble1._id, goodvibeUser2._id).then(function(updatedBabble1){
                    Babble.getReputation(babbleUser._id).then(function(result) {
                      assert.equal(5,result);
                    },function(err) {
                      assert.equal(true, false);
                    });
                    Babble.getReputation(goodvibeUser1._id).then(function(result) {
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


  it('negative reputation, >0 babble, had goodvibes and badvibes', function (done) {
    UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser) {
      Babble.addBabble("I love dinning hall food?", babbleUser._id, null).then(function(newBabble1){
        Babble.addBabble("Winter is coming", babbleUser._id, null).then(function(newBabble2){
          UserUtils.register("stacy00", "Stacy Ho", "123456789", "123456789").then(function(User1) {
            UserUtils.register("stacy11", "Stacy Ho", "123456789", "123456789").then(function(User2) {
              Babble.goodVibe(newBabble1._id, User1._id).then(function(updatedBabble1){
                Babble.badVibe(newBabble2._id, User2._id).then(function(updatedBabble2){
                  Babble.badVibe(updatedBabble1._id, User2._id).then(function(updatedBabble1){
                    Babble.badVibe(updatedBabble1._id, babbleUser._id).then(function(updatedBabble1){
                      Babble.badVibe(updatedBabble2._id, babbleUser._id).then(function(updatedBabble2){
                        Babble.getReputation(babbleUser._id).then(function(result) {
                          assert.equal(-1,result);
                        },function(err) {
                          assert.equal(true, false);
                        });
                        Babble.getReputation(User2._id).then(function(result) {
                          //no change in reputation for goodvibbing/badvibbing
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
  })


}); //End describe #getReputation

describe("#shouldBeRedacted(babbleId, countThreshold)", function() {
    //For testing purposes, the countThreshold will be 2
    //Partition for shouldBeRedacted:
    //            should be redacted: yes, no
    //            total vibes has reached countThreshold: yes, no
    //            goodvibes and badvibes: none, #goodvibes >= #badvibes, #goodvibes < #badvibes, 

  it('no goodvibes and badvibes->has not reached countThreshold -> should not be redacted', function (done) {
    UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser) {
      Babble.addBabble("hello",babbleUser._id, null).then(function(newBabble){
        Babble.shouldBeRedacted(newBabble._id, 2).then(function(result) {
          assert.equal(false, result);
          done();
          }, function(err) {
            assert.equal(true, false);
            done();
          })
        });
      });
    });

  it('only goodvibes-> reached countThreshold -> should not be redacted', function (done) {
    UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser) {
      Babble.addBabble("hello",babbleUser._id, null).then(function(newBabble){
        UserUtils.register("stacy00", "Stacy Ho", "123456789", "123456789").then(function(goodvibeUser1) {
          UserUtils.register("stacy11", "Stacy Ho", "123456789", "123456789").then(function(goodvibeUser2) {
            Babble.goodVibe(newBabble._id, goodvibeUser1._id).then(function(updatedBabble){
              Babble.goodVibe(updatedBabble._id, goodvibeUser2._id).then(function(updatedBabble){
                Babble.goodVibe(updatedBabble._id, babbleUser._id).then(function(updatedBabble){
                  Babble.shouldBeRedacted(updatedBabble._id, 2).then(function(result) {
                    assert.equal(false, result);
                    done();
                    }, function(err) {
                      assert.equal(true, false);
                      done();
                    })
                  });
                });
              });
            });
          });
        });
      });
    });

  it('#badvibes > #goodvides, reached countThreshold, redacted', function (done) {
    UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser) {
      Babble.addBabble("hello",babbleUser._id, null).then(function(newBabble){
        UserUtils.register("stacy00", "Stacy Ho", "123456789", "123456789").then(function(badvibeUser1) {
          UserUtils.register("stacy11", "Stacy Ho", "123456789", "123456789").then(function(badvibeUser2) {
            UserUtils.register("stacy22", "Stacy Ho", "123456789", "123456789").then(function(badvibeUser3) {
              UserUtils.register("stacy33", "Stacy Ho", "123456789", "123456789").then(function(badvibeUser4) {
                UserUtils.register("stacy44", "Stacy Ho", "123456789", "123456789").then(function(badvibeUser5) {
                  Babble.badVibe(newBabble._id, badvibeUser1._id).then(function(updatedBabble){
                    Babble.badVibe(updatedBabble._id, badvibeUser2._id).then(function(updatedBabble){
                      Babble.badVibe(updatedBabble._id, badvibeUser3._id).then(function(updatedBabble){
                        Babble.badVibe(updatedBabble._id, badvibeUser4._id).then(function(updatedBabble){
                          Babble.badVibe(updatedBabble._id, badvibeUser5._id).then(function(updatedBabble){
                           Babble.goodVibe(updatedBabble._id, babbleUser._id).then(function(updatedBabble){
                            Babble.shouldBeRedacted(updatedBabble._id, 2).then(function(result) {
                              //5 bad vibes, 1 goodvibe, ratio = 5/6 > 80%
                              assert.equal(true, result);
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
                  })
                });
              });
            });
          });
        });
      });
    });
  });

  it('#badvibes > #goodvides, reached countThreshold, but still not redacted', function (done) {
    UserUtils.register("rachel00", "Rachel Lin", "123456789", "123456789").then(function(babbleUser) {
      Babble.addBabble("hello",babbleUser._id, null).then(function(newBabble){
        UserUtils.register("stacy00", "Stacy Ho", "123456789", "123456789").then(function(badvibeUser1) {
          UserUtils.register("stacy11", "Stacy Ho", "123456789", "123456789").then(function(badvibeUser2) {
            UserUtils.register("stacy22", "Stacy Ho", "123456789", "123456789").then(function(badvibeUser3) {
              Babble.badVibe(newBabble._id, badvibeUser1._id).then(function(updatedBabble){
                Babble.badVibe(updatedBabble._id, badvibeUser2._id).then(function(updatedBabble){
                  Babble.badVibe(updatedBabble._id, badvibeUser3._id).then(function(updatedBabble){
                    Babble.goodVibe(updatedBabble._id, babbleUser._id).then(function(updatedBabble){
                      Babble.shouldBeRedacted(updatedBabble._id, 2).then(function(result) {
                        // bad vibes, 1 goodvibe, ratio = 3/4 < 80%
                        assert.equal(false, result);
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
            })
          });
        });
      });
    });
       

  }); //End describe #shouldBeRedacted


}); // End describe Babble Model.
