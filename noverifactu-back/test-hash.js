import { generarHashRegistro } from "./src/core/hashEngine.js";

// Registro 1 (génesis)
const registro1 = generarHashRegistro({
  nifEmisor: "71902382N",
  numeroFacturaCompleto: "A-2024-0001",
  fechaHoraEmision: "2024-09-01T10:23:45.123Z",
  importeTotal: 121.0,
  numRegistroAnterior: 0,
  numRegistroActual: 1,
});

// Registro 2 (encadenado al primero)
const registro2 = generarHashRegistro({
  nifEmisor: "71902382N",
  numeroFacturaCompleto: "A-2024-0002",
  fechaHoraEmision: "2024-09-01T11:10:01.456Z",
  importeTotal: 242.0,
  numRegistroAnterior: 1,
  numRegistroActual: 2,
  hashAnterior: registro1.hashActual,
});

console.log("Registro 1:");
console.log(registro1);

console.log("\nRegistro 2:");
console.log(registro2);
