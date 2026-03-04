import libxmljs from "libxmljs2";
import fs from "fs";

export default function validarFacturaAltaXSD(xmlString) {
  const xsdPath = "../esquemas/registroAltaFactura.xsd";

  const xsdContent = fs.readFileSync(xsdPath, "utf8");

  const xmlDoc = libxmljs.parseXml(xmlString);
  const xsdDoc = libxmljs.parseXml(xsdContent);

  const esValido = xmlDoc.validate(xsdDoc);

  return {
    esValido,
    errores: xmlDoc.validationErrors,
  };
}
