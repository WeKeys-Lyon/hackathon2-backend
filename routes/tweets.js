var express = require('express');
var router = express.Router();

require('../models/connection');
const User = require('../models/users');
const Tweet = require('../models/tweets');
const Trend = require('../models/trends');
const { checkBody } = require('../modules/checkBody');

function getTrendsFromTweet(string) {
  const myRegex = new RegExp(/\#[\w\d\-\@\é\à\è\ù\ç\û\&]*/,'ig');
  let myExtractedTrends = [];
  [...string.matchAll(myRegex)].forEach((trend) => myExtractedTrends.push(trend[0]))
  return myExtractedTrends;
};

function sendTrends(array) {
  array.forEach(async (trend) => {
    const isTrend = await Trend.findOne({hashtags: trend}).exec();
    if (isTrend === null) {
      const newTrend = new Trend ({
        hashtags: trend,
        count: 0
      })
      newTrend.save()
    }
  })
}

/*GET afficher tous les tweets */
router.get('/', async (req, res) => {
  const tweets = await Tweet.find().populate('username', 'username -_id').sort({date: -1});

  if (!tweets.length) {
    res.json({result: false, error: 'aucun tweet à afficher'});
    return;
  }

  res.json({result: true, tweets});
});

/*POST myTweet */
router.post('/publishtweet', async function(req, res) {
   if (!checkBody(req.body, ['username', 'content', 'date'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }
  
  await User.findOne({ username: req.body.username }).then(data => {
    const whatTimeIsIt = new Date();

    const newTweet = new Tweet ({
        username: data._id,
        content: req.body.content,
        date: whatTimeIsIt,
        likes: 0
    })
    newTweet.save().then(res.json({result: true, tweet: newTweet}))

    const myTrends = getTrendsFromTweet(newTweet.content)
    sendTrends(myTrends);
  });
});
module.exports = router;
