const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const NewsAPI = require('newsapi');
const { type } = require('os');
const newsapi = new NewsAPI('3dd595f2d707459499de0e17e7861822');
app.use(express('public'));
app.use(bodyParser.urlencoded({extended:true}))
app.set("view engine","ejs");
app.get('/',(req,res)=>{
    res.send("This will be home page");
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

app.listen(3000,()=>{
    console.log('server started at port 3000');
})