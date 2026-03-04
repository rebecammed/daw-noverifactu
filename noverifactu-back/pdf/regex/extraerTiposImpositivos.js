export default function extraerTiposImpositivos(texto) {
  const impuestos = {};

  const regex = /\b(IVA|IGIC|IPSI|IRPF)\s*(\d+)\s*%/gi;

  let match;

  while ((match = regex.exec(texto)) !== null) {
    const tipo = match[1].toUpperCase();
    const porcentaje = parseInt(match[2]);

    impuestos[tipo] = porcentaje;
  }

  return impuestos;
}
