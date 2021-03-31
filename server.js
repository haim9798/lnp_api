//require all needed libraries and extentions 
const express        = require('express');
var sip = require('sip');
var util = require('util');
var os = require( 'os' );
const redis     = require('redis');
const app            = express();
const port = 8000;

// find local host IP and write it to console 
var networkInterfaces = os.networkInterfaces();
console.log('Local IP is : ' + networkInterfaces['eth0'][0].address);
var serverAddress = networkInterfaces['eth0'][0].address;

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

require('./app/lnp')(app, client);app.listen(port, () => {  console.log('We are live on ' + port);});

//start of SIP LNP server 

sip.start({
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
