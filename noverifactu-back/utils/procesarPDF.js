import path from "path";
import fs from "fs";
import { desbloquearPDF } from "../pdf/pdfUnlocker.js";
import { estamparSobreCopia } from "../pdf/estamparSobreCopia.js";
import { r2 } from "./r2.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export async function procesarPDF({
  pdf,
  baseDir,
  facturaId,
  usuarioId,
  connection,
  qrData,
  hashActual,
  generarPDFManual,
}) {
  let rutaSellado = null;

  if (pdf) {
    // 🔹 1. Guardar original
    const rutaOriginal = path.join(baseDir, "original.pdf");
    fs.renameSync(pdf.path, rutaOriginal);

    const keyOriginal = `usuarios/${usuarioId}/facturas/${facturaId}/original.pdf`;

    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: keyOriginal,
        Body: fs.readFileSync(rutaOriginal),
        ContentType: "application/pdf",
      }),
    );

    await connection.query(`UPDATE facturas SET ruta_pdf = ? WHERE id = ?`, [
      keyOriginal,
      facturaId,
    ]);

    // 🔹 2. Intentar desbloquear
    let rutaPDFProcesable = rutaOriginal;

    try {
      const rutaDesbloqueado = await desbloquearPDF(rutaOriginal);

      if (fs.existsSync(rutaDesbloqueado)) {
        rutaPDFProcesable = rutaDesbloqueado;
      }
    } catch (err) {
      console.log("PDF protegido con contraseña o no desbloqueable.");
      // Seguimos con original
    }

    // 🔹 3. Intentar estampar QR
    try {
      const pdfSellado = await estamparSobreCopia(
        rutaPDFProcesable,
        qrData,
        hashActual,
      );

      rutaSellado = path.join(baseDir, "sellado.pdf");
      fs.writeFileSync(rutaSellado, pdfSellado);
    } catch (err) {
      console.log(
        "No se pudo estampar sobre el PDF original. Generando manual.",
      );

      // 🔹 Fallback seguro
      const pdfNuevo = await generarPDFManual();
      rutaSellado = path.join(baseDir, "sellado.pdf");
      fs.writeFileSync(rutaSellado, pdfNuevo);
    }
  } else {
    // 🔹 Caso sin PDF externo
    const pdfNuevo = await generarPDFManual();
    rutaSellado = path.join(baseDir, "sellado.pdf");
    fs.writeFileSync(rutaSellado, pdfNuevo);
  }

  // 🔹 4. Subir a R2
  const keyPDF = `usuarios/${usuarioId}/facturas/${facturaId}/sellado.pdf`;

  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: keyPDF,
      Body: fs.readFileSync(rutaSellado),
      ContentType: "application/pdf",
    }),
  );

  // 🔹 Guardar key en DB
  await connection.query(
    `UPDATE facturas SET pdf_generado_path = ? WHERE id = ?`,
    [keyPDF, facturaId],
  );
  if (fs.existsSync(rutaSellado)) {
    fs.unlinkSync(rutaSellado);
  }
  if (fs.existsSync(rutaOriginal)) {
    fs.unlinkSync(rutaOriginal);
  }
  return keyPDF;
}
