const crypto = require('crypto');
const express = require('express');
const router = express.Router();

// Index page as in domain.com/
router.get('/', (req,res)=>{
	//messages page is the home page
	res.redirect('/ui/messages');
}).post('/', (req,res)=>{ res.status(404).end('404'); });

router.use(express.static('public'));
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
router.get('/messages/:hash([a-fA-F0-9]+)', (req,res)=>{
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

router.post('/messages/hashing', (req,res)=>{	
	let hash = req.body.hash;
	res.redirect('/ui/messages/' + hash );
})


module.exports = router;