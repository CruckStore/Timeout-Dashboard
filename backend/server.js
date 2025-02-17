const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const timerRoutes = require('./routes/timer');

app.use('/api/auth', authRoutes);
app.use('/api/timer', timerRoutes);

const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

let timerState = {
  time: 0,
  isRunning: false,
};

io.on('connection', (socket) => {
  console.log('Nouvelle connexion:', socket.id);

  socket.emit('timerUpdate', timerState);

  socket.on('updateTimer', (data) => {
    timerState.time = data.time;
    timerState.isRunning = data.isRunning;
    io.emit('timerUpdate', timerState);
  });

  socket.on('toggleTimer', (data) => {
    timerState.isRunning = data.isRunning;
    io.emit('timerUpdate', timerState);
  });

  socket.on("mainScreenUpdate", (data) => {
    io.emit("mainScreenUpdate", data);
  });

  socket.on('disconnect', () => {
    console.log('Déconnexion:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
});
