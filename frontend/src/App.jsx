import { useEffect, useState } from "react";
import { io } from "socket.io-client";

function App() {
  const [page, setPage] = useState("client");
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [dishName, setDishName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [menuInput, setMenuInput] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLogged, setIsLogged] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");
  const [notif, setNotif] = useState("");

  useEffect(() => {
    const socket = io("http://localhost:3000");

    // get initial orders
    fetch("http://localhost:3000/api/orders")
      .then((r) => r.json())
      .then((data) => setOrders(data || []))
      .catch(() => console.log("orders error"));

    // get menu
    fetch("http://localhost:3000/api/menu")
      .then((r) => r.json())
      .then((data) => {
        setMenu(data || []);
        if (data && data.length > 0) {
          setDishName(data[0].dish_name);
        }
      })
      .catch(() => console.log("menu error"));

    // socket updates
    socket.on("queue_update", (data) => {
      setOrders(data || []);
    });

    socket.on("order_created", (data) => {
      console.log("new order", data);
    });

    return () => {
      socket.off("queue_update");
      socket.off("order_created");
      socket.disconnect();
    };
  }, []);

  const waiting = orders.filter((o) => o.status === "waiting");
  const ready = orders.filter((o) => o.status === "ready");
  const served = orders.filter((o) => o.status === "served");

  const currentServing = ready.length > 0 ? ready[0].queue_number : "-";

  function createOrder() {
    if (!dishName) return;

    fetch("http://localhost:3000/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dish_name: dishName, customer_name: customerName || null })
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.queue_number) {
          setNotif("Votre numéro est " + data.queue_number);
          setCustomerName("");
        }
      })
      .catch(() => console.log("create order error"));
  }

  function adminLogin() {
    fetch("http://localhost:3000/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    })
      .then((r) => {
        if (!r.ok) throw new Error("bad login");
        return r.json();
      })
      .then(() => {
        setIsLogged(true);
        setLoginMessage("");
      })
      .catch(() => {
        setLoginMessage("Identifiants incorrects");
      });
  }

  function markReady(id) {
    fetch("http://localhost:3000/api/orders/" + id + "/ready", {
      method: "PUT"
    }).catch(() => console.log("ready error"));
  }

  function markServed(id) {
    fetch("http://localhost:3000/api/orders/" + id + "/served", {
      method: "PUT"
    }).catch(() => console.log("served error"));
  }

  function addMenuItem() {
    if (!menuInput) return;

    fetch("http://localhost:3000/api/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dish_name: menuInput })
    })
      .then((r) => r.json())
      .then(() => {
        setMenuInput("");
        return fetch("http://localhost:3000/api/menu");
      })
      .then((r) => r.json())
      .then((data) => setMenu(data || []))
      .catch(() => console.log("menu add error"));
  }

  return (
    <div className="app">
      <h1>GLesCrocs</h1>

      <div className="tabs">
        <button onClick={() => setPage("client")}>Client</button>
        <button onClick={() => setPage("admin")}>Admin</button>
      </div>

      {page === "client" && (
        <div className="box">
          <h2>Menu du jour</h2>
          <select value={dishName} onChange={(e) => setDishName(e.target.value)}>
            {menu.map((m) => (
              <option key={m.id} value={m.dish_name}>
                {m.dish_name}
              </option>
            ))}
          </select>

          <input
            placeholder="Votre nom (optionnel)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />

          <button onClick={createOrder}>Passer commande</button>

          <p>{notif}</p>

          <h2>Numéro en cours</h2>
          <p className="big">{currentServing}</p>

          <h2>File d'attente</h2>
          {waiting.map((o) => (
            <div key={o.id} className="row">
              <span>#{o.queue_number}</span>
              <span>{o.dish_name}</span>
              {o.customer_name && <span>({o.customer_name})</span>}
            </div>
          ))}

          {ready.length > 0 && (
            <div className="notif">🔔 Un repas est prêt !</div>
          )}
        </div>
      )}

      {page === "admin" && (
        <div className="box">
          {!isLogged ? (
            <>
              <h2>Login admin</h2>
              <input
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <input
                placeholder="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button onClick={adminLogin}>Se connecter</button>
              <p className="error">{loginMessage}</p>
              <p>Demo: admin / demo</p>
            </>
          ) : (
            <>
              <h2>Dashboard admin</h2>

              <div className="admin-row">
                <input
                  placeholder="nouveau plat"
                  value={menuInput}
                  onChange={(e) => setMenuInput(e.target.value)}
                />
                <button onClick={addMenuItem}>Ajouter menu</button>
              </div>

              <h3>Commandes en attente</h3>
              {waiting.map((o) => (
                <div key={o.id} className="row">
                  <span>#{o.queue_number} - {o.dish_name}{o.customer_name ? " (" + o.customer_name + ")" : ""}</span>
                  <button onClick={() => markReady(o.id)}>Marquer prête</button>
                </div>
              ))}

              <h3>Commandes prêtes</h3>
              {ready.map((o) => (
                <div key={o.id} className="row">
                  <span>#{o.queue_number} - {o.dish_name}{o.customer_name ? " (" + o.customer_name + ")" : ""}</span>
                  <button onClick={() => markServed(o.id)}>Servie</button>
                </div>
              ))}

              <h3>Commandes servies</h3>
              {served.map((o) => (
                <div key={o.id} className="row">
                  <span>#{o.queue_number} - {o.dish_name}{o.customer_name ? " (" + o.customer_name + ")" : ""}</span>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
