const express        = require('express');


const app            = express();

const port = 8000;


const redis     = require('redis');
var client    = redis.createClient();

client.on("connect", function() {
	  console.log("You are now connected");
});

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

require('./app/lnp')(app, client);app.listen(port, () => {  console.log('We are live on ' + port);});
