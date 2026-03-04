import { createContext, useContext, useEffect, useState } from "react";

const SystemContext = createContext();

export function SystemProvider({ children }) {
  const [mantenimiento, setMantenimiento] = useState(false);
  const [loading, setLoading] = useState(true);

  async function cargarEstado() {
    try {
      const res = await fetch("/api/status");
      const data = await res.json();
      setMantenimiento(data.mantenimiento);
    } catch {
      // Si falla status, asumimos operativo
      setMantenimiento(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarEstado();

    // 🔄 Opcional: comprobar cada 30 segundos
    const interval = setInterval(cargarEstado, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SystemContext.Provider
      value={{
        mantenimiento,
        loading,
        refrescarEstado: cargarEstado,
      }}
    >
      {children}
    </SystemContext.Provider>
  );
}

export function useSystem() {
  return useContext(SystemContext);
}
