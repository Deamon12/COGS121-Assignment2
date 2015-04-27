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

var YoutubeStrategy = require('passport-youtube-v3').Strategy
var YOUTUBE_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID;
var YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;
var YOUTUBE_CALLBACK_URL = process.env.YOUTUBE_CALLBACK_URL;
var Youtube = require("youtube-api");



//connect to database
mongoose.connect(process.env.MONGODB_CONNECTION_URL);
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


app.get('/youtubetest',
    passport.authenticate('bearer', { session: false }),
    function(req, res) {
        res.json(req.user);
    });



passport.use(new YoutubeStrategy({
        clientID: YOUTUBE_CLIENT_ID,
        clientSecret: YOUTUBE_CLIENT_SECRET,
        callbackURL: YOUTUBE_CALLBACK_URL,
        scope: ['https://www.googleapis.com/auth/youtube.readonly']
    }, function (accessToken, refreshToken, profile, done) {

      //console.log(JSON.stringify(profile, undefined, 2))
        console.log(profile);

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
            console.log("user: "+user);
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
                  resave: true}));
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
        console.log("Ensure Youtube auth, passed")
        return next();
    }
    res.redirect('/login');
}

function ensureAuthenticatedInstagram(req, res, next) {
  if (req.isAuthenticated() && !!req.user.ig_id) {
    console.log("Ensure IG auth, passed")
    return next(); 
  }
  res.redirect('/login');
}

function ensureAuthenticatedLinkedin(req, res, next) {
  if (req.isAuthenticated() && !!req.user.linkedin_id) {
    console.log("Ensure linkedin auth, passed")
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



// Call the Data API to retrieve the playlist ID that uniquely identifies the
// list of videos uploaded to the currently authenticated user's channel.

//https://gdata.youtube.com/feeds/api/users/yourdaddydm/uploads?v=2&alt=jsonc
//https://www.googleapis.com/youtube/v3/channels?part=contentDetails&mine=true&key={YOUR_API_KEY}
//https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&key={YOUR_API_KEY}



/*
plus.people.get({ userId: 'me', auth: oauth2Client }, function(err, response) {
    // handle err and response
});

plus.people.get({ auth: API_KEY, userId: '+google' }, function(err, user) {
    console.log('Result: ' + (err ? err.message : user.displayName));
});
*/




app.get('/youtubelist', ensureAuthenticatedYoutube, function(req, res){

    var query  = models.User.where({ youtube_id: req.user.youtube_id });
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
        var upload_list = {
            items: []
        };

        /*
                function takes5Seconds(callback) {
                    console.log('Starting 5 second task');
                    setTimeout( function() {
                        console.log('Just finshed 5 seconds');
                        callback(null, 'five');
                    }, 5000);
                }
                */
/*
        function takes2Seconds(callback) {
            console.log('Starting 2 second task');
            setTimeout( function() {
                console.log('Just finshed 2 seconds');
                callback(null, 'two');
            }, 2000);
        }
*/









        async.series([
            getSubscriptions,
            buildIdString,
            getUploadListIds,
            getUserUploadInfosFinally
        ], function (err, results) {
            // Here, results is an array of the value from each function
            console.log(results); // ['one', 'two']

            //console.log("uploadlistId_list: " + JSON.stringify(uploadlistId_list, undefined, 2));
            //console.log("upload_list: " + JSON.stringify(upload_list, undefined, 2));
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

                //console.log(a+".) Sub: "+JSON.stringify(err || subscriptions.items[a].snippet.title, undefined, 2));
                if (a == 0) {
                    id_string = subscriptions.items[a].snippet.resourceId.channelId;
                } else
                    id_string = id_string + ", " + subscriptions.items[a].snippet.resourceId.channelId;
            }
            callback(null, 'Id String Built: '+id_string);
        }



        //Use the list of subscriber accounts to retrieve the ID's
        //for their uploads. Youtube stores upload lists with their own UploadID's
        function getUploadListIds(callback) {


            Youtube.channels.list({
                "part": "contentDetails",
                "id": id_string
            }, function (err, data) {

                //console.log("channel list data: " + JSON.stringify(err || data.items, undefined, 2));
                //console.log();
                /*
                for(var a = 0; a < data.items.length;a++){
                    //console.log(a+".) adding: "+JSON.stringify(err || data.items[a], undefined, 2));
                    uploadlistId_list.items.push(data.items[a].contentDetails.relatedPlaylists.uploads);
                }
                */

                async.each(data.items,
                    // 2nd param is the function that each item is passed to
                    function(item, callback){
                        // Call an asynchronous function, often a save() to DB
                       // item.someAsyncCall(function (){
                            uploadlistId_list.items.push(item.contentDetails.relatedPlaylists.uploads);
                            callback();
                        //});
                    },
                    // 3rd param is the function to call when everything's done
                    function(err){
                        // All tasks are done now
                        //doSomethingOnceAllAreDone();
                        callback(null, 'List of upload IDs done '+uploadlistId_list.items);
                    }
                );



/*

                async.each(data.items, function(item, callback) {
                    //console.log('Processing item ' + JSON.stringify(item, undefined, 2));
                    uploadlistId_list.items.push(item.contentDetails.relatedPlaylists.uploads);
                    callback();
                });
*/
                //console.log("uploadlistId_list: "+JSON.stringify(uploadlistId_list, undefined, 2));

                /*
                //We now have the required ID's
                //Call the id's to get the total number of uploads per users sub account
                for(var a = 0; a < uploadlistId_list.items.length;a++) {
                    //console.log("uploadlistId_list "+uploadlistId_list.items[a]);

                    Youtube.playlistItems.list({
                        "part": "snippet",
                        "playlistId": uploadlistId_list.items[a]
                        //"maxResults": 50
                    }, function (err, data) {

                        //console.log("playlist_data: " + JSON.stringify(data.pageInfo.totalResults, undefined, 2));
                        //console.log();

                        //res.render('youtube_uploads', {counts: data});
                    });
                }
                */


            });

            //callback(null, 'List of upload IDs done '+uploadlistId_list.items);
        }


        function getUserUploadInfosFinally(callback){

            console.log('getUserUploadInfosFinally');

            async.each(uploadlistId_list.items,
                // 2nd param is the function that each item is passed to
                function(item, callback){
                    // Call an asynchronous function, often a save() to DB
                    console.log('Processing item ' + JSON.stringify(item, undefined, 2));
                    Youtube.playlistItems.list({
                        "part": "snippet",
                        "playlistId": item
                        //"maxResults": 50
                    }, function (err, data) {

                        upload_list.items.push(data.pageInfo.totalResults);
                        callback();
                    });
                },
                // 3rd param is the function to call when everything's done
                function(err){
                    // All tasks are done now
                    //doSomethingOnceAllAreDone();
                    callback(null, 'Got user upload objects: '+upload_list.items);
                }
            );



/*

            async.each(uploadlistId_list.items, function(item, callback) {

                Youtube.playlistItems.list({
                    "part": "snippet",
                    "playlistId": item
                    //"maxResults": 50
                }, function (err, data) {
                    upload_list.items.push(data.pageInfo.totalResults);
                });
            });
*/




            //callback(null, 'Got user upload objects: '+upload_list.items);
        }



/*

        Youtube.subscriptions.list({
                "part": "snippet"
                , "mine": true
                //, "maxResults": 50
            }, function (err, data) {
                if(err)return err;
                //console.log("Length: "+data.items.length);
                for(var a = 0; a < data.items.length;a++){
                    //console.log(a+".) Sub: "+JSON.stringify(err || data.items[a], undefined, 2));
                    subscriptions.items.push(data.items[a]);
                }

                //console.log("subscription[0]: "+JSON.stringify(subscriptions.items[0], undefined, 2));
                //console.log("channel Id[0]: "+JSON.stringify(subscriptions.items[0].snippet.resourceId.channelId, undefined, 2));


                //Create Comma separated string of ID's

                for(var a = 0; a < subscriptions.items.length; a++){

                    //console.log(a+".) Sub: "+JSON.stringify(err || subscriptions.items[a].snippet.title, undefined, 2));
                    if(a == 0){
                        id_string = subscriptions.items[a].snippet.resourceId.channelId;
                    }else
                        id_string = id_string+", "+subscriptions.items[a].snippet.resourceId.channelId;

                }

                //Get ids of the users subscribed channels
                //Need the ID of the channels to get the id of user uploads list

                Youtube.channels.list({
                    "part": "contentDetails",
                    "id": id_string
                    //"maxResults": 50
                }, function (err, data) {

                    //console.log("channel list data: " + JSON.stringify(err || data.items, undefined, 2));
                    //console.log();
                    for(var a = 0; a < data.items.length;a++){
                        //console.log(a+".) adding: "+JSON.stringify(err || data.items[a], undefined, 2));
                        uploadlistId_list.items.push(data.items[a].contentDetails.relatedPlaylists.uploads);
                    }


                    //console.log("uploadlistId_list: "+JSON.stringify(uploadlistId_list, undefined, 2));
                    //We now have the required ID's
                    //Call the id's to get the total number of uploads per users sub account
                    for(var a = 0; a < uploadlistId_list.items.length;a++) {
                        //console.log("uploadlistId_list "+uploadlistId_list.items[a]);

                         Youtube.playlistItems.list({
                         "part": "snippet",
                         "playlistId": uploadlistId_list.items[a]
                         //"maxResults": 50
                         }, function (err, data) {

                             upload_list.items.push(data.pageInfo.totalResults);
                             //console.log("data: " + JSON.stringify(data.pageInfo.totalResults, undefined, 2));
                             //console.log("upload_list: " + JSON.stringify(upload_list.items[--a], undefined, 2));   //Correct
                             //console.log();

                             //res.render('youtube_uploads', {counts: data});
                         });
                    }
                });

            });




*/




    });



});




app.get('/igphotos', ensureAuthenticatedInstagram, function(req, res){
  var query  = models.User.where({ ig_id: req.user.ig_id });
  query.findOne(function (err, user) {
    if (err) return err;
    if (user) {
      // doc may be null if no document matched
      Instagram.users.liked_by_self({
        access_token: user.ig_access_token,
        complete: function(data) {
          console.log(data);
          //Map will iterate through the returned data obj
          var imageArr = data.map(function(item) {
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

app.get('/igMediaCounts', ensureAuthenticatedInstagram, function(req, res){
  var query  = models.User.where({ ig_id: req.user.ig_id });
  query.findOne(function (err, user) {
    if (err) return err;
    if (user) {
      Instagram.users.follows({ //get followers
        user_id: user.ig_id,
        access_token: user.ig_access_token,
        complete: function(data) {
          // an array of asynchronous functions
          var asyncTasks = [];
          var mediaCounts = [];
           
          data.forEach(function(item){
            asyncTasks.push(function(callback){
              // asynchronous function!
              Instagram.users.info({ 
                  user_id: item.id,
                  access_token: user.ig_access_token,
                  complete: function(data) {
                    mediaCounts.push(data);
                    callback();
                  }
                });            
            });
          });
          
          // Now we have an array of functions, each containing an async task
          // Execute all async tasks in the asyncTasks array
          async.parallel(asyncTasks, function(err){
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
app.get('/visualization', ensureAuthenticated, function (req, res){
  res.render('visualization');
});
//Called after logged in, redirects to effect pages
app.get('/c3visualization', ensureAuthenticated, function (req, res){
  res.render('c3visualization');
});

////////linkedin
app.get('/visualization_linkedin', ensureAuthenticated, function (req, res){
  res.render('visualization_linkedin');
});
app.get('/c3visualization_linkedin', ensureAuthenticated, function (req, res){
  res.render('c3visualization_linkedin');
});

/////YouTube
app.get('/visualization_youtube', ensureAuthenticated, function (req, res){
    res.render('visualization_youtube');
});
app.get('/c3visualization_youtube', ensureAuthenticated, function (req, res){
    res.render('c3visualization_youtube');
});



//Youtube
app.get('/auth/youtube/callback',
    passport.authenticate('youtube', { failureRedirect: '/login'}),
    function(req, res) {
        res.redirect('/accountyoutube');
    });
app.get('/auth/youtube',
    passport.authenticate('youtube'),
    function(req, res){
    });


//Linkedin
app.get('/auth/linkedin',
    passport.authenticate('linkedin', { state: 'SOME STATE' }),
    function(req, res){
    });
app.get('/auth/linkedin/callback',
    passport.authenticate('linkedin', { failureRedirect: '/login'}),
    function(req, res) {
        res.redirect('/accountlinkedin');
    });


//IG
app.get('/auth/instagram',
  passport.authenticate('instagram'),
  function(req, res){
    // The request will be redirected to Instagram for authentication, so this
    // function will not be called.
  });
app.get('/auth/instagram/callback', 
  passport.authenticate('instagram', { failureRedirect: '/login'}),
  function(req, res) {
    res.redirect('/accountinstagram');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});
