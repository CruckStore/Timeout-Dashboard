const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>API Status Page</title>
        <style>
          body {
            background-color: #f9f9f9;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 30px;
            color: #333;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            text-align: center;
          }
          h1 {
            font-size: 2em;
            margin-bottom: 10px;
          }
          p.description {
            font-size: 1.1em;
            color: #666;
          }
          .status-cards {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 20px;
            margin-top: 30px;
          }
          .card {
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            padding: 20px;
            flex: 1 1 250px;
            max-width: 300px;
          }
          .card h2 {
            font-size: 1.2em;
            margin: 0 0 10px;
          }
          .endpoint {
            display: block;
            margin-top: 10px;
            padding: 10px;
            border-radius: 4px;
            text-decoration: none;
            font-weight: bold;
          }
          .up {
            background-color: #e8f5e9;
            color: #2e7d32;
          }
          .down {
            background-color: #ffebee;
            color: #c62828;
          }
          footer {
            margin-top: 40px;
            font-size: 0.9em;
            color: #777;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>API Status Page</h1>
          <p class="description">Bienvenue sur l'API. Voici l'état des endpoints :</p>
          <div class="status-cards">
            <div class="card">
              <h2>Authentification</h2>
              <a class="endpoint up" href="/api/auth" target="_blank">/api/auth</a>
            </div>
            <div class="card">
              <h2>Timer</h2>
              <a class="endpoint up" href="/api/timer" target="_blank">/api/timer</a>
            </div>
            <div class="card">
              <h2>Socket.IO</h2>
              <span class="endpoint up">En ligne</span>
            </div>
          </div>
          <footer>
            <p>Le serveur fonctionne correctement et est en écoute sur ce port.</p>
          </footer>
        </div>
      </body>
    </html>
  `);
});

const authRoutes = require("./routes/auth");
const timerRoutes = require("./routes/timer");
app.use("/api/auth", authRoutes);
app.use("/api/timer", timerRoutes);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

let timerState = {
  time: 0,
  isRunning: false,
};

io.on("connection", (socket) => {
  console.log("Nouvelle connexion:", socket.id);

  socket.emit("timerUpdate", timerState);

  socket.on("updateTimer", (data) => {
    timerState.time = data.time;
    timerState.isRunning = data.isRunning;
    io.emit("timerUpdate", timerState);
  });

  socket.on("toggleTimer", (data) => {
    timerState.isRunning = data.isRunning;
    io.emit("timerUpdate", timerState);
  });

  socket.on("mainScreenUpdate", (data) => {
    io.emit("mainScreenUpdate", data);
  });

  socket.on("secondaryScreenUpdate", (data) => {
    io.emit("secondaryScreenUpdate", data);
  });

  socket.on("disconnect", () => {
    console.log("Déconnexion:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
});
