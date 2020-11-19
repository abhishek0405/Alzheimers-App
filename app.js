const express=require('express');
const app=express();
var	mongoose= require("mongoose");
var	passport= require("passport");
var bodyParser= require("body-parser");
var LocalStrategy=require("passport-local");
var	LocalMongoose=require("passport-local-mongoose");
var	User = require('./models/user'),
 	fs   = require('fs'),
	path = require('path');
var multer = require('multer'); 

var storage = multer.diskStorage({ 
    destination: (req, file, cb) => { 
        cb(null, 'uploads') 
    }, 
    filename: (req, file, cb) => { 
        cb(null, file.fieldname + '-' + Date.now()) 
    } 
}); 
var upload = multer({ storage: storage }); 
const NewsAPI = require('newsapi');
const { type } = require('os');
const newsapi = new NewsAPI('3dd595f2d707459499de0e17e7861822');

const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;

function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	else{
		res.redirect('/login');
	}
}

app.use(express('public'));
app.set("view engine","ejs");
mongoose.connect("mongodb+srv://vishaka:Vishaka@cluster0.u0mor.mongodb.net/alzheimers?retryWrites=true&w=majority",{ useNewUrlParser: true, useUnifiedTopology: true});

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(require("express-session")({
	secret:"KEYTEST",
	resave:false,
	saveUninitialized:false
}))


app.use(passport.initialize());


app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
	res.locals.CurrentUser = req.user;
	next();
})	



app.get('/',function(req,res){
	res.render("landing.ejs");
})

app.get('/home',isLoggedIn,function(req,res){
	console.log(req.user);
	res.render("homepage.ejs");
	
})

app.get('/register',function(req,res){
		res.render("auth/register.ejs");
})

app.post('/register',upload.single('DP'),function(req,res,next){
	var newUser = new User({
		name: req.body.name,
		username: req.body.username,
		email: req.body.email,
		DP: { 
	            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)), 
	            contentType: 'image/png'
        	} 

	});
	User.register(newUser,req.body.password,function(err,user){
		if(err){
			console.log("Not registered");

		}
		else{
			passport.authenticate("local")(req,res,function(){
				res.redirect('/login');
			})
		}
	})
})



app.get('/login',function(req,res){
		res.render("auth/login.ejs");
})

app.post('/login',passport.authenticate("local",{
	successRedirect:"/home",
	failureRedirect:"/login"

}),function(req,res){
	
})

app.get('/logout',function(req,res){
	req.logout();
	res.redirect('/');
})

app.post('/news',(req,res)=>{
    newsapi.v2.topHeadlines({
        country: req.body.Country,
        language: 'en',
      }).then(response => {
        console.log(req.body)
        res.render('newsapp/newspage',{news:response});
      }).catch((e)=>{
        console.log(e);
    });
})

app.post('/news',(req,res)=>{
  res.redirect('/news');
})

app.get('/news/configure',(req,res)=>{
    res.render('newsapp/newsconfigure');
})

app.listen(3000,function(){
	console.log("Server Started at http://localhost:3000/");
})