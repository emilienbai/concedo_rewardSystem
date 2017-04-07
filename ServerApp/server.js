//server.js

var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');

var offerCtrl = require('./Controllers/OfferCtrl')



app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

//Here we set the routes for the API
var router= express.Router();

router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

//offers
router.route('/offers')
    .post(offerCtrl.createOffer);

router.route('/offers/:offerId')
    .delete(offerCtrl.removeOffer)
    .get(offerCtrl.getOffer)

router.route('/offers/:offerId/commit').put(offerCtrl.commitToOffer);
router.route('/offers/:offerId/claim').put(offerCtrl.claimOffer);
router.route('/offers/:offerId/confirm').put(offerCtrl.confirmOffer);

app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('server starts on port ' + port);