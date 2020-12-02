const express=require('express');
const app=express();
var	mongoose= require("mongoose");
var	passport= require("passport");
var bodyParser= require("body-parser");
var LocalStrategy=require("passport-local");
var	LocalMongoose=require("passport-local-mongoose");
var	User = require('./models/user'),
	Relative = require('./models/mycircle'),
	Event = require('./models/events'),
 	fs   = require('fs'),
	path = require('path');
var multer = require('multer'); 
const uri ="mongodb+srv://vishaka:Vishaka@cluster0.u0mor.mongodb.net/alzheimers?retryWrites=true&w=majority"
//const uri = process.env.DATABASEURL;
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
//const NEWSAPIKEY = process.env.NEWSAPIKEY;
const NEWSAPIKEY='3dd595f2d707459499de0e17e7861822';
const newsapi = new NewsAPI(NEWSAPIKEY);

const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;

const flash = require('connect-flash');

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
app.use(flash());
mongoose.connect(uri,{ useNewUrlParser: true, useUnifiedTopology: true});

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
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
})	

function checkReminders(data){
	var d = new Date(); 
	var currDay = d.getDay();
	console.log(d);
	console.log(d.getDay());
	var timeStart = new Date().getHours();
	var minStart = new Date().getMinutes();
	var resReminders = [];
	

	for(let i=0; i<data.length; i++){
		for(let j=0; j<data[i].days.length; j++){
			if(data[i].days[j]== currDay){
				var timeEnd = new Date("01/01/2007 " + data[i].time + ":00").getHours();
				if(timeEnd - timeStart <= 2 && timeEnd - timeStart >=0){
					console.log("Inside check");
					console.log(timeEnd - timeStart);
					if(timeEnd - timeStart == 0){
						var minEnd = new Date("01/01/2007 " + data[i].time + ":00").getMinutes();
						console.log(minEnd - minStart);
						if(minEnd - minStart >= 0){
							resReminders.push(data[i]);
						}
					}
					else{
						resReminders.push(data[i]);

					}
					

				}

			}
		}
	}
	console.log(resReminders);

	return resReminders;
	
}



app.get('/',function(req,res){

	
	
	res.render("landing.ejs");
})

app.get('/home',isLoggedIn,function(req,res){
	let myreminders=[];
	console.log(req.user);
	console.log("at start reminders",myreminders);
	var msg = "";
	var client = new MongoClient(uri, { useNewUrlParser: true});
	client.connect(err => {
					  collection = client.db("alzheimers").collection("events");
					  
					  console.log("success getting");
					  collection.find({patUserName: req.user.username }).toArray(function(err,data){
							if(err) throw err;
							console.log("get data check here",data);
							myreminders = checkReminders(data);
							if(myreminders.length==0){
								msg = "No upcoming reminders (for 2 hours at least)";
							}
							res.render('homepage.ejs', {myreminders: myreminders, msg: msg});

						});
						//client.close();	
						console.log("REMINDERS LATER",myreminders);
						client.close();
			        });
					  	//client.close();	
	
			//res.render("homepage.ejs",{myreminders:myreminders,msg:msg});
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
			
			req.flash("error","A user with the same username already exits! Choose another Username.")
			console.log(err);
			res.redirect('/register');

		}
		else{
			req.flash("success","You have been registered succesfully");
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
	req.flash("success","Succesfully Logged Out");
	res.redirect('/');
})

app.get('/news',isLoggedIn,(req,res)=>{
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

app.post('/news',isLoggedIn,(req,res)=>{
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



app.get('/news/configure',isLoggedIn,(req,res)=>{
    res.render('newsapp/newsconfigure');
})

app.get('/entertainment',isLoggedIn,(req,res)=>{

	let myreminders=[];
	var msg = "";
	vidids = "";

	var client = new MongoClient(uri, { useNewUrlParser: true});
	client.connect(err => {
					  collection = client.db("alzheimers").collection("users");
					  
					  console.log("success getting");
					  collection.find({_id: ObjectId(req.user._id) }).toArray(function(err,data){
							if(err) throw err;
							console.log(data);

							
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
							
							
							//res.render('entertainment.ejs', {result: vidids});

						});
			
			        });
					  	client.close();	
	var client = new MongoClient(uri, { useNewUrlParser: true});

	client.connect(err => {
					  collection = client.db("alzheimers").collection("events");
					  
					  console.log("success getting");
					  collection.find({patUserName: req.user.username }).toArray(function(err,data){
							if(err) throw err;
							console.log(data);
							myreminders = checkReminders(data);
							if(myreminders.length==0){
								msg = "No upcoming reminders (for 2 hours at least)";
							}
							res.render('entertainment.ejs', {result: vidids, msg: msg, myreminders:myreminders});

						});
						//client.close();	
			        });
					  	client.close();	
})

app.get('/addvideos',isLoggedIn,(req,res)=>{


	res.render('addVideos.ejs');

})

app.post('/addvideos',isLoggedIn,(req,res)=>{

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
	req.flash("success","added video succesfully");
	res.redirect('/addvideos');
	//res.render('addVideos.ejs');
})

app.get('/games',isLoggedIn,(req,res)=>{
	let myreminders=[];
	var msg="";
	var client = new MongoClient(uri, { useNewUrlParser: true});
	client.connect(err => {
		collection = client.db("alzheimers").collection("events");
		
		console.log("success getting");
		collection.find({patUserName: req.user.username }).toArray(function(err,data){
			  if(err) throw err;
			  console.log(data);
			  myreminders = checkReminders(data);
			  if(myreminders.length==0){
				  msg = "No upcoming reminders (for 2 hours at least)";
			  }
			  res.render('games.ejs', {myreminders:myreminders, msg: msg});

		  });
		  	client.close();
	  });
			//client.close();	
	
})

app.get('/memorygame',isLoggedIn,(req,res)=>{

	res.render('memoryGame.ejs');
})

app.get('/quiz', (req,res)=>{
	res.render('quiz.ejs');
})

app.get('/circle',isLoggedIn,(req,res)=>{
	let myreminders=[];
	var msg = "";
	var client = new MongoClient(uri, { useNewUrlParser: true});
	client.connect(err => {
					  collection = client.db("alzheimers").collection("events");
					  
					  console.log("success getting");
					  collection.find({patUserName: req.user.username }).toArray(function(err,data){
							if(err) throw err;
							console.log(data);
							myreminders = checkReminders(data);
							if(myreminders.length==0){
								msg = "No upcoming reminders (for 2 hours at least)";
							}
							//res.render('events.ejs', {result: result, msg: msg});

						});
						//client.close();	
			        });
					  	client.close();	

	var client = new MongoClient(uri, { useNewUrlParser: true});
	client.connect(err => {
					  collection = client.db("alzheimers").collection("relatives");
					  
					  console.log("success getting");
					  collection.find({patUserName: req.user.username }).toArray(function(err,data){
							if(err) throw err;
							console.log(data);
							
							res.render('myCircle.ejs', {result: data,myreminders:myreminders,msg:msg});

						});
						//client.close();	
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

app.get('/circleupload',isLoggedIn,(req,res) =>{

	
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
				            req.flash("error","Could not add");
				            console.log(err);
				        }else{

							
							console.log("done");
						}
				
	        });
			  	client.close();
		});
	req.flash("success","relative added succesfully");
	res.redirect('/circleupload');
	//res.render('myCircleUpload.ejs');
	
	
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
						client.close();	
			        });
					  	//client.close();	
	
})

app.post('/guesswho/checkanswer',isLoggedIn,(req,res)=>{
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

app.get('/video',isLoggedIn,(req,res)=>{

	
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
						client.close();	
			        });
					  	//client.close();	
	
})

app.get('/events',isLoggedIn,(req,res) =>{
	let myreminders=[];
	var msg = "";
	var client = new MongoClient(uri, { useNewUrlParser: true});
	client.connect(err => {
					  collection = client.db("alzheimers").collection("events");
					  
					  console.log("success getting");
					  collection.find({patUserName: req.user.username }).toArray(function(err,data){
							if(err) throw err;
							console.log(data);
							result = checkReminders(data);
							if(result.length==0){
								msg = "No upcoming reminders (for 2 hours at least)";
							}
							res.render('events.ejs', {result: result, msg: msg});

						});
						client.close();	
			        });
					  	//client.close();	

})

app.get('/eventsadd',isLoggedIn,(req,res) => {
	res.render('eventsAdd.ejs');
	//console.log(req.query);
	

})

app.post('/eventsadd',isLoggedIn,(req,res) =>{
	console.log(req.body);
	var days = [];
	if("0" in req.body)
		days.push("0");
	if("1" in req.body)
		days.push("1");
	if("2" in req.body)
		days.push("2");
	if("3" in req.body)
		days.push("3");
	if("4" in req.body)
		days.push("4");
	if("5" in req.body)
		days.push("5");
	if("6" in req.body)
		days.push("6");
	console.log(days);

	var newEvent = new Event({
		patUserName: req.user.username,
		days: days,
		time: req.body.time,
		tag: req.body.tag

	});

	var client = new MongoClient(uri, { useNewUrlParser: true});
	console.log("adding events for");
	console.log(req.user.username);
	client.connect(err => {

			  collection = client.db("alzheimers").collection("events");
			  
			  console.log("success");

			  	collection.insertOne(newEvent, (err, result) => {
				        if(err) {
				            req.flash("error","Could not add event");
				            console.log(err);
				        }else{
							
							
							console.log("done");
						}
				
	        });
			  	client.close();
		});
	req.flash("success","Event added succesfully");
	res.redirect('/eventsadd');
	//res.render('eventsAdd.ejs');

})


app.listen(process.env.PORT||3000,function(){
	console.log(process.env.PORT);
	console.log("Server Started at http://localhost:3000/");
})
