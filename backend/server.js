const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

let requestLogs = [];
let socketLogs = [];
let connectedSockets = {};

app.use((req, res, next) => {
  const logEntry = {
    method: req.method,
    url: req.url,
    time: new Date().toISOString(),
  };
  requestLogs.push(logEntry);
  if (requestLogs.length > 50) {
    requestLogs.shift();
  }
  io.emit("newRequest", logEntry);
  next();
});

app.get("/logs", (req, res) => {
  res.json(requestLogs);
});

app.get("/socket-logs", (req, res) => {
  res.json(socketLogs);
});

app.get("/stop", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Stop? Vraiment?</title>
        <style>
          body { 
            background-color: #ffebee; 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            text-align: center; 
            padding: 50px; 
            color: #c62828; 
            position: relative; 
            height: 100vh; 
            overflow: hidden; 
          }
          h1 { font-size: 3em; }
          p { font-size: 1.2em; }
          a { 
            display: inline-block; 
            margin-top: 20px; 
            padding: 10px 20px; 
            background-color: #c62828; 
            color: #fff; 
            text-decoration: none; 
            border-radius: 5px; 
            font-size: 1.2em; 
          }
          a:hover { background-color: #8e0000; }
          #runawayBtn {
            position: absolute;
            top: 70%;
            left: 50%;
            transform: translate(-50%, -50%);
            padding: 10px 20px;
            background-color: #c62828;
            color: #fff;
            border: none;
            border-radius: 5px;
            font-size: 1.2em;
            cursor: pointer;
            transition: background-color 0.2s ease, transform 0.2s ease;
          }
          #runawayBtn:hover {
            background-color: #8e0000;
            transform: translate(-50%, -50%) rotate(20deg);
          }
          @keyframes shake {
            0% { transform: translate(0, 0); }
            20% { transform: translate(-5px, 0); }
            40% { transform: translate(5px, 0); }
            60% { transform: translate(-5px, 0); }
            80% { transform: translate(5px, 0); }
            100% { transform: translate(0, 0); }
          }
          .funText {
            font-size: 1.4em;
            margin-top: 20px;
            animation: shake 0.5s infinite;
          }
        </style>
      </head>
      <body>
        <h1>Stop? Vraiment?</h1>
        <p>Tu veux arrêter la magie de l'API ?! Mais c'est pas cool, non ?</p>
        <p class="funText">Non, non, non, on va pas te laisser faire ça !</p>
        <p>Regarde plutôt notre super chaîne YouTube :</p>
        <a href="https://www.youtube.com/@timeoutlive" target="_blank">TimeoutLive</a>
        <br><br>
        <button id="runawayBtn" onclick="alert('T\'as raté, le bouton s\'enfuit !')">Supprimer</button>
        <script>
          const btn = document.getElementById("runawayBtn");
          document.body.addEventListener("mousemove", (e) => {
            const rect = btn.getBoundingClientRect();
            const btnX = rect.left + rect.width / 2;
            const btnY = rect.top + rect.height / 2;
            const dist = Math.hypot(e.clientX - btnX, e.clientY - btnY);
            if(dist < 80) {
              const newLeft = Math.random() * (window.innerWidth - rect.width);
              const newTop = Math.random() * (window.innerHeight - rect.height);
              btn.style.left = newLeft + "px";
              btn.style.top = newTop + "px";
            }
          });
        </script>
      </body>
    </html>
  `);
});

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>API Status & Real-Time Logs</title>
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
          .status-cards, .frontend-links, .request-logs, .clients-section {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 20px;
            margin-top: 30px;
          }
          .card, .link-card, .log-card, .client-card {
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            padding: 20px;
            flex: 1 1 250px;
            max-width: 300px;
            transition: transform 0.2s ease;
          }
          .card:hover, .link-card:hover, .log-card:hover, .client-card:hover {
            transform: translateY(-5px);
          }
          .card h2, .link-card h2, .log-card h2, .client-card h2 {
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
          #logs, #socketLogs, #clients {
            max-height: 200px;
            overflow-y: auto;
            text-align: left;
            font-size: 0.9em;
            border: 1px solid #ddd;
            padding: 10px;
            border-radius: 4px;
            background: #fff;
          }
          #socketLogs {
            max-height: 200px;
          }
          footer {
            margin-top: 40px;
            font-size: 0.9em;
            color: #777;
          }
        </style>
        <script src="/socket.io/socket.io.js"></script>
        <script>
          const socket = io();

          socket.on("newRequest", (log) => {
            const logsContainer = document.getElementById("logs");
            if (logsContainer) {
              const logItem = document.createElement("div");
              logItem.textContent = "[" + log.time + "] " + log.method + " " + log.url;
              logsContainer.appendChild(logItem);
              logsContainer.scrollTop = logsContainer.scrollHeight;
            }
          });

          socket.on("newSocketEvent", (log) => {
            const socketLogsContainer = document.getElementById("socketLogs");
            if (socketLogsContainer) {
              const logItem = document.createElement("div");
              logItem.textContent =
                "[" + log.time + "] socketId=" + log.socketId +
                " event=" + log.event +
                " data=" + JSON.stringify(log.data);
              socketLogsContainer.appendChild(logItem);
              socketLogsContainer.scrollTop = socketLogsContainer.scrollHeight;
            }
          });

          socket.on("clientsUpdate", (clients) => {
            const clientsContainer = document.getElementById("clients");
            if (clientsContainer) {
              clientsContainer.innerHTML = "";
              clients.forEach(clientId => {
                const clientItem = document.createElement("div");
                clientItem.textContent = clientId;
                clientsContainer.appendChild(clientItem);
              });
            }
          });
        </script>
      </head>
      <body>
        <div class="container">
          <h1>API Status & Real-Time Logs</h1>
          <p class="description">
            Bienvenue sur l'API. Vous trouverez ici l'état des endpoints, des liens vers le Frontend, ainsi que les logs en temps réel (HTTP et Socket.IO).
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

          <h2 style="margin-top:40px;">Requêtes HTTP en temps réel</h2>
          <div class="request-logs">
            <div class="log-card">
              <h2>Logs API</h2>
              <div id="logs"></div>
            </div>
          </div>

          <h2 style="margin-top:40px;">Événements Socket.IO en temps réel</h2>
          <div class="request-logs">
            <div class="log-card">
              <h2>Logs Socket</h2>
              <div id="socketLogs"></div>
            </div>
          </div>

          <h2 style="margin-top:40px;">Clients connectés</h2>
          <div class="clients-section">
            <div class="client-card">
              <h2>Instances Socket</h2>
              <div id="clients"></div>
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

function logSocketEvent(socket, eventName, data) {
  const logEntry = {
    event: eventName,
    data,
    time: new Date().toISOString(),
    socketId: socket.id,
  };
  socketLogs.push(logEntry);
  if (socketLogs.length > 50) {
    socketLogs.shift();
  }
  io.emit("newSocketEvent", logEntry);
}

io.on("connection", (socket) => {
  console.log("Nouvelle connexion:", socket.id);
  connectedSockets[socket.id] = socket.id;
  io.emit("clientsUpdate", Object.keys(connectedSockets));

  socket.emit("timerUpdate", timerState);

  socket.on("updateTimer", (data) => {
    logSocketEvent(socket, "updateTimer", data);

    timerState.time = data.time;
    timerState.isRunning = data.isRunning;
    io.emit("timerUpdate", timerState);
  });

  socket.on("toggleTimer", (data) => {
    logSocketEvent(socket, "toggleTimer", data);

    timerState.isRunning = data.isRunning;
    io.emit("timerUpdate", timerState);
  });

  socket.on("mainScreenUpdate", (data) => {
    logSocketEvent(socket, "mainScreenUpdate", data);
    io.emit("mainScreenUpdate", data);
  });

  socket.on("secondaryScreenUpdate", (data) => {
    logSocketEvent(socket, "secondaryScreenUpdate", data);
    io.emit("secondaryScreenUpdate", data);
  });

  socket.on("disconnect", () => {
    console.log("Déconnexion:", socket.id);
    delete connectedSockets[socket.id];
    io.emit("clientsUpdate", Object.keys(connectedSockets));
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
});
