import fs from "fs";
import pdf from "pdf-parse/lib/pdf-parse.js";

export async function extraerTextoPDF(rutaPDF) {
  const buffer = fs.readFileSync(rutaPDF);
  const data = await pdf(buffer);
  return data.text;
}
/*import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

pdfjsLib.GlobalWorkerOptions.workerSrc = path.join(
  __dirname,
  "node_modules/pdfjs-dist/legacy/build/pdf.worker.js",
);

export default async function extraerTextoPDF(rutaPDF) {
  try {
    // 👇 LEEMOS EL PDF REAL DESDE DISCO
    const bufferPDF = fs.readFileSync(rutaPDF);

    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(bufferPDF),
      standardFontDataUrl: path.join(
        __dirname,
        "node_modules/pdfjs-dist/standard_fonts/",
      ),
    });

    const pdf = await loadingTask.promise;

    let textoCompleto = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      const textoPagina = content.items.map((item) => item.str).join(" ");
      textoCompleto += textoPagina + "\n";
    }

    return textoCompleto;
  } catch (error) {
    console.error("ERROR REAL pdfjs:", error);
    throw new Error("No se pudo extraer texto del PDF");
  }
}
*/
