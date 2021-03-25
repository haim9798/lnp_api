const express        = require('express');
const MongoClient    = require('mongodb').MongoClient;
const bodyParser     = require('body-parser');

const app            = express();

const port = 8000;


const redis     = require('redis');
var client    = redis.createClient();

client.on("connect", function() {
	  console.log("You are now connected");
});

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());


require('./app/lnp')(app, client);app.listen(port, () => {  console.log('We are live on ' + port);});
