require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose');
const mongodb = require('mongodb');
const dns = require('dns');
const shortid = require('shortid');

// Basic Configuration
const port = process.env.PORT || 3000;
app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());


//connect a mongo database with the POST command of Node
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
});

mongoose.Promise = global.Promise;
//why is this important?

//building a new schema
const Schema = mongoose.Schema;
//name validation for mongoose
const urlSchema = new Schema({
  original_url: {type: String, required: true},
  short_url: {type: String, required: true}
},{collection: 'completed'})

//create url model instance from schema
const Url = mongoose.model('Url', urlSchema);

//create a "create and save" function
const createAndSaveUrl = (item) => {
  const newUrl = new Url(item); //use destructuring
  newUrl.save(function(error, data){
    if(error) return (error);
  })
}

//create a "find by shortUrl" that matches you to the original Url
const findUrlByShortUrl = (shortId) => {
  return Url.findOne({short_url: shortId}).exec(function(error, data){
    if (error) return (error);
    res.json(data);
  })
}


//this initiates a res.redirect(url)
//then input these functions into app.post, app.get
app.post('/api/shorturl/new', (req, res)=>{
  const originalUrl = req.body.url;
  //const isValid = dns.lookup(originalUrl, (error, address, family) => {
  //  if (error) return "error";
    //need to validate each component;
  //  return address;
  //})
  const validRegex = /^https:\/\/|http:\/\//g;
  const isTrue = validRegex.test(originalUrl);

  if (isTrue){
    const array = [1,2,3,4,5,6];

    //const shortUrl = Math.round(Math.random()*100);
    const shortUrl = shortid.generate();
    //this uses an outside library
    const dbItem = {original_url: originalUrl, short_url: shortUrl};
    createAndSaveUrl(dbItem);
    res.json({original_url: originalUrl, short_url: shortUrl})
  }
  else {
    res.json({error: 'invalid url'}) 
  }

});

app.get('/api/shorturl/:short_url/', (req, res)=> {
  const shortId = req.params.short_url;
  Url.findOne({short_url: shortId}).select('original_url').exec(function(error,data){
    if(error) return (error);
    res.redirect(data.original_url);
  })
  //finds the short url in API library
  //then matches it to the long url 
  //use filter
  //then the response is actually going to that website in original_url
})

// Your first API endpoint
// Creating API endpoints --- 
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
