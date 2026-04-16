var express = require('express');
var router = express.Router();

require('../models/connection');
const User = require('../models/users');
const Tweet = require('../models/tweets');
const Trend = require('../models/trends');
const { checkBody } = require('../modules/checkBody');

// Obtiens les 5 meilleurs trends et les renvoies dans un tableau
router.get('/besttrends', async (req,res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    await Trend.find({count:{$exists:true}}).sort({count:-1}).limit(5)
    .then(data => res.status(200).send({result: true, trends: data}))
});

// Affiche les X premiers tweets correspondant à la trend
router.get('/:trendid/:start/:stop', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
if (!checkBody(req.params, ['trendid', 'start', 'stop'])) {
    res.status(200).send({ result: false, error: 'Missing or empty fields' });
    return;
  }
  const batch = await Tweet.find({hashtags: req.params.trendid}).populate({path: "username", model: User, select: {avatar: 1, firstname: 1, username: 1}}).sort({date: -1}).skip(req.params.start).limit(req.params.stop);
  return res.status(200).send({result: true, tweets: batch});
})

// Obtenir l'ID d'une Trend
router.get('/getid/:trend', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (!checkBody(req.params, ['trend'])) {
    res.status(200).send({ result: false, error: 'Missing or empty fields' });
    return;
  }
  const regex = new RegExp(`${req.params.trend}`)
  Trend.findOne({hashtags: {$regex: regex, $options: 'i'} })
  .then(data => {
    if (!data) {
        res.status(200).send({result: false, error: 'Rien n\'a été trouvé'})
    } else {
        res.status(200).send({result: true, trend: {id: data._id, hashtags: data.hashtags}})
    }
    })
})
module.exports = router;