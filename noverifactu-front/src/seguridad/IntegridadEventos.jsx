import { useEffect, useState } from "react";
import { authFetch } from "../utils/authFetch";

function IntegridadEventos() {
  const [estado, setEstado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function cargarEstado() {
      try {
        const res = await authFetch("/api/integridad-eventos");
        const data = await res.json();

        setEstado(data);
      } catch {
        setError("Error comprobando la integridad de la cadena de eventos");
      } finally {
        setCargando(false);
      }
    }

    cargarEstado();
  }, []);

  async function iniciarCadena() {
    const confirmar = window.confirm(
      "Esta acción inicia una nueva cadena de auditoría. Las cadenas anteriores no se eliminan. ¿Deseas continuar?",
    );

    if (!confirmar) return;

    try {
      const res = await authFetch("/api/admin/iniciar-cadena-eventos", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error iniciando la nueva cadena");
        return;
      }

      setMensaje("Nueva cadena de auditoría iniciada correctamente");
      setEstado({ iniciada: true });
    } catch {
      setError("Error de conexión con el servidor");
    }
  }

  if (cargando) return <p>Comprobando integridad…</p>;

  return (
    <div
      style={{
        marginTop: "2rem",
        borderTop: "1px solid #ccc",
        paddingTop: "1rem",
      }}
    >
      <h3>Integridad y auditoría</h3>

      {estado?.ok && (
        <p style={{ color: "green" }}>✅ Cadena de eventos íntegra.</p>
      )}

      {estado && estado.ok === false && (
        <p style={{ color: "#dc2626" }}>
          ❌ La cadena presenta inconsistencias.
        </p>
      )}

      {/* 🔴 BOTÓN SIEMPRE VISIBLE */}
      <button
        onClick={iniciarCadena}
        style={{
          backgroundColor: "#dc2626",
          color: "white",
          marginTop: "0.5rem",
        }}
      >
        Iniciar nueva cadena de auditoría
      </button>

      <p style={{ fontSize: "0.9em", color: "#666" }}>
        Esta acción se utiliza únicamente ante cambios técnicos o correcciones
        del sistema.
      </p>

      {mensaje && <p style={{ color: "green" }}>{mensaje}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default IntegridadEventos;
