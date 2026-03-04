const db = require("./db");

async function probarConexion() {
  try {
    const [rows] = await db.query("SELECT 1");
    console.log("✅ Conexión a MySQL correcta");
  } catch (error) {
    console.error("❌ Error conectando a MySQL:", error);
  } finally {
    process.exit();
  }
}

probarConexion();
