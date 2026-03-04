export default function validarMinimos(datos) {
  if (!datos.numeroFactura) {
    throw new Error("No se pudo detectar el número de factura");
  }

  if (!datos.fechaExpedicion) {
    throw new Error("No se pudo detectar la fecha de expedición");
  }

  if (
    datos.importeTotal === null ||
    datos.importeTotal === undefined ||
    isNaN(datos.importeTotal)
  ) {
    throw new Error("No se pudo detectar el importe total");
  }

  // 🔥 La cuota IVA ya no es obligatoria en preview
  // Se calculará en backend desde conceptos
}
