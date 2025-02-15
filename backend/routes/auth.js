const express = require('express');
const router = express.Router();
const userData = require('../data/user.json');

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if(username === userData.username && password === userData.password) {
    res.status(200).json({ message: 'Connexion réussie' });
  } else {
    res.status(401).json({ message: 'Identifiants invalides' });
  }
});

module.exports = router;
