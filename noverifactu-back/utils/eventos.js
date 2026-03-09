import pool from "../db/db.js";
import { generarHashEvento } from "../src/core/hashEngineEventos.js";
import { HASH_GENESIS } from "../src/config/hashing.js";

export async function registrarEvento(usuarioId, tipoEvento, descripcion) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const [SIF] = await connection.query(
      `SELECT nombre 
      FROM sif_configuracion
      WHERE activo = 1 AND es_global = 1`,
    );

    const [ultimo] = await connection.query(
      `
      SELECT hash_evento, num_evento
      FROM log_eventos
      WHERE usuario_id = ?
      ORDER BY num_evento DESC
      LIMIT 1
      FOR UPDATE
      `,
      [usuarioId],
    );

    const hashEventoAnterior =
      ultimo.length > 0 ? ultimo[0].hash_evento : HASH_GENESIS;

    const numEventoAnterior = ultimo.length > 0 ? ultimo[0].num_evento : 0;

    const numEventoActual = numEventoAnterior + 1;

    const fechaHoraEvento = new Date().toISOString();
    const SIF_ID = SIF[0].nombre;

    const hashEventoActual = generarHashEvento({
      SIF_ID,
      usuarioId,
      tipoEvento,
      descripcion,
      fechaHoraEvento,
      numEventoAnterior,
      numEventoActual,
      hashAnterior: hashEventoAnterior,
    });

    await connection.query(
      `
      INSERT INTO log_eventos
      (
        usuario_id,
        tipo_evento,
        descripcion,
        fecha_evento,
        hash_evento,
        hash_evento_anterior,
        num_evento
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        usuarioId,
        tipoEvento,
        descripcion,
        fechaHoraEvento,
        hashEventoActual,
        hashEventoAnterior,
        numEventoActual,
      ],
    );

    await connection.commit();
  } catch (e) {
    await connection.rollback();
    throw e;
  } finally {
    connection.release();
  }
}
