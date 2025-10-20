// config/db.js
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

let dbConnected = false;

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ MySQL connected successfully");
    dbConnected = true;
    connection.release();
  } catch (err) {
    console.error("❌ MySQL connection failed:", err);
    dbConnected = false;
  }
}

function isDbConnected() {
  return dbConnected;
}

module.exports = { pool, testConnection, isDbConnected };