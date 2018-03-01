var express = require('express'),
	router = express.Router(),
	asyncMethod = require('./asyncMiddleware'),
	controller = require('../controllers/CalendarController');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/getLunarData', asyncMethod(controller.getLunarData));

module.exports = router;
