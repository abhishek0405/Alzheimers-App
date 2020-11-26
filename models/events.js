var mongoose =require("mongoose");
var	passportLocalMongoose = require("passport-local-mongoose");

var eventSchema =  new mongoose.Schema({
	patUserName: String,
	days: [String],
	time: String,
	tag: String
	
});

eventSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("event", eventSchema);