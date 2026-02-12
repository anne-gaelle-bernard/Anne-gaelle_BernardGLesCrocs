import "./App.css";

function App() {
  return (
    <div style={{ textAlign: "center", marginTop: 40 }}>
      <h1>GLesCrocs</h1>

      <a href="http://localhost:3000">Reserve ton plat </a>
    </div>
  );
}

export default App;

import axios from "axios";
import { useState } from "react";

function App() {
  const [nom, setNom] = useState("");

  const commander = async () => {
    await axios.post("http://localhost:3000/commande", {
      nom
    });
    alert("Commande envoyée !");
  };

  return (
    <div>
      <h1>Commander</h1>

      <input
        placeholder="Nom"
        onChange={e => setNom(e.target.value)}
      />

      <button onClick={commander}>
        Commander
      </button>
    </div>
  );
}

export default App;

import axios from "axios";
import { useEffect, useState } from "react";

function App() {
  const [cmds, setCmds] = useState([]);

  const charger = async () => {
    const res = await axios.get(
      "http://localhost:3000/commandes"
    );
    setCmds(res.data);
  };

  useEffect(() => {
    charger();
  }, []);

  const valider = async id => {
    await axios.put(
      `http://localhost:3000/commande/${id}/valider`
    );
    charger();
  };

  return (
    <div>
      <h1>Admin</h1>

      {cmds.map(c => (
        <div key={c.id}>
          {c.client_nom} — {c.statut}

          <button onClick={() => valider(c.id)}>
            Valider
          </button>
        </div>
      ))}
    </div>
  );
}

export default App;
app.get("/commandes", (req, res) => {
  db.query("SELECT * FROM commandes", (err, data) =>
    res.send(data)
  );
});

import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

socket.on("update_file", () => {
  charger();
});
