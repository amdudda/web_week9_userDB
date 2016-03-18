var express = require('express');
var router = express.Router();

/*
 * get userlist
 */
router.get('/userlist',function(req,res) {
	var db = req.db;
	var collection = db.get('userlist');
	collection.find({},{},function(e,docs){
		res.json(docs);
	});
});

/*
 * POST to add new user
 */
router.post('/adduser',function(req,res) {
	//console.log("got here");
	var db = req.db
	var collection = db.get('userlist');
	collection.insert(req.body, function(err,result) {
		res.send(
			(err === null) ? {msg: '' } : {msg:err}
		);
	});
});

module.exports = router;
