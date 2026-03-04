let modoMantenimiento = false;

export function activarMantenimiento() {
  modoMantenimiento = true;
}

export function desactivarMantenimiento() {
  modoMantenimiento = false;
}

export function estaEnMantenimiento() {
  return modoMantenimiento;
}
