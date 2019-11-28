const crypto = require('crypto');
const express = require('express');
const path = require('path');
const router = express.Router();

router.use(express.static('public'));

router.get('/', (req,res)=>{
	//messages page is the home page
	res.redirect('/ui/messages');
}).post('/', (req,res)=>{ res.status(404).end('404'); });

// Create form and db save function
router.get('/messages', (req,res)=>{
	res.sendFile( process.cwd() + '/views/index.html' );
});
router.post('/messages', (req,res)=>{
	let message = req.body.message;
	let hash = crypto.createHash('sha256').update(message).digest('hex');
	let ms = db.collection('messages');
	// Save if not already in there
	ms.find({hash:hash},{projection:{_id:0,hash:0}}).limit(1).toArray((e,r)=>{
		if (r.length==0) {
			ms.insertOne({message:message,hash:hash},(err,rep)=>{
				if (err) { console.log(0); return false; }
				res.render('hashpage', {
					hash: hash,
					message: message
				});
			});
		} else {
			res.render('hashpage', {
				hash: hash,
				message: message
			});
		}
	});
});

// Get the GET hash and spit out the original msg or else show 404 error
router.post('/hashing', (req,res, next)=>{	
	let hash = req.body.hash;
	res.set({'Content-Type': 'text/html'});
	// Find and get msg. 
	db.collection('messages')
	.find({hash:hash},{projection:{_id:0,hash:0}}).limit(1)
	.toArray((e,r)=>{
		let errmsg = "";
		if (!e) {
			if (r.length) {
				let message = r[0].message;
				res.render('messagepage', {
					hash: hash,
					message: r[0].message
				});				
			} else if (r.length==0) {
				res.status(404);
				errmsg = 'Message not found';
				res.render('errorpage', {
					errmsg: errmsg
				});	
			}
		} else {
			res.status(503);
			errmsg = 'Connection error';
			res.render('errorpage', {
				errmsg: errmsg
			});	
		}
	});
});

module.exports = router;