import { useEffect, useState } from "react";
import { authFetch } from "../utils/authFetch";
import {
  Box,
  Chip,
  Paper,
  MenuItem,
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
  Autocomplete,
} from "@mui/material";

function AdminFacturas() {
  const [facturas, setFacturas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioFiltro, setUsuarioFiltro] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  useEffect(() => {
    cargarFacturas();
  }, [
    page,
    limit,
    usuarioFiltro,
    estadoFiltro,
    fechaInicio,
    fechaFin,
    busqueda,
  ]);

  useEffect(() => {
    return () => {
      setSearchParams({});
    };
  }, []);

  async function cargarUsuarios() {
    const res = await authFetch("/api/admin/usuarios");
    const data = await res.json();
    setUsuarios(data.usuarios || []);
  }

  async function cargarFacturas() {
    const params = new URLSearchParams();

    params.append("page", page);
    params.append("limit", limit);

    if (usuarioFiltro) params.append("usuarioId", usuarioFiltro);
    if (estadoFiltro) params.append("estado", estadoFiltro);
    if (fechaInicio) params.append("fechaInicio", fechaInicio);
    if (fechaFin) params.append("fechaFin", fechaFin);
    if (busqueda) params.append("q", busqueda);

    const res = await authFetch(`/api/admin/facturas?${params.toString()}`);
    const data = await res.json();

    setFacturas(data.facturas || []);
    setTotalPages(data.totalPages || 1);
    setTotal(data.total || 0);
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 5 },
        borderRadius: 4,
        border: "1px solid #eee",
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 4 }}>
        Facturas globales
      </Typography>

      {/* ========================== */}
      {/* FILTROS */}
      {/* ========================== */}

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Filtros
        </Typography>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          flexWrap="wrap"
        >
          <TextField
            label="Buscar"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPage(1);
            }}
            size="small"
          />

          <Autocomplete
            size="small"
            options={usuarios}
            sx={{ minWidth: 260 }}
            getOptionLabel={(option) =>
              option.empresa
                ? `${option.empresa} / ${option.email}`
                : option.email
            }
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={usuarios.find((u) => u.id === usuarioFiltro) || null}
            onChange={(event, newValue) => {
              setUsuarioFiltro(newValue ? newValue.id : "");
              setPage(1);
            }}
            renderInput={(params) => (
              <TextField {...params} label="Empresa / usuario" />
            )}
          />

          <TextField
            select
            label="Estado"
            value={estadoFiltro}
            onChange={(e) => {
              setEstadoFiltro(e.target.value);
              setPage(1);
            }}
            size="small"
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="ACTIVA">ACTIVA</MenuItem>
            <MenuItem value="ANULADA">ANULADA</MenuItem>
          </TextField>

          <TextField
            label="Desde"
            type="date"
            value={fechaInicio}
            onChange={(e) => {
              setFechaInicio(e.target.value);
              setPage(1);
            }}
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            label="Hasta"
            type="date"
            value={fechaFin}
            onChange={(e) => {
              setFechaFin(e.target.value);
              setPage(1);
            }}
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              setBusqueda("");
              setUsuarioFiltro("");
              setEstadoFiltro("");
              setFechaInicio("");
              setFechaFin("");
              setPage(1);
            }}
          >
            Limpiar
          </Button>
        </Stack>
      </Box>

      {/* ========================== */}
      {/* TABLA */}
      {/* ========================== */}

      {facturas.length > 0 && (
        <Typography sx={{ mb: 2 }}>
          Mostrando {(page - 1) * limit + 1}–
          {(page - 1) * limit + facturas.length} de {total} facturas
        </Typography>
      )}

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "grey.100" }}>
              {[
                "ID",
                "Usuario",
                "Número",
                "Fecha",
                "Tipo",
                "Importe",
                "Estado",
              ].map((col) => (
                <TableCell key={col}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: "1rem",
                      fontWeight: 550,
                      color: "#374151",
                    }}
                  >
                    {col}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {facturas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>No hay facturas</TableCell>
              </TableRow>
            ) : (
              facturas.map((f) => (
                <TableRow key={f.id}>
                  <TableCell>{f.id}</TableCell>
                  <TableCell>{f.empresa ? f.empresa : f.email}</TableCell>
                  <TableCell>{f.numero_factura}</TableCell>
                  <TableCell>
                    {new Date(f.fecha_expedicion).toLocaleString()}
                  </TableCell>
                  <TableCell>{f.tipo_factura}</TableCell>
                  <TableCell>{f.importe_total} €</TableCell>
                  <TableCell>{f.estado}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ========================== */}
      {/* PAGINACIÓN */}
      {/* ========================== */}

      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="center"
        sx={{ mt: 4 }}
      >
        <Button
          variant="outlined"
          disabled={page <= 1}
          onClick={() => setPage(1)}
        >
          ⏮ Primera
        </Button>

        <Button
          variant="outlined"
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
        >
          ◀ Anterior
        </Button>

        <Typography sx={{ fontWeight: 500 }}>
          Página {page} de {totalPages}
        </Typography>

        <Button
          variant="outlined"
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
        >
          Siguiente ▶
        </Button>

        <Button
          variant="outlined"
          disabled={page >= totalPages}
          onClick={() => setPage(totalPages)}
        >
          Última ⏭
        </Button>
      </Stack>

      {/* ========================== */}
      {/* REGISTROS POR PÁGINA */}
      {/* ========================== */}

      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="flex-end"
        sx={{ mt: 3 }}
      >
        <Typography variant="body2">Registros por página:</Typography>

        <TextField
          select
          size="small"
          value={limit}
          onChange={(e) => {
            setLimit(parseInt(e.target.value));
            setPage(1);
          }}
        >
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={20}>20</MenuItem>
          <MenuItem value={50}>50</MenuItem>
          <MenuItem value={100}>100</MenuItem>
        </TextField>
      </Stack>
    </Paper>
  );
}

export default AdminFacturas;
