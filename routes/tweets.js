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
   if (!checkBody(req.body, ['tweetId', 'token'])) {
    res.status(200).send({ result: false, error: 'Missing or empty fields' });
    return;
  }
  //On créé une variable qui contiendra les données du Tweet
  const thisTweet = await Tweet.findOne({_id: req.body.tweetId}).exec();
  // On créé une variable qui regarde si le tweet se trouve dans la liste de like de l'utilisateur
  const isInMyList = await User.findOne({token: req.body.token, likes: {$in: thisTweet._id}}).exec();

  if (isInMyList === null) {
    //Si la réponse est non, alors on ajoute le tweet dans la liste de like de l'utilisateur...
    await User.updateOne({token: req.body.token},{$push: {likes: thisTweet._id}}).then()
    //...Et on incrémente de 1 le nombre de likes du dit Tweet
    await Tweet.updateOne({_id: thisTweet._id}, {likes: thisTweet.likes+1}).then(res.status(200).send({result: true, tweet: thisTweet}));
  } else {
    //Si la réponse est oui, alors on fait l'inverse.
    await User.updateOne({token: req.body.token},{$pull: {likes: thisTweet._id}}).then()
    await Tweet.updateOne({_id: thisTweet._id}, {likes: thisTweet.likes-1}).then(res.status(200).send({result: true, tweet: thisTweet}));
  }

   
});
module.exports = router;
