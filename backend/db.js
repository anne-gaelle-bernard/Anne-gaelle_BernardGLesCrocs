import mysql from "mysql2/promise";

const CREATE_ORDERS_TABLE = "CREATE TABLE IF NOT EXISTS orders (id INT AUTO_INCREMENT PRIMARY KEY, queue_number INT NOT NULL, dish_name VARCHAR(100) NOT NULL, customer_name VARCHAR(100) DEFAULT NULL, status VARCHAR(20) NOT NULL DEFAULT 'waiting', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)";
const CREATE_MENU_TABLE = "CREATE TABLE IF NOT EXISTS menu (id INT AUTO_INCREMENT PRIMARY KEY, dish_name VARCHAR(100) NOT NULL, name VARCHAR(100) NOT NULL, price DECIMAL(10,2) NOT NULL DEFAULT 0, available TINYINT(1) NOT NULL DEFAULT 1)";
const CREATE_ADMINS_TABLE = "CREATE TABLE IF NOT EXISTS admins (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(50) NOT NULL UNIQUE, password VARCHAR(50) NOT NULL)";

const SEED_MENU_SQL = "INSERT INTO menu (dish_name,name,price,available) VALUES ('Pates','Pates',0,1),('Poulet','Poulet',0,1),('Salade','Salade',0,1),('Sandwich','Sandwich',0,1)";
const SEED_ADMIN_SQL = "INSERT INTO admins (username,password) VALUES ('admin','demo')";

export async function initDb(config) {
  const root = await mysql.createConnection({
    host: config.DB_HOST,
    user: config.DB_USER,
    password: config.DB_PASSWORD
  });

  await root.query(`CREATE DATABASE IF NOT EXISTS ${config.DB_NAME}`);
  await root.end();

  const db = mysql.createPool({
    host: config.DB_HOST,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
  });

  await db.query(CREATE_ORDERS_TABLE);
  await db.query(CREATE_MENU_TABLE);
  await db.query(CREATE_ADMINS_TABLE);

  // Add customer_name column if it doesn't exist
  try {
    await db.query("ALTER TABLE orders ADD COLUMN customer_name VARCHAR(100) DEFAULT NULL");
  } catch (err) {
    // Column already exists, ignore error
  }

  const [menuRows] = await db.query("SELECT COUNT(*) AS total FROM menu");
  if ((menuRows[0].total || 0) === 0) {
    await db.query(SEED_MENU_SQL);
  }

  const [adminRows] = await db.query("SELECT COUNT(*) AS total FROM admins WHERE username='admin'");
  if ((adminRows[0].total || 0) === 0) {
    await db.query(SEED_ADMIN_SQL);
  }

  return db;
}
