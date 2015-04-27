var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');


/*
var userSchema = mongoose.Schema({
	"name" : { type: String },
  "ig_id" : { type: String},
	"ig_access_token" : { type: String }
});
*/

var userSchema = mongoose.Schema({
	// IG
	"ig_name" : { type: String },
	"ig_id" : { type: String},
	"ig_access_token" : { type: String },

	//Linkedin
	"linkedin_name" : { type: String},
	"linkedin_id" : { type: String},
	"linkedin_access_token" : { type: String },

	//youtube
	"youtube_name" : { type: String},
	"youtube_id" : { type: String},
	"youtube_access_token" : { type: String },


	"provider" : { type: String }
});


exports.User = mongoose.model('User', userSchema);

