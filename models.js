var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');




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

	//twitter
	"twitter_name" : { type: String},
	"twitter_id" : { type: String},
	"twitter_access_token" : { type: String },
	"twitter_pic" : { type: String },
	"twitter_location" : { type: String },



	"provider" : { type: String }
});


exports.User = mongoose.model('User', userSchema);

