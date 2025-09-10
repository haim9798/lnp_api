module.exports = function(sip, slaveClient , util,serverAddress,sipPort, logger= null) {
//If no logger is sent to the function , just use a default logger that sends everything to //null/dev	
if (logger == null){
    const { createLogger, format, transports } = require('winston');
    const { combine, timestamp, label, printf } = format;
    var logger = createLogger({
            level: "info",
            format: format.json(),
            transports: [
                new transports.Console({
                    level: 'info',
                    name : 'logger.infor',
                    silent : 'true'})
            ]
        });
}

logger.info('LNP Server - Starting SIP LNP Service in ' + serverAddress + ':' + sipPort );
console.log('LNP Server - SIP LNP Service started');
sip.start({
	port : sipPort,
	address: serverAddress,
	logger: {
	  send: function(message, address) { debugger; const debuglog = util.debuglog('siplnp');debuglog("send\n" + util.inspect(message, false, null)); },
	  recv: function(message, address) { debugger; const debuglog = util.debuglog('siplnp');debuglog("recv\n" + util.inspect(message, false, null)); }
	}
  },
  function (rq) {
	try {
	  if(rq.method === 'INVITE') {
				  sip.send(sip.makeResponse(rq, 100, 'Trying'));
				  var pnumber = sip.parseUri(rq.uri).user; //extract phone number
				  logger.info(pnumber);
				  slaveClient.get(pnumber, (err, LRN) => {
					  if (err || LRN == null) {
						  sip.send(sip.makeResponse(rq, 404, 'Not Found'));
						  logger.error('SIP LNP Service - Error encountered in Redis DB query');
					  }
					  else {
						  var response = sip.makeResponse(rq, 302, 'Moved Temporarily');
						  logger.info('SIP LNP Service - Found LRN in DB : '+ LRN);
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