import normalizarTextoOCR from "./regex/normalizarTexto.js";

function convertirFechaAEstandar(fechaStr) {
  if (!fechaStr) return null;

  const [fechaParte, horaParte = "00:00"] = fechaStr.split(" ");
  const [dia, mes, anio] = fechaParte.split("/");

  return `${anio}-${mes}-${dia}T${horaParte}`;
}

export default function parsearFactura(textoCrudo) {
  console.log("========== TEXTO CRUDO ==========");
  console.log(textoCrudo);

  const texto = normalizarTextoOCR(textoCrudo);
  console.log("========== TEXTO NORMALIZADO ==========");
  console.log(texto);
  const numeroFactura = texto.match(/N[ºo]\s*(\d+)/i)?.[1] ?? null;
  console.log("Número de factura encontrado:", numeroFactura);

  const fecha =
    texto.match(
      /Fecha de (?:emisión|expedición):?\s*([0-9]{2}\/[0-9]{2}\/[0-9]{4}(?:\s+[0-9]{2}:[0-9]{2})?)/i,
    )?.[1] ?? null;
  console.log("Fecha encontrada:", fecha);

  const ivaMatch = texto.match(/IVA\s+(\d+)%\s+([\d.,]+)\s*€/i);

  const porcentajeIVA = ivaMatch?.[1] ?? null;
  const cuotaIVA = ivaMatch?.[2] ?? null;

  console.log("Cuota IVA:", cuotaIVA);
  console.log("Porcentaje IVA:", porcentajeIVA);
  // TOTAL correcto (último TOTAL del documento)
  const totalMatches = [...texto.matchAll(/\bTOTAL\b\s+([\d.,]+)\s*€/gi)];

  const total = totalMatches.length
    ? totalMatches[totalMatches.length - 1][1]
    : null;
  /*const totalMatches = [
  ...textoPlano.matchAll(/(?:^|\s)TOTAL\s+([\d.,]+)\s*€/gi)
];
*/
  console.log("Total encontrado:", total);
  const conceptoRegex = /^(.+?)\s+(\d+)\s+([\d.,]+)\s*€\s+([\d.,]+)\s*€$/gm;
  function parseImporte(valor) {
    return valor
      ? parseFloat(valor.replace(/\./g, "").replace(",", "."))
      : null;
  }

  const conceptos = [];
  let match;
  console.log("========== BUSCANDO CONCEPTOS ==========");

  while ((match = conceptoRegex.exec(texto)) !== null) {
    console.log("Concepto detectado:", match);
    conceptos.push({
      descripcion: match[1].trim(),
      cantidad: parseInt(match[2], 10),
      precioUnitario: parseImporte(match[3]),
      total: parseImporte(match[4]),
    });
  }
  console.log("Conceptos finales:", conceptos);

  console.log("========== RESULTADO FINAL ==========");

  const resultado = {
    numeroFactura,
    fechaExpedicion: convertirFechaAEstandar(fecha),
    conceptos,
    porcentajeIVA,
    cuotaIVA,
    total,
  };

  console.log(resultado);

  return resultado;
}

/*import normalizarTextoOCR from "./regex/normalizarTexto.js";
import extraerNumeroFactura from "./regex/extraerNumFac.js";
import extraerFechaExpedicion from "./regex/extraerFecha.js";
import extraerImporteTotal from "./regex/extraerImporteTotal.js";
import extraerCuotaIVA from "./regex/extraerCuotaIVA.js";
import extraerConceptos from "./regex/extraerConceptos.js";
import validarMinimos from "./regex/validarMinima.js";

export default function parsearFactura(textoCrudo) {
  const texto = normalizarTextoOCR(textoCrudo);
  console.log("=== TEXTO OCR ===");
  console.log(texto);
  console.log("=================");
  const totalDetectado = extraerImporteTotal(texto);
  console.log("TOTAL DETECTADO:", totalDetectado);

  const conceptos = extraerConceptos(texto);
  const resultado = {
    numeroFactura: extraerNumeroFactura(texto),
    fechaExpedicion: extraerFechaExpedicion(texto),
    importeTotal: extraerImporteTotal(texto),
    conceptos,
    cuotaIVA: extraerCuotaIVA(texto, conceptos),
    tipoFactura: extraerTipoFactura(texto),
    nifEmisor: extraerNIFEmisor(texto),
    nifReceptor: extraerNIFReceptor(texto),
  };

  validarMinimos(resultado);

  return resultado;
}*/
