export function registerRoutes(app, db, io) {
  const q = (sql, params = []) => db.query(sql, params);
  const getOrders = async () => (await q("SELECT * FROM orders ORDER BY id ASC"))[0];
  const pushQueue = async () => io.emit("queue_update", await getOrders());

  const safe = (fn) => async (req, res) => {
    try {
      await fn(req, res);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  const getDishName = (req, res) => {
    const dishName = req.body?.dish_name;
    if (!dishName) {
      res.status(400).json({ error: "dish_name required" });
      return null;
    }
    return dishName;
  };

  const updateOrderStatus = (status) => safe(async (req, res) => {
    await q("UPDATE orders SET status=? WHERE id=?", [status, Number(req.params.id)]);
    await pushQueue();
    res.json({ ok: true });
  });

  app.get("/api/health", safe(async (_, res) => {
    await q("SELECT 1");
    res.json({ ok: true, mode: "mysql" });
  }));

  app.post("/api/admin/login", (req, res) => {
    if (req.body?.username === "admin" && req.body?.password === "demo") {
      return res.json({ ok: true, username: "admin" });
    }
    return res.status(401).json({ error: "Bad credentials" });
  });

  app.get("/api/menu", safe(async (_, res) => {
    const [rows] = await q("SELECT id,dish_name,available FROM menu WHERE available=1 ORDER BY id ASC");
    res.json(rows);
  }));

  app.post("/api/menu", safe(async (req, res) => {
    const dishName = getDishName(req, res);
    if (!dishName) return;
    await q("INSERT INTO menu (dish_name,name,price,available) VALUES (?,?,0,1)", [dishName, dishName]);
    res.json({ ok: true });
  }));

  app.get("/api/orders", safe(async (_, res) => {
    res.json(await getOrders());
  }));

  app.post("/api/orders", safe(async (req, res) => {
    const dishName = getDishName(req, res);
    if (!dishName) return;

    const customerName = req.body.customer_name || null;

    const [maxRows] = await q("SELECT MAX(queue_number) AS maxNum FROM orders");
    const nextNumber = (maxRows[0].maxNum || 0) + 1;
    const [result] = await q("INSERT INTO orders (queue_number,dish_name,customer_name,status) VALUES (?,?,?,'waiting')", [nextNumber, dishName, customerName]);

    const order = { id: result.insertId, queue_number: nextNumber, dish_name: dishName, customer_name: customerName, status: "waiting" };
    io.emit("order_created", order);
    await pushQueue();
    res.json(order);
  }));

  app.put("/api/orders/:id/ready", updateOrderStatus("ready"));
  app.put("/api/orders/:id/served", updateOrderStatus("served"));

  return { pushQueue };
}
