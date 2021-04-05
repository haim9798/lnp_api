module.exports = function(app, client,logger = null ) {
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
	//This will get post and update a number in the DB
	// If number exist it will update it to new value
	app.post('/lnp', (req, res) => {
	const lnp = { number: req.body.number, transnum: req.body.transnum };4
	console.log(req.body.number);
	logger.info("This is the original numnber:  " +lnp["number"]+"\n");
	client.set (lnp["number"],lnp["transnum"], function(err, reply) {

		if (err) {
			         res.send({ 'error': 'An error has occurred' }); 
				 } 
		else { 
			res.send ({'success':'Number ' + lnp["number"] + ' inserted to LNP DB'});
			 }
	});
} ); // end of post to /lnp  

app.post('/lnp/:number', (req, res) => {
	logger.info(req.body.transnum);
	client.set (req.params.number,req.body.transnum, function(err, reply) {

		if (err) {
			         res.send({ 'error': 'An error has occurred' }); 
					 logger.error('A redis DB error has occured : ' + err );
				 } 
		else { 
			res.send ({'success':'Number ' + lnp["number"] + ' inserted to LNP DB'});
			 }
	});
} );

//Start of get to /lnp/:number 
app.get('/lnp/:number', (req, res) => {
	logger.info('Original number is : ' + req.params.number);
	client.get(req.params.number, function(err, reply) {
			 if (err) {
				          res.send({ 'error': err }); 
						}
			 else { 
				 if (reply == null ) {
						res.send({ 'error': 'Cannot retrive this number from DB, please make sure to add ' + req.params.number + ' to the DB and try again'  });
						logger.error('Number retrival failed for number : ' + req.params.number);
				 }
				else { 
					res.send({'number':reply}); 
				}
			 }
				});
	});

//Start of delete to /lnp/:number 

app.delete('/lnp/:number', (req, res) => {
	
	client.del(req.params.number, function(err, reply) {
			 if (err) {
				          res.send({ 'error': 'An error has occurred' }); 
						}
			 else { 
				 if (reply == 1 ) {
						res.send( {'success': 'Numebr ' + req.params.number + ' deleted successfully from LNP DB'});
				 }
				else { 
					res.send({ 'error': 'Cannot delete this number from DB, Check if ' + req.params.number + ' Exist in the system' }); 
				}

				console.log(reply);
			 }
				});
	});


//end of listeners to API calls	
}
