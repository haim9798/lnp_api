module.exports = function(app, client) {  
	//This will get post and update a number in the DB
	// If number exist it will update it to new value
	app.post('/lnp', (req, res) => {
	const lnp = { number: req.body.number, transnum: req.body.transnum };
	console.log(req.body);
	console.log("This is the original numnber:  " +lnp["number"]+"\n");
	client.set (lnp["number"],lnp["transnum"], function(err, reply) {

		if (err) {
			         res.send({ 'error': 'An error has occurred' }); 
				 } 
		else { 
			res.send ('Number inserted to LNP DB');
			 }
	});
} ); // end of post to /lnp  
//Start of get to /lnp/:number 
app.get('/lnp/:number', (req, res) => {
	
	client.get(req.params.number, function(err, reply) {
			 if (err) {
				          res.send({ 'error': 'An error has occurred' }); 
						}
			 else { 
				 if (reply == null ) {
						res.send( req.params.number);
				 }
				else { res.send(reply); 
				}

				console.log(reply);
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
						res.send( 'Numebr ' + req.params.number + ' deleted successfully from LNP DB');
				 }
				else { res.send({ 'error': 'Cannot delete this number from DB, Check if ' + req.params.number + ' Exist in the system' }); 
				}

				console.log(reply);
			 }
				});
	});


//end of listeners to API calls	
}
