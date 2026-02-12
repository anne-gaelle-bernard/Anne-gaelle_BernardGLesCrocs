import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const app = express();
const server = createServer(app);
const io = new Server(server);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});


let queue = [];
let id = 0;

io.on("connection", (socket) => {
  socket.emit("update", queue);

  socket.on("join", (data) => {
    queue.push({ id: id++, name: data.name, food: data.food });
    io.emit("update", queue);
  });

  socket.on("leave", (personId) => {
    queue = queue.filter(p => p.id !== personId);
    io.emit("update", queue);
  });

  socket.on("updateFood", (data) => {
    let person = queue.find(p => p.id === data.id);
    if (person) person.food = data.food;
    io.emit("update", queue);
  });
});

server.listen(3000, () => console.log("Server running on port 3000"));

const db = require("./db");

app.post("/commande", (req, res) => {
  const { nom } = req.body;

  db.query(
    "INSERT INTO commandes (client_nom, statut) VALUES (?, 'en_attente')",
    [nom],
    (err, result) => {
      if (err) return res.send(err);

      io.emit("update_file");

      res.send("Commande créée");
    }
  );
});

app.put("/commande/:id/valider", (req, res) => {
  db.query(
    "UPDATE commandes SET statut='validee' WHERE id=?",
    [req.params.id],
    () => {
      io.emit("update_file");
      res.send("Commande validée");
    }
  );
});
