export default function extraerImporteTotal(texto) {
  // 🔹 Buscar TOTAL que NO sea BASE IMPONIBLE TOTAL
  const regex = /(?:^|\s)TOTAL\s+([\d.,]+)\s*€/i;

  const match = texto.match(regex);

  if (match) {
    return parseFloat(match[1].replace(/\./g, "").replace(",", "."));
  }

  return null;
}

/*export default function extraerImporteTotal(texto) {
  const regex = /TOTAL\s*(FACTURA|A PAGAR|IMPORTE)?\s*[:\-]?\s*([\d.,]+)/gi;

  let max = null;
  let match;

  while ((match = regex.exec(texto)) !== null) {
    const valor = parseFloat(match[2].replace(",", "."));
    if (!max || valor > max) max = valor;
  }

  if (max === null) {
    const regexMultilinea = /TOTAL[\s\r\n]+([\d.,]+)\s*€/i;
    const matchMultilinea = texto.match(regexMultilinea);

    if (matchMultilinea) {
      const valor = parseFloat(
        matchMultilinea[1].replace(/\./g, "").replace(",", "."),
      );

      if (!isNaN(valor)) {
        max = valor;
      }
    }
  }

  return max;
}
*/
