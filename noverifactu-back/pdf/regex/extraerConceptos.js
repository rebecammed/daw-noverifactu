import extraerTiposImpositivos from "./extraerTiposImpositivos.js";

export default function extraerConceptos(texto) {
  const conceptos = [];

  const tiposDetectados = extraerTiposImpositivos(texto);
  const tipoImpuesto = Object.keys(tiposDetectados)[0] || "IVA";
  const tipoImpositivo = tiposDetectados[tipoImpuesto] || 0;

  const bloqueMatch = texto.match(
    /CONCEPTO[\s\S]*?(?=BASE IMPONIBLE|IVA|TOTAL)/i,
  );

  if (!bloqueMatch) return conceptos;

  const bloque = bloqueMatch[0];

  /*
    Patrón OCR actual:
    DISEÑO DE LOGOTIPO 1100 € 100 €
  */

  const regexFila = /(.+?)\s+(\d+)\s*€\s+([\d.,]+)\s*€/g;

  let match;

  while ((match = regexFila.exec(bloque)) !== null) {
    const descripcion = match[1].trim();
    const numeroPegado = match[2]; // ej: 1100
    const totalLinea = parseFloat(match[3].replace(",", "."));

    if (!descripcion || isNaN(totalLinea)) continue;

    let cantidad = 1;
    let precioUnitario = totalLinea;

    /*
      🔥 Lógica inteligente OCR:
      Si 1100 y total = 100
      → cantidad = 1
      → precio = 100
    */
    if (
      numeroPegado.length > String(totalLinea).length &&
      numeroPegado.endsWith(String(totalLinea).replace(".", ""))
    ) {
      const posibleCantidad = numeroPegado.slice(
        0,
        numeroPegado.length - String(totalLinea).replace(".", "").length,
      );

      if (!isNaN(numeroPegado) && totalLinea > 0) {
        const posibleCantidad = parseInt(numeroPegado) / totalLinea;

        if (Number.isInteger(posibleCantidad)) {
          cantidad = posibleCantidad;
          precioUnitario = totalLinea / posibleCantidad;
        }
      }
    }

    conceptos.push({
      descripcion,
      cantidad,
      precioUnitario,
      tipoImpositivo,
      tipoImpuesto,
    });
  }

  return conceptos;
}

/*export default function extraerConceptos(texto) {
  const conceptos = [];

  // 1️⃣ Aislar bloque de tabla
  const bloqueMatch = texto.match(/CONCEPTO[\s\S]*?(?=\bIVA\b|\bTOTAL\b)/i);

  if (!bloqueMatch) return conceptos;

  const bloque = bloqueMatch[0];

  // 2️⃣ Dividir en líneas limpias
  const lineas = bloque
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  let i = 0;

  while (i < lineas.length) {
    const descripcion = lineas[i];

    // Saltar cabecera
    if (/CONCEPTO/i.test(descripcion)) {
      i++;
      continue;
    }

    // Intentar leer siguiente patrón
    const cantidad = lineas[i + 1];
    const precio = lineas[i + 2];
    const total = lineas[i + 3];

    if (
      cantidad &&
      precio &&
      total &&
      /^\d+([.,]\d+)?$/.test(cantidad.replace(",", ".")) &&
      /€/.test(precio) &&
      /€/.test(total)
    ) {
      const cantidadNum = parseFloat(cantidad.replace(",", "."));

      const precioNum = parseFloat(precio.replace("€", "").replace(",", "."));

      conceptos.push({
        descripcion,
        cantidad: cantidadNum,
        precioUnitario: precioNum,
        tipoImpositivo: 21, // 🔥 provisional (se puede mejorar luego)
        tipoImpuesto: "IVA",
      });

      i += 4;
    } else {
      i++;
    }
  }

  return conceptos;
}
*/
/*export default function extraerConceptos(texto) {
  const conceptos = [];

  // Divide por bloques tipo "IMPUESTO 1", "IMPUESTO 2", etc.
  const bloques = texto.split(/IMPUESTO\s+\d+/i);

  for (const bloque of bloques) {
    // Tipo de impuesto
    const tipoMatch = bloque.match(/\b(IVA|IRPF|IGIC|IPSI)\b/i);
    if (!tipoMatch) continue;

    const tipoImpuesto = tipoMatch[1].toUpperCase();

    // Tipo impositivo (%)
    const tipoMatchPct = bloque.match(/([\d.,]+)\s*%/);
    if (!tipoMatchPct) continue;

    const tipoImpositivo = parseFloat(tipoMatchPct[1].replace(",", "."));

    // Base imponible
    const baseMatch = bloque.match(/BASE\s*IMPONIBLE\s*[:\-]?\s*([\d.,]+)/i);
    if (!baseMatch) continue;

    const base = parseFloat(baseMatch[1].replace(",", "."));

    // Cuota
    const cuotaMatch = bloque.match(/CUOTA\s*[:\-]?\s*([\d.,]+)/i);
    if (!cuotaMatch) continue;

    const cuota = parseFloat(cuotaMatch[1].replace(",", "."));

    conceptos.push({
      tipoImpuesto,
      tipoImpositivo,
      base,
      cuota,
    });
  }

  return conceptos;
}
*/
