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
const indexRouter = require('./routes/indexroute');
const apiRouter = require('./routes/apiroute');
const uiRouter = require('./routes/uiroute');

//Module for process.env
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
	db = dbcli.db('hashdb');	
	const server = app.listen(8080, ()=>{console.log("Connected to http://localhost:8080");})
});

app.use(express.static('public'));

app.set('view engine','ejs');
app.use(parser.urlencoded({extended:true}))

//endpoints
app.use('/', indexRouter);
app.use('/api/messages', apiRouter);
app.use('/ui', uiRouter);

app.use((req, res) =>{
	let errmsg = "No such route";
		res.render('errorpage', {
		errmsg: errmsg
	});	
})