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
// const router = new express.Router();
require('dotenv').config();


// Db connection
const DBHOST = 'cluster0-dnnzf.mongodb.net';
const DBACC  = 'sim';
const MLABACC= 'hashdb';

// Secret db password
const DBPWD = process.env.DBPWD ? process.env.DBPWD : process.argv[2];
//Database connection
mongo.connect('mongodb+srv://' + DBACC + ':' + DBPWD + '@' +DBHOST+ '/' + MLABACC + '?retryWrites=true', { useUnifiedTopology: true }, (e,dbcli)=>{
	if(e) { console.log(e); return false; }
	db = dbcli.db('andy-bit');
	var server = app.listen(8080, ()=>{console.log("http://localhost:8080");})
});

//Serve static assets
app.use(express.static('public'));
app.set('view engine','ejs');

// Index page as in domain.com/
app.get('/', (req,res)=>{
	//messages page is the home page
	res.redirect('/messages');
}).post('/', (req,res)=>{ res.status(404).end('404'); });

// Create router for /messages and /messages/HASH
app.use(parser.urlencoded({extended:true}))


// app.use('/messages', router);

	// Create form and db save function
app.get('/messages', (req,res)=>{
	res.sendFile( __dirname + '/views/index.html' );
});
app.post('/messages', (req,res)=>{
	let message = req.body.message;
	let hash = crypto.createHash('sha256').update(message).digest('hex');
	let ms = db.collection('messages');
	// Save if not already in there
	ms.find({hash:hash},{projection:{_id:0,hash:0}}).limit(1).toArray((e,r)=>{
		if (r.length==0) {
			ms.insertOne({message:message,hash:hash},(err,rep)=>{
				if (err) { console.log(0); return false; }
				//res.send(/*'Not saved before ' +*/ hash);
				res.send('<html><head><title>Index</title></head><body>' +
					'<b>SHA256 Hash of your string:</b><br><br>' + hash +
					'</body></body></html>');
			});
		} else {
			//res.send(/*'Already found ' +*/ hash);
			res.send('<html><head><title>Index</title></head><body>' +
				'<b>SHA256 Hash of your string:</b><br><br>' + hash +
				'</body></body></html>');

		}
	});
});

// Get the GET hash and spit out the original msg or else show 404 error
app.get('/messages/:hash([a-fA-F0-9]+)', (req,res)=>{
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
});

app.post('/messages/hashing', (req,res)=>{	
	let hash = req.body.hash;
	res.redirect('/messages/' + hash );
})