// Controlador de pagos
// - Si hay llaves de Wompi en el .env  -> se usa Wompi (modo de pruebas / sandbox)
// - Si NO hay llaves                   -> se usa la pasarela DEMO de PinkPort (simula a Wompi)
// Documentación de Wompi: https://docs.wompi.co/en/docs/colombia/widget-checkout-web/
const crypto = require("crypto");
const supabase = require("../config/database");

const WOMPI_CHECKOUT = "https://checkout.wompi.co/p/";
const WOMPI_API = "https://sandbox.wompi.co/v1";

// Devuelve true cuando no hay llaves de Wompi configuradas
function esModoDemo() {
  return !process.env.WOMPI_PUBLIC_KEY || !process.env.WOMPI_INTEGRITY_SECRET;
}

// Crea el enlace para pagar un pedido
function crearLinkPago(pedido, redirectUrl) {
  const llavePublica = process.env.WOMPI_PUBLIC_KEY;
  const secretoIntegridad = process.env.WOMPI_INTEGRITY_SECRET;

  const referencia = "PINKPORT-" + pedido.id_pedido + "-" + Date.now();
  const montoCentavos = Math.round(pedido.total * 100); // Wompi pide el valor en centavos
  const moneda = "COP";

  // Pasarela DEMO: es una vista de nuestro propio frontend
  if (esModoDemo()) {
    return redirectUrl + "/?pago_demo=" + referencia + "&monto=" + montoCentavos;
  }

  // Firma de integridad: SHA256 de referencia + monto en centavos + moneda + secreto
  const firma = crypto
    .createHash("sha256")
    .update(referencia + montoCentavos + moneda + secretoIntegridad)
    .digest("hex");

  const parametros = new URLSearchParams({
    "public-key": llavePublica,
    "currency": moneda,
    "amount-in-cents": montoCentavos,
    "reference": referencia,
    "signature:integrity": firma,
    "redirect-url": redirectUrl
  });

  return WOMPI_CHECKOUT + "?" + parametros.toString();
}

// GET /api/pagos/verificar/:id
// Wompi devuelve al usuario a la tienda con ?id=ID_DE_LA_TRANSACCION
// Aquí se consulta esa transacción y se actualiza el pedido
exports.verificarPago = async (req, res) => {
  try {
    const idTransaccion = req.params.id;
    let transaccion;

    // 1. Consultar la transacción
    if (idTransaccion.startsWith("DEMO-")) {
      // Pago DEMO: el id tiene la forma DEMO-APPROVED-PINKPORT-12-1699999999
      if (!esModoDemo()) {
        return res.status(400).json({ mensaje: "Los pagos demo están desactivados porque se está usando Wompi" });
      }
      const partesDemo = idTransaccion.split("-");
      transaccion = {
        status: partesDemo[1],                       // APPROVED o DECLINED
        reference: partesDemo.slice(2).join("-"),    // PINKPORT-12-1699999999
        payment_method_type: "DEMO"
      };
    } else {
      // Pago con Wompi: se pregunta a la API de Wompi
      const respuesta = await fetch(WOMPI_API + "/transactions/" + idTransaccion);
      const datosWompi = await respuesta.json();

      if (!respuesta.ok || !datosWompi.data) {
        return res.status(404).json({ mensaje: "No se encontró la transacción en Wompi" });
      }
      transaccion = datosWompi.data;
    }

    // 2. Sacar el id del pedido de la referencia "PINKPORT-12-1699999999"
    const partes = transaccion.reference.split("-");
    const idPedido = partes[1];

    const { data: pedido } = await supabase
      .from("pedido")
      .select("*")
      .eq("id_pedido", idPedido)
      .single();

    if (!pedido) {
      return res.status(404).json({ mensaje: "El pedido no existe" });
    }

    // 3. Revisar que se pagó el valor correcto (solo en Wompi)
    if (transaccion.payment_method_type !== "DEMO" && transaccion.amount_in_cents !== Math.round(pedido.total * 100)) {
      return res.status(400).json({ mensaje: "El valor pagado no coincide con el pedido" });
    }

    // 4. Saber en qué estado debe quedar el pedido
    let nuevoEstado = "pendiente";
    if (transaccion.status === "APPROVED") {
      nuevoEstado = "pagado";
    } else if (transaccion.status === "DECLINED" || transaccion.status === "ERROR" || transaccion.status === "VOIDED") {
      nuevoEstado = "rechazado";
    }

    // 5. Actualizar el pedido SOLO si todavía está pendiente
    // (así, si se recarga la página, el stock no se descuenta dos veces)
    if (nuevoEstado !== "pendiente") {
      const { data: actualizados } = await supabase
        .from("pedido")
        .update({ estado: nuevoEstado })
        .eq("id_pedido", pedido.id_pedido)
        .eq("estado", "pendiente")
        .select();

      // Si se actualizó y fue aprobado, se descuenta el stock
      if (actualizados.length > 0 && nuevoEstado === "pagado") {
        const { data: detalles } = await supabase
          .from("detalle_pedido")
          .select("id_producto, cantidad, producto(stock)")
          .eq("id_pedido", pedido.id_pedido);

        for (const detalle of detalles) {
          await supabase
            .from("producto")
            .update({ stock: detalle.producto.stock - detalle.cantidad })
            .eq("id_producto", detalle.id_producto);
        }
      }
    }

    // Se vuelve a leer el estado final del pedido
    const { data: pedidoFinal } = await supabase
      .from("pedido")
      .select("estado")
      .eq("id_pedido", pedido.id_pedido)
      .single();

    res.json({
      id_pedido: pedido.id_pedido,
      total: pedido.total,
      direccion_envio: pedido.direccion_envio,
      estado: pedidoFinal.estado,
      estado_wompi: transaccion.status,
      metodo: transaccion.payment_method_type
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al verificar el pago" });
  }
};

exports.crearLinkPago = crearLinkPago;
