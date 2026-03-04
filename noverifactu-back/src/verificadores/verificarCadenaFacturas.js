//no se está aplicando porque de momento no funciona

import pool from "../../db/db.js";
import { generarHashRegistro } from "../core/hashEngine.js";
import { HASH_GENESIS } from "../config/hashing.js";
import { SIF } from "../config/sif.js";

async function verificarCadenaFacturas(usuarioId) {
  const [registros] = await pool.query(
    `
    SELECT
      r.id,
      r.num_registro,
      r.hash_registro_anterior,
      r.hash_registro_actual,
      r.fecha_hora_generacion,
      f.numero_factura,
      f.fecha_expedicion,
      f.importe_total,
      df.nif AS nif_emisor
    FROM registros_facturacion r
    JOIN facturas f ON f.registro_id = r.id
    JOIN datos_fiscales df ON df.usuario_id = r.usuario_id
    WHERE r.usuario_id = ?
    ORDER BY r.num_registro ASC
    `,
    [usuarioId],
  );

  if (registros.length === 0) {
    return {
      valida: true,
      mensaje: "No hay registros de facturación para este usuario",
    };
  }

  let hashEsperado = HASH_GENESIS;

  for (const registro of registros) {
    // 1️⃣ Comprobar hash_anterior
    if (registro.hash_registro_anterior !== hashEsperado) {
      return {
        valida: false,
        registro: registro.num_registro,
        motivo: "hash_registro_anterior no coincide",
        hashEsperado,
        hashEncontrado: registro.hash_registro_anterior,
      };
    }

    const cadenaCanonica = [
      SIF.ID,
      registro.nif_emisor,
      registro.numero_factura,
      registro.fecha_hora_generacion,
      Number(registro.importe_total).toFixed(2),
      registro.num_registro - 1,
      registro.num_registro,
      hashEsperado,
    ].join("|");
    console.log("verificar", cadenaCanonica);

    // 2️⃣ Recalcular hash_actual
    const hashCalculado = generarHashRegistro({
      nifEmisor: registro.nif_emisor,
      numeroFacturaCompleto: registro.numero_factura,
      fechaHoraEmision: registro.fecha_hora_generacion,
      importeTotal: Number(registro.importe_total).toFixed(2),
      numRegistroAnterior: registro.num_registro - 1,
      numRegistroActual: registro.num_registro,
      hashAnterior: hashEsperado,
    });

    if (hashCalculado !== registro.hash_registro_actual) {
      return {
        valida: false,
        registro: registro.num_registro,
        motivo: "hash_actual no coincide",
        hashEsperado: hashCalculado,
        hashEncontrado: registro.hash_registro_actual,
      };
    }

    // 3️⃣ Avanzar cadena
    hashEsperado = registro.hash_registro_actual;
  }

  return {
    valida: true,
    mensaje: "Cadena de facturación válida",
    totalRegistros: registros.length,
  };
}

// 🔹 EJECUCIÓN DIRECTA DEL SCRIPT
const USUARIO_PRUEBA = 2;

verificarCadenaFacturas(USUARIO_PRUEBA)
  .then((resultado) => {
    console.log("Resultado verificación:");
    console.dir(resultado, { depth: null });
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error verificando cadena:", error);
    process.exit(1);
  });
