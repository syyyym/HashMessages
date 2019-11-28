var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
	res.redirect('/ui');
});

router.get('/api', (req, res) => {
	res.redirect('/api/messages');
});

module.exports = router;
