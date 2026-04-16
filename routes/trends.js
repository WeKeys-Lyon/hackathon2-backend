var express = require('express');
var router = express.Router();

require('../models/connection');
const User = require('../models/users');
const Tweet = require('../models/tweets');
const Trend = require('../models/trends');
const { checkBody } = require('../modules/checkBody');

// Obtiens les 5 meilleurs trends et les renvoies dans un tableau
router.get('/besttrends', async (req,res) => {
    await Trend.find({count:{$exists:true}}).sort({count:-1}).limit(5)
    .then(data => res.status(200).send({result: true, trends: data}))
});

// Affiche les X premiers tweets correspondant à la trend
router.get('/trend/:trendid/:start/:stop', (req, res) => {

})


module.exports = router;