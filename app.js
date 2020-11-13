const express = require('express');
const app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var passport = require('passport');
var LocalStrategy = require('passport-local');
var LocalMongoose = require('passport-local-mongoose');
var flash = require('connect-flash');
var Patient = require('./models/patient.js');
var Caretaker = require('./models/caretaker.js');
var multer = require('multer'); 
var fs   = require('fs');
var	path = require('path');
var authpatient = new passport.Passport();
var authcaretaker = new passport.Passport();

var storage = multer.diskStorage({ 
    destination: (req, file, cb) => { 
        cb(null, 'uploads') 
    }, 
    filename: (req, file, cb) => { 
        cb(null, file.fieldname + '-' + Date.now()) 
    } 
}); 

function ispatient(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	else{
		res.redirect('/patient/login');
	}
}

function iscaretaker(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	else{
		res.redirect('/caretaker/login');
	}
}



var upload = multer({ storage: storage }); 

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static((__dirname+"/public")));
app.use(flash());
app.use(require("express-session")({
	secret:"KEY123",
	resave:false,
	saveUninitialized:false
}))

const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;



mongoose.connect('',{ useNewUrlParser: true, useUnifiedTopology: true})




app.set('view-engine', 'ejs');
app.use(authpatient.initialize({ userProperty:'patientuser'}));
app.use(authpatient.session());
app.use(authcaretaker.initialize({ userProperty:'caretakeruser'}));
app.use(authcaretaker.session())
/*app.use(passport.initialize());


app.use(passport.session());
passport.use('patientuser', new LocalStrategy(Patient.authenticate()));
passport.use('caretakeruser', new LocalStrategy(Caretaker.authenticate()));*/

authpatient.use(new LocalStrategy(Patient.authenticate('patientuser')));
authcaretaker.use(new LocalStrategy(Caretaker.authenticate('caretakeruser')));
authpatient.serializeUser(Patient.serializeUser());
authpatient.deserializeUser(Patient.deserializeUser());
authcaretaker.serializeUser(Caretaker.serializeUser());
authcaretaker.deserializeUser(Caretaker.deserializeUser());
/*passport.serializeUser(Patient.serializeUser());
passport.deserializeUser(Patient.deserializeUser());
passport.serializeUser(Caretaker.serializeUser());
passport.deserializeUser(Caretaker.deserializeUser());*/


app.use(function(req,res,next){
	res.locals.CurrentUser = req.user;
	next();
})


app.get('/',(req,res)=>{
    res.render('landing.ejs');
})

app.get('/patient/register', (req, res)=>{
	res.render('auth/patientReg.ejs');
})

app.get('/caretaker/register', (req, res)=>{
	res.render('auth/caretakerReg.ejs');
})

app.get('/patient/login', (req, res)=>{
	res.render('auth/patientLogin.ejs');
})

app.get('/caretaker/login', (req, res)=>{
	res.render('auth/caretakerLogin.ejs');
})

app.post('/patient/register',upload.single('DP'), (req, res)=>{
	
	var newPatient = new Patient({
		name: req.body.name,
		username: req.body.username,
		email: req.body.email,
		DP: { 
	            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)), 
	            contentType: 'image/png'
        	} 

	});
	Patient.register(newPatient, req.body.password,function(err,tchr){
		if(err){
			console.log("Not registered try again");
		}
		else{
			authpatient.authenticate("local")(req,res,function(){
				res.redirect('/patient/login');
			})
		}


	});



})

app.post('/caretaker/register',upload.single('DP'), (req, res)=>{
	
	var newCaretaker = new Caretaker({
		name: req.body.name,
		username: req.body.username,
		email: req.body.email,
		DP: { 
	            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)), 
	            contentType: 'image/png'
        	} 

	});
	Caretaker.register(newCaretaker, req.body.password,function(err,tchr){
		if(err){
			console.log("Not registered try again");
		}
		else{
			authcaretaker.authenticate("local")(req,res,function(){
				res.redirect('/caretaker/login');
			})
		}


	});


})

app.post('/patient/login',authpatient.authenticate("local",{
	successRedirect:"/patient/home",
	failureRedirect:"/patient/login"

}),function(req,res){
	
})

app.post('/caretaker/login',authcaretaker.authenticate("local",{
	successRedirect:"/caretaker/home",
	failureRedirect:"/caretaker/login"

}),function(req,res){
	
})




app.get('/patient/home',function(req,res){
	res.render("homepagePatient.ejs");
	console.log(req.patientuser._id);
})

app.get('/caretaker/home',function(req,res){
	res.render("homepageCaretaker.ejs");
	//console.log(req.user);
	console.log(req.caretakeruser);
})

app.get('/logout',function(req,res){
	req.logout();
	res.redirect('/');
})






app.listen(3000,()=>{
    console.log('server started at port 3000');
})
