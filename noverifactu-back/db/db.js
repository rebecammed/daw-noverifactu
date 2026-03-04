import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "", // pon aquí tu contraseña si tienes
  database: "proyecto_noverifactu",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
