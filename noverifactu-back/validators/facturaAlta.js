export default function validarFacturaAlta(metadata, fechaRecepcion) {
  const errores = [];

  if (!metadata.numeroFactura) {
    errores.push("Número de factura obligatorio");
  }

  if (!metadata.fechaExpedicion) {
    errores.push("Fecha de expedición obligatoria");
  }

  if (metadata.fechaExpedicion) {
    const d = new Date(metadata.fechaExpedicion);
    if (isNaN(d.getTime())) {
      errores.push("Fecha de expedición con formato inválido");
    }
  }

  if (metadata.fechaExpedicion) {
    const fechaFactura = new Date(metadata.fechaExpedicion);

    if (fechaFactura > fechaRecepcion) {
      errores.push(
        "La fecha de expedición no puede ser posterior a la fecha de subida",
      );
    }
  }

  if (
    metadata.nifReceptor &&
    !/^[A-Z]{1}[0-9]{8}$|^[0-9]{8}[A-Z]{1}$/i.test(metadata.nifReceptor)
  ) {
    errores.push("NIF del receptor no tiene formato válido");
  }

  if (metadata.numeroFactura && typeof metadata.numeroFactura !== "string") {
    errores.push("Número de factura debe ser texto");
  }

  if (metadata.tipoFactura && !"ORDINARIA".includes(metadata.tipoFactura)) {
    errores.push("Tipo de factura no permitido");
  }

  // ============================
  // 🔹 VALIDACIÓN DE IMPUESTOS (DESDE CONCEPTOS)
  // ============================

  if (!Array.isArray(metadata.conceptos) || metadata.conceptos.length === 0) {
    errores.push("Debe existir al menos un concepto");
  } else {
    const existeImpuesto = metadata.conceptos.some(
      (c) =>
        Number(c.tipoImpositivo) > 0 &&
        ["IVA", "IGIC", "IPSI", "IRPF"].includes(c.tipoImpuesto),
    );

    if (!existeImpuesto) {
      errores.push("Debe existir al menos un impuesto");
    }
  }

  return errores;
}

/*export default function validarFacturaAlta(metadata, fechaRecepcion) {
  const errores = [];

  if (!metadata.numeroFactura) {
    errores.push("Número de factura obligatorio");
  }

  if (!metadata.fechaExpedicion) {
    errores.push("Fecha de expedición obligatoria");
  }

  if (
    metadata.fechaExpedicion &&
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(
      metadata.fechaExpedicion,
    )
  ) {
    errores.push("Fecha de expedición con formato inválido");
  }

  if (metadata.fechaExpedicion) {
    const fechaFactura = new Date(metadata.fechaExpedicion);

    if (fechaFactura > fechaRecepcion) {
      errores.push(
        "La fecha de expedición no puede ser posterior a la fecha de subida",
      );
    }
  }

  if (metadata.nifReceptor && !/^[0-9]{8}[A-Z]$/.test(metadata.nifReceptor)) {
    errores.push("NIF del receptor no tiene formato válido");
  }

  if (metadata.numeroFactura && typeof metadata.numeroFactura !== "string") {
    errores.push("Número de factura debe ser texto");
  }

  if (
    metadata.tipoFactura &&
    !["ORDINARIA", "SIMPLIFICADA"].includes(metadata.tipoFactura)
  ) {
    errores.push("Tipo de factura no permitido");
  }

  if (
    metadata.baseImponible !== undefined &&
    (isNaN(metadata.baseImponible) || Number(metadata.baseImponible) < 0)
  ) {
    errores.push("Base imponible no válida");
  }

  if (
    metadata.tipoImpositivo !== undefined &&
    (isNaN(metadata.tipoImpositivo) || Number(metadata.tipoImpositivo) < 0)
  ) {
    errores.push("Tipo impositivo no válido");
  }

  if (!metadata.tipoImpuesto) {
    errores.push("Tipo de impuesto obligatorio");
  } else if (!["IVA", "IGIC", "IPSI", "IRPF"].includes(metadata.tipoImpuesto)) {
    errores.push("Tipo de impuesto no permitido");
  }
  return errores;
}
*/
