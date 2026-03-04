export default function extraerFechaExpedicion(texto) {
  const regex =
    /FECHA\s*(DE\s*)?(?:EMISI[ÓO]N|EXPEDICI[ÓO]N)?\s*[:\-]?\s*(\d{2}\/\d{2}\/\d{4})(?:\s+(\d{1,2}:\d{2}))?/i;

  const match = texto.match(regex);

  if (match) {
    const fecha = match[2];
    const hora = match[3] || "00:00";
    return normalizarFechaHora(fecha, hora);
  }

  return null;
}

function normalizarFechaHora(fecha, hora = "00:00") {
  if (!fecha) return null;

  try {
    const [dia, mes, anio] = fecha.split("/").map(Number);

    let horas = 0;
    let minutos = 0;

    if (hora) {
      const partesHora = hora.split(":").map(Number);
      horas = partesHora[0] || 0;
      minutos = partesHora[1] || 0;
    }

    const fechaUTC = new Date(
      Date.UTC(anio, mes - 1, dia, horas, minutos, 0, 0),
    );

    return fechaUTC.toISOString();
  } catch {
    return null;
  }
}

/*export default function extraerFechaExpedicion(texto) {
  const patrones = [
    /FECHA\s*(DE\s*)?EMISI[ÓO]N\s*[:\-]?\s*(\d{2}\/\d{2}\/\d{4})(?:\s+(\d{1,2}:\d{2}))?/i,
    // FECHA EXPEDICIÓN: 05/02/2026 13:10
    /FECHA\s*(DE\s*)?EXPEDICI[ÓO]N\s*[:\-]?\s*(\d{2}\/\d{2}\/\d{4})(?:\s+(\d{1,2}:\d{2}))?/i,

    // FECHA: 05/02/2026
    /FECHA\s*[:\-]?\s*(\d{2}\/\d{2}\/\d{4})(?:\s+(\d{1,2}:\d{2}))?/i,

    // fallback: fecha suelta
    /\b(\d{2}\/\d{2}\/\d{4})\b/,
  ];

  for (const regex of patrones) {
    const match = texto.match(regex);
    if (match) {
      const fecha = match[2] || match[1];
      const hora = match[3] || "00:00";
      return normalizarFechaHora(fecha, hora);
    }
  }

  return null;
}
function normalizarFechaHora(fecha, hora) {
  const [d, m, y] = fecha.split("/");
  const [h, min] = hora.split(":");

  const fechaUTC = new Date(
    Date.UTC(Number(y), Number(m) - 1, Number(d), Number(h), Number(min), 0, 0),
  );

  return fechaUTC.toISOString(); // ✅ YYYY-MM-DDTHH:mm:ss.SSSZ
}
*/
