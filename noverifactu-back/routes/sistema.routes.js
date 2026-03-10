import express from "express";
import pool from "../db/db.js";
import auth from "../middleware/auth.js";
import checkMantenimiento from "../middleware/checkMantenimiento.js";
import { registrarEvento } from "../utils/eventos.js";
import { estaEnMantenimiento } from "../src/core/systemState.js";

const router = express.Router();

router.get("/sif", auth, async (req, res) => {
  const usuarioId = req.usuario.id;

  try {
    const [rows] = await pool.query(
      `
      SELECT
        id,
        nombre,
        nif,
        version,
        fecha_declaracion_responsable,
        activo,
        created_at
      FROM sif_configuracion
      WHERE usuario_id = ? OR es_global = 1
      ORDER BY activo DESC, created_at DESC
      `,
      [usuarioId],
    );
    const sifActivo = rows.find((s) => s.activo === 1);
    res.json({
      ok: true,
      sifs: rows,
      sifActivo,
    });
  } catch (error) {
    console.error("Error obteniendo SIF:", error);
    res.status(500).json({
      ok: false,
      error: "Error obteniendo los SIF",
    });
  }
});

router.post("/sif", auth, checkMantenimiento, async (req, res) => {
  const usuarioId = req.usuario.id;
  const { nombre, nif, version, fecha_declaracion_responsable } = req.body;

  if (!nombre || !nif || !version || !fecha_declaracion_responsable) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  try {
    // desactivar los anteriores
    await pool.query(
      "UPDATE sif_configuracion SET activo = 0 WHERE usuario_id = ?",
      [usuarioId],
    );

    const [result] = await pool.query(
      `
      INSERT INTO sif_configuracion
      (usuario_id, nombre, nif, version, fecha_declaracion_responsable, activo, created_at)
      VALUES (?, ?, ?, ?, ?, 1, NOW())
      `,
      [usuarioId, nombre, nif, version, fecha_declaracion_responsable],
    );

    await registrarEvento(
      usuarioId,
      "SIF_CREADO",
      `Alta de SIF ${nombre} v${version}`,
    );

    res.json({ ok: true, id: result.insertId });
  } catch (e) {
    console.error("Error creando SIF:", e);
    res.status(500).json({ error: "Error creando SIF" });
  }
});

router.patch("/sif/:id/activar", auth, checkMantenimiento, async (req, res) => {
  const usuarioId = req.usuario.id;
  const sifId = req.params.id;
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    await conn.query(
      "UPDATE sif_configuracion SET activo = 0 WHERE usuario_id = ?",
      [usuarioId],
    );

    const [r] = await conn.query(
      "UPDATE sif_configuracion SET activo = 1 WHERE id = ? AND usuario_id = ?",
      [sifId, usuarioId],
    );

    if (r.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "SIF no encontrado" });
    }
    await conn.commit();
    await registrarEvento(
      usuarioId,
      "SIF_ACTIVADO",
      `Activación de SIF id ${sifId}`,
    );

    res.json({ ok: true });
  } catch (e) {
    await conn.rollback();
    console.error("Error activando SIF:", e);
    res.status(500).json({ error: "Error activando SIF" });
  } finally {
    conn.release();
  }
});

router.get("/status", (req, res) => {
  res.json({
    mantenimiento: estaEnMantenimiento(),
  });
});

export default router;
