var mongoose =require("mongoose");
var	passportLocalMongoose = require("passport-local-mongoose");

var userSchema =  new mongoose.Schema({
	name:String,	
	username:String,
	email: String,
	password:String,
	country:String,
	DP: 
    { 
        data: Buffer, 
        contentType: String 
    } ,
	videos: [String],
	scores:[Number],
	sageScores:[Number]
	
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("user", userSchema);
