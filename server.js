var express    = require('express');  
var braintree = require("braintree");     
var app        = express();                 
var bodyParser = require('body-parser');
var ep = require('express-promise')();
var cors = require('cors');

app.use(ep);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

var port = process.env.PORT || 3000;        
var router = express.Router(); 

var gateway = braintree.connect({
  	environment: braintree.Environment.Sandbox,
 	merchantId: "wb327cgbsxc9c45m",
  	publicKey: "gjjctjftttn3nb45",
  	privateKey: "16cb3e322fe99f8b6ecbc5cf9070e36f"
});

app.use(express.static('static'));
app.use('/', router);

router.get('/',function(request,response){
	response.json({"Message":"Welcome to Braintree api home screen"})
})

router.get('/client_token',function(request,response){
	var token;
	gateway.clientToken.generate({}, function (err, data) {
		response.send(data);

	})
	

})

router.get('/getCustomer',function(request,response){
	var customerId = request.query.id;
	gateway.customer.find(customerId, function(err, customer) {
		if(err){
			response.json(err);
		} else {
			response.json(customer);
		}

	});

})

app.listen(port);
console.log('server started on port ' + port);