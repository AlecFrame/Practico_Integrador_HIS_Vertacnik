
export function agregarCambio(cambios, campo, antes, despues) {
    if (antes != despues) {
      if (campo=="clave") {
        cambios.push("se cambio la contraseña");
      }else
      if (campo=="avatar") {
        cambios.push("se cambio el avatar");
      }else
        cambios.push(`${campo}: '${antes ?? ""}' → '${despues ?? ""}'`);
    }
}

export function normalizarFecha(valor) {
  if (!valor) return null;

  // Si ya está en formato string YYYY-MM-DD lo devolvemos igual
  if (typeof valor === "string" && /^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return valor;
  }

  // Si es Date lo convertimos
  const fecha = new Date(valor);
  return fecha.toISOString().slice(0, 10);
}

export function normalizarFechaDate(valor) {
  if (!valor) return null;

  // Si ya está en formato string YYYY-MM-DD lo devolvemos igual
  if (typeof valor === "string" && /^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return valor;
  }

  // Si es Date lo convertimos
  const fecha = new Date(valor);
  return fecha;
}