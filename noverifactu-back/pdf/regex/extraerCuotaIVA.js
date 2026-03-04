export default function extraerCuotaIVA(texto, conceptos = []) {
  // 1️⃣ Caso moderno: calcular desde conceptos
  if (Array.isArray(conceptos) && conceptos.length > 0) {
    const cuotaIVA = conceptos
      .filter(
        (c) =>
          c.tipoImpuesto === "IVA" &&
          typeof c.precioUnitario === "number" &&
          typeof c.cantidad === "number" &&
          typeof c.tipoImpositivo === "number",
      )
      .map((c) => {
        const base = c.cantidad * c.precioUnitario;
        return base * (c.tipoImpositivo / 100);
      })
      .reduce((a, b) => a + b, 0);

    return Math.round(cuotaIVA * 100) / 100;
  }

  // 2️⃣ Fallback antiguo: CUOTA TOTAL
  const matchCuotaTotal = texto.match(/CUOTA\s*TOTAL\s*[:\-]?\s*([\d.,]+)/i);

  if (matchCuotaTotal) {
    return parseFloat(matchCuotaTotal[1].replace(",", "."));
  }

  // 3️⃣ Último recurso: IVA directo
  const matchIVA = texto.match(/(TOTAL\s*)?IVA\s*[:\-]?\s*([\d.,]+)/i);

  if (matchIVA) {
    return parseFloat(matchIVA[2].replace(",", "."));
  }

  return null;
}

/*export default function extraerCuotaIVA(texto, impuestos = []) {
  // 1️⃣ Caso correcto: suma de cuotas IVA
  const cuotasIVA = impuestos
    .filter((i) => i.tipoImpuesto === "IVA" && typeof i.cuota === "number")
    .map((i) => i.cuota);

  if (cuotasIVA.length > 0) {
    return Math.round(cuotasIVA.reduce((a, b) => a + b, 0) * 100) / 100;
  }

  // 2️⃣ Fallback: "CUOTA TOTAL"
  const matchCuotaTotal = texto.match(/CUOTA\s*TOTAL\s*[:\-]?\s*([\d.,]+)/i);

  if (matchCuotaTotal) {
    return parseFloat(matchCuotaTotal[1].replace(",", "."));
  }

  // 3️⃣ Último recurso: "IVA: xx"
  const matchIVA = texto.match(/(TOTAL\s*)?IVA\s*[:\-]?\s*([\d.,]+)/i);

  if (matchIVA) {
    return parseFloat(matchIVA[2].replace(",", "."));
  }

  return null;
}
*/
