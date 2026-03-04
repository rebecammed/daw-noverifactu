export default function extraerNumeroFactura(texto) {
  const patrones = [
    // Factura nº: 10 | Factura n° 10 | Factura número 10
    /FACTURA\s*(?:Nº|N°|NO|NÚMERO|NUMERO)\s*[:\-]?\s*([A-Z0-9][A-Z0-9\-\/]*)/i,

    // Nº Factura: 10
    /(?:Nº|N°)\s*FACTURA\s*[:\-]?\s*([A-Z0-9][A-Z0-9\-\/]*)/i,

    // Número de factura: X-2026-01
    /NÚMERO\s+DE\s+FACTURA\s*[:\-]?\s*([A-Z0-9][A-Z0-9\-\/]*)/i,
  ];

  for (const regex of patrones) {
    const match = texto.match(regex);
    if (match) {
      return match[1];
    }
  }

  return null;
}
