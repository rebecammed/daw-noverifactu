import { HASH_GENESIS } from "../config/hashing.js";
import { generarHashEvento } from "../core/hashEngineEventos.js";
import pool from "../../db/db.js";

export async function comprobarIntegridadEventos(eventos) {
  const errores = [];

  if (!eventos.length) return errores;

  let inicioIndex = eventos.findIndex(
    (e) => e.tipo_evento === "INICIO_NUEVA_CADENA_EVENTOS",
  );

  // Si hay varios reinicios, coger el último
  if (inicioIndex !== -1) {
    for (let i = eventos.length - 1; i >= 0; i--) {
      if (eventos[i].tipo_evento === "INICIO_NUEVA_CADENA_EVENTOS") {
        inicioIndex = i;
        break;
      }
    }
  } else {
    // No hay reinicio → empieza desde el primer evento
    inicioIndex = 0;
  }

  const [SIF] = await pool.query(
    `SELECT nombre
    FROM sif_configuracion
    WHERE activo = 1 AND es_global = 1`,
  );

  const SIF_ID = SIF[0].nombre;

  // 2️⃣ Validar desde ese punto en adelante
  for (let i = inicioIndex; i < eventos.length; i++) {
    const actual = eventos[i];
    const anterior = i > 0 ? eventos[i - 1] : null;
    //const anterior = i > inicioIndex ? eventos[i - 1] : null;
    const hashAnteriorEsperado =
      actual.tipo_evento === "INICIO_NUEVA_CADENA_EVENTOS"
        ? HASH_GENESIS
        : anterior
          ? anterior.hash_evento
          : HASH_GENESIS;

    const numEventoAnterior = anterior ? anterior.num_evento : 0;

    const hashRecalculado = generarHashEvento({
      SIF_ID,
      usuarioId: actual.usuario_id,
      tipoEvento: actual.tipo_evento,
      descripcion: actual.descripcion,
      fechaHoraEvento: actual.fecha_evento,
      numEventoAnterior,
      numEventoActual: actual.num_evento,
      hashAnterior: hashAnteriorEsperado,
    });

    const cadenaCanonicaDebug = [
      SIF_ID,
      actual.usuario_id,
      actual.tipo_evento,
      actual.descripcion,
      actual.fecha_evento,
      numEventoAnterior,
      actual.num_evento,
      hashAnteriorEsperado,
    ].join("|");

    console.log("RECALCULO:");
    console.log(cadenaCanonicaDebug);
    console.log("HASH RECALCULADO:", hashRecalculado);
    console.log("HASH GUARDADO:", actual.hash_evento);
    console.log("------");

    if (actual.hash_evento_anterior !== hashAnteriorEsperado) {
      errores.push({
        num_evento: actual.id,
        error: "CADENA_ROTA",
      });
    }

    if (hashRecalculado !== actual.hash_evento) {
      errores.push({
        num_evento: actual.id,
        error: "HASH_INCORRECTO",
      });
    }
  }

  return errores;
}

/*
export function comprobarIntegridadEventos(eventos) {
  const errores = [];

  if (!eventos.length) return errores;

  // 1️⃣ Buscar último inicio de cadena
  let inicio = -1;
  for (let i = 0; i < eventos.length; i++) {
    if (eventos[i].tipo_evento === "INICIO_NUEVA_CADENA_EVENTOS") {
      inicio = i;
    }
  }

  if (inicio === -1) {
    errores.push({
      tipo: "SIN_INICIO_CADENA",
      mensaje: "No existe un inicio de cadena verificable",
    });
    return errores;
  }

  // 2️⃣ Validar el evento de reinicio (génesis lógico)
  const eventoInicio = eventos[inicio];

  const cadenaCanonicaInicio = [
    SIF.ID,
    eventoInicio.usuario_id,
    eventoInicio.tipo_evento,
    eventoInicio.descripcion,
    eventoInicio.fecha_evento,
    0,
    1,
    HASH_GENESIS,
  ].join("|");

  console.log("=== DEBUG INICIO CADENA ===");
  console.log("CADENA RECALCULADA:");
  console.log(cadenaCanonicaInicio);
  console.log("LONGITUD CADENA:", cadenaCanonicaInicio.length);

  const hashInicioRecalculado = generarHashEvento({
    usuarioId: eventoInicio.usuario_id,
    tipoEvento: eventoInicio.tipo_evento,
    descripcion: eventoInicio.descripcion,
    fechaHoraEvento: eventoInicio.fecha_evento,
    numEventoAnterior: 0,
    numEventoActual: 1,
    hashAnterior: HASH_GENESIS,
  });

  console.log("HASH RECALCULADO:", hashInicioRecalculado);
  console.log("HASH GUARDADO   :", eventoInicio.hash_evento);
  console.log("HASH ANTERIOR GUARDADO:", eventoInicio.hash_evento_anterior);
  console.log("HASH GENESIS ESPERADO :", HASH_GENESIS);
  console.log("===========================");
  if (eventoInicio.hash_evento_anterior !== HASH_GENESIS) {
    errores.push({
      num_evento: eventoInicio.id,
      error: "GENESIS_INCORRECTO",
    });
  }

  if (hashInicioRecalculado !== eventoInicio.hash_evento) {
    errores.push({
      num_evento: eventoInicio.id,
      error: "HASH_INCORRECTO",
    });
  }

  // 3️⃣ Validar resto de la cadena
  let hashAnterior = eventoInicio.hash_evento;
  let numLogicoAnterior = 1;

  for (let i = inicio + 1; i < eventos.length; i++) {
    const actual = eventos[i];
    const numLogicoActual = numLogicoAnterior + 1;

    const cadenaCanonicaDebug = [
      SIF.ID,
      actual.usuario_id,
      actual.tipo_evento,
      actual.descripcion,
      actual.fecha_evento,
      numLogicoAnterior,
      numLogicoActual,
      hashAnterior,
    ].join("|");

    console.log("RECALCULO:");
    console.log(cadenaCanonicaDebug);

    const hashRecalculado = generarHashEvento({
      usuarioId: actual.usuario_id,
      tipoEvento: actual.tipo_evento,
      descripcion: actual.descripcion,
      fechaHoraEvento: actual.fecha_evento,
      numEventoAnterior: numLogicoAnterior,
      numEventoActual: numLogicoActual,
      hashAnterior,
    });
    console.log("HASH RECALCULADO:", hashRecalculado);
    console.log("HASH GUARDADO:", actual.hash_evento);
    console.log("------");
    if (actual.hash_evento_anterior !== hashAnterior) {
      errores.push({
        num_evento: actual.id,
        error: "CADENA_ROTA",
      });
    }

    if (hashRecalculado !== actual.hash_evento) {
      errores.push({
        num_evento: actual.id,
        error: "HASH_INCORRECTO",
      });
    }

    hashAnterior = actual.hash_evento;
    numLogicoAnterior = numLogicoActual;
  }

  return errores;
}
*/
