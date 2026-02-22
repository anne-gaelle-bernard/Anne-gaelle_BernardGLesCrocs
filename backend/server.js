import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { initDb } from "./db.js";
import { registerRoutes } from "./routes.js";

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const config = {
  PORT: process.env.PORT || 3000,
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_USER: process.env.DB_USER || "root",
  DB_PASSWORD: process.env.DB_PASSWORD || "",
  DB_NAME: process.env.DB_NAME || "glescrocs"
};

app.use(cors());
app.use(express.json());

initDb(config)
  .then((db) => {
    const { pushQueue } = registerRoutes(app, db, io);

    io.on("connection", (socket) => {
      pushQueue().catch(() => {});
      socket.on("disconnect", () => {});
    });

    server.listen(config.PORT, () => {
      console.log("server started on port", config.PORT);
    });
  })
  .catch((error) => {
    console.error("database start error:", error.message);
    process.exit(1);
  });
