import fs from "fs";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";

export async function estamparQRenPDF(rutaPDFOriginal, qrData, hash) {
  const pdfBytes = fs.readFileSync(rutaPDFOriginal);

  const pdfDoc = await PDFDocument.load(pdfBytes, {
    ignoreEncryption: true,
  });
  const page = pdfDoc.getPages()[0];

  // generar QR como imagen PNG
  const qrImageBytes = await QRCode.toBuffer(qrData);

  const qrImage = await pdfDoc.embedPng(qrImageBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const { width, height } = page.getSize();

  const qrSize = 100;
  const margin = 30;
  const qrX = width - qrSize - margin; // margen derecho
  const qrY = margin + 12; // subimos un poco

  const texto = "Factura verificable en la sede electrónica de la AEAT";
  const fontSize = 6;

  // Medir ancho real del texto
  const textWidth = font.widthOfTextAtSize(texto, fontSize);

  // Posición X para que el FINAL del texto coincida con el FINAL del QR
  const textX = qrX + qrSize - textWidth;

  // dibujar QR
  page.drawImage(qrImage, {
    x: qrX,
    y: qrY,
    width: qrSize,
    height: qrSize,
  });

  page.drawText(texto, {
    x: textX,
    y: margin - 2,
    size: fontSize,
    font: font,
  });

  // dibujar hash pequeño
  page.drawText(`HASH: ${hash}`, {
    x: 40,
    y: 15,
    size: 6,
    color: rgb(0, 0, 0),
  });

  const pdfModificado = await pdfDoc.save();
  return pdfModificado;
}
