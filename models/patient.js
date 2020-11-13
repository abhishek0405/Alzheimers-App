var mongoose =require("mongoose");
var	passportLocalMongoose = require("passport-local-mongoose");

var patientSchema =  new mongoose.Schema({
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

patientSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("patient", patientSchema);