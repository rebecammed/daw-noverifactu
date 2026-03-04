import { generarHashRegistro } from "./hashEngine.js";
import { extraerDatosDesdeXML } from "./extraerDatosDesdeXML.js";
import { HASH_GENESIS } from "../config/hashing.js";

export function comprobarIntegridad(registros) {
  const errores = [];

  for (let i = 0; i < registros.length; i++) {
    const actual = registros[i];
    const anterior = i > 0 ? registros[i - 1] : null;
    const sif = actual.sif_nombre;
    const datos = extraerDatosDesdeXML(actual.contenido_registro);
    const cadenaCanonicaDebug = [
      sif,
      datos.nifEmisor,
      datos.numeroFacturaCompleto,
      datos.fechaHoraExpedicion,
      datos.importeTotal,
      anterior ? anterior.num_registro : 0,
      actual.num_registro,
      anterior ? anterior.hash_registro_actual : HASH_GENESIS,
    ].join("|");

    console.log("RECALCULO:");
    console.log(cadenaCanonicaDebug);

    const hashRecalculado = generarHashRegistro({
      sifId: sif,
      nifEmisor: datos.nifEmisor,
      numeroFacturaCompleto: datos.numeroFacturaCompleto,
      fechaHoraEmision: datos.fechaHoraExpedicion,
      importeTotal: datos.importeTotal,
      numRegistroAnterior: anterior ? anterior.num_registro : 0,
      numRegistroActual: actual.num_registro,
      hashAnterior: anterior ? anterior.hash_registro_actual : HASH_GENESIS,
    });
    console.log("==== DEBUG REGISTRO ====");
    console.log("ID:", actual.id);
    console.log("HASH GUARDADO:", actual.hash_registro_actual);
    console.log("HASH RECALCULADO:", hashRecalculado);
    console.log("NUM ANT:", anterior ? anterior.num_registro : 0);
    console.log("NUM ACT:", actual.num_registro);
    console.log("HASH ANT GUARDADO:", actual.hash_registro_anterior);
    console.log(
      "HASH ANT ESPERADO:",
      anterior ? anterior.hash_registro_actual : HASH_GENESIS,
    );

    // 1️⃣ hash propio
    if (hashRecalculado !== actual.hash_registro_actual) {
      errores.push({
        registro: actual.id,
        tipo: "HASH_INCORRECTO",
      });
    }

    // 2️⃣ hash anterior
    if (i === 0) {
      if (actual.hash_registro_anterior !== HASH_GENESIS) {
        errores.push({
          registro: actual.id,
          tipo: "GENESIS_INCORRECTO",
        });
      }
    } else {
      if (actual.hash_registro_anterior !== anterior.hash_registro_actual) {
        errores.push({
          registro: actual.id,
          tipo: "CADENA_ROTA",
        });
      }
    }
  }

  return errores;
}
