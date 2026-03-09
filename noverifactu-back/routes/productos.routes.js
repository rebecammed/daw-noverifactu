import express from "express";
import pool from "../db/db.js";
import auth from "../middleware/auth.js";
import checkMantenimiento from "../middleware/checkMantenimiento.js";

const router = express.Router();

router.get("/productos", auth, async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const [rows] = await pool.query(
      `
    SELECT id, nombre, descripcion, precio, tipo_iva, activo
    FROM productos
    WHERE usuario_id = ?
    ORDER BY nombre ASC
    `,
      [usuarioId],
    );

    res.json({ productos: rows });
  } catch (error) {
    console.error("Error encontrando productos:", error);
    res.status(500).json({ error: "Error encontrando productos" });
  }
});

router.post("/productos", auth, checkMantenimiento, async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { nombre, descripcion, precio, tipo_iva } = req.body;

    if (!nombre || !precio) {
      return res.status(400).json({ error: "Nombre y precio obligatorios" });
    }

    const [result] = await pool.query(
      `
    INSERT INTO productos (usuario_id, nombre, descripcion, precio, tipo_iva)
    VALUES (?, ?, ?, ?, ?)
    `,
      [usuarioId, nombre, descripcion || null, precio, tipo_iva || 21],
    );

    res.json({ id: result.insertId });
  } catch (error) {
    console.error("Error creando producto:", error);
    res.status(500).json({ error: "Error creando producto" });
  }
});

router.put("/productos/:id", auth, checkMantenimiento, async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const productoId = req.params.id;

    const { nombre, descripcion, precio, tipo_iva } = req.body;

    await pool.query(
      `
    UPDATE productos
    SET nombre = ?, descripcion = ?, precio = ?, tipo_iva = ?
    WHERE id = ? AND usuario_id = ?
    `,
      [nombre, descripcion, precio, tipo_iva, productoId, usuarioId],
    );

    res.json({ ok: true });
  } catch (error) {
    console.error("Error actualizando producto:", error);
    res.status(500).json({ error: "Error actualizando producto" });
  }
});
router.patch(
  "/productos/:id/desactivar",
  auth,
  checkMantenimiento,
  async (req, res) => {
    try {
      const usuarioId = req.usuario.id;
      const productoId = req.params.id;

      await pool.query(
        `
      UPDATE productos
      SET activo = 0
      WHERE id = ? AND usuario_id = ?
      `,
        [productoId, usuarioId],
      );

      res.json({ ok: true });
    } catch (error) {
      console.error("Error desactivando producto:", error);
      res.status(500).json({ error: "Error desactivando producto" });
    }
  },
);

router.patch(
  "/productos/:id/reactivar",
  auth,
  checkMantenimiento,
  async (req, res) => {
    try {
      const usuarioId = req.usuario.id;
      const productoId = req.params.id;

      await pool.query(
        `
      UPDATE productos
      SET activo = 1
      WHERE id = ? AND usuario_id = ?
      `,
        [productoId, usuarioId],
      );

      res.json({ ok: true });
    } catch (error) {
      console.error("Error reactivando producto:", error);
      res.status(500).json({ error: "Error reactivando producto" });
    }
  },
);
router.get("/productos/buscar", auth, async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { q = "" } = req.query;

    const like = `%${q}%`;

    const [rows] = await pool.query(
      `
      SELECT id, nombre, precio, tipo_iva, unidad
      FROM productos
      WHERE usuario_id = ?
      AND activo = 1
      AND nombre LIKE ?
      ORDER BY nombre
      LIMIT 20
      `,
      [usuarioId, like],
    );

    res.json({ productos: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error buscando productos" });
  }
});

export default router;
