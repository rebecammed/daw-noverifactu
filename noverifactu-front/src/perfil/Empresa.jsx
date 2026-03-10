import { useEffect, useState } from "react";
import { authFetch } from "../utils/authFetch";
import {
  Button,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Typography,
  Container,
  Box,
} from "@mui/material";
const API_URL = import.meta.env.VITE_API_URL;
function Empresa() {
  const [datosFiscales, setDatosFiscales] = useState({
    razon_social: "",
    nif: "",
    direccion: "",
    codigo_postal: "",
    ciudad: "",
    pais: "",
  });
  const [logo, setLogo] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [erroresValidacion, setErroresValidacion] = useState({});
  useEffect(() => {
    async function cargarDatos() {
      try {
        const res = await authFetch("/api/user/datos-fiscales");
        const data = await res.json();

        setDatosFiscales(data.datos); // puede ser null
      } catch {
        setError("Error cargando datos fiscales");
      } finally {
        setCargando(false);
      }
    }

    cargarDatos();
  }, []);
  function handleChange(e) {
    const { name, value } = e.target;
    setDatosFiscales((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
  function validarNIF(nif) {
    if (!nif) return false;

    const nifRegex = /^[0-9]{8}[A-Z]$/i; // DNI
    const cifRegex = /^[A-HJNP-SUVW][0-9]{7}[0-9A-J]$/i; // CIF básico
    const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/i; // NIE

    return nifRegex.test(nif) || cifRegex.test(nif) || nieRegex.test(nif);
  }

  function validarCodigoPostal(cp) {
    return /^[0-9]{5}$/.test(cp);
  }

  async function guardarDatos(e) {
    e.preventDefault();
    setMensaje("");
    setError("");

    const nuevosErrores = {};

    if (!validarNIF(datosFiscales.nif)) {
      nuevosErrores.nif = "NIF/CIF no válido";
    }

    if (!validarCodigoPostal(datosFiscales.codigo_postal)) {
      nuevosErrores.codigo_postal = "Código postal no válido";
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErroresValidacion(nuevosErrores);
      return;
    }

    setErroresValidacion({});

    try {
      const data = new FormData();

      data.append("razon_social", datosFiscales.razon_social);
      data.append("nif", datosFiscales.nif);
      data.append("direccion", datosFiscales.direccion);
      data.append("codigo_postal", datosFiscales.codigo_postal);
      data.append("ciudad", datosFiscales.ciudad);
      data.append("pais", datosFiscales.pais);

      if (logo) {
        data.append("logo", logo);
      }

      const res = await authFetch("/api/user/datos-fiscales", {
        method: "POST",
        body: data,
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Error guardando datos fiscales");
        return;
      }

      setDatosFiscales(result.datos || datosFiscales);
      setModoEdicion(false);
      setMensaje("Datos fiscales guardados correctamente");
    } catch {
      setError("Error de conexión con el servidor");
    }
  }
  function datosIncompletos() {
    if (!datosFiscales) return true;

    const { razon_social, nif, direccion, codigo_postal, ciudad, pais } =
      datosFiscales;

    return (
      !razon_social || !nif || !direccion || !codigo_postal || !ciudad || !pais
    );
  }
  if (cargando) return <p>Cargando...</p>;
  return (
    <Box sx={{ p: 1 }}>
      {datosIncompletos() && (
        <Paper
          sx={{
            p: 2,
            mb: 3,
            backgroundColor: "#FFF4E5",
            border: "1px solid #FFA726",
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            ⚠️ Datos fiscales incompletos
          </Typography>
          <Typography variant="body2">
            Debes completar tus datos fiscales para poder crear facturas.
            Mientras tanto, algunas funciones estarán deshabilitadas.
          </Typography>
        </Paper>
      )}
      {!modoEdicion && datosFiscales && (
        <>
          {/* SECCIÓN SUPERIOR: Títulos y Logo */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Box>
              <Typography variant="h4">Datos fiscales de la empresa</Typography>
            </Box>
            {datosFiscales.logo_path && (
              <Box
                component="img"
                src={`${API_URL}${datosFiscales.logo_path}`}
                alt="Logo empresa"
                sx={{
                  maxWidth: 280,
                  maxHeight: 220,
                  objectFit: "contain",
                  borderRadius: 2,
                }}
              />
            )}
          </Box>

          <TableContainer
            component={Paper}
            sx={{
              mt: 2,
              borderRadius: 4,
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            }}
          >
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
                      Razón social
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
                      NIF
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
                      Domicilio fiscal
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
                      Código postal
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
                      Ciudad
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
                      País
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>{datosFiscales.razon_social} </TableCell>
                  <TableCell>{datosFiscales.nif} </TableCell>
                  <TableCell>{datosFiscales.direccion} </TableCell>
                  <TableCell>{datosFiscales.codigo_postal} </TableCell>
                  <TableCell>{datosFiscales.ciudad} </TableCell>
                  <TableCell>{datosFiscales.pais} </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              sx={{
                borderRadius: 2,
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
              onClick={() => {
                setModoEdicion(true);
              }}
            >
              Modificar datos fiscales
            </Button>
          </Box>
        </>
      )}

      {!modoEdicion && !datosFiscales && (
        <>
          <h1>Datos fiscales y tarifas</h1>
          <h2>Datos fiscales de la empresa</h2>
          <p style={{ color: "#666" }}>
            No existen datos fiscales asociados a este usuario.
          </p>

          <Button
            type="submit"
            variant="contained"
            sx={{
              mt: 2,
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
            onClick={() => {
              setModoEdicion(true);
            }}
          >
            Añadir datos fiscales
          </Button>
        </>
      )}
      <div>
        {modoEdicion && datosFiscales === null && (
          <div>
            <h1>Datos fiscales y tarifas</h1>
            <form onSubmit={guardarDatos}>
              <h2>Añadir datos fiscales</h2>
              <label>Razón social</label>

              <input
                name="razon_social"
                placeholder="Razón social"
                value={datosFiscales?.razon_social || ""}
                onChange={handleChange}
              />
              <label>NIF</label>

              <input
                name="nif"
                placeholder="NIF"
                value={datosFiscales?.nif || ""}
                onChange={handleChange}
              />

              {erroresValidacion.nif && (
                <p style={{ color: "red", fontSize: "0.8rem" }}>
                  {erroresValidacion.nif}
                </p>
              )}
              <label>Dirección</label>

              <input
                name="direccion"
                placeholder="Dirección"
                value={datosFiscales?.direccion || ""}
                onChange={handleChange}
              />
              <label>Código postal</label>

              <input
                name="codigo_postal"
                placeholder="Código postal"
                value={datosFiscales?.codigo_postal || ""}
                onChange={handleChange}
              />

              {erroresValidacion.codigo_postal && (
                <p style={{ color: "red", fontSize: "0.8rem" }}>
                  {erroresValidacion.codigo_postal}
                </p>
              )}
              <label>Ciudad</label>

              <input
                name="ciudad"
                placeholder="Ciudad"
                value={datosFiscales?.ciudad || ""}
                onChange={handleChange}
              />
              <label>País</label>

              <input
                name="pais"
                placeholder="País"
                value={datosFiscales?.pais || ""}
                onChange={handleChange}
              />

              <label>Logo de la empresa</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogo(e.target.files[0])}
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
              >
                Guardar datos fiscales
              </Button>
            </form>
          </div>
        )}

        {modoEdicion && datosFiscales && (
          <div>
            <h1>Datos fiscales y tarifas</h1>
            <form onSubmit={guardarDatos}>
              <h2>Modificar datos fiscales</h2>
              <label>Razón social</label>
              <input
                name="razon_social"
                value={datosFiscales.razon_social}
                onChange={handleChange}
              />
              <label>NIF</label>
              <input
                name="nif"
                value={datosFiscales.nif}
                onChange={handleChange}
              />
              <label>Dirección</label>
              <input
                name="direccion"
                value={datosFiscales.direccion}
                onChange={handleChange}
              />
              <label>Código postal</label>
              <input
                name="codigo_postal"
                value={datosFiscales.codigo_postal}
                onChange={handleChange}
              />
              <label>Ciudad</label>
              <input
                name="ciudad"
                value={datosFiscales.ciudad}
                onChange={handleChange}
              />
              <label>País</label>
              <input
                name="pais"
                value={datosFiscales.pais}
                onChange={handleChange}
              />
              <br></br>
              {datosFiscales.logo && (
                <div style={{ marginBottom: "0.5rem" }}>
                  <img
                    src={`http://localhost:3000${datosFiscales.logo}`}
                    alt="Logo actual"
                    style={{ maxWidth: "150px" }}
                  />
                </div>
              )}

              <label>Cambiar logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogo(e.target.files[0])}
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
              >
                Guardar datos fiscales
              </Button>
            </form>
          </div>
        )}

        {mensaje && <p style={{ color: "green" }}>{mensaje}</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        <hr />
      </div>
    </Box>
  );
}

export default Empresa;
