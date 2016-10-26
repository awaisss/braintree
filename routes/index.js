var express = require('express');
var router = express.Router();
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var braintree = require("braintree");
var Promise = require('bluebird');
var app = express();
var cors = require('cors');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

var gateway = braintree.connect({
  	environment: braintree.Environment.Sandbox,
 	merchantId: "wb327cgbsxc9c45m",
  	publicKey: "gjjctjftttn3nb45",
  	privateKey: "16cb3e322fe99f8b6ecbc5cf9070e36f"
});

// Get A Customer by id
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


// Get all plans 
router.get('/plans',function(request,response){
	var plans = gateway.plan.all(function(err,result){
		response.json(result);

	});

})

//Get subscriptions
router.get('/getTransaction',function(req,res){
	var transaction_id = req.query.t_id;
	var res_obj = {'PlanName':'','Price':0,'TotalPrice':0,'SubscriptionID':'',
	'DateCreated':'','DateUpdated':'','PlanAddOns':[]};

	var getPlans = Promise.promisify(gateway.plan.all,{context:gateway.plan});

	getPlans()
		.then(function(plans){
			gateway.transaction.find(transaction_id,function(err,transaction){
				res_obj.SubscriptionID = transaction.subscriptionId;
				res_obj.DateCreated = transaction.createdAt;
				res_obj.DateUpdated = transaction.updatedAt;
				if(transaction.addOns.length != 0) {
					res_obj.PlanAddOns = transaction.addOns;
				}
				res_obj.Price = transaction.amount; 

				// Calculate Total Price
				for(j=0;j<transaction.addOns.length;j++){
					res_obj.TotalPrice = res_obj.TotalPrice + transaction.addOns[j].amount * transaction.addOns[j].quantity;
				}
				
				
				for(i=0;i<plans.plans.length;i++){
					if(transaction.planId == plans.plans[i].id) {
						res_obj.PlanName = plans.plans[i].name;
						break;
					}

				} 
				res.json(res_obj);
			})

		})
		.catch(function(e){
			res.json({'Message':'Error Occured'});
		})

})

// Update Credit Card
/*
router.post('/updateCard',function(req,res){
	//var info = {'customerId':'','token':'','firstName':'','lastName':'','cardNumber':'','cvv':'','email':'','expirationDate':''};
	var token = req.query.token;
	var str_val = token.toString();
	gateway.creditCard.update(token,{
		firstName:req.body.firstName,
		lastName: req.body.lastName,
		email: req.body.email,
		number: req.body.cardNumber,
		cvv: req.body.cvv,
		expirationDate: req.body.expirationDate,
		customerId: req.body.customerId,
		options: {
			verifyCard: false
		}

	},function(err,data){
		if(err){
			res.json(err);
			//res.json({'Message':'Error occured in updating credit card info'});
		} else {
			res.json(data);
		}

	});

})
*/

// Update Credit Card --- 2
router.post('/updateCard',function(req,res){
	//var info = {'customerId':'','token':'','firstName':'','lastName':'','cardNumber':'','cvv':'','email':'','expirationDate':''};
	var token = req.body.token;
	var str_val = token.toString();
	var customerId = req.body.customerId;
	// First check whether this customer has credit card or not --
	gateway.customer.find(customerId,function(err,customer){
		if(customer.creditCards.length > 0) {
			for(i=0;i<customer.creditCards.length;i++){
				if(customer.creditCards[i].token == token) {
					// Credit Card exists --  Delete it and create new one --
					gateway.creditCard.delete(str_val,function(error,result){
						if(err) {
							console.log('Failed to delete creadit card');
							res.json(error);
						} else {
							// Deleted successfully --- Now create new one
							console.log('Deleted successfully');

							gateway.creditCard.create({
								firstName: req.body.firstName,
								lastName: req.body.lastName,
								customerId: req.body.customerId,
								cvv: req.body.cvv,
								expirationDate: req.body.expirationDate,
								number: req.body.cardNumber

							},function(err,card){
								if(err){
									console.log('Failed to create new card');
									res.json(err);
								} else {
									console.log('card created successfully');
									res.json(card);
								}

							});

						}

					})

					break;
				}
			}

		} else {
			// credit card not present alreay -- create new one
			gateway.creditCard.create({
				firstName: req.body.firstName,
				lastName: req.body.lastName,
				customerId: req.body.customerId,
				cvv: req.body.cvv,
				expirationDate: req.body.expirationDate,
				number: req.body.cardNumber

			},function(err,card){
				if(err){
					console.log('Failed to create new card');
					res.json(err);
				} else {
					console.log('card created successfully');
					res.json(card);
				}

			});

		}

	})


}) 


// Get a subscription details 
/*
router.get('/getSubscription',function(req,res){
	var sub_id = req.query.s_id;
	gateway.subscription.find(sub_id, function (err, result) {
		res.json(result);
	});

})
*/




/* GET home page. */
router.get('/', function(req, res, next) {
  	res.json({'Message':'Welcome to Braintree API Home Screen'});
});


module.exports = router;
