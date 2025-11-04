// /lib/db.ts
import mysql from "mysql2/promise";

let pool: mysql.Pool | null = null;

async function initDB() {
  if (!pool) {
    try {
      pool = mysql.createPool({
        host: "localhost",
        user: "root",
        password: "",
        database: "naw_rentcar",
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });

      // Probar la conexión
      const connection = await pool.getConnection();
      console.log("✅ Conectado correctamente a la base de datos naw_rentcar.");
      connection.release();
    } catch (error) {
      console.error("❌ Error al conectar con la base de datos:", error);
    }
  }
  return pool!;
}

const db = await initDB();

export default db;
