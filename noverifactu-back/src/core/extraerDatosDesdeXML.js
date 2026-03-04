import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true,
});

export function extraerDatosDesdeXML(xml) {
  const parsed = parser.parse(xml);

  // ========= FACTURA NORMAL =========
  if (parsed.FacturaNoVerifactu) {
    const f = parsed.FacturaNoVerifactu;

    let baseTotal = 0;
    let cuotaTotal = 0;

    const desglose = f.DesgloseFiscal;

    // 🔹 CASO NUEVO: <Impuestos><Impuesto>...</Impuesto></Impuestos>
    if (desglose?.Impuestos?.Impuesto) {
      const lista = Array.isArray(desglose.Impuestos.Impuesto)
        ? desglose.Impuestos.Impuesto
        : [desglose.Impuestos.Impuesto];

      for (const imp of lista) {
        baseTotal += Number(imp.BaseImponible || 0);
        cuotaTotal += Number(imp.Cuota || 0);
      }
    }

    // 🔹 CASO ANTIGUO: <BaseImponible> + <Impuestos> sin <Impuesto>
    else if (desglose?.BaseImponible && desglose?.Impuestos) {
      baseTotal = Number(desglose.BaseImponible || 0);
      cuotaTotal = Number(desglose.Impuestos.Cuota || 0);
    }

    const importeTotal = baseTotal + cuotaTotal;

    return {
      sifId: f.Trazabilidad.IdentificacionSIF.IdSoftware,
      nifEmisor: f.Cabecera.NIFEmisor,
      numeroFacturaCompleto: f.DatosFactura.NumeroFacturaCompleto,
      fechaHoraExpedicion: f.DatosFactura.FechaHoraExpedicion,
      importeTotal: Number(importeTotal).toFixed(2),
      numRegAnt: Number(f.Trazabilidad.NumRegistroAnterior),
      numRegAct: Number(f.Trazabilidad.NumRegistroActual),
      hashAnterior: f.Trazabilidad.HashRegistroAnterior,
      hashDocumento: f.Trazabilidad.HashRegistroPropio,
    };
  }

  // ========= RECTIFICATIVA =========
  if (parsed.RegistroFacturaRectificativaNoVerifactu) {
    const f = parsed.RegistroFacturaRectificativaNoVerifactu;

    let baseTotal = 0;
    let cuotaTotal = 0;

    const impuestos = f.DesgloseFiscal.Impuestos.Impuesto;
    const lista = Array.isArray(impuestos) ? impuestos : [impuestos];

    for (const imp of lista) {
      baseTotal += Number(imp.BaseImponible || 0);
      cuotaTotal += Number(imp.Cuota || 0);
    }

    const importeTotal = baseTotal + cuotaTotal;

    return {
      sifId: f.Trazabilidad.IdentificacionSIF.IdSoftware,
      nifEmisor: f.Cabecera.NIFEmisor,
      numeroFacturaCompleto:
        f.DatosFacturaRectificativa.NumeroFacturaRectificativa,
      fechaHoraExpedicion: f.DatosFacturaRectificativa.FechaHoraExpedicion,
      importeTotal: Number(importeTotal).toFixed(2),
      numRegAnt: Number(f.Trazabilidad.NumRegistroAnterior),
      numRegAct: Number(f.Trazabilidad.NumRegistroActual),
      hashAnterior: f.Trazabilidad.HashRegistroAnterior,
      hashDocumento: f.Trazabilidad?.HashRegistroPropio,
    };
  }

  // ========= ANULACIÓN =========
  if (parsed.RegistroAnulacionNoVerifactu) {
    const f = parsed.RegistroAnulacionNoVerifactu;

    return {
      sifId: f.Trazabilidad.IdentificacionSIF.IdSoftware,
      nifEmisor: f.Cabecera.NIFEmisor,
      numeroFacturaCompleto: f.ReferenciaRegistroAnulado.NumeroFacturaOriginal,
      fechaHoraExpedicion: f.Cabecera.FechaHoraAnulacion,
      importeTotal: "0.00",
      numRegAnt: Number(f.Trazabilidad.NumRegistroAnterior),
      numRegAct: Number(f.Trazabilidad.NumRegistroActual),
      hashAnterior: f.Trazabilidad.HashRegistroAnterior,
      hashDocumento: f.Trazabilidad?.HashRegistroPropio,
    };
  }

  throw new Error("XML con estructura desconocida");
}
