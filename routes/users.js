var express = require('express');
var router = express.Router();

// Root API URL
router.get('/',function(req,res){
	res.json({"Message":"You are visiting API root URL"});

})

module.exports = router;
