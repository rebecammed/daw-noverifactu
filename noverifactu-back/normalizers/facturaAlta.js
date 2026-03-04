export default function normalizarFacturaAlta(metadata) {
  return {
    nifReceptor: normalizarTexto(metadata.nifReceptor),
    numeroFactura: normalizarTexto(metadata.numeroFactura),
    fechaExpedicion: normalizarFecha(metadata.fechaExpedicion),
    tipoFactura: normalizarTexto(metadata.tipoFactura),

    conceptos: Array.isArray(metadata.conceptos)
      ? metadata.conceptos.map((c) => ({
          descripcion: normalizarTexto(c.descripcion),
          cantidad: normalizarNumero(c.cantidad),
          precioUnitario: normalizarNumero(c.precioUnitario),
          tipoImpositivo: normalizarNumero(c.tipoImpositivo),
          tipoImpuesto: normalizarTexto(c.tipoImpuesto)?.toUpperCase(),
        }))
      : [],
  };
}

/* ===== funciones auxiliares ===== */

function normalizarTexto(valor) {
  if (typeof valor !== "string") return null;
  return valor.trim();
}

function normalizarFecha(fecha) {
  const date = new Date(fecha);
  if (isNaN(date.getTime())) return null;
  return date.toISOString();
}

function normalizarNumero(valor) {
  if (valor === undefined || valor === null || valor === "") return null;
  const num = Number(valor);
  if (isNaN(num)) return null;
  return num;
}
/*
function construirImpuestos(metadata) {
  if (
    metadata.base === undefined ||
    metadata.tipoImpositivo === undefined ||
    !metadata.tipoImpuesto
  ) {
    return [];
  }

  return [
    {
      base: normalizarNumero(metadata.baseImponible),
      tipoImpositivo: normalizarNumero(metadata.tipoImpositivo),
      tipoImpuesto: normalizarTexto(metadata.tipoImpuesto),
    },
  ];
}*/

/*export default function normalizarFacturaAlta(metadata) {
  return {
    nifReceptor: normalizarTexto(metadata.nifReceptor),
    numeroFactura: normalizarTexto(metadata.numeroFactura),
    fechaExpedicion: normalizarFecha(metadata.fechaExpedicion),
    tipoFactura: normalizarTexto(metadata.tipoFactura),
    baseImponible: normalizarNumero(metadata.baseImponible),
    //impuestos: construirImpuestos(metadata),
    tipoImpositivo: normalizarNumero(metadata.tipoImpositivo),
    tipoImpuesto: metadata.tipoImpuesto,
  };
}

/* ===== funciones auxiliares ===== 

function normalizarTexto(valor) {
  if (typeof valor !== "string") return null;
  return valor.trim();
}

function normalizarFecha(fecha) {
  const date = new Date(fecha);
  if (isNaN(date.getTime())) return null;
  return date.toISOString();
}

function normalizarNumero(valor) {
  if (valor === undefined || valor === null || valor === "") return null;
  const num = Number(valor);
  if (isNaN(num)) return null;
  return num;
}

function construirImpuestos(metadata) {
  // Si no hay datos de impuesto, devolvemos array vacío
  if (
    metadata.tipoImpositivo === undefined ||
    metadata.cuotaTotal === undefined ||
    !metadata.tipoImpuesto
  ) {
    return [];
  }

  return [
    {
      tipoImpositivo: normalizarNumero(metadata.tipoImpositivo),
      tipoImpuesto: normalizarTexto(metadata.tipoImpuesto),
      
    },
  ];
}*/
