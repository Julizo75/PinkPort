// Controlador de la TRM (precio del dólar en Colombia)
// API gratuita: https://co.dolarapi.com/v1/trm

const TRM_RESPALDO = 3237.83; // se usa si la API no responde
const LIMITE_USD = 200;       // compras de más de USD 200 pagan IVA

// Consulta la TRM del día
async function obtenerTRM() {
  try {
    // Si la API tarda más de 5 segundos, se cancela y se usa el respaldo
    const respuesta = await fetch("https://co.dolarapi.com/v1/trm", { signal: AbortSignal.timeout(5000) });
    const datos = await respuesta.json();

    if (!datos.valor) throw new Error("La API no trajo el valor");
    return datos.valor;
  } catch (err) {
    console.log("No se pudo consultar la TRM, se usa el valor de respaldo");
    return TRM_RESPALDO;
  }
}

// Calcula en pesos el límite de USD 200
async function obtenerLimitePesos() {
  const trm = await obtenerTRM();
  return Math.round(LIMITE_USD * trm);
}

// GET /api/trm -> el frontend la usa para mostrar los costos
exports.verTRM = async (req, res) => {
  const trm = await obtenerTRM();
  res.json({
    trm: trm,
    limite_usd: LIMITE_USD,
    limite_pesos: Math.round(LIMITE_USD * trm)
  });
};

exports.obtenerLimitePesos = obtenerLimitePesos;
