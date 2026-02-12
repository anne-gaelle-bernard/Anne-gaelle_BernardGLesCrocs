const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "glescrocs"
});

db.connect(err => {
  if (err) console.log(err);
  else console.log("DB connectée");
});

module.exports = db;
