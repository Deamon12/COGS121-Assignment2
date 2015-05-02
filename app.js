//dependencies for each module used
var express = require('express');
var passport = require('passport');
var http = require('http');
var path = require('path');
var handlebars = require('express-handlebars');
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var dotenv = require('dotenv');
var mongoose = require('mongoose');
var Instagram = require('instagram-node-lib');
var async = require('async');
var app = express();


//local dependencies
var models = require('./models');


//client id and client secret here, taken from .env
dotenv.load();
var InstagramStrategy = require('passport-instagram').Strategy;
var INSTAGRAM_CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID;
var INSTAGRAM_CLIENT_SECRET = process.env.INSTAGRAM_CLIENT_SECRET;
var INSTAGRAM_CALLBACK_URL = process.env.INSTAGRAM_CALLBACK_URL;
Instagram.set('client_id', INSTAGRAM_CLIENT_ID);
Instagram.set('client_secret', INSTAGRAM_CLIENT_SECRET);

var LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
var LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
var LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
var LINKEDIN_CALLBACK_URL = process.env.LINKEDIN_CALLBACK_URL;

var YoutubeStrategy = require('passport-youtube-v3').Strategy;
var YOUTUBE_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID;
var YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;
var YOUTUBE_CALLBACK_URL = process.env.YOUTUBE_CALLBACK_URL;
var Youtube = require("youtube-api");


var TwitterStrategy = require('passport-twitter').Strategy;
var TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID;
var TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET;
var TWITTER_CALLBACK_URL = process.env.TWITTER_CALLBACK_URL;
var TWITTER_ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN;
var TWITTER_ACCESS_SECRET = process.env.TWITTER_ACCESS_SECRET;
var Twitter = require('twitter');
var client = new Twitter({
    consumer_key: TWITTER_CLIENT_ID,
    consumer_secret: TWITTER_CLIENT_SECRET,
    access_token_key: TWITTER_ACCESS_TOKEN,
    access_token_secret: TWITTER_ACCESS_SECRET
});

//var Twit = require('twit');

/*var T = new Twit({
    consumer_key: TWITTER_CLIENT_ID,
    consumer_secret: TWITTER_CLIENT_SECRET,
    access_token: TWITTER_ACCESS_TOKEN,
    access_token_secret: TWITTER_ACCESS_SECRET
});
*/
//connect to database
mongoose.connect(process.env.MONGOLAB_URI);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  console.log("Database connected succesfully.");
});

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Instagram profile is
//   serialized and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});



passport.use(new YoutubeStrategy({
        clientID: YOUTUBE_CLIENT_ID,
        clientSecret: YOUTUBE_CLIENT_SECRET,
        callbackURL: YOUTUBE_CALLBACK_URL,
        scope: ['https://www.googleapis.com/auth/youtube.readonly']
    }, function (accessToken, refreshToken, profile, done) {

      //console.log(JSON.stringify(profile, undefined, 2))
        //console.log(profile);

      // asynchronous verification, for effect...
      models.User.findOne({
        "youtube_id": profile.id
      }, function (err, user) {
        if (err) {
          return done(err);
        }

        //didnt find a user
        if (!user) {
          //console.log("didnt find linkedin user");
          newUser = new models.User({
            youtube_name: profile.displayName,
            youtube_id: profile.id,
            provider: profile.provider,
            youtube_access_token: accessToken
          });

          newUser.save(function (err) {
            if (err) {
              console.log(err);
            } else {
              console.log('user: ' + newUser.youtube_name + " created.");
            }
            return done(null, newUser);
          });
        } else {
          //console.log("user: "+user);
          //update user here
          console.log('user: ' + user.youtube_name + " updated.");
          user.youtube_access_token = accessToken;
          user.save();
          process.nextTick(function () {

            return done(null, user);
          });
        }
      });
    }
));












passport.use(new LinkedInStrategy({
      clientID: LINKEDIN_CLIENT_ID,
      clientSecret: LINKEDIN_CLIENT_SECRET,
      callbackURL: LINKEDIN_CALLBACK_URL,
      scope: ['r_basicprofile', 'r_network']
      //state: true
    }, function (accessToken, refreshToken, profile, done) {

      //console.log("profile: " + JSON.stringify(profile));

      //console.log(JSON.stringify(profile, undefined, 2))

      // asynchronous verification, for effect...
      models.User.findOne({
        "linkedin_id": profile.id
      }, function (err, user) {
        if (err) {
          return done(err);
        }

        //didnt find a user
        if (!user) {
          //console.log("didnt find linkedin user");
          newUser = new models.User({
            linkedin_name: profile.displayName,
            linkedin_id: profile.id,
            provider: profile.provider,
            linkedin_access_token: accessToken
          });

          newUser.save(function (err) {
            if (err) {
              console.log(err);
            } else {
              console.log('user: ' + newUser.name + " created.");
            }
            return done(null, newUser);
          });
        } else {
          //update user here
          user.linkedin_access_token = accessToken;
          user.save();
          process.nextTick(function () {

            return done(null, user);
          });
        }
      });
    }
));


passport.use(new TwitterStrategy({
        consumerKey: TWITTER_CLIENT_ID,
        consumerSecret: TWITTER_CLIENT_SECRET,
        callbackURL: TWITTER_CALLBACK_URL
    },
    function(accessToken, refreshToken, profile, done) {

        //console.log("twitter: "+JSON.stringify(profile, undefined, 2));
        // asynchronous verification, for effect...
        models.User.findOne({
            "twitter_id": profile.id
        }, function(err, user) {
            if (err) {
                return done(err);
            }

            //didnt find a user
            if (!user) {
                newUser = new models.User({
                    twitter_name: profile.displayName,
                    twitter_id: profile.id,
                    provider: profile.provider,
                    twitter_pic: profile.photos[0].value,
                    twitter_access_token: accessToken
                });

                newUser.save(function(err) {
                    if(err) {
                        console.log(err);
                    } else {
                        console.log('user: ' + newUser.name + " created.");
                    }
                    return done(null, newUser);
                });
            } else {
                //update user here
                user.twitter_access_token = accessToken;
                user.save();
                process.nextTick(function () {
                    // To keep the example simple, the user's Instagram profile is returned to
                    // represent the logged-in user.  In a typical application, you would want
                    // to associate the Instagram account with a user record in your database,
                    // and return that user instead.
                    return done(null, user);
                });
            }
        });
    }


));



passport.use(new InstagramStrategy({
    clientID: INSTAGRAM_CLIENT_ID,
    clientSecret: INSTAGRAM_CLIENT_SECRET,
    callbackURL: INSTAGRAM_CALLBACK_URL
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
   models.User.findOne({
    "ig_id": profile.id
   }, function(err, user) {
      if (err) {
        return done(err); 
      }
      
      //didnt find a user
      if (!user) {
        newUser = new models.User({
          ig_name: profile.username,
          ig_id: profile.id,
          provider: profile.provider,
          ig_access_token: accessToken
        });

        newUser.save(function(err) {
          if(err) {
            console.log(err);
          } else {
            console.log('user: ' + newUser.name + " created.");
          }
          return done(null, newUser);
        });
      } else {
        //update user here
        user.ig_access_token = accessToken;
        user.save();
        process.nextTick(function () {
          // To keep the example simple, the user's Instagram profile is returned to
          // represent the logged-in user.  In a typical application, you would want
          // to associate the Instagram account with a user record in your database,
          // and return that user instead.
          return done(null, user);
        });
      }
   });
  }
));


//Configures the Template engine
app.engine('handlebars', handlebars({defaultLayout: 'layout'}));
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({ secret: 'keyboard cat',
                  saveUninitialized: true,
                  resave: true,
                  name: 'id'
                  }));
app.use(passport.initialize());
app.use(passport.session());

//set environment ports and start application
app.set('port', process.env.PORT || 3000);

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { 
    return next(); 
  }
  res.redirect('/login');
}

function ensureAuthenticatedYoutube(req, res, next) {
    if (req.isAuthenticated() && !!req.user.youtube_id) {
        console.log("Ensure Youtube auth, passed");
        return next();
    }
    res.redirect('/login');
}

function ensureAuthenticatedInstagram(req, res, next) {
  if (req.isAuthenticated() && !!req.user.ig_id) {
    console.log("Ensure IG auth, passed");
    return next(); 
  }
  res.redirect('/login');
}

function ensureAuthenticatedLinkedin(req, res, next) {
  if (req.isAuthenticated() && !!req.user.linkedin_id) {
    console.log("Ensure linkedin auth, passed");
    return next();
  }
  res.redirect('/login');
}

function ensureAuthenticatedTwitter(req, res, next) {
    if (req.isAuthenticated() && !!req.user.twitter_id) {
        console.log("Ensure twitter auth, passed");
        return next();
    }
    res.redirect('/login');
}

//routes
app.get('/', function(req, res){
  res.render('login');
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

app.get('/accountyoutube', ensureAuthenticated, function(req, res){
    res.render('accountyoutube', {user: req.user});
});

app.get('/accountinstagram', ensureAuthenticated, function(req, res){
  res.render('accountinstagram', {user: req.user});
});

app.get('/accountlinkedin', ensureAuthenticated, function(req, res){
  res.render('accountlinkedin', {user: req.user});
});

app.get('/accounttwitter', ensureAuthenticated, function(req, res){
    res.render('accounttwitter', {user: req.user});
});




//children[name,
var jsonResult= {
    "name": "Trending Tweets",
    children: []
};



app.get('/twitterData', ensureAuthenticated, function(req, res){
    var query  = models.User.where({ twitter_id: req.user.twitter_id });
    query.findOne(function (err, user) {
        if (err) return err;
        if (user) {


            //Get local trends (trends/place) //woeId2487889
            //Grab 100 tweets of each of the local trends (search/tweets)

            var localTrends = {
                localTrends: {},
                tweets: []
            };


            async.series([
                getLocalTrends,
                getAllTweetsFromLocalTrends,
                sortTweets
            ], function (err, results) {

                //console.log(results);
                //console.log("Globals after: " + JSON.stringify(localTrends, undefined, 2));
                return res.json({data: jsonResult});
            });




            function getLocalTrends(callback){
                var sanDiegowoeid = "2487889";
                client.get('trends/place', {id: sanDiegowoeid}, function (error, data, response) {
                    if (!error) {
                        localTrends.localTrends = data[0].trends;
                    }
                    if(data.errors){
                        //console.log("Error: " + JSON.stringify(data.errors[0].message, undefined, 2));
                    }
                    callback(null, 'Done - local hashes: ');
                });


            }   //End method




            function getAllTweetsFromLocalTrends(callback) {

                async.eachLimit(localTrends.localTrends, 15, function(item, callback) {

                    client.get('search/tweets', {q: item.query, count:98}, function (error, data, response) {
                        if (!error) {
                            data.hash = item.name;
                            localTrends.tweets.push(data);
                        }
                        if(data.errors){
                            console.log("Error: " + JSON.stringify(data.errors[0].message, undefined, 2));
                        }
                        //console.log("data: "+JSON.stringify(data, undefined, 2));
                        callback();
                    });

                }, function(err){
                    // if any of the file processing produced an error, err would equal that error
                    if( err ) {
                        // One of the iterations produced an error.
                        // All processing will now stop.
                        console.log('An item failed to process');
                    } else {
                        //console.log('All items have been processed successfully');
                        //console.log("localTrends.tweets.statuses[a]: " + JSON.stringify(localTrends.tweets.length, undefined, 2));
                        callback(null, 'Done - Fetched Tweets:');
                    }
                });

            }//endmethod




            //Sort by Hashtag
            //Sort by Location
            //Sort by date

            //Possible sorts, retweet_count, location, hashtag, posted date
            function sortTweets(callback){

                async.eachLimit(localTrends.tweets, 15, function(item, callback) {

                    var hashTag = item.hash;

                    //Add a new child object for each hashtag
                    var parentObject = {
                        name: {},
                        children: []
                    };

                    parentObject.name = hashTag;


                    var location;
                    var creation;
                    var retweet;
                    var userName;
                    var text;


                    for(var a = 0, numItems = item.statuses.length; a < numItems; a++){
                        location = item.statuses[a].user.location;
                        userName = item.statuses[a].user.screen_name;
                        creation = item.statuses[a].created_at;
                        retweet = item.statuses[a].retweet_count;
                        text = item.statuses[a].text;


                        if(retweet < 5 ){
                            retweet = Math.random() * 10;
                        }

                        var posterInfo = {"name": userName, "size": retweet};



                        var locationInfo = {
                            name: "",
                            children: []
                        };

                        //posterInfo.children.push(textInfo);
                        locationInfo.children.push(posterInfo);
                        parentObject.children.push(locationInfo);




                    }

                    jsonResult.children.push(parentObject);
                    //console.log(" parentObject.children: " + JSON.stringify( parentObject, undefined, 2));
                    callback();



                }, function(err){

                    if( err ) {
                        console.log('An item failed to process');
                    } else {
                        //console.log('All items have been processed successfully');
                        //console.log("final Result: " + JSON.stringify(jsonResult, undefined, 2));
                        callback(null, 'Done - Sorting Tweets:');
                    }
                });


            }





        }

    });


});

/*
//Use Woeids to get global tweets.
function getTrendsbyLocationId(callback) {


    async.each(trendingLocations, function (item, callback) {

        // Perform operation on file here.
        console.log('Processing file ' + JSON.stringify(item.woeid, undefined, 2));

        client.get('trends/place', {id: item.woeid}, function (error, data, response) {
            if (!error) {
                console.log(item.woeid + ": " + JSON.stringify(data, undefined, 2));
                console.log(JSON.stringify(data, undefined, 2));
                //trendingHashtags.items.push(data);
                //localTrends[0].trends.posts.push(data)
                callback();
            }
        });




        }, function (err) {
        // if any of the file processing produced an error, err would equal that error
        if (err) {
        console.log('An item failed to process');
        } else {
        console.log('All items have been processed successfully');
        }
        });


        }
        */
            /*
             async.eachSeries(trendingLocations, item, function(err) {

             console.log("item: "+item);





             });


             callback(null, 'Done getting global trends');


             }



             /*
             // if(item.woeid != 1) {

             client.get('trends/place', params, function(error, data, response){
             if (!error) {
             //console.log("a tweet: "+tweets);
             console.log(JSON.stringify(data, undefined, 2));
             //trendingHashtags.items.push(data);
             //localTrends[0].trends.posts.push(data)
             }

             });



             */
            /*
             client.get('trends/place', params, function (err, data, response) {
             //console.log("response: "+JSON.stringify(response, undefined, 2));
             //console.log(item.woeid+": "+JSON.stringify(data, undefined, 2));
             globalHashtags.places.push(data);


             });*/
            //}


            /*
             T.get('search/tweets', { q: 'banana', since:'2011-11-11', count: 100 }, function(err, data, response) {
             console.log(data)
             })*/
            /*
             T.get('followers/ids', { screen_name: 'tolga_tezel' },  function (err, data, response) {
             console.log(data)
             })
             */

            /*
             T.get('trends/place', { id: '2487889' },  function (err, data, response) {
             for(var a = 0 ; a < data[0].trends;a++){
             jsonResult.children[a] = data[0].trends[a];
             }
             console.log(JSON.stringify(jsonResult, undefined, 2));
             })*/
            /*
             //var stream = T.stream('statuses/filter', { track: ['bananas', 'oranges', 'strawberries'] })
             var stream = T.stream('statuses/filter', { locations: soCal, language: 'en'  });
             stream.on('tweet', function (tweet) {
             console.log(tweet.text);
             //return res.json({tweet: tweet});
             });
             */
            /*
             function getRateLimitStatus(callback) {
             //var sanDiegowoeid = "2487889";
             var params = {};
             //application / rate_limit_status
             client.get('application/rate_limit_status', params, function(error, data, response){
             if (err)return err;

             //console.log(data);
             //console.log(JSON.stringify(localTrends, undefined, 2));
             callback(null, 'Status: '+data);
             });

             }
             */


        app.get('/twitterStream', ensureAuthenticated, function (req, res) {
            var query = models.User.where({twitter_id: req.user.twitter_id});
            query.findOne(function (err, user) {
                if (err) return err;
                if (user) {


                    var localTrends = {};
                    var trendingHashtags = {
                        items: []
                    };


                    /*
                     T.get('search/tweets', { q: 'banana', since:'2011-11-11', count: 100 }, function(err, data, response) {
                     console.log(data)
                     })*/
                    /*
                     T.get('followers/ids', { screen_name: 'tolga_tezel' },  function (err, data, response) {
                     console.log(data)
                     })
                     */


                    var sanFrancisco = [-122.75, 36.8, -121.75, 37.8];
                    var ucsd = [-117.3800415993, 32.7195620813, -117.0516662598, 32.9079761123]; //woeid: 2487889
                    var sanDiego = [-117.4260468483, 32.4965256796, -116.8669586182, 33.3132218581];
                    var soCal = [-119.247030735, 32.4965256796, -116.8669586182, 34.4238109325];
                    var newYork = [-74, 40, -73, 41];

                    /*
                     T.get('trends/place', { id: '2487889' },  function (err, data, response) {
                     for(var a = 0 ; a < data[0].trends;a++){
                     jsonResult.children[a] = data[0].trends[a];
                     }
                     console.log(JSON.stringify(jsonResult, undefined, 2));
                     })
                     */


                    //var stream = T.stream('statuses/filter', { track: ['bananas', 'oranges', 'strawberries'] })
                    var stream = T.stream('statuses/filter', {locations: sanDiego, language: 'en'});
                    stream.on('tweet', function (tweet) {
                        console.log(tweet.place.name + " : " + tweet.text);

                    });



                }
            });
        });


        /**
         * Get Youtube info
         */
        app.get('/youtubeSubInfo', ensureAuthenticatedYoutube, function (req, res) {

            var query = models.User.where({youtube_id: req.user.youtube_id});
            query.findOne(function (err, user) {
                if (err) return err;


                Youtube.authenticate({
                    type: "oauth",
                    token: user.youtube_access_token
                });

                var id_string = "";
                var subscriptions = {
                    items: []
                };
                var uploadlistId_list = {
                    items: []
                };
                var stats_list = {
                    items: []
                };


                async.series([
                    getSubscriptions,
                    buildIdString,
                    getUploadListIds
                    //getUserUploadInfosFinally
                ], function (err, results) {

                    console.log(results);
                    //Add counts to sub JSON
                    //console.log("upload_list: " + JSON.stringify(upload_list, undefined, 2));
                    for (var a = 0; a < stats_list.items.length; a++) {
                        subscriptions.items[a].stats = stats_list.items[a];
                        //console.log("ITEM: " + JSON.stringify(subscriptions.items[a], undefined, 2));
                    }

                    return res.json({users: subscriptions});

                });


                function getSubscriptions(callback) {
                    Youtube.subscriptions.list({
                        "part": "snippet"
                        , "mine": true
                        //, "maxResults": 50
                    }, function (err, data) {
                        if (err)return err;
                        //console.log("Length: "+data.items.length);
                        for (var a = 0; a < data.items.length; a++) {
                            //console.log(a+".) Sub: "+JSON.stringify(err || data.items[a], undefined, 2));
                            subscriptions.items.push(data.items[a]);
                        }

                        callback(null, 'GetSubsDone');
                    })

                }


                function buildIdString(callback) {
                    for (var a = 0; a < subscriptions.items.length; a++) {

                        //console.log(subscriptions.items[a].snippet.title+".) "+JSON.stringify(subscriptions.items[a], undefined, 2));
                        if (a == 0) {
                            id_string = subscriptions.items[a].snippet.resourceId.channelId;
                        } else
                            id_string = id_string + ", " + subscriptions.items[a].snippet.resourceId.channelId;
                    }
                    callback(null, 'Id String Built: ' + id_string);
                }


                //Use the list of subscriber accounts to retrieve the ID's
                //for their uploads. Youtube stores upload lists with their own UploadID's
                function getUploadListIds(callback) {

                    Youtube.channels.list({
                        "part": "statistics",
                        "id": id_string
                    }, function (err, data) {

                        async.each(data.items,
                            function (item, callback) {
                                //console.log("item: "+JSON.stringify(item, undefined, 2));
                                //stats_list.items.push(item.contentDetails.relatedPlaylists.uploads);
                                stats_list.items.push(item);
                                callback();
                            },
                            // 3rd param is the function to call when everything's done
                            function (err) {
                                callback(null, 'List of upload IDs done ' + uploadlistId_list.items);
                            }
                        );
                    });
                    //callback(null, 'List of upload IDs done '+uploadlistId_list.items);
                }

            });


        });


        app.get('/igphotos', ensureAuthenticatedInstagram, function (req, res) {
            var query = models.User.where({ig_id: req.user.ig_id});
            query.findOne(function (err, user) {
                if (err) return err;
                if (user) {
                    // doc may be null if no document matched
                    Instagram.users.liked_by_self({
                        access_token: user.ig_access_token,
                        complete: function (data) {
                            console.log(data);
                            //Map will iterate through the returned data obj
                            var imageArr = data.map(function (item) {
                                //create temporary json object
                                tempJSON = {};
                                tempJSON.url = item.images.low_resolution.url;
                                //insert json object into image array
                                return tempJSON;
                            });
                            res.render('photos', {photos: imageArr});
                        }
                    });
                }
            });
        });

        app.get('/igMediaCounts', ensureAuthenticatedInstagram, function (req, res) {
            var query = models.User.where({ig_id: req.user.ig_id});
            query.findOne(function (err, user) {
                if (err) return err;
                if (user) {
                    Instagram.users.follows({ //get followers
                        user_id: user.ig_id,
                        access_token: user.ig_access_token,
                        complete: function (data) {
                            // an array of asynchronous functions
                            var asyncTasks = [];
                            var mediaCounts = [];

                            data.forEach(function (item) {
                                asyncTasks.push(function (callback) {
                                    // asynchronous function!
                                    Instagram.users.info({
                                        user_id: item.id,
                                        access_token: user.ig_access_token,
                                        complete: function (data) {
                                            mediaCounts.push(data);
                                            callback();
                                        }
                                    });
                                });
                            });

                            // Now we have an array of functions, each containing an async task
                            // Execute all async tasks in the asyncTasks array
                            async.parallel(asyncTasks, function (err) {
                                // All tasks are done now
                                if (err) return err;
                                return res.json({users: mediaCounts});
                            });
                        }
                    });
                }
            });
        });


//Called after logged in, redirects to effect pages
        app.get('/visualization', ensureAuthenticated, function (req, res) {
            res.render('visualization');
        });
//Called after logged in, redirects to effect pages
        app.get('/c3visualization', ensureAuthenticated, function (req, res) {
            res.render('c3visualization');
        });

////////linkedin
        app.get('/visualization_linkedin', ensureAuthenticated, function (req, res) {
            res.render('visualization_linkedin');
        });
        app.get('/c3visualization_linkedin', ensureAuthenticated, function (req, res) {
            res.render('c3visualization_linkedin');
        });

/////YouTube
        app.get('/visualization_youtube', ensureAuthenticated, function (req, res) {
            res.render('visualization_youtube');
        });
        app.get('/c3visualization_youtube', ensureAuthenticated, function (req, res) {
            res.render('c3visualization_youtube');
        });

/////Twitter
        app.get('/visualization_twitter', ensureAuthenticated, function (req, res) {
            res.render('visualization_twitter');
        });


//Youtube
        app.get('/auth/youtube/callback',
            passport.authenticate('youtube', {failureRedirect: '/login'}),
            function (req, res) {
                res.redirect('/accountyoutube');
            });
        app.get('/auth/youtube',
            passport.authenticate('youtube'),
            function (req, res) {
            });


//Linkedin
        app.get('/auth/linkedin',
            passport.authenticate('linkedin', {state: 'SOME STATE'}),
            function (req, res) {
            });
        app.get('/auth/linkedin/callback',
            passport.authenticate('linkedin', {failureRedirect: '/login'}),
            function (req, res) {
                res.redirect('/accountlinkedin');
            });


//IG
        app.get('/auth/instagram',
            passport.authenticate('instagram'),
            function (req, res) {
                // The request will be redirected to Instagram for authentication, so this
                // function will not be called.
            });
        app.get('/auth/instagram/callback',
            passport.authenticate('instagram', {failureRedirect: '/login'}),
            function (req, res) {
                res.redirect('/accountinstagram');
            });


        app.get('/auth/twitter', passport.authenticate('twitter'));
        app.get('/auth/twitter/callback',
            passport.authenticate('twitter', {
                successRedirect: '/accounttwitter',
                failureRedirect: '/login'
            }));


        app.get('/logout', function (req, res) {
            //req.logout();
            //passport.req.logout();
            res.redirect('/');
        });

        http.createServer(app).listen(app.get('port'), function () {
            console.log('Express server listening on port ' + app.get('port'));
        });
