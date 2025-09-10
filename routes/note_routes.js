module.exports = function(app, client) {  app.post('/notes', (req, res) => {
	const note = { username: req.body.username, password: req.body.password };
	console.log(req.body);
	console.log("this is the username:  " +note["username"]+"\n");
	res.send('The password is : ' + note["password"]);
	client.set (note["username"],note["password"]);
	});
	
	app.get('/notes/:number', (req, res) => {
		console.log('GET incoming');
	var answer = client.get(req.params.number, function(err, reply) {
			 
			 if (err) {         res.send({ 'error': 'An error has occurred' }); }
			 else { 
				 if (reply == null ) {
						res.send( req.params.number);
				 }
				else { res.send(reply); }

				console.log(reply);
			 }
				});
	});

};
	
