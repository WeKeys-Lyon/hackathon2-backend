const Trend = require('../models/trends');
const Tweet = require('../models/tweets');

function getTrendsFromTweet(string) {
  //extrait dans un tableau les mots dièses contenus dans un tweet exemple ['#Trends','#France','#Foot2Rue']
  const myRegex = new RegExp(/\#[\w\d\-\@\é\à\è\ù\ç\û\&]*/,'ig');
  let myExtractedTrends = [];
  [...string.matchAll(myRegex)].forEach((trend) => myExtractedTrends.push(trend[0].toLowerCase()))
  return myExtractedTrends;
};

async function sendTrends(array) {
  //envoie sur la collection MongoDB trends les différents mots dièses contenus dans un tweet
  await array.forEach(async (trend) => {
    const isTrend = await Trend.findOne({hashtags: trend}).exec();
    if (isTrend === null) { //Si la trend n'existe pas, on la créée
      const newTrend = new Trend ({
        hashtags: trend,
        count: 1
      })
      newTrend.save()
    } else { //Si la trend existe, on la modifie pour augmenter le compteur
      await Trend.updateOne({hashtags: trend}, { count: isTrend.count+1}).then()
    }
  })
}
//Ajouter dans le tweet les IDs
async function updateTrendsAndTweet(numbertweet, arrayTrends) {

  await arrayTrends.forEach(async(trend) => {
    await Trend.findOne({hashtags: trend}).then(data => {
     Tweet.updateOne({_id: numbertweet}, {$push: {hashtags: data._id}}).then()
    });
  })
}
module.exports = { updateTrendsAndTweet, sendTrends, getTrendsFromTweet};