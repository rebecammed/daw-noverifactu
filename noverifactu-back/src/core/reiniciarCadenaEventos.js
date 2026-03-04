import { generarHashEvento } from "../core/hashEngineEventos.js";
import { HASH_GENESIS } from "../config/hashing.js";
import pool from "../../db/db.js";
export async function iniciarNuevaCadenaEventos(usuarioId) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [ultimo] = await connection.query(
      `
      SELECT num_evento
      FROM log_eventos
      WHERE usuario_id = ?
      ORDER BY num_evento DESC
      LIMIT 1
      FOR UPDATE
      `,
      [usuarioId],
    );

    const numEventoAnterior = ultimo.length > 0 ? ultimo[0].num_evento : 0;
    const numEventoActual = numEventoAnterior + 1;

    const fechaEvento = new Date().toISOString();

    const hashEvento = generarHashEvento({
      usuarioId,
      tipoEvento: "INICIO_NUEVA_CADENA_EVENTOS",
      descripcion:
        "Inicio de nueva etapa por corrección estructural del sistema",
      fechaHoraEvento: fechaEvento,
      numEventoAnterior,
      numEventoActual,
      hashAnterior: HASH_GENESIS, // 🔥 SOLO esto cambia
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
        "INICIO_NUEVA_CADENA_EVENTOS",
        "Inicio de nueva etapa por corrección estructural del sistema",
        fechaEvento,
        hashEvento,
        HASH_GENESIS,
        numEventoActual,
      ],
    );

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

/*import { generarHashEvento } from "../core/hashEngineEventos.js";
import { HASH_GENESIS } from "../config/hashing.js";
import pool from "../../db/db.js";

export async function iniciarNuevaCadenaEventos(usuarioId) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1️⃣ Obtener el siguiente num_evento físico
    const [[{ siguiente }]] = await connection.query(
      `
      SELECT COALESCE(MAX(num_evento), 0) + 1 AS siguiente
      FROM log_eventos
      WHERE usuario_id = ?
      `,
      [usuarioId],
    );

    const numEventoFisico = siguiente;

    // 2️⃣ Fecha ISO (STRING, no Date)
    const fechaEvento = new Date().toISOString();

    // 3️⃣ Calcular hash del nuevo génesis lógico
    const hashEvento = generarHashEvento({
      usuarioId,
      tipoEvento: "INICIO_NUEVA_CADENA_EVENTOS",
      descripcion: "Inicio de nueva cadena por corrección del formato temporal",
      fechaHoraEvento: fechaEvento,
      numEventoAnterior: 0, // 👈 génesis lógico
      numEventoActual: 1, // 👈 empieza nueva cadena
      hashAnterior: HASH_GENESIS,
    });

    // 4️⃣ Insertar evento
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
        "INICIO_NUEVA_CADENA_EVENTOS",
        "Inicio de nueva cadena por corrección del formato temporal",
        fechaEvento,
        hashEvento,
        HASH_GENESIS,
        numEventoFisico,
      ],
    );

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}
*/
