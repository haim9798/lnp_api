module.exports = function(client, dns, serverAddress , enumPort = 53,logger = null  ) {
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
						name : 'console.log',
						silent : 'true'})
				]
			});
	}

    var consts = require('native-dns-packet').consts;   
    "use strict";
      
    server = dns.createServer();
    
    var onMessage = function (request, response) {
      logger.info('ENUM Service - Request from: ' + request.address.address);
      var i;
      if (request.question[0].type == 35 ){
        // Extract the number from NAPTR message 
        var num = request.question[0].name.split(".");
        num.reverse();
        num.splice(0,2);
        var phone = num.join("");
        logger.info('ENUM Service -The number in the query is : ' + phone); 
         
        //Query DB and get translated number 
        client.get(phone, (err, LRN) => {
            if (err || LRN == null) {
                response.header.rcode = consts.NAME_TO_RCODE.SERVFAIL;
                response.send();
                logger.error('ENUM Service - Error encountered in Redis DB query');
            }
            else {
                var answer_exp = '!^.*$!sip:+' + phone + ';npdi;rn=+' + LRN + '@'+ serverAddress + ';user=phone!' ;
                logger.info('ENUM Service - Found ENUM response in DB : '+ LRN);
                response.answer.push(dns.NAPTR({
                    name: request.question[0].name,
                    order : 10, 
                    preference : 10 , 
                    flags : 'U',
                    service : 'E2U+pstn:SIP', 
                    regexp  : answer_exp ,
                    replacement : '',
                    ttl: 600,
                  }));
                  response.send();
            }
        });
    }
    else {
        //Send back error that such query is not implemented
        response.header.rcode = consts.NAME_TO_RCODE.NOTIMP;
        response.send();
    }
  };
    
    var onError = function (err, buff, req, res) {
      logger.error(err.stack);
    };
    
    var onListening = function () {
      logger.info('LNP Server -ENUM DNS Service listening on port ' + enumPort );
      //this.close();
    };
    
    var onSocketError = function (err, socket) {
      logger.error(err);
    };
    
    var onClose = function () {
      logger.info('LNP Server -ENUM DNS Service closed');
    };
    
    server.on('request', onMessage);
    server.on('error', onError);
    server.on('listening', onListening);
    server.on('socketError', onSocketError);
    server.on('close', onClose);
    
    // if you want to bind server to spesific IP , uncomment the line below and comment last line
    //server.serve(enumPort, serverAddress);
    server.serve(enumPort);
    




}