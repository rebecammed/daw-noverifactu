export async function authFetch(url, options = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    // token inválido → logout
    console.log("⚠️ 401 recibido en:", url);
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  if (res.status === 403) {
    // suscripción no activa → NO logout
    const data = await res.json();
    alert("Tu suscripción no está activa: " + data.estado);
    throw new Error("Suscripción no activa");
  }

  return res;
}
