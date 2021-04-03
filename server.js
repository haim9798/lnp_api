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
console.log('Starting SIP LNP server in ' + serverAddress + ':' + sipPort );
sip.start({
	port : sipPort,
	address: serverAddress,
	logger: {
	  send: function(message, address) { debugger; util.debug("send\n" + util.inspect(message, false, null)); },
	  recv: function(message, address) { debugger; util.debug("recv\n" + util.inspect(message, false, null)); }
	}
  },
  function (rq) {
	try {
	  if(rq.method === 'INVITE') {
				  sip.send(sip.makeResponse(rq, 100, 'Trying'));
				  var pnumber = sip.parseUri(rq.uri).user; //extract phone number
				  console.log(pnumber);
				  client.get(pnumber, (err, LRN) => {
					  if (err || LRN == null) {
						  sip.send(sip.makeResponse(rq, 404, 'Not Found'));
					  }
					  else {
						  var response = sip.makeResponse(rq, 302, 'Moved Temporarily');
						  console.log("after 302",LRN);
						  var uri = sip.parseUri(rq.uri);
						  uri.user = pnumber + ";rn=" + LRN;
						  response.headers.contact = [{uri: uri}];
						  sip.send(response);
  
					  }
				  });
		  }
  
	} catch (e) {
	  sip.send(sip.makeResponse(request, 500, 'Internal Server Error'));
	  sys.debug('Exception ' + e + ' at ' + e.stack);
  }
  });
