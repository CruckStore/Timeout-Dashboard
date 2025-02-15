const express = require('express');
const router = express.Router();

let timerState = {
  time: 0,
  isRunning: false,
};

router.get('/', (req, res) => {
  res.json(timerState);
});

router.post('/update', (req, res) => {
  const { time, isRunning } = req.body;
  timerState = { time, isRunning };
  res.json(timerState);
});

module.exports = router;
