import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "./utils/authFetch";
import { useOutletContext } from "react-router-dom";
import { Stack, Button } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import { Snackbar, Alert } from "@mui/material";
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
  Chip,
  LinearProgress,
} from "@mui/material";
function ListadoFacturas() {
  const facturasPorPagina = 10;

  const [searchParams, setSearchParams] = useSearchParams();
  const paginaDesdeURL = parseInt(searchParams.get("page") || "1", 10);

  const [paginaActual, setPaginaActual] = useState(paginaDesdeURL);
  const [facturas, setFacturas] = useState([]);
  const [totalFacturas, setTotalFacturas] = useState(0);

  const { fechaInicio, fechaFin, busqueda, orden, clienteSeleccionado } =
    useOutletContext();
  const [busquedaDebounced, setBusquedaDebounced] = useState(busqueda);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // success | error | warning | info
  });

  useEffect(() => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set("page", paginaActual);
      return params;
    });
  }, [paginaActual]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setBusquedaDebounced(busqueda);
    }, 400);

    return () => clearTimeout(timer);
  }, [busqueda]);

  useEffect(() => {
    setPaginaActual(1);
  }, [fechaInicio, fechaFin, busquedaDebounced, orden, clienteSeleccionado]);

  useEffect(() => {
    cargarFacturas();
  }, [
    paginaActual,
    fechaInicio,
    fechaFin,
    busquedaDebounced,
    orden,
    clienteSeleccionado,
  ]);

  async function cargarFacturas() {
    try {
      const params = new URLSearchParams();

      if (fechaInicio) params.append("fechaInicio", fechaInicio);
      if (fechaFin) params.append("fechaFin", fechaFin);
      if (busquedaDebounced) params.append("q", busquedaDebounced);
      if (orden) params.append("orden", orden);
      if (clienteSeleccionado) params.append("cliente", clienteSeleccionado);

      params.append("page", paginaActual);
      params.append("limit", facturasPorPagina);
      setLoading(true);

      const res = await authFetch(`/api/facturas?${params.toString()}`);
      const data = await res.json();

      setFacturas(data.facturas);
      setTotalFacturas(data.total);

      const nuevasPaginas = Math.max(
        1,
        Math.ceil(data.total / facturasPorPagina),
      );

      if (paginaActual > nuevasPaginas) {
        setPaginaActual(nuevasPaginas);
      }
      setLoading(false);
    } catch {
      setError("Error cargando facturas");
    }
  }
  const cambiarPagina = (nuevaPagina) => {
    setPaginaActual(nuevaPagina);

    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set("page", nuevaPagina);
      return params;
    });
  };
  const irPrimera = () => cambiarPagina(1);

  const irAnterior = () => {
    if (paginaActual > 1) {
      cambiarPagina(paginaActual - 1);
    }
  };

  const irSiguiente = () => {
    if (paginaActual < totalPaginas) {
      cambiarPagina(paginaActual + 1);
    }
  };

  const irUltima = () => cambiarPagina(totalPaginas);

  async function comprobarIntegridad() {
    try {
      const res = await authFetch("/api/integridad");
      const data = await res.json();
      console.log(data);

      if (data.ok) {
        setSnackbar({
          open: true,
          message: "Integridad correcta: la cadena es válida",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: "Integridad rota en uno o más registros",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error comprobando integridad:", error);
      alert("⚠️ Error al comprobar la integridad");
    }
  }

  async function comprobarIntegridadEventos() {
    try {
      const res = await authFetch("/api/integridad-eventos");
      const data = await res.json();

      if (!res.ok) {
        alert("⚠️ Error del servidor comprobando integridad");
        return;
      }

      if (data.ok) {
        setSnackbar({
          open: true,
          message: "Integridad correcta: la cadena es válida",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: "Integridad rota en uno o más registros",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error comprobando integridad de eventos:", error);
      alert("⚠️ Error al comprobar la integridad del log de eventos");
    }
  }

  const descargarXML = async (id) => {
    const res = await authFetch(`/api/facturas/${id}/xml`);

    if (!res.ok) {
      alert("Error descargando XML");
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `factura_${id}.xml`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  };

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
  if (error) return <p>{error}</p>;

  const totalPaginas = Math.max(
    1,
    Math.ceil(totalFacturas / facturasPorPagina),
  );

  const inicio = (paginaActual - 1) * facturasPorPagina + 1;
  const fin = inicio + facturas.length - 1;

  return (
    <Paper
      elevation={3}
      sx={{ p: { xs: 2, md: 5 }, borderRadius: 4, border: "1px solid #eee" }}
    >
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 4 }}>
        Mis facturas
      </Typography>
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Button
          variant="contained"
          onClick={comprobarIntegridad}
          sx={{
            px: 4,
            py: 1.5,
            fontSize: "1rem",
            bgcolor: "#1a73e8",
            fontWeight: 600,
            textTransform: "none",
            transition: "all 0.2s ease",

            "&:hover": {
              bgcolor: "#155ec0",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            },
          }}
        >
          Comprobar integridad facturas
        </Button>

        <Button
          variant="outlined"
          onClick={comprobarIntegridadEventos}
          sx={{
            px: 4,
            py: 1.5,
            fontSize: "1rem",
            borderColor: "#1a73e8",
            color: "#1a73e8",
            fontWeight: 600,
            textTransform: "none",
            transition: "all 0.2s ease",

            "&:hover": {
              bgcolor: "rgba(26,115,232,0.08)",
              borderColor: "#155ec0",
            },
          }}
        >
          Comprobar integridad eventos
        </Button>
      </Stack>

      {facturas.length > 0 && (
        <p style={{ marginTop: "10px" }}>
          Mostrando {inicio}–{fin} de {totalFacturas} factura
          {totalFacturas !== 1 && "s"}
        </p>
      )}
      {loading && <LinearProgress />}
      <TableContainer component={Paper} sx={{ mt: 3, borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "grey.100" }}>
              <TableCell>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "1rem",
                    fontWeight: "550",
                    color: "#374151",
                  }}
                >
                  Número
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "1rem",
                    fontWeight: "550",
                    color: "#374151",
                  }}
                >
                  Fecha
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "1rem",
                    fontWeight: "550",
                    color: "#374151",
                  }}
                >
                  Cliente
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "1rem",
                    fontWeight: "550",
                    color: "#374151",
                  }}
                >
                  Tipo
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "1rem",
                    fontWeight: "550",
                    color: "#374151",
                  }}
                >
                  Importe
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "1rem",
                    fontWeight: "550",
                    color: "#374151",
                  }}
                >
                  Estado
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "1rem",
                    fontWeight: "550",
                    color: "#374151",
                  }}
                >
                  Acciones
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "1rem",
                    fontWeight: "550",
                    color: "#374151",
                  }}
                >
                  Detalle
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(facturas) && facturas.length === 0 ? (
              <TableRow>
                <TableCell colSpan="7">No hay facturas</TableCell>
              </TableRow>
            ) : (
              facturas.map((f) => (
                <TableRow key={f.id}>
                  <TableCell>{f.numero_factura} </TableCell>
                  <TableCell>{formatearFecha(f.fecha_expedicion)} </TableCell>
                  <TableCell>
                    {f.cliente_nombre ? `${f.cliente_nombre}` : f.cliente_nif}
                  </TableCell>
                  <TableCell>{f.tipo_factura} </TableCell>
                  <TableCell>{f.importe_total} € </TableCell>
                  <TableCell>{f.estado} </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        borderColor: "#1a73e8",
                        color: "#1a73e8",
                        transition: "all 0.2s ease",

                        "&:hover": {
                          bgcolor: "rgba(26,115,232,0.08)",
                          borderColor: "#155ec0",
                        },
                      }}
                      onClick={() => {
                        descargarPDF(f.id);
                      }}
                    >
                      PDF
                    </Button>

                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        borderColor: "#1a73e8",
                        color: "#1a73e8",
                        transition: "all 0.2s ease",

                        "&:hover": {
                          bgcolor: "rgba(26,115,232,0.08)",
                          borderColor: "#155ec0",
                        },
                      }}
                      onClick={() => {
                        descargarXML(f.id);
                      }}
                    >
                      XML
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => navigate(`/registro/${f.id}`)}
                      sx={{
                        px: 3,
                        py: 0.7,
                        bgcolor: "#1a73e8",
                        fontWeight: 600,
                        textTransform: "none",
                        transition: "all 0.2s ease",

                        "&:hover": {
                          bgcolor: "#155ec0",
                          boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                        },
                      }}
                    >
                      Ver detalle
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <div style={{ marginTop: "15px" }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderColor: "#d1d5db",
              transition: "all 0.2s ease",

              "&:hover": {
                bgcolor: "#f1f5f9",
              },
            }}
            onClick={irPrimera}
            disabled={paginaActual === 1}
          >
            ⏮ Primera
          </Button>

          <Button
            variant="outlined"
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderColor: "#d1d5db",
              transition: "all 0.2s ease",

              "&:hover": {
                bgcolor: "#f1f5f9",
              },
            }}
            onClick={irAnterior}
            disabled={paginaActual === 1}
          >
            ◀ Anterior
          </Button>

          <Typography>
            Página {paginaActual} de {totalPaginas}
          </Typography>

          <Button
            variant="outlined"
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderColor: "#d1d5db",
              transition: "all 0.2s ease",

              "&:hover": {
                bgcolor: "#f1f5f9",
              },
            }}
            onClick={irSiguiente}
            disabled={paginaActual === totalPaginas}
          >
            Siguiente ▶
          </Button>

          <Button
            variant="outlined"
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderColor: "#d1d5db",
              transition: "all 0.2s ease",

              "&:hover": {
                bgcolor: "#f1f5f9",
              },
            }}
            onClick={irUltima}
            disabled={paginaActual === totalPaginas}
          >
            Última ⏭
          </Button>
        </Stack>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </Paper>
  );
}

export default ListadoFacturas;
