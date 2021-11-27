var mongoose =require("mongoose");
var	passportLocalMongoose = require("passport-local-mongoose");

var eventSchema =  new mongoose.Schema({
	patUserName: {type : String},
	days: {type :[String]},
	time:{type : String},
	tag: {type : String}
	
});

eventSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("event", eventSchema);