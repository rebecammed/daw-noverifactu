import { useState, useEffect } from "react";
import { LinearProgress } from "@mui/material";
import { authFetch } from "../utils/authFetch";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  MenuItem,
  Autocomplete,
  CircularProgress,
} from "@mui/material";

function SidebarRegistro({
  fechaInicio,
  setFechaInicio,
  fechaFin,
  setFechaFin,
  busqueda,
  setBusqueda,
  orden,
  setOrden,
  clienteSeleccionado,
  setClienteSeleccionado,
  clientes,
  cargarFacturas,
}) {
  const [clientesOpciones, setClientesOpciones] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const clienteSeleccionadoObj =
    clientesOpciones.find((c) => c.id === clienteSeleccionado) ||
    (clienteSeleccionado
      ? { id: clienteSeleccionado, nombre: "Cliente seleccionado", nif: "" }
      : null);

  useEffect(() => {
    if (busquedaCliente.length < 2 && busquedaCliente !== "") return;

    const timer = setTimeout(() => {
      buscarClientes(busquedaCliente);
    }, 300);

    return () => clearTimeout(timer);
  }, [busquedaCliente]);

  async function buscarClientes(texto = "") {
    try {
      setLoadingClientes(true);

      const res = await authFetch(`/api/clientes/buscar?q=${texto}`);
      const data = await res.json();

      setClientesOpciones(data.clientes || []);
    } catch {
      setClientesOpciones([]);
    } finally {
      setLoadingClientes(false);
    }
  }
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Filtros
      </Typography>

      <Stack spacing={2}>
        <TextField
          select
          label="Orden"
          value={orden}
          onChange={(e) => setOrden(e.target.value)}
          size="small"
        >
          <MenuItem value="desc">Más recientes</MenuItem>
          <MenuItem value="asc">Más antiguas</MenuItem>
        </TextField>

        <TextField
          label="Desde"
          type="date"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
          size="small"
          slotProps={{
            inputLabel: { shrink: true },
          }}
        />

        <TextField
          label="Hasta"
          type="date"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
          size="small"
          slotProps={{
            inputLabel: { shrink: true },
          }}
        />

        <TextField
          label="Buscar"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          size="small"
        />

        <Autocomplete
          size="small"
          options={[
            ...(clienteSeleccionadoObj &&
            !clientesOpciones.some((c) => c.id === clienteSeleccionado)
              ? [clienteSeleccionadoObj]
              : []),
            ...clientesOpciones,
          ]}
          loading={loadingClientes}
          getOptionLabel={(option) => `${option.nombre} (${option.nif})`}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          value={clienteSeleccionadoObj}
          onChange={(event, newValue) => {
            setClienteSeleccionado(newValue ? newValue.id : "");
            setBusquedaCliente("");
          }}
          onOpen={() => {
            if (clientesOpciones.length === 0) {
              buscarClientes();
            }
          }}
          onInputChange={(event, value) => {
            setBusquedaCliente(value);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Cliente"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loadingClientes ? (
                      <CircularProgress color="inherit" size={18} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />

        <Button
          variant="outlined"
          color="error"
          onClick={() => {
            setFechaInicio("");
            setFechaFin("");
            setBusqueda("");
            setClienteSeleccionado("");
            setBusquedaCliente("");
          }}
        >
          Limpiar
        </Button>
      </Stack>
    </Box>
  );
}

export default SidebarRegistro;
