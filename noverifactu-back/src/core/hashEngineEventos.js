import crypto from "crypto";
import { SIF } from "../config/sif.js";
/*
ORDEN CANÓNICO DEL HASH DE EVENTOS

1. SIF_ID
2. USUARIO_ID
3. TIPO_EVENTO
4. DESCRIPCION
5. FECHA_HORA_EVENTO
6. NUM_EVENTO_ANTERIOR
7. NUM_EVENTO_ACTUAL
8. HASH_EVENTO_ANTERIOR
*/

export function generarHashEvento({
  SIF_ID,
  usuarioId,
  tipoEvento,
  descripcion,
  fechaHoraEvento,
  numEventoAnterior,
  numEventoActual,
  hashAnterior,
}) {
  const cadenaCanonica = [
    SIF_ID,
    usuarioId,
    tipoEvento,
    descripcion,
    fechaHoraEvento,
    numEventoAnterior,
    numEventoActual,
    hashAnterior,
  ].join("|");

  console.log("CADENA CANONICA EVENTO:");
  console.log(cadenaCanonica);

  return crypto.createHash("sha256").update(cadenaCanonica).digest("hex");
}
