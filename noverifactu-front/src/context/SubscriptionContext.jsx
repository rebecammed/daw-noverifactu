import { createContext, useContext, useEffect, useState } from "react";
import { authFetch } from "../utils/authFetch";

const SubscriptionContext = createContext();

export function SubscriptionProvider({ children }) {
  const [estadoSuscripcion, setEstadoSuscripcion] = useState(null);
  const [loading, setLoading] = useState(true);

  async function cargarSuscripcion() {
    try {
      const res = await authFetch("/api/user/subscription/status");
      const data = await res.json();
      setEstadoSuscripcion(data);
    } catch (e) {
      console.error("Error cargando suscripción", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      cargarSuscripcion();
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <SubscriptionContext.Provider
      value={{ estadoSuscripcion, setEstadoSuscripcion, loading }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  return useContext(SubscriptionContext);
}
