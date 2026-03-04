import { create } from "xmlbuilder2";

export default function generarFacturaAnulacionXML(datosNormalizados) {
  const doc = create({ version: "1.0", encoding: "UTF-8" })
    .ele("RegistroAnulacionNoVerifactu", {
      xmlns: "https://noverifactu.local/esquema/anulacion",
    })

    .ele("Cabecera")
    .ele("NIFEmisor")
    .txt(datosNormalizados.cabecera.nifEmisor)
    .up()
    .ele("VersionSIF")
    .txt(datosNormalizados.cabecera.versionSIF)
    .up()
    .ele("FechaHoraAnulacion")
    .txt(datosNormalizados.cabecera.fhAn)
    .up()
    .up()

    .ele("ReferenciaRegistroAnulado")
    .ele("NumeroFacturaOriginal")
    .txt(datosNormalizados.refAn.numeroFacturaOr)
    .up()
    .ele("FechaHoraExpedicionOriginal")
    .txt(datosNormalizados.refAn.fechaHoraExpedicionOr)
    .up()
    .ele("HashRegistroAnulado")
    .txt(datosNormalizados.refAn.hashAnulado)
    .up()
    .ele("MotivoAnulacion")
    .txt(datosNormalizados.refAn.motivo)
    .up()
    .up()

    .ele("Trazabilidad")
    .ele("NumRegistroAnterior")
    .txt(datosNormalizados.tr.numRegAnt)
    .up()
    .ele("NumRegistroActual")
    .txt(datosNormalizados.tr.numRegAct)
    .up()
    .ele("HashRegistroAnterior")
    .txt(datosNormalizados.tr.hashAnterior)
    .up()
    .ele("HashRegistroPropio")
    .txt(datosNormalizados.tr.hashPropio)
    .up()
    .ele("IdentificacionSIF")
    .ele("IdSoftware")
    .txt(datosNormalizados.tr.sif.idSw)
    .up()
    .ele("NIFDesarrollador")
    .txt(datosNormalizados.tr.sif.nifDev)
    .up()
    .ele("fechaDeclaracionResponsable")
    .txt(datosNormalizados.tr.sif.fechaDeclaracionResponsable)
    .up()
    .up()
    .up()

    .up();

  return doc.end({ prettyPrint: true });
}
