module.exports = function(sip, client , util) {
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
}