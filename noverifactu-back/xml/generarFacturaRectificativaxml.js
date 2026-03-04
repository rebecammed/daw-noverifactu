import { create } from "xmlbuilder2";

export default function generarFacturaRectificativaXML(datosNormalizados) {
  const doc = create({ version: "1.0", encoding: "UTF-8" })
    .ele("RegistroFacturaRectificativaNoVerifactu", {
      xmlns: "https://noverifactu.local/esquema/rectificativa",
    })

    /* =========================
       CABECERA
    ========================= */
    .ele("Cabecera")
    .ele("TipoRegistro")
    .txt(datosNormalizados.cabecera.tipoRegistro)
    .up()
    .ele("NIFEmisor")
    .txt(datosNormalizados.cabecera.nifEmisor)
    .up()
    .ele("NIFReceptor")
    .txt(datosNormalizados.cabecera.nifReceptor)
    .up()
    .ele("VersionSIF")
    .txt(datosNormalizados.cabecera.versionSIF)
    .up()
    .up()

    /* =========================
       DATOS FACTURA RECTIFICATIVA
    ========================= */
    .ele("DatosFacturaRectificativa")
    .ele("NumeroFacturaRectificativa")
    .txt(datosNormalizados.datosFacturaRectificativa.numeroFactura)
    .up()
    .ele("FechaHoraExpedicion")
    .txt(datosNormalizados.datosFacturaRectificativa.fechaHoraExpedicion)
    .up()
    .ele("TipoRectificacion")
    .txt(datosNormalizados.datosFacturaRectificativa.tipoRectificacion) // DIFERENCIAS
    .up()
    .ele("ImporteTotalRectificativa")
    .txt(datosNormalizados.datosFacturaRectificativa.importeTotal) // DIFERENCIAS
    .up()
    .up()

    /* =========================
       FACTURA RECTIFICADA (ORIGINAL)
    ========================= */
    .ele("ReferenciaFacturaOriginal")
    .ele("NumeroFacturaOriginal")
    .txt(datosNormalizados.referenciaFacturaOriginal.numeroFacturaOriginal)
    .up()
    .ele("FechaHoraExpedicionOriginal")
    .txt(
      datosNormalizados.referenciaFacturaOriginal.fechaHoraExpedicionOriginal,
    )
    .up()
    .ele("HashRegistroFacturaOriginal")
    .txt(
      datosNormalizados.referenciaFacturaOriginal.hashRegistroFacturaOriginal,
    )
    .up()
    .up()

    /* =========================
       DESGLOSE FISCAL
    ========================= */
    .ele("DesgloseFiscal")
    .ele("Impuestos");
  datosNormalizados.desgloseFiscal.impuestos.forEach((imp) => {
    doc
      .ele("Impuesto")
      .ele("BaseImponible")
      .txt(imp.base)
      .up()
      .ele("TipoImpositivo")
      .txt(imp.tipoImpositivo)
      .up()
      .ele("Cuota")
      .txt(imp.cuota)
      .up()
      .ele("Tipo")
      .txt(imp.tipoImpuesto)
      .up()
      .up();
  });
  doc
    .up()
    .up()
    .ele("Trazabilidad")
    .ele("NumRegistroAnterior")
    .txt(datosNormalizados.trazabilidad.numRegAnt)
    .up()
    .ele("NumRegistroActual")
    .txt(datosNormalizados.trazabilidad.numRegAct)
    .up()
    .ele("HashRegistroAnterior")
    .txt(datosNormalizados.trazabilidad.hashAnterior)
    .up()
    .ele("HashRegistroPropio")
    .txt(datosNormalizados.trazabilidad.hashPropio)
    .up()
    .ele("IdentificacionSIF")
    .ele("IdSoftware")
    .txt(datosNormalizados.trazabilidad.identificacionSIF.idSw)
    .up()
    .ele("NIFDesarrollador")
    .txt(datosNormalizados.trazabilidad.identificacionSIF.nifDev)
    .up()
    .ele("fechaDeclaracionResponsable")
    .txt(
      datosNormalizados.trazabilidad.identificacionSIF
        .fechaDeclaracionResponsable,
    )
    .up()
    .up()
    .up()
    .up();

  return doc.end({ prettyPrint: true });
}
