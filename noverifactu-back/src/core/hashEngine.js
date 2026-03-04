{
  /*
ORDEN CANÓNICO DEL HASH DE REGISTRO DE FACTURACIÓN

1. SIF_ID
2. NIF_EMISOR
3. NUM_FACTURA_COMPLETO
4. FECHA_HORA_EMISION (ISO-8601 con ms)
5. IMPORTE_TOTAL
6. NUM_REGISTRO_ANTERIOR
7. NUM_REGISTRO_ACTUAL
8.   HASH_ANTERIOR
    */
}
import crypto from "crypto";

/**
 * Construye la cadena canónica EXACTA para el hash
 */
export function generarHashRegistro({
  sifId,
  nifEmisor,
  numeroFacturaCompleto,
  fechaHoraEmision,
  importeTotal,
  numRegistroAnterior,
  numRegistroActual,
  hashAnterior,
}) {
  const cadenaCanonica = [
    sifId,
    nifEmisor,
    numeroFacturaCompleto,
    fechaHoraEmision,
    Number(importeTotal).toFixed(2),
    numRegistroAnterior,
    numRegistroActual,
    hashAnterior,
  ].join("|");

  return crypto.createHash("sha256").update(cadenaCanonica).digest("hex");
}
