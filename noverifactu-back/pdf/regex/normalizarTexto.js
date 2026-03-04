export default function normalizarTextoOCR(texto) {
  return (
    texto
      .toUpperCase()

      // Mantener saltos de línea (solo limpiar espacios laterales)
      .replace(/[ \t]+/g, " ")

      // Normalizar espacios alrededor de :
      .replace(/\s*:\s*/g, ":")

      // Asegurar espacio antes del €
      .replace(/\s*€/g, " €")

      // Quitar espacios al inicio y final de cada línea
      .split("\n")
      .map((linea) => linea.trim())
      .join("\n")

      .trim()
  );
}
