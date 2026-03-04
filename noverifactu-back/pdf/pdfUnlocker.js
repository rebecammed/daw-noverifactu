import { exec } from "child_process";
import fs from "fs";
import path from "path";

export async function desbloquearPDF(rutaEntrada) {
  const rutaSalida = rutaEntrada.replace(".pdf", "_unlock.pdf");

  return new Promise((resolve, reject) => {
    exec(`qpdf --decrypt "${rutaEntrada}" "${rutaSalida}"`, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve(rutaSalida);
      }
    });
  });
}
