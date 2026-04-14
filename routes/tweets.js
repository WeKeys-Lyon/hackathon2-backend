var express = require('express');
var router = express.Router();

require('../models/connection');
const User = require('../models/users');
const Tweet = require('../models/tweets');
const Trend = require('../models/trends');
const { checkBody } = require('../modules/checkBody');
const { updateTrendsAndTweet, sendTrends, getTrendsFromTweet} = require('../modules/tweets_func');

/*GET afficher tous les tweets */
router.get('/', async (req, res) => {
  const tweets = await Tweet.find().populate('username', 'username -_id').sort({date: -1});

  if (!tweets.length) {
    res.status(200).send({result: false, error: 'aucun tweet à afficher'});
    return;
  }

  res.status(200).send({result: true, tweets});
});

/*POST myTweet */
router.post('/publishtweet', async function(req, res) {
   if (!checkBody(req.body, ['username', 'content', 'date'])) {
    res.status(200).send({ result: false, error: 'Missing or empty fields' });
    return;
  }
  //On récupère l'utilisateur...
  await User.findOne({ username: req.body.username }).then(data => {
    const whatTimeIsIt = new Date();
    //On envoie en traitement (inscription ou counter + 1) les mots dièses
    const myTrends = getTrendsFromTweet(req.body.content)
    sendTrends(myTrends);
    //On crée le nouveau Tweet
    const newTweet = new Tweet ({
        username: data._id,
        content: req.body.content,
        date: whatTimeIsIt,
        likes: 0
    })
    newTweet.save().then(updateTrendsAndTweet(newTweet._id, myTrends))
    .then(res.status(200).send({result: true, tweet: newTweet}))
  });
});


/* Mettre un coeur sur un Tweet */
router.post('/ilikeit', async function(req, res) {
   if (!checkBody(req.body, ['tweetId'])) {
    res.status(200).send({ result: false, error: 'Missing or empty fields' });
    return;
  }

  const myTweet = await Tweet.findOne({_id: req.body.tweetId}).exec();

  await Tweet.updateOne({_id: req.body.tweetId}, {likes: myTweet.likes+1}).then(res.status(200).send({result: true, tweet: myTweet}));

   
});
module.exports = router;
