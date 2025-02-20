const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// Tableau pour stocker les logs de requêtes (limité aux 50 dernières)
let requestLogs = [];

// Middleware pour logger chaque requête et l'envoyer via Socket.IO
app.use((req, res, next) => {
  const logEntry = {
    method: req.method,
    url: req.url,
    time: new Date().toISOString(),
  };
  requestLogs.push(logEntry);
  if (requestLogs.length > 50) {
    requestLogs.shift(); // conserver les 50 dernières
  }
  // Émet le log à tous les clients connectés
  io.emit("newRequest", logEntry);
  next();
});

// Page d'accueil avec status, liens frontend et logs en temps réel
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>API Status & Real-Time Requests</title>
        <style>
          body {
            background-color: #f9f9f9;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 30px;
            color: #333;
          }
          .container {
            max-width: 900px;
            margin: 0 auto;
            text-align: center;
          }
          h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
          }
          p.description {
            font-size: 1.1em;
            color: #666;
          }
          .status-cards, .frontend-links, .request-logs {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 20px;
            margin-top: 30px;
          }
          .card, .link-card, .log-card {
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            padding: 20px;
            flex: 1 1 250px;
            max-width: 300px;
            transition: transform 0.2s ease;
          }
          .card:hover, .link-card:hover, .log-card:hover {
            transform: translateY(-5px);
          }
          .card h2, .link-card h2, .log-card h2 {
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
          #logs {
            max-height: 200px;
            overflow-y: auto;
            text-align: left;
            font-size: 0.9em;
          }
          footer {
            margin-top: 40px;
            font-size: 0.9em;
            color: #777;
          }
        </style>
        <script src="/socket.io/socket.io.js"></script>
        <script>
          // Se connecter à Socket.IO
          const socket = io();
          // Lorsque l'événement newRequest est reçu, on ajoute la requête à la liste
          socket.on("newRequest", (log) => {
            const logsContainer = document.getElementById("logs");
            if(logsContainer) {
              const logItem = document.createElement("div");
              logItem.textContent = "[" + log.time + "] " + log.method + " " + log.url;
              logsContainer.appendChild(logItem);
              // Faire défiler vers le bas
              logsContainer.scrollTop = logsContainer.scrollHeight;
            }
          });
        </script>
      </head>
      <body>
        <div class="container">
          <h1>API Status Page</h1>
          <p class="description">
            Bienvenue sur l'API. Voici l'état des endpoints, des liens vers le Frontend et un flux en temps réel des requêtes.
          </p>
          
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
          
          <h2 style="margin-top:40px;">Frontend</h2>
          <div class="frontend-links">
            <div class="link-card">
              <h2>Main Screen</h2>
              <a class="endpoint up" href="http://82.153.202.154:3000/main" target="_blank">Accéder au Main Screen</a>
            </div>
            <div class="link-card">
              <h2>Secondary Screen</h2>
              <a class="endpoint up" href="http://82.153.202.154:3000/secondary" target="_blank">Accéder au Secondary Screen</a>
            </div>
            <div class="link-card">
              <h2>Countdown</h2>
              <a class="endpoint up" href="http://82.153.202.154:3000/countdown" target="_blank">Accéder au Countdown</a>
            </div>
          </div>
          
          <h2 style="margin-top:40px;">Requêtes en temps réel</h2>
          <div class="request-logs">
            <div class="log-card">
              <h2>Logs API</h2>
              <div id="logs" style="border:1px solid #ddd; padding:10px; border-radius:4px; background:#fff;"></div>
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
