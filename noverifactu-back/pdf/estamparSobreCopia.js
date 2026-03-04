import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";
import fs from "fs";

export async function estamparSobreCopia(rutaOriginal, qrData, hashActual) {
  const originalBytes = fs.readFileSync(rutaOriginal);

  // 🔥 Cargar ignorando restricciones
  const originalDoc = await PDFDocument.load(originalBytes, {
    ignoreEncryption: true,
  });

  const newDoc = await PDFDocument.create();

  const pages = await newDoc.copyPages(
    originalDoc,
    originalDoc.getPageIndices(),
  );

  pages.forEach((page) => newDoc.addPage(page));

  const font = await newDoc.embedFont(StandardFonts.Helvetica);

  // 🔹 Generar QR como imagen
  const qrImageBuffer = await QRCode.toBuffer(qrData);
  const qrImage = await newDoc.embedPng(qrImageBuffer);

  const qrDims = qrImage.scale(0.5);

  // 🔹 Estampar en todas las páginas
  newDoc.getPages().forEach((page) => {
    const { width, height } = page.getSize();

    page.drawImage(qrImage, {
      x: width - qrDims.width - 40,
      y: 40,
      width: qrDims.width,
      height: qrDims.height,
    });

    page.drawText(`Hash: ${hashActual}`, {
      x: 40,
      y: 40,
      size: 8,
      font,
      color: rgb(0, 0, 0),
    });

    page.drawText("Factura registrada en sistema SIF", {
      x: 40,
      y: height - 20,
      size: 8,
      font,
      color: rgb(0, 0, 0),
    });
  });

  return await newDoc.save();
}
