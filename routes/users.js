var express = require('express');
var router = express.Router();

require('../models/connection');
const User = require('../models/users');
const { checkBody } = require('../modules/checkBody');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');


/*POST SignUp user */
router.post('/signup', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (!checkBody(req.body, ['username', 'firstname', 'password'])) {
    res.json({result: false, error: 'Missing or empty fields'})
  }

  // Vérifier si user existe déjà
  User.findOne({username: req.body.username}).then(data => {
    // si l'utilisateur n'existe pas, on va créer un nouvel utilisateur
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);

      const newUser = new User ({
        username: req.body.username,
        firstname: req.body.firstname,
        password: hash,
        avatar: req.body.avatar,
        token: uid2(32),
      });
      newUser.save().then(res.json({result: true, token: newUser.token, avatar: newUser.avatar, firstname: newUser.firstname}))
  
    } else {
      // si l'utilisateur existe déjà
      res.json({result: false, erreur: 'user already exists'});
    }
  });
});

/*POST SignIN user */
router.post('/signin', async function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
   if (!checkBody(req.body, ['username', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }
  //On recherche si l'utilisateur existe
  await User.findOne({ username: req.body.username }).then(data => {
    //Si l'utilisateur existe on compare son password renseigné
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({ result: true, token: data.token, avatar: data.avatar, firstname: data.firstname });
    } else {
      res.json({ result: false, error: 'User not found or wrong password' });
    }
  });
});
module.exports = router;
