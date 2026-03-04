import libxmljs from "libxmljs2";
import fs from "fs";
import path from "path";

export default function validarFacturaRectificativaXSD(xmlString) {
  const xsdPath = "../esquemas/registroRectificativoFactura.xsd";
  const xsdString = fs.readFileSync(xsdPath, "utf8");

  const xmlDoc = libxmljs.parseXml(xmlString);
  const xsdDoc = libxmljs.parseXml(xsdString);

  const esValido = xmlDoc.validate(xsdDoc);

  return {
    esValido,
    errores: esValido ? [] : xmlDoc.validationErrors,
  };
}
