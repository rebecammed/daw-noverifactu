export default function parsearFactura(texto) {
  console.log("=== TEXTO PDF CRUDO ===");
  console.log(texto);
  console.log("=== FIN TEXTO PDF ===");

  const resultado = {
    nifReceptor: null,
    numeroFactura: null,
    fechaExpedicion: null,
    tipoFactura: "ORDINARIA",
    cuotaTotal: null,
    importeTotal: null,
  };

  // Normalizamos espacios
  function normalizarTextoOCR(texto) {
    return (
      texto
        // Quita saltos de línea raros
        .replace(/\n+/g, " ")

        // Une dígitos separados: "2 1 7" → "217"
        .replace(/(\d)\s+(?=\d)/g, "$1")

        // Normaliza símbolos
        .replace(/\s*:\s*/g, ": ")
        .replace(/\s*-\s*/g, "-")
        .replace(/\s+€/g, " €")

        // Colapsa espacios múltiples
        .replace(/\s+/g, " ")

        .trim()
    );
  }

  const textoNormalizado = normalizarTextoOCR(texto);

  console.log("=== TEXTO NORMALIZADO ===");
  console.log(textoNormalizado);
  console.log("=== FIN TEXTO NORMALIZADO ===");

  // ======================
  // 1. NIF emisor
  // ======================
  const receptorMatch = textoNormalizado.match(
    /NIF\s*Receptor\s*[:\-]?\s*([0-9]{8}[A-Z])/i,
  );

  if (receptorMatch) {
    resultado.nifReceptor = receptorMatch[1];
  }

  // ======================
  // 2. Número de factura
  // ======================
  const facturaMatch = textoNormalizado.match(
    /factura\s*(n\s*[ºo]|n[ºo]|no)?\s*:?\s*([0-9]+)/i,
  );

  if (facturaMatch) {
    resultado.numeroFactura = facturaMatch[2];
  }

  // ======================
  // 3. Fecha expedición (ISO completo)
  // ======================
  const fechaMatch = textoNormalizado.match(
    /fecha\s*expedici[oó]n\s*:\s*([\d\s\-:TZ\.]+)/i,
  );

  if (fechaMatch) {
    resultado.fechaExpedicion = fechaMatch[1].replace(/\s+/g, "");
  }

  // ======================
  // 4. Tipo factura
  // ======================
  const tipoMatch = textoNormalizado.match(
    /Tipo de factura:\s*(ORDINARIA|SIMPLIFICADA|RECTIFICATIVA|ANULACIÓN)/i,
  );
  if (tipoMatch) {
    resultado.tipoFactura = tipoMatch[1].toUpperCase();
  }

  // ======================
  // 5. Cuota total
  // ======================
  const cuotaMatch = textoNormalizado.match(
    /c\s*u\s*o\s*t\s*a\s*:\s*([\d.,]+)/i,
  );
  if (cuotaMatch)
    resultado.cuotaTotal = parseFloat(cuotaMatch[1].replace(",", "."));

  const impuestoMatch = textoNormalizado.match(
    /(\d{1,2})\s*%?\s*[-–]?\s*(I\s*V\s*A|I\s*R\s*P\s*F|I\s*G\s*I\s*C|I\s*P\s*S\s*I)/i,
  );

  if (impuestoMatch) {
    resultado.tipoImpositivo = impuestoMatch[1];
    resultado.tipoImpuesto = impuestoMatch[2].replace(/\s+/g, "").toUpperCase();
  }

  // ======================
  // 6. Importe total
  // ======================
  const totalMatch = textoNormalizado.match(/importe\s*total\s*:\s*([\d.,]+)/i);
  if (totalMatch)
    resultado.importeTotal = parseFloat(totalMatch[1].replace(",", "."));

  const baseMatch = textoNormalizado.match(/base\s*imponible\s*:\s*([\d.,]+)/i);
  if (baseMatch)
    resultado.baseImponible = parseFloat(baseMatch[1].replace(",", "."));

  return resultado;
}

export default function parsearFactura(texto) {
  console.log("=== TEXTO PDF CRUDO ===");
  console.log(texto);
  console.log("=== FIN TEXTO PDF ===");

  const resultado = {
    nifReceptor: null,
    numeroFactura: null,
    fechaExpedicion: null,
    tipoFactura: "ORDINARIA",
    impuestos: [],
  };

  // Normalizamos espacios
  function normalizarTextoOCR(texto) {
    return (
      texto
        .toUpperCase()
        // Quita saltos de línea raros
        .replace(/\n+/g, " ")

        // Une dígitos separados: "2 1 7" → "217"
        .replace(/(\d)\s+(?=\d)/g, "$1")

        //une palabras
        .replace(/im\s*p\s*u\s*e\s*s\s*t\s*o/g, "IMPUESTO")
        .replace(/c\s*u\s*o\s*t\s*a/g, "CUOTA")
        .replace(/b\s*a\s*s\s*e/g, "BASE")
        .replace(/expedici[oó]n/g, "EXPEDICION")
        .replace(/N\s*I\s*F/g, "NIF")
        // Normaliza símbolos
        .replace(/\s*:\s*/g, ":")
        .replace(/\s*-\s*/g, "-")
        .replace(/\s*\/\s*/g, "/")
        .replace(/\s+€/g, " €")

        // Colapsa espacios múltiples
        .replace(/\s+/g, " ")

        .trim()
    );
  }

  const textoNormalizado = normalizarTextoOCR(texto);

  console.log("=== TEXTO NORMALIZADO ===");
  console.log(textoNormalizado);
  console.log("=== FIN TEXTO NORMALIZADO ===");

  // ======================
  // 1. NIF emisor
  // ======================
  const receptorMatch = textoNormalizado.match(
    /N\s*I\s*F\s*RECEPTOR\s*[:\-]?\s*(([0-9]{8}\s*[A-Z])|([A-Z]\s*[0-9]{8}))/i,
  );

  if (receptorMatch) {
    resultado.nifReceptor = receptorMatch[1].replace(/\s+/g, "");
  }

  // ======================
  // 2. Número de factura
  // ======================
  const facturaMatch = textoNormalizado.match(
    /FACTURA\s*(N\s*[ºO]|N[ºO]|NO)?\s*:?\s*([0-9]+)/i,
  );

  if (facturaMatch) {
    resultado.numeroFactura = facturaMatch[2];
  }

  // ======================
  // 3. Fecha expedición (ISO completo)
  // ======================

  const fechaMatch = textoNormalizado.match(
    /FECHA\s*EXPEDICIÓN\s*:\s*([0-9\/:\-T\.Z]+)/i,
  );

  if (fechaMatch) {
    let fechaTexto = fechaMatch[1];

    // CASO 1: formato DD/MM/YYYYHH:MM  (SIN espacio)
    if (/^\d{2}\s?\/\d{2}\s?\/\d{4}\s?\d{1,2}:\d{2}$/.test(fechaTexto)) {
      const dia = fechaTexto.slice(0, 2);
      const mes = fechaTexto.slice(3, 5);
      const año = fechaTexto.slice(6, 10);
      const hora = fechaTexto.slice(10); // ej: 9:45

      resultado.fechaExpedicion = `${año}-${mes}-${dia}T${hora}:00`;
    }

    // CASO 2: formato DD/MM/YYYY HH:MM
    else if (/^\d{2}\/\d{2}\/\d{4}\s+\d{1,2}:\d{2}$/.test(fechaTexto)) {
      const [fecha, hora] = fechaTexto.split(" ");
      const [d, m, y] = fecha.split("/");

      resultado.fechaExpedicion = `${y}-${m}-${d}T${hora}:00`;
    }

    // CASO 3: ISO
    else {
      resultado.fechaExpedicion = fechaTexto;
    }
  }

  /*
  const fechaMatch = textoNormalizado.match(
    /FECHA\s*EXPEDICIÓN\s*:\s*((\d{2}\/\d{2}\/\d{4})(\s*\d{1,2}:\d{2})?|[\dT:\.\-Z]+)/i,
  );

  if (fechaMatch) {
    let fechaTexto = fechaMatch[1];

    if (fechaTexto.includes("/")) {
      const [fecha, hora = "00:00"] = fechaTexto.split(/(?<=\d{4})/);
      const [d, m, y] = fecha.split("/");
      const horaLimpia = hora.replace("T", "").trim() || "00:00";

      resultado.fechaExpedicion = new Date(
        `${y}-${m}-${d}T${horaLimpia}:00`,
      ).toISOString();
    } else {
      resultado.fechaExpedicion = new Date(fechaTexto).toISOString();
    }
  }

  
  if (fechaMatch) {
    const d = fechaMatch[1];
    const m = fechaMatch[2];
    const y = fechaMatch[3];
    const hora = fechaMatch[4] || "00:00";
    resultado.fechaExpedicion = new Date(
      `${y}-${m}-${d}T${hora}:00`,
    ).toISOString();
  }
*/
  // ======================
  // 4. Tipo factura
  // ======================
  const tipoMatch = textoNormalizado.match(
    /TIPO DE FACTURA:\s*(ORDINARIA|SIMPLIFICADA|RECTIFICATIVA|ANULACIÓN)/i,
  );
  if (tipoMatch) {
    resultado.tipoFactura = tipoMatch[1].toUpperCase();
  }

  // ======================
  // 5. Impuestos
  // ======================
  resultado.impuestos = [];
  const regexImpuestos =
    /BASE\s*IMPONIBLE\s*:\s*([\d.,]+).*?([\d.,]+)%\s*-\s*(IVA|IRPF|IGIC|IPSI).*?CUOTA\s*:\s*([\d.,]+)/gi;

  let match;

  while ((match = regexImpuestos.exec(textoNormalizado)) !== null) {
    const base = Number(match[1].replace(",", "."));
    const tipoImpositivo = Number(match[2].replace(",", "."));
    const tipoImpuesto = match[3];
    const cuota = Number(match[4].replace(",", "."));

    resultado.impuestos.push({
      base,
      tipoImpositivo,
      cuota,
      tipoImpuesto,
    });
  }

  /*
  const regexImpuesto =
    /Impuesto\s+\d+:\s*(IVA|IRPF|IGIC|IPSI)\s*\(([\d.,]+)%\)\s*Base\s+imponible:\s*([\d.,\s]+)\s*€\s*Cuota:\s*([\d.,\s]+)/gi;

  const regexImpuesto = [
    /IMPUESTO\s+\d+:\s*(IVA|IRPF|IGIC|IPSI)\s*\(([\d.,]+)%\)\s*BASE\s+IMPONIBLE:\s*([\d.,\s]+)\s*€\s*CUOTA:\s*([\d.,\s]+)/gi,
    /IMPUESTO.*?\(([\d.,]+)%.*?(IVA|IRPF|IGIC|IPSI)\).*?BASE.*?([\d.,]+).*?CUOTA.*?([\d.,]+)/gi,
  ];

  let match;
  let encontrado = false;

  for (const regex of regexImpuesto) {
    regex.lastIndex = 0; // importantísimo

    while ((match = regex.exec(textoNormalizado)) !== null) {
      resultado.impuestos.push({
        base: Number(match[3].replace(/\s+/g, "").replace(",", ".")),
        tipoImpositivo: Number(
          match[1].replace(",", ".") || match[2].replace(",", "."),
        ),
        cuota: Number(match[4].replace(/\s+/g, "").replace(",", ".")),
        tipoImpuesto: match[2] || match[1],
      });
      encontrado = true;
    }

    if (encontrado) break; // si uno funciona, no pruebo los demás
  }

  
  while ((match = regexImpuesto.exec(textoNormalizado)) !== null) {
    const tipoImpuesto = match[2] || match[1];

    const tipoImpositivo = Number(
      match[1].replace(",", ".") || match[2].replace(",", "."),
    );

    const base = Number(match[3].replace(/\s+/g, "").replace(",", "."));

    const cuota = Number(match[4].replace(/\s+/g, "").replace(",", "."));

    resultado.impuestos.push({
      base,
      tipoImpositivo,
      cuota,
      tipoImpuesto,
    });
  }*/

  return resultado;
}


/* PARSER PDF
app.post(
  "/api/facturas/preview",
  upload.single("pdf"),
  auth,
  checkMantenimiento,
  //comprobarSuscripcion,
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        mensaje: "PDF no recibido",
      });
    }

    const rutaTemporalPDF = req.file.path;

    try {
      // 1️⃣ Extraer texto
      const textoPDF = await extraerTextoPDF(rutaTemporalPDF);

      // 2️⃣ Parsear datos
      const datosDetectados = parsearFactura(textoPDF);

      // 🔥 Asegurar estructura de conceptos
      if (
        !datosDetectados.conceptos ||
        !Array.isArray(datosDetectados.conceptos)
      ) {
        datosDetectados.conceptos = [];
      }

      // Normalizar números básicos
      datosDetectados.conceptos = datosDetectados.conceptos.map((c) => ({
        descripcion: c.descripcion ?? c.concepto ?? "",
        cantidad: Number(c.cantidad) || 1,
        precioUnitario: Number(c.precioUnitario) || 0,
        tipoImpositivo: Number(datosDetectados.porcentajeIVA) || 0,
        tipoImpuesto: c.tipoImpuesto || "IVA",
      }));

      // 3️⃣ Validación preliminar (sin bloquear)
      const erroresPreliminares = validarFacturaAlta(
        datosDetectados,
        new Date(),
      );

      // 4️⃣ Eliminar archivo temporal
      fs.unlinkSync(rutaTemporalPDF);

      return res.json({
        mensaje: "Datos extraídos correctamente",
        datosDetectados,
        erroresPreliminares,
      });
    } catch (error) {
      if (fs.existsSync(rutaTemporalPDF)) {
        fs.unlinkSync(rutaTemporalPDF);
      }

      console.error("Error en preview:", error);

      return res.status(400).json({
        mensaje: "No se pudo procesar el PDF",
        detalle: error.message,
      });
    }
  },
);*/
