//server.js

var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var offerCtrl = require('./Controllers/OfferCtrl');
var rewardCtrl = require('./Controllers/RewardCtrl');
var UserCtrl = require('./Controllers/UserCtrl');



app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

//Here we set the routes for the API
var router = express.Router();

router.get('/', function (req, res) {
    res.json({ message: 'hooray! welcome to our api!' });
});

router.route('/users').post(UserCtrl.addUser);
router.route('/users/:userAddress/permission').put(UserCtrl.setUserPermission);
router.route('/users/:userAddress/balance').get(UserCtrl.getBalance);
router.route('/users/:userAddress/offers').get(UserCtrl.getUserOffers);
router.route('/users/:userAddress/rewards').get(UserCtrl.getUserRewards);



//offers
router.route('/offers')
    .post(offerCtrl.createOffer)
    .get(offerCtrl.getOffers)

router.route('/offers/:offerId')
    .delete(offerCtrl.removeOffer)
    .get(offerCtrl.getOffer)

router.route('/offers/:offerId/commit').put(offerCtrl.commitToOffer);
router.route('/offers/:offerId/claim').put(offerCtrl.claimOffer);
router.route('/offers/:offerId/confirm').put(offerCtrl.confirmOffer);

//rewards
router.route('/rewards')
    .post(rewardCtrl.createReward)
    .get(rewardCtrl.getRewards);

router.route('/rewards/:rewardId')
.get(rewardCtrl.getReward)
    .delete(rewardCtrl.removeReward);

router.route('/rewards/:rewardId/buy')
    .put(rewardCtrl.buyReward);

app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('server starts on port ' + port);