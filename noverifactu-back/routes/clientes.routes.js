import express from "express";
import pool from "../db/db.js";
import auth from "../middleware/auth.js";
import checkMantenimiento from "../middleware/checkMantenimiento.js";

const router = express.Router();

router.put("/clientes/:id", auth, checkMantenimiento, async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const clienteId = req.params.id;
    const { nombre, direccion, codigo_postal, ciudad, pais, email, telefono } =
      req.body;

    await pool.query(
      `
    UPDATE clientes
    SET nombre = ?, direccion = ?, codigo_postal = ?, ciudad = ?, pais = ?, email = ?, telefono = ?
    WHERE id = ? AND usuario_id = ?
    `,
      [
        nombre,
        direccion,
        codigo_postal,
        ciudad,
        pais,
        email,
        telefono,
        clienteId,
        usuarioId,
      ],
    );

    res.json({ ok: true });
  } catch (error) {
    console.error("Error actualizando cliente:", error);
    res.status(500).json({ error: "Error actualizando cliente" });
  }
});
router.patch(
  "/clientes/:id/desactivar",
  auth,
  checkMantenimiento,
  async (req, res) => {
    try {
      const usuarioId = req.usuario.id;
      const clienteId = req.params.id;

      await pool.query(
        `
      UPDATE clientes
      SET activo = 0
      WHERE id = ? AND usuario_id = ?
      `,
        [clienteId, usuarioId],
      );

      res.json({ ok: true });
    } catch (error) {
      console.error("Error desactivando cliente:", error);
      res.status(500).json({ error: "Error desactivando cliente" });
    }
  },
);

router.patch(
  "/clientes/:id/reactivar",
  auth,
  checkMantenimiento,
  async (req, res) => {
    try {
      const usuarioId = req.usuario.id;
      const clienteId = req.params.id;

      await pool.query(
        `
      UPDATE clientes
      SET activo = 1
      WHERE id = ? AND usuario_id = ?
      `,
        [clienteId, usuarioId],
      );

      res.json({ ok: true });
    } catch (error) {
      console.error("Error reactivando cliente:", error);
      res.status(500).json({ error: "Error reactivando cliente" });
    }
  },
);

router.get("/clientes/buscar", auth, async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { q = "" } = req.query;

    const like = `%${q}%`;

    const [rows] = await pool.query(
      `
      SELECT id, nombre, nif
      FROM clientes
      WHERE usuario_id = ?
      AND (
        nombre LIKE ?
        OR nif LIKE ?
      )
      ORDER BY nombre
      LIMIT 20
      `,
      [usuarioId, like, like],
    );

    res.json({ clientes: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error buscando clientes" });
  }
});

router.get("/clientes", auth, async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const [rows] = await pool.query(
      `
    SELECT id, nif, nombre, direccion, codigo_postal, ciudad, pais, email, telefono, activo
    FROM clientes
    WHERE usuario_id = ?
    ORDER BY nombre ASC
    `,
      [usuarioId],
    );

    res.json({ clientes: rows });
  } catch (error) {
    console.error("Error encontrando cliente:", error);
    res.status(500).json({ error: "Error encontrando cliente" });
  }
});

router.post("/clientes", auth, checkMantenimiento, async (req, res) => {
  try {
    const { nif, nombre, direccion, email } = req.body;
    const usuarioId = req.usuario.id;

    if (!nif) return res.status(400).json({ error: "NIF obligatorio" });

    const [existente] = await pool.query(
      `SELECT id FROM clientes WHERE usuario_id = ? AND nif = ?`,
      [usuarioId, nif],
    );

    if (existente.length) {
      return res.json({ id: existente[0].id, reutilizado: true });
    }

    const [result] = await pool.query(
      `INSERT INTO clientes (usuario_id, nif, nombre, direccion, email)
     VALUES (?, ?, ?, ?, ?)`,
      [usuarioId, nif, nombre || null, direccion || null, email || null],
    );

    res.json({ id: result.insertId, creado: true });
  } catch (error) {
    console.error("Error creando cliente:", error);
    res.status(500).json({ error: "Error creando cliente" });
  }
});

export default router;
