const Pool = require("pg").Pool;

const db = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false },
});

const dbConn = async () => {
  try {
    await db.connect();
    console.log("DB connected");
  } catch (err) {
    console.log(`Error: ${err.message}`);
  }
};

module.exports = { db, dbConn };
