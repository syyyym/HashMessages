const crypto = require('crypto');
const router = require('express').Router();

// Create form and db save function
router.get('', (req,res)=>{
	res.send('<html><head><title>Sha</title></head><body>'+
	'<h2>Submit message for sha256 hashing and saving</h2>'+
	'<form action="/api/messages" method="POST">'+
	'<input placeholder="foo" name="message">'+
	'<button type="submit">Submit</button>'+
	'</form></body></body></html>');
}).post('', (req,res)=>{
	let message = req.body.message;
	let hash = crypto.createHash('sha256').update(message).digest('hex');
	let ms = db.collection('messages');
	// Save if not already in there
	ms.find({hash:hash},{projection:{_id:0,hash:0}}).limit(1).toArray((e,r)=>{
		if (r.length==0) {
			ms.insertOne({message:message,hash:hash},(err,rep)=>{
				if (err) { console.log(0); return false; }
				res.send(/*'Not saved before ' +*/ hash);
			});
		} else {
			res.send(/*'Already found ' +*/ hash);
		}
	});
});
// Get the GET hash and spit out the original msg or else show 404 error
router.get('/:hash([a-fA-F0-9]+)', (req,res)=>{
	res.set({'Content-Type': 'application/json'});
	let hash = req.params.hash;
	// Find and get msg. 
	db.collection('messages')
	.find({hash:hash},{projection:{_id:0,hash:0}}).limit(1)
	.toArray((e,r)=>{
		if (!e) {
			if (r.length) {
				res.send(JSON.stringify(r[0],null,' '));
			} else if (r.length==0) {
				const errmsg = 'Message not found';
				res.status(404).send(JSON.stringify({err_msg:errmsg},null,' '));
			}
		} else {res.send('["connection_error"]')}
	});
}).post('/:hash', (req,res)=>{
	res.send("No POST allowed, just GET");
});

module.exports = router;