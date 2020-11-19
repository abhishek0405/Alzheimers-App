var mongoose =require("mongoose");
var	passportLocalMongoose = require("passport-local-mongoose");

var userSchema =  new mongoose.Schema({
	name:String,	
	username:String,
	email: String,
	password:String,
	DP: 
    { 
        data: Buffer, 
        contentType: String 
    } 	
	
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("user", userSchema);
