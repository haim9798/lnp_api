//require all needed libraries and extentions 
const express        = require('express');
var sip = require('sip');
var util = require('util');
var os = require( 'os' );
const redis     = require('redis');
const app            = express();
const port = 8000;
const sipPort = "5060";

// find local host IP from first real interface  
var networkInterfaces = os.networkInterfaces();
var serverAddress ='';
for (var Interfaces in networkInterfaces ) {
	if ( ( networkInterfaces[Interfaces][0].address == '127.0.0.1' ) ){
		continue;
	}
	else {
		serverAddress = networkInterfaces[Interfaces][0].address;
		console.log('found the address : ' + serverAddress + ' in ' + Interfaces );
		break;
	}
}



//connect to local redisDB 
var client    = redis.createClient();
client.on("connect", function() {
	  console.log("You are now connected to Redis DB");
});
//Start the API app 
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

const lnpModule =require('./app/lnp');
const api4LNP = lnpModule.api(app, client);

app.listen(port, () => {  console.log('API is live on port ' + port);});

//start of SIP LNP server 
const sipLnpServer = lnpModule.sipserver(sip,client,util,serverAddress,sipPort);