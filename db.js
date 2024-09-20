const { Client } = require("pg");

let DB_URI;

if (process.env.NODE_ENV !== "test") {
  DB_URI = "postgresql:///biztime";
} else {
  DB_URI = "postgresql:///biztime_test";
}

let db = new Client({
  connectionString: DB_URI,
});

db.connect((err) => {
  if (err) {
    console.error("Connection error:", err.stack);
  } else {
    console.log("Database connected successfully");
  }
});

module.exports = db;
