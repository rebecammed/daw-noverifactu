import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import { r2 } from "../utils/r2.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";

export default async function generarFacturaAltaPDF(datos) {
  const doc = new PDFDocument({ margin: 50 });

  const chunks = [];
  doc.on("data", (chunk) => chunks.push(chunk));

  const resultPromise = new Promise((resolve) => {
    doc.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
  });

  const {
    cabecera,
    datosFactura,
    desgloseFiscal,
    trazabilidad,
    qrData,
    tipoFactura,
    referenciaOriginal,
  } = datos;

  const formatearFechaHora = (fechaStr) => {
    const d = new Date(fechaStr);
    // Formato: DD/MM/YYYY HH:mm:ss
    return (
      d.toLocaleDateString("es-ES") +
      " " +
      d.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "Europe/Madrid",
      })
    );
  };

  const marginLeft = doc.page.margins.left;
  const marginRight = doc.page.margins.right;
  const marginTop = doc.page.margins.top;
  const marginBottom = doc.page.margins.bottom;

  const pageWidth = doc.page.width - marginLeft - marginRight;

  /* =====================================================
     CABECERA
  ===================================================== */
  const headerTop = marginTop;
  const logoWidth = 120;
  let logoHeight = 0;

  // =====================
  // 1️⃣ LOGO (desde R2)
  // =====================
  if (cabecera.logoPath) {
    try {
      const response = await r2.send(
        new GetObjectCommand({
          Bucket: process.env.R2_BUCKET,
          Key: cabecera.logoPath,
        }),
      );

      const chunks = [];
      for await (const chunk of response.Body) {
        chunks.push(chunk);
      }

      const buffer = Buffer.concat(chunks);

      const image = doc.openImage(buffer);
      const scale = logoWidth / image.width;
      logoHeight = image.height * scale;

      doc.image(buffer, marginLeft, headerTop, {
        width: logoWidth,
      });
    } catch (e) {
      console.error("No se pudo cargar el logo desde R2:", e);
    }
  }

  // =====================
  // 2️⃣ MEDIMOS BLOQUE TEXTO SIN PINTARLO
  // =====================
  const esRectificativa = tipoFactura === "RECTIFICATIVA";
  let titulo = "FACTURA";
  let subtitulo = null;
  if (esRectificativa) {
    titulo = "FACTURA RECTIFICATIVA";
    if (datosFactura.tipoRectificacion === "DIFERENCIAS") {
      subtitulo = "Por diferencias";
    } else if (datosFactura.tipoRectificacion === "SUSTITUCION") {
      subtitulo = "Sustitutiva";
    }
  }

  const esDiferencias =
    esRectificativa && datosFactura.tipoRectificacion === "DIFERENCIAS";

  doc.font("Helvetica-Bold").fontSize(20);
  const tituloHeight = doc.heightOfString(titulo, {
    width: pageWidth,
  });

  let subtituloHeight = 0;

  if (subtitulo) {
    doc.font("Helvetica").fontSize(11);
    subtituloHeight = doc.heightOfString(subtitulo, {
      width: pageWidth,
    });
  }

  const facturaHeight = tituloHeight + subtituloHeight;
  doc.font("Helvetica").fontSize(12);
  const numeroHeight = doc.heightOfString(`Nº ${datosFactura.numeroFactura}`, {
    width: pageWidth,
  });

  const fechaHeight = doc.heightOfString(
    new Date(datosFactura.fechaExpedicion).toLocaleDateString(),
    { width: pageWidth },
  );

  const textBlockHeight = facturaHeight + numeroHeight + fechaHeight;

  // =====================
  // 3️⃣ ALTURA TOTAL CABECERA
  // =====================
  const headerContentHeight = Math.max(logoHeight, textBlockHeight);
  const headerBottomY = headerTop + headerContentHeight + 20;

  // =====================
  // 4️⃣ CENTRAMOS TEXTO VERTICALMENTE
  // =====================
  const textStartY = headerTop + (headerContentHeight - textBlockHeight) / 2;

  // Ahora sí pintamos el texto
  doc.font("Helvetica-Bold").fontSize(20).text(titulo, marginLeft, textStartY, {
    width: pageWidth,
    align: "right",
  });
  if (subtitulo) {
    doc.font("Helvetica").fontSize(11).text(subtitulo, {
      width: pageWidth,
      align: "right",
    });
  }
  doc
    .font("Helvetica")
    .fontSize(12)
    .text(`Nº ${datosFactura.numeroFactura}`, {
      width: pageWidth,
      align: "right",
    })
    .text(formatearFechaHora(datosFactura.fechaExpedicion), {
      width: pageWidth,
      align: "right",
    });

  // =====================
  // 5️⃣ LÍNEA DIVISORIA
  // =====================
  doc.y = headerBottomY;

  doc
    .moveTo(marginLeft, doc.y)
    .lineTo(doc.page.width - marginRight, doc.y)
    .stroke();

  if (esRectificativa && referenciaOriginal) {
    doc.moveDown(0.8);

    const bloqueTopY = doc.y;

    // Texto bloque
    doc.font("Helvetica-Bold").fontSize(10);
    doc.text("Factura rectificada", marginLeft);

    doc.font("Helvetica").fontSize(10);
    doc.text(`Número: ${referenciaOriginal.numeroFacturaOriginal}`);
    doc.text(
      `Fecha original: ${formatearFechaHora(referenciaOriginal.fechaOriginal)}`,
    );

    const bloqueBottomY = doc.y + 5;

    doc
      .moveTo(marginLeft, bloqueBottomY)
      .lineTo(doc.page.width - marginRight, bloqueBottomY)
      .stroke();

    doc.moveDown(1.5);
  } else {
    doc.moveDown(1.5);
  }

  /* =====================================================
     EMISOR / CLIENTE
  ===================================================== */

  const colWidth = pageWidth / 2;
  const startY = doc.y;

  doc.font("Helvetica-Bold").fontSize(11);
  doc.text("EMISOR", marginLeft, startY);

  doc.font("Helvetica").fontSize(10);
  doc.text(cabecera.emisor.razon_social);
  doc.text(`NIF: ${cabecera.emisor.nif}`);
  doc.text(cabecera.emisor.direccion);
  doc.text(
    `${cabecera.emisor.codigo_postal} ${cabecera.emisor.ciudad} (${cabecera.emisor.pais})`,
  );

  doc.font("Helvetica-Bold").fontSize(11);
  doc.text("CLIENTE", marginLeft + colWidth, startY);

  doc.font("Helvetica").fontSize(10);
  doc.text(cabecera.receptor.nombre, marginLeft + colWidth);
  doc.text(`NIF: ${cabecera.receptor.nif}`);
  doc.text(cabecera.receptor.direccion);
  doc.text(
    `${cabecera.receptor.codigo_postal} ${cabecera.receptor.ciudad} (${cabecera.receptor.pais})`,
  );

  doc.moveDown(3);

  /* =====================================================
   TABLA CONCEPTOS
===================================================== */

  if (datos.conceptos && datos.conceptos.length > 0) {
    doc.font("Helvetica-Bold").fontSize(11);
    doc.text("CONCEPTOS");
    doc.moveDown(0.5);

    const c1 = marginLeft;
    const c2 = c1 + 200;
    const c3 = c2 + 60;
    const c4 = c3 + 80;

    let conceptosY = doc.y;

    doc.font("Helvetica-Bold").fontSize(10);

    doc.text("Descripción", c1, conceptosY);
    doc.text("Cantidad", c2, conceptosY, { width: 60, align: "right" });
    doc.text("Precio", c3, conceptosY, { width: 80, align: "right" });
    doc.text("Total", c4, conceptosY, { width: 80, align: "right" });

    conceptosY += 15;

    doc
      .moveTo(marginLeft, conceptosY)
      .lineTo(doc.page.width - marginRight, conceptosY)
      .stroke();

    conceptosY += 10;

    doc.font("Helvetica").fontSize(10);

    datos.conceptos.forEach((c) => {
      const totalLinea = esDiferencias
        ? Number(c.base)
        : Number(c.cantidad * c.precioUnitario);
      doc.text(c.descripcion, c1, conceptosY);
      doc.text(c.cantidad.toString(), c2, conceptosY, {
        width: 60,
        align: "right",
      });
      doc.text(c.precioUnitario.toFixed(2) + " €", c3, conceptosY, {
        width: 80,
        align: "right",
      });
      doc.text(totalLinea.toFixed(2) + " €", c4, conceptosY, {
        width: 80,
        align: "right",
      });

      conceptosY += 18;
    });

    doc.moveDown(2);
  }

  /* =====================================================
   CÁLCULO INTERNO DE TOTALES
===================================================== */
  let baseTotal = 0;
  let cuotaTotal = 0;

  // 🔹 Si es por DIFERENCIAS, la base y cuota son la suma del desglose (los deltas)
  if (esDiferencias) {
    desgloseFiscal.impuestos.forEach((imp) => {
      baseTotal += Number(imp.baseImponible) || 0;
      cuotaTotal += Number(imp.cuota) || 0;
    });
  } else {
    // 🔹 Si es SUSTITUCION o NORMAL, sumamos los conceptos completos
    if (datos.conceptos) {
      datos.conceptos.forEach((c) => {
        const baseLinea = Number(c.cantidad) * Number(c.precioUnitario);
        baseTotal += baseLinea;
        const cuotaLinea = baseLinea * (Number(c.tipoImpositivo) / 100);
        cuotaTotal += cuotaLinea;
      });
    }
  }

  // El importe total ahora será coherente con el tipo de factura
  const importeTotal = Number((baseTotal + cuotaTotal).toFixed(2));

  /* =====================================================
   TOTALES
===================================================== */

  const labelX = doc.page.width - marginRight - 200;
  const valueX = doc.page.width - marginRight - 80;

  let totalY = doc.y;

  doc
    .moveTo(labelX, totalY)
    .lineTo(doc.page.width - marginRight, totalY)
    .stroke();

  totalY += 12;

  doc.font("Helvetica").fontSize(10);

  doc.text("Base imponible total:", labelX, totalY);
  doc.text(baseTotal.toFixed(2) + " €", valueX, totalY, {
    width: 80,
    align: "right",
  });

  totalY += 18;

  // Una línea por cada impuesto
  desgloseFiscal.impuestos.forEach((imp) => {
    const cuota = Number(imp.cuota);

    const cuotaFormateada =
      imp.tipoImpuesto === "IRPF"
        ? "-" + Math.abs(cuota).toFixed(2) + " €"
        : cuota.toFixed(2) + " €";

    doc.text(`${imp.tipoImpuesto} ${imp.tipoImpositivo}%:`, labelX, totalY);

    doc.text(cuotaFormateada, valueX, totalY, { width: 80, align: "right" });

    totalY += 18;
  });

  doc
    .moveTo(labelX, totalY)
    .lineTo(doc.page.width - marginRight, totalY)
    .stroke();

  totalY += 10;

  doc.font("Helvetica-Bold").fontSize(13);

  doc.text("IMPORTE TOTAL:", labelX, totalY);
  doc.text(importeTotal.toFixed(2) + " €", valueX, totalY, {
    width: 80,
    align: "right",
  });

  if (esRectificativa && datosFactura.tipoRectificacion === "DIFERENCIAS") {
    totalY += 25;
    doc.font("Helvetica").fontSize(10);

    const totalOriginal = Number(referenciaOriginal.importeOriginal) || 0;

    const totalRectificativa = importeTotal;

    const diferencia = totalRectificativa - totalOriginal;

    // Localiza esta línea en tu generador de PDF:
    const texto = `Esta factura rectifica por diferencias a la factura ${referenciaOriginal.numeroFacturaOriginal}. El importe de esta factura corresponde al ajuste neto (Base + Impuestos) respecto al total original.`;
    doc.text(texto, labelX - 200, totalY, {
      width: 400,
      align: "right",
    });

    doc.y = totalY + 20;
  }

  /* =====================================================
     BLOQUE INFERIOR IZQUIERDO (FIJO)
  ===================================================== */

  const qrImage = await QRCode.toDataURL(qrData);

  const bottomBlockTop = doc.page.height - marginBottom - 200;

  // QR
  doc.image(qrImage, marginLeft, bottomBlockTop, {
    fit: [110, 110],
  });

  // Trazabilidad justo debajo
  let legalY = bottomBlockTop + 120;

  doc.font("Helvetica").fontSize(8);

  doc.text(
    "Factura verificable en la sede electrónica de la AEAT",
    marginLeft,
    legalY,
    { width: pageWidth },
  );

  legalY += 12;
  doc.text(
    `Sistema: ${trazabilidad.identificacionSIF.idSw}`,
    marginLeft,
    legalY,
  );
  legalY += 12;
  doc.text(
    `NIF desarrollador: ${trazabilidad.identificacionSIF.nifDev}`,
    marginLeft,
    legalY,
  );
  legalY += 12;
  doc.text(
    `Fecha declaración responsable: ${trazabilidad.identificacionSIF.fechaDeclaracionResponsable}`,
    marginLeft,
    legalY,
  );

  legalY += 14;
  doc.text("Huella del registro:", marginLeft, legalY);
  legalY += 10;
  doc.text(trazabilidad.hashPropio, marginLeft, legalY, {
    width: pageWidth,
  });

  doc.end();
  return await resultPromise;
}
