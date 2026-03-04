export function extraerCamposDesdeJSON(json) {
  if (json.FacturaNoVerifactu) {
    const f = json.FacturaNoVerifactu;

    let baseTotal = 0;
    let cuotaTotal = 0;

    const impuestos = f.DesgloseFiscal?.Impuestos?.Impuesto || [];

    const lista = Array.isArray(impuestos) ? impuestos : [impuestos];

    for (const imp of lista) {
      baseTotal += Number(imp.BaseImponible || 0);
      cuotaTotal += Number(imp.Cuota || 0);
    }

    const importeTotal = baseTotal + cuotaTotal;

    return {
      sifId: f.Trazabilidad.IdentificacionSIF.IdSoftware,
      nifEmisor: f.Cabecera.NIFEmisor,
      numeroFacturaCompleto: f.DatosFactura.NumeroFacturaCompleto,
      fechaHoraExpedicion: f.DatosFactura.FechaHoraExpedicion,
      importeTotal: Number(importeTotal).toFixed(2),
      numRegAnt: f.Trazabilidad.NumRegistroAnterior,
      numRegAct: f.Trazabilidad.NumRegistroActual,
      hashAnterior: f.Trazabilidad.HashRegistroAnterior,
      hashDocumento: f.Trazabilidad?.HashRegistroPropio,
    };
  }

  if (json.RegistroFacturaRectificativaNoVerifactu) {
    const f = json.RegistroFacturaRectificativaNoVerifactu;

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
      numRegAnt: f.Trazabilidad.NumRegistroAnterior,
      numRegAct: f.Trazabilidad.NumRegistroActual,
      hashAnterior: f.Trazabilidad.HashRegistroAnterior,
      hashDocumento: f.Trazabilidad?.HashRegistroPropio,
    };
  }

  if (json.RegistroAnulacionNoVerifactu) {
    const f = json.RegistroAnulacionNoVerifactu;

    return {
      sifId: f.Trazabilidad.IdentificacionSIF.IdSoftware,
      nifEmisor: f.Cabecera.NIFEmisor,
      numeroFacturaCompleto: f.ReferenciaRegistroAnulado.NumeroFacturaOriginal,
      fechaHoraExpedicion: f.Cabecera.FechaHoraAnulacion,
      importeTotal: "0.00",
      numRegAnt: f.Trazabilidad.NumRegistroAnterior,
      numRegAct: f.Trazabilidad.NumRegistroActual,
      hashAnterior: f.Trazabilidad.HashRegistroAnterior,
      hashDocumento: f.Trazabilidad?.HashRegistroPropio,
    };
  }

  throw new Error("JSON con estructura desconocida");
}
