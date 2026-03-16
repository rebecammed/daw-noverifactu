import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import pool from "./db/db.js";

// routers
import authRoutes from "./routes/auth.routes.js";
import usuariosRoutes from "./routes/usuario.routes.js";
import clientesRoutes from "./routes/clientes.routes.js";
import productosRoutes from "./routes/productos.routes.js";
import facturasCreateRoutes from "./routes/facturas/facturas.crear.routes.js";
import facturasReadRoutes from "./routes/facturas/facturas.ver.routes.js";
import facturasDownloadRoutes from "./routes/facturas/facturas.descargar.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import sistemaRoutes from "./routes/sistema.routes.js";
import integridadRoutes from "./routes/integridad.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log("process.cwd():", process.cwd());
console.log("__dirname:", __dirname);
dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();

app.use(
  cors({
    origin: "https://daw-noverifactu.vercel.app",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// montar routers
app.use("/api", authRoutes);
app.use("/api", usuariosRoutes);
app.use("/api", clientesRoutes);
app.use("/api", productosRoutes);
app.use("/api/facturas", facturasCreateRoutes);
app.use("/api/facturas", facturasReadRoutes);
app.use("/api/facturas", facturasDownloadRoutes);
app.use("/api", adminRoutes);
app.use("/api", sistemaRoutes);
app.use("/api", integridadRoutes);

app.listen(PORT, () => {
  console.log(`Backend escuchando en puerto ${PORT}`);
});
