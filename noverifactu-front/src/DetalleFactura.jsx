import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authFetch } from "./utils/authFetch";
import { useSubscription } from "./context/SubscriptionContext";
import { useSystem } from "./context/SystemContext";
import {
  Box,
  Paper,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Stack,
  Button,
} from "@mui/material";

function DetalleFactura() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { estadoSuscripcion, load } = useSubscription();
  const [loading, setLoading] = useState(true);
  const [factura, setFactura] = useState(null);
  const [rectificaciones, setRectificaciones] = useState(null);
  const [estado, setEstado] = useState(null);
  const [error, setError] = useState(null);
  const [datosFiscales, setDatosFiscales] = useState(null);
  const { mantenimiento } = useSystem();

  useEffect(() => {
    authFetch(`/api/facturas/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo cargar la factura");
        return res.json();
      })
      .then((data) => {
        const { estadoReal, rectificaciones, tieneXmlAnulacion, ...factura } =
          data;
        setFactura({ ...factura, tieneXmlAnulacion });
        setRectificaciones(rectificaciones);
        setEstado(estadoReal);
        setLoading(false);
      })
      .catch(() => {
        setError("No se pudo cargar la factura");
        setLoading(false);
      });
  }, [id]);
  useEffect(() => {
    async function cargarDatosFiscales() {
      try {
        const res = await authFetch(
          "http://localhost:3000/api/user/datos-fiscales",
        );

        const data = await res.json();
        setDatosFiscales(data.datos); // puede ser null
      } catch (error) {
        console.error("Error cargando datos fiscales", error);
      } finally {
        setCargandoDatos(false);
      }
    }

    cargarDatosFiscales();
  }, []);
  async function descargarPDFOriginal() {
    try {
      const res = await authFetch(`/api/facturas/${id}/pdf-original`);

      if (!res.ok) {
        const text = await res.text();
        alert("Error descargando PDF: " + text);
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `factura_${factura.numero_factura}_original.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Error descargando PDF");
    }
  }

  async function descargarXML() {
    try {
      const res = await authFetch(`/api/facturas/${id}/xml`);

      if (!res.ok) {
        const text = await res.text();
        alert("Error descargando XML: " + text);
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `factura_${factura.numero_factura}.xml`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Error descargando XML");
    }
  }

  async function descargarXMLAnulacion() {
    try {
      const res = await authFetch(`/api/facturas/${id}/xml?tipo=anulacion`);

      if (!res.ok) {
        const text = await res.text();
        alert("Error descargando XML de anulación: " + text);
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `anulacion_${factura.numero_factura}.xml`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Error descargando XML de anulación");
    }
  }

  const formatearFecha = (fecha) => {
    if (!fecha) return "—";
    return new Date(fecha).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const tieneSustitutivaActiva =
    rectificaciones &&
    rectificaciones.some(
      (r) => r.tipo_rectificacion === "SUSTITUCION" && r.estado !== "ANULADA",
    );

  const tieneSustitutivaHistorica =
    rectificaciones &&
    rectificaciones.some((r) => r.tipo_rectificacion === "SUSTITUCION");

  const permitirMasRectificaciones = !tieneSustitutivaActiva;

  function datosIncompletos() {
    if (!datosFiscales) return true;

    const { razon_social, nif, direccion, codigo_postal, ciudad, pais } =
      datosFiscales;

    return (
      !razon_social || !nif || !direccion || !codigo_postal || !ciudad || !pais
    );
  }
  if (loading) return <p>Cargando factura...</p>;
  if (load) return <p>Cargando...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!factura) return <p>No hay datos</p>;

  return (
    <Paper
      elevation={3}
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 4,
        border: "1px solid #eee",
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 4 }}>
        Detalle de factura
      </Typography>

      {/* ========================= */}
      {/* DATOS GENERALES */}
      {/* ========================= */}

      <Grid container columnSpacing={3} justifyContent="space-between">
        {/* IZQUIERDA */}
        <Grid item xs={12} md="auto">
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Información de la factura
            </Typography>

            <Stack spacing={1}>
              <Typography>
                <strong>Número:</strong> {factura.numero_factura}
              </Typography>
              <Typography>
                <strong>Fecha expedición:</strong>{" "}
                {formatearFecha(factura.fecha_expedicion)}
              </Typography>
              <Typography>
                <strong>Tipo:</strong> {factura.tipo_factura}
              </Typography>
              <Typography>
                <strong>Importe total:</strong> {factura.importe_total} €
              </Typography>
              <Typography>
                <strong>Estado:</strong>{" "}
                <span
                  style={{
                    color: estado === "ANULADA" ? "red" : "green",
                    fontWeight: 600,
                  }}
                >
                  {estado}
                </span>
              </Typography>
            </Stack>
          </Box>
        </Grid>

        {/* DERECHA */}
        <Grid item xs={12} md="auto">
          <Box sx={{ textAlign: "right", pr: { xs: 0, md: 2 } }}>
            <Typography variant="h6" sx={{ mb: 4, fontWeight: 600 }}>
              Datos del cliente
            </Typography>

            <Stack spacing={1}>
              <Typography>
                <strong>NIF:</strong> {factura.cliente?.nif || "—"}
              </Typography>
              <Typography>
                <strong>Nombre:</strong> {factura.cliente?.nombre || "—"}
              </Typography>
              <Typography>
                <strong>Dirección:</strong> {factura.cliente?.direccion || "—"}
              </Typography>
            </Stack>
          </Box>
        </Grid>
      </Grid>

      {/* ========================= */}
      {/* CONCEPTOS */}
      {/* ========================= */}

      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Conceptos
        </Typography>

        {(!factura.conceptos || factura.conceptos.length === 0) && (
          <Typography color="text.secondary">
            No hay conceptos asociados a esta factura.
          </Typography>
        )}

        {factura.conceptos && factura.conceptos.length > 0 && (
          <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.100" }}>
                  {["Descripción", "Cantidad", "Precio unitario", "Base"].map(
                    (col) => (
                      <TableCell key={col}>
                        <Typography sx={{ fontWeight: 550 }}>{col}</Typography>
                      </TableCell>
                    ),
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {factura.conceptos.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.descripcion}</TableCell>
                    <TableCell>{Number(c.cantidad)}</TableCell>
                    <TableCell>
                      {Number(c.precio_unitario).toFixed(2)} €
                    </TableCell>
                    <TableCell>{Number(c.base).toFixed(2)} €</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* ========================= */}
      {/* RESUMEN */}
      {/* ========================= */}

      {factura.conceptos && factura.conceptos.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Resumen
          </Typography>

          {(() => {
            const baseTotal = factura.conceptos.reduce(
              (acc, c) => acc + Number(c.base),
              0,
            );

            const cuotaTotal =
              factura.impuestos?.reduce(
                (acc, imp) => acc + Number(imp.cuota),
                0,
              ) || 0;

            const importeTotal = baseTotal + cuotaTotal;

            return (
              <Stack spacing={1}>
                <Typography>
                  <strong>Base imponible:</strong> {baseTotal.toFixed(2)} €
                </Typography>

                {factura.impuestos?.map((imp) => (
                  <Typography key={imp.id}>
                    <strong>
                      {imp.tipo_impuesto} {imp.tipo_impositivo}%:
                    </strong>{" "}
                    {Number(imp.cuota).toFixed(2)} €
                  </Typography>
                ))}

                <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", mt: 1 }}>
                  TOTAL: {importeTotal.toFixed(2)} €
                </Typography>
              </Stack>
            );
          })()}
        </Box>
      )}

      {/* ========================= */}
      {/* BOTONES DOCUMENTOS */}
      {/* ========================= */}

      <Stack direction="row" spacing={2} sx={{ mb: 4, flexWrap: "wrap" }}>
        <Button variant="outlined" onClick={descargarXML}>
          Descargar XML
        </Button>

        {estado === "ANULADA" && factura.tieneXmlAnulacion && (
          <Button
            variant="contained"
            color="error"
            onClick={descargarXMLAnulacion}
          >
            Descargar XML de anulación
          </Button>
        )}

        {factura.ruta_pdf ? (
          <Button variant="outlined" onClick={descargarPDFOriginal}>
            Descargar PDF original
          </Button>
        ) : (
          <Button variant="outlined" disabled>
            PDF original no disponible
          </Button>
        )}
      </Stack>

      {/* ========================= */}
      {/* RECTIFICACIONES */}
      {/* ========================= */}

      {factura.tipo_factura !== "RECTIFICATIVA" && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Rectificaciones
          </Typography>

          {rectificaciones && rectificaciones.length === 0 && (
            <Typography color="text.secondary">
              No existen rectificaciones para esta factura.
            </Typography>
          )}

          {rectificaciones && rectificaciones.length > 0 && (
            <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "grey.100" }}>
                    {[
                      "Número",
                      "Fecha",
                      "Tipo",
                      "Importe",
                      "Documentos",
                      "Acciones",
                    ].map((col) => (
                      <TableCell key={col}>
                        <Typography sx={{ fontWeight: 550 }}>{col}</Typography>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rectificaciones.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.numero_factura}</TableCell>
                      <TableCell>{r.fecha_expedicion}</TableCell>
                      <TableCell>{r.tipo_rectificacion}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {r.importe_total} €
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() =>
                              descargarXMLRectificativa(r.id, r.numero_factura)
                            }
                          >
                            XML
                          </Button>

                          <Button
                            variant="contained"
                            size="small"
                            onClick={() =>
                              descargarPDFRectificativa(r.id, r.numero_factura)
                            }
                          >
                            PDF
                          </Button>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => navigate(`/registro/${r.id}`)}
                        >
                          Ver Detalle
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* ========================= */}
      {/* ACCIONES FINALES */}
      {/* ========================= */}

      <Stack direction="row" spacing={2} flexWrap="wrap">
        {factura.tipo_factura !== "RECTIFICATIVA" &&
          estado !== "ANULADA" &&
          permitirMasRectificaciones && (
            <Button
              variant="contained"
              onClick={() => navigate(`/rectificar/${factura.id}`)}
              disabled={
                //estadoSuscripcion.estadoSuscripcion !== "ACTIVA" ||
                mantenimiento || datosIncompletos()
              }
            >
              Rectificar factura
            </Button>
          )}

        {estado === "ANULADA" && (
          <Typography color="error">
            No se puede rectificar una factura anulada.
          </Typography>
        )}

        {tieneSustitutivaActiva && (
          <Typography color="warning.main">
            Esta factura fue reemplazada por una rectificativa sustitutiva.
          </Typography>
        )}

        {estado !== "ANULADA" && (
          <Button
            variant="outlined"
            color="error"
            onClick={() => navigate(`/registro/${factura.id}/anulacion`)}
            disabled={
              //estadoSuscripcion.estadoSuscripcion !== "ACTIVA" ||
              mantenimiento || datosIncompletos()
            }
          >
            Anular factura
          </Button>
        )}

        <Button variant="outlined" onClick={() => navigate("/registro")}>
          Volver al listado
        </Button>
      </Stack>
    </Paper>
  );
}

export default DetalleFactura;

/*import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authFetch } from "./utils/authFetch";
import { useSubscription } from "./context/SubscriptionContext";

function DetalleFactura() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { estadoSuscripcion, load } = useSubscription();
  const [loading, setLoading] = useState(true);
  const [factura, setFactura] = useState(null);
  const [rectificaciones, setRectificaciones] = useState(null);
  const [estado, setEstado] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    authFetch(`/api/facturas/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo cargar la factura");
        return res.json();
      })
      .then((data) => {
        const { estadoReal, rectificaciones, ...factura } = data;
        setFactura(factura);
        setRectificaciones(rectificaciones);
        setEstado(estadoReal);
        setLoading(false);
      })
      .catch(() => {
        setError("No se pudo cargar la factura");
        setLoading(false);
      });
  }, [id]);
  /*
  const descargarPDF = async (id) => {
    const res = await authFetch(`/api/facturas/${id}/pdf`);

    if (!res.ok) {
      alert("Error descargando PDF");
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `factura_${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  };

  async function descargarPDFOriginal() {
    try {
      const res = await authFetch(`/api/facturas/${id}/pdf-original`);

      if (!res.ok) {
        const text = await res.text();
        alert("Error descargando PDF: " + text);
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `factura_${factura.numero_factura}_original.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Error descargando PDF");
    }
  }

  async function descargarXML() {
    try {
      const res = await authFetch(`/api/facturas/${id}/xml`);

      if (!res.ok) {
        const text = await res.text();
        alert("Error descargando XML: " + text);
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `factura_${factura.numero_factura}.xml`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Error descargando XML");
    }
  }

  if (loading) return <p>Cargando factura...</p>;
  if (load) return <p>Cargando...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!factura) {
    return <p>No hay datos</p>;
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Detalle de factura</h2>

      {/* Datos principales */ /*}
      <section>
        <p>
          <strong>Número:</strong> {factura.numero_factura}
        </p>
        <p>
          <strong>Fecha expedición:</strong> {factura.fecha_expedicion}
        </p>
        <p>
          <strong>Tipo de factura:</strong> {factura.tipo_factura}
        </p>
        <p>
          <strong>Importe total:</strong> {factura.importe_total} €
        </p>
        <p>
          <strong>Estado:</strong>{" "}
          {estado === "ANULADA" ? (
            <span style={{ color: "red", fontWeight: "bold" }}>ANULADA</span>
          ) : (
            <span style={{ color: "green", fontWeight: "bold" }}>ACTIVA</span>
          )}
        </p>
      </section>

      {/* 👇 NUEVA SECCIÓN CLIENTE */ /*}
      <section style={{ marginTop: "1.5rem" }}>
        <h3>Datos del cliente</h3>

        <p>
          <strong>NIF:</strong> {factura.cliente?.nif || "—"}
        </p>
        <p>
          <strong>Nombre:</strong> {factura.cliente?.nombre || "—"}
        </p>
        <p>
          <strong>Dirección:</strong> {factura.cliente?.direccion || "—"}
        </p>
      </section>
      <section style={{ marginTop: "1.5rem" }}>
        <h3>Desglose de impuestos</h3>

        {(!factura.impuestos || factura.impuestos.length === 0) && (
          <p>No hay impuestos asociados a esta factura.</p>
        )}

        {factura.impuestos && factura.impuestos.length > 0 && (
          <table border="1" cellPadding="6">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Base imponible</th>
                <th>Tipo %</th>
                <th>Cuota</th>
              </tr>
            </thead>
            <tbody>
              {factura.impuestos.map((imp) => (
                <tr key={imp.id}>
                  <td>{imp.tipo_impuesto}</td>
                  <td>{Number(imp.base_imponible).toFixed(2)} €</td>
                  <td>{imp.tipo_impositivo} %</td>
                  <td>{Number(imp.cuota).toFixed(2)} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      <button onClick={descargarXML}>Descargar XML</button>

      {factura.ruta_pdf ? (
        <button onClick={descargarPDFOriginal} style={{ marginLeft: "1rem" }}>
          Descargar PDF original
        </button>
      ) : (
        <button disabled style={{ marginLeft: "1rem", opacity: 0.5 }}>
          PDF original no disponible
        </button>
      )}

      {
        //</section>
      }
      {/* Rectificaciones */ /*}
      {factura.tipo_factura !== "RECTIFICATIVA" && (
        <section style={{ marginTop: "2rem" }}>
          <h3>Rectificaciones</h3>

          {rectificaciones && rectificaciones.length === 0 && (
            <p>No existen rectificaciones para esta factura.</p>
          )}

          {rectificaciones && rectificaciones.length > 0 && (
            <table border="1" cellPadding="6">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Importe</th>
                  <th>XML</th>
                </tr>
              </thead>
              <tbody>
                {rectificaciones.map((r) => (
                  <tr key={r.id}>
                    <td>{r.numero_factura}</td>
                    <td>{r.fecha_expedicion}</td>
                    <td>{r.tipo_rectificacion}</td>
                    <td>{r.importe_total} €</td>
                    <td>
                      <button
                        onClick={async () => {
                          try {
                            const res = await authFetch(
                              `/api/facturas/${r.id}/xml`,
                            );

                            if (!res.ok) {
                              alert("Error descargando XML");
                              return;
                            }

                            const blob = await res.blob();
                            const url = window.URL.createObjectURL(blob);

                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `rectificativa_${r.numero_factura}.xml`;
                            a.click();

                            window.URL.revokeObjectURL(url);
                          } catch (e) {
                            console.error(e);
                            alert("Error descargando XML");
                          }
                        }}
                      >
                        Descargar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {/* Acciones */ /*}
      <section style={{ marginTop: "2rem" }}>
        {estadoSuscripcion.estadoSuscripcion !== "ACTIVA" && (
          <p style={{ color: "red" }}>
            Tu suscripción no está activa. No puedes registrar facturas.
          </p>
        )}
        {factura.tipo_factura !== "RECTIFICATIVA" && (
          <button
            onClick={() => navigate(`/rectificar/${factura.id}`)}
            disabled={estadoSuscripcion.estadoSuscripcion !== "ACTIVA"}
          >
            Rectificar factura
          </button>
        )}

        {estado !== "ANULADA" && (
          <button
            onClick={() => navigate(`/registro/${factura.id}/anulacion`)}
            disabled={estadoSuscripcion.estadoSuscripcion !== "ACTIVA"}
          >
            Anular factura
          </button>
        )}

        <button
          style={{ marginLeft: "1rem" }}
          onClick={() => navigate("/registro")}
        >
          Volver al listado
        </button>
      </section>
    </div>
  );
}

export default DetalleFactura;
*/
