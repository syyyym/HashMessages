/*
* App to calculate digest hashes of messages and save them then return
* the original messages based on digest hashes
* USAGE:
* RUNNING: node app.js
* TEST: open browser and naviget to <IP>/ or
* http://<IP>:8080/messages
* http://<IP>:8080/messages/12...
*/

// Get all the libraries needed
const express = require('express');
const mongoose = require('mongoose');
const parser = require('body-parser');
const crypto = require('crypto');
const app = express();
const router = new express.Router();

require('dotenv').config();

// DB Connection
const dbURI = process.env.DBURI;
mongoose.connect(dbURI, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', error => logger.log('Database connection error', error));
db.once('open', function () {
  console.log('Database connection successful');
  var server = app.listen(8080, ()=>{console.log(process.env.HOST);})
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
	// Save if not already in there. Can be optimized!
});
// Get the GET hash and spit out the original msg or else show 404 error
router.get('/:hash([a-fA-F0-9]+)', (req,res)=>{
	res.set({'Content-Type': 'application/json'});
	let hash = req.params.hash;
	// Find and get msg. 

}).post('/:hash', (req,res)=>{
	res.send("No POST allowed, just GET");
});

