var mongoose =require("mongoose");
var	passportLocalMongoose = require("passport-local-mongoose");

var caretakerSchema =  new mongoose.Schema({
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

caretakerSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("caretaker", caretakerSchema);