const express=require('express');
const app=express();
var	mongoose= require("mongoose");
var	passport= require("passport");
var bodyParser= require("body-parser");
var LocalStrategy=require("passport-local");
var	LocalMongoose=require("passport-local-mongoose");
var	User = require('./models/user'),
	Relative = require('./models/myCircle'),
 	fs   = require('fs'),
	path = require('path');
var multer = require('multer'); 
const uri ="mongodb+srv://vishaka:Vishaka@cluster0.u0mor.mongodb.net/alzheimers?retryWrites=true&w=majority"
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
const { ESRCH } = require('constants');
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

function getRandom(arr, n) {
    var result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}
//preparing the quiz


let all_questions;
const GetRandQuestion =(personobj,allnames)=>{
	
	let randpicind = Math.floor(Math.random() * personobj.photos.length);
	let randphoto = personobj.photos[randpicind];
	let answer = personobj.relName;
	let ansind = allnames.indexOf(answer);
	let option2 = allnames[(ansind+1)%allnames.length];
	let options = [answer,option2];
	let questionobj ={
		'photo':randphoto,
		'options':options,
		'answer':answer
	}

	return questionobj;
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

app.get('/news',(req,res)=>{
    newsapi.v2.topHeadlines({
        country: 'in',
        language: 'en',
      }).then(response => {
        console.log(response);
        res.render('newsapp/newspage',{news:response});
      }).catch((e)=>{
        console.log(e);
    });
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



app.get('/news/configure',(req,res)=>{
    res.render('newsapp/newsconfigure');
})

app.get('/entertainment', (req,res)=>{

	var client = new MongoClient(uri, { useNewUrlParser: true});
	client.connect(err => {
					  collection = client.db("alzheimers").collection("users");
					  
					  console.log("success getting");
					  collection.find({_id: ObjectId(req.user._id) }).toArray(function(err,data){
							if(err) throw err;
							console.log(data);

							vidids = "";
							if(data[0].hasOwnProperty('videos')){
								
								for(var i=0; i<data[0].videos.length-1; i++)
								{
									vidids += data[0].videos[i] ;
									vidids += ",";

								}
								vidids += data[0].videos[data[0].videos.length-1];
								console.log(req.user.name);
								console.log(vidids);
							}
							
							
							res.render('entertainment.ejs', {result: vidids});

						});
			
			        });
					  	client.close();	
})

app.get('/addvideos', (req,res)=>{


	res.render('addVideos.ejs');

})

app.post('/addvideos', (req,res)=>{

	var client = new MongoClient(uri, { useNewUrlParser: true});
	console.log("adding videos for");
	console.log(req.body);
	client.connect(err => {

		    collection = client.db("alzheimers").collection("users");
			
			
			collection.updateOne({_id: ObjectId(req.user._id)}, {$addToSet: {videos: req.body.videoid}},
					function(err, res) {

						    if (err) throw err;
						    console.log("1  document updated");

						    client.close();
						});
	});

	res.render('addVideos.ejs');
})

app.get('/games', (req,res)=>{

	res.render('games.ejs');
})

app.get('/memorygame', (req,res)=>{

	res.render('memoryGame.ejs');
})

app.get('/quiz', (req,res)=>{
	res.render('quiz.ejs');
})

app.get('/circle', (req,res)=>{

	var client = new MongoClient(uri, { useNewUrlParser: true});
	client.connect(err => {
					  collection = client.db("alzheimers").collection("relatives");
					  
					  console.log("success getting");
					  collection.find({patUserName: req.user.username }).toArray(function(err,data){
							if(err) throw err;
							console.log(data);
							
							res.render('myCircle.ejs', {result: data});

						});
			
			        });
					  	client.close();	
	
})



var storageCircle = multer.diskStorage({ 
    destination: (req, file, cb) => {
    if (!fs.existsSync('uploads/'+ req.user.username )){
    		fs.mkdirSync('uploads/'+ req.user.username);
	} 
    	if (!fs.existsSync('uploads/'+ req.user.username + '/' + req.body.relName)){
    		fs.mkdirSync('uploads/'+ req.user.username + '/' + req.body.relName);
	}
        cb(null, 'uploads/'+ req.user.username + '/' + req.body.relName) ;
    }, 
    filename: (req, file, cb) => { 
        cb(null, file.fieldname + '-' + Date.now()) 
    } 
}); 
var uploadCircle = multer({ storage: storageCircle }); 

app.get('/circleupload', (req,res) =>{

	
	res.render('myCircleUpload.ejs');

})

app.post('/circleupload',uploadCircle.array('files'),function(req,res,next){
	
	var photos = [];
	for(var i=0; i<req.files.length; i++)
	{
		photos.push({ 
	            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.user.username + '/'+ req.body.relName + '/' + req.files[i].filename)), 
				contentType: 'image/png',
				path: req.files[i].path
        	});
	}
	
	var newRelative = new Relative({
		patUserName: req.user.username,
		relName: req.body.relName,
		relation: req.body.relation,
		
		photos: photos

	});
	var client = new MongoClient(uri, { useNewUrlParser: true});
	console.log("adding relative for");
	console.log(req.body);
	client.connect(err => {

			  collection = client.db("alzheimers").collection("relatives");
			  
			  console.log("success");

			  	collection.insertOne(newRelative, (err, result) => {
				        if(err) {
				            
				            console.log(err);
				        }

				 
				        	console.log("done");
				
	        });
			  	client.close();
		});
	res.render('myCircleUpload.ejs');
	
	
})



app.get('/guesswho',isLoggedIn,(req,res)=>{
	

	var client = new MongoClient(uri, { useNewUrlParser: true});
	client.connect(err => {
					  collection = client.db("alzheimers").collection("relatives");
					  
					  console.log("success getting");
					  collection.find({patUserName: req.user.username }).toArray(function(err,data){
							if(err) throw err;
							console.log(data);
							let maxind = Math.min(data.length,5);
							let randarray = getRandom(data,maxind);
							let allnames=[];
							for(var obj of data){
								allnames.push(obj.relName);
							}
							 all_questions=[];
							for(var obj of randarray){
								let question = GetRandQuestion(obj,allnames);
								all_questions.push(question);
							}
							
							
							console.log("THE QUESTION SET IS",all_questions);
							res.render('guesswho', {all_questions:all_questions});

						});
			
			        });
					  	client.close();	
	
})

app.post('/guesswho/checkanswer',(req,res)=>{
	let myanswer=[];
	console.log("FORM RESPONSE IS",req.body);
	let boolarr=[]
	console.log("all questions data ",all_questions);
	let score=0;
	let correctansarr = all_questions.map(obj=>obj.answer);
	let indices = all_questions.length;
	for(var i=1;i<=indices;i++){
		
		let key = "Choice"+(i);
		let value = req.body[key];
		myanswer[i-1]=value;
		if(correctansarr[i-1]===value){
			console.log("correct ans");
			score+=1;
			boolarr[i-1]=true;
		}
		else{
			boolarr[i-1]=false;
			console.log("wrong answer");
		}
	}
	console.log(correctansarr);
	console.log(boolarr);
	res.render("score",{boolarr:boolarr,correctansarr:correctansarr,myanswer:myanswer,score:score,all_questions:all_questions})
})

app.get('/video', (req,res)=>{

	
	 let labels = [];
	 let path = [];
	var client = new MongoClient(uri, { useNewUrlParser: true});
	client.connect(err => {
					  collection = client.db("alzheimers").collection("relatives");
					  
					  console.log("success getting");
					  collection.find({patUserName: req.user.username }).toArray(function(err,data){
							if(err) throw err;
							
							for(let i=0; i<data.length; i++){
								labels.push(data[i].relName);
							}
							console.log(labels);

							for(let i=0; i<data.length; i++){
								p=[];
								for(let j=0; j<data[i].photos.length; j++){
									p.push(data[i].photos[j].path);
								}
								path.push(p);
							}

							console.log(path);
							
							res.render('videoRec.ejs', {labels: labels, path: path});

						});
			
			        });
					  	client.close();	
	
})


app.listen(3000,function(){
	console.log("Server Started at http://localhost:3000/");
})
