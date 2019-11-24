/*
* App crafter to calculate digest hashes of messages and save them then return
* the original messages based on digest hashes
* USAGE:
* RUNNING: DBPWD=<dbpassword> node app.js
* TEST: open browser and naviget to <IP>/ or
* http://<IP>:8080/messages
* http://<IP>:8080/messages/12...
*/

// Get all the libraries needed
const express = require('express');
const mongo = require('mongodb');
const parser = require('body-parser');
const crypto = require('crypto');
const app = express();
const router = new express.Router();
require('dotenv').config();


// The secret db password
const DBPWD = process.env.DBPWD ? process.env.DBPWD : process.argv[2];

// The db connection
const DBHOST = 'cluster0-dnnzf.mongodb.net';
const DBACC  = 'sim';
const MLABACC= 'hashdb';

mongo.connect('mongodb+srv://' + DBACC + ':' + DBPWD + '@' +DBHOST+ '/' + MLABACC + '?retryWrites=true', { useUnifiedTopology: true }, (e,dbcli)=>{
	if(e) { console.log(e); return false; }
	db = dbcli.db('andy-bit');
	var server = app.listen(8080, ()=>{console.log("http://localhost:8080");})
});

// Index page as in domain.com/
app.get('/', (req,res)=>{
	res.send('<html><head><title>Index</title></head><body>'+
	'<b>Move along, nothing to see here!</b> <a href="/messages">form</a>?'+
	'</body></body></html>');
}).post('/', (req,res)=>{ res.status(404).end('404'); });
// Create router for /messages and /messages/HASH
app.use(parser.urlencoded({extended:true}))
	.use('/messages', router);
// Create form and db save function
router.get('', (req,res)=>{
	res.send('<html><head><title>Sha</title></head><body>'+
	'<h2>Submit message for sha256 hashing and saving</h2>'+
	'<form action="/messages" method="POST">'+
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