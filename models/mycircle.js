var mongoose =require("mongoose");
var	passportLocalMongoose = require("passport-local-mongoose");

var relSchema =  new mongoose.Schema({
	patUserName: String,
	relName:String,	
	relation:String,
	photos: 
    [{ 
        data: Buffer, 
        contentType: String,
        path: String
    }]
	
});

relSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("relative", relSchema);