const { Client } = require("pg");

// Ensure this URL is correct and matches the configuration
let DB_URI = "postgresql:///biztime";

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
