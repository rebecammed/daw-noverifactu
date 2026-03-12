import path from "path";
import fs from "fs";
import { desbloquearPDF } from "../pdf/pdfUnlocker.js";
import { estamparSobreCopia } from "../pdf/estamparSobreCopia.js";
import { generarPDFManual } from "../pdf/generarFacturaAltaPDF.js";
export async function procesarPDF({
  pdf,
  baseDir,
  facturaId,
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

    await connection.query(`UPDATE facturas SET ruta_pdf = ? WHERE id = ?`, [
      rutaOriginal,
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
        rutaOriginal,
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

  // 🔹 4. Guardar ruta final
  await connection.query(
    `UPDATE facturas SET pdf_generado_path = ? WHERE id = ?`,
    [rutaSellado, facturaId],
  );

  return rutaSellado;
}
