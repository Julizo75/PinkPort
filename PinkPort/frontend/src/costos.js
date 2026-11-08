// Costos de importación (es la misma fórmula del backend en pedidoController.js)
// Envío: $25.000 base (primera libra y manejo) + 5% del valor (seguro y libras adicionales)
// IVA: si la compra supera USD 200 (convertidos con la TRM del día) se suma el 19%
const ENVIO_BASE = 25000;
const PORCENTAJE_ENVIO = 0.05;
const PORCENTAJE_IVA = 0.19;

export function calcularCostos(subtotal, limitePesos) {
  const envio = Math.round(ENVIO_BASE + subtotal * PORCENTAJE_ENVIO);

  let iva = 0;
  if (subtotal > limitePesos) {
    iva = Math.round(subtotal * PORCENTAJE_IVA);
  }

  const total = subtotal + envio + iva;
  return { envio, iva, total };
}

// Convierte un número en pesos. Ej: 149900 -> "$149.900"
export function pesos(valor) {
  return "$" + Number(valor).toLocaleString("es-CO");
}
