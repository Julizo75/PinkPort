// Controlador de pedidos
const supabase = require("../config/database");

const { obtenerLimitePesos } = require("./trmController");
const { crearLinkPago } = require("./pagoController");

// ===== Costos de importación =====
// Envío: $25.000 base (primera libra y manejo) + 5% del valor (seguro y libras adicionales)
// IVA: si la compra supera USD 200 (convertidos con la TRM del día) se suma el 19%
const ENVIO_BASE = 25000;
const PORCENTAJE_ENVIO = 0.05;
const PORCENTAJE_IVA = 0.19;

function calcularCostos(subtotal, limitePesos) {
  const envio = Math.round(ENVIO_BASE + subtotal * PORCENTAJE_ENVIO);

  let iva = 0;
  if (subtotal > limitePesos) {
    iva = Math.round(subtotal * PORCENTAJE_IVA);
  }

  const total = subtotal + envio + iva;
  return { envio, iva, total };
}

// POST /api/pedidos -> guarda el pedido (pendiente) y devuelve el enlace de pago de Wompi
// Recibe: { id_usuario, ciudad, direccion, redirect_url, productos: [ { id_producto, cantidad } ] }
exports.crearPedido = async (req, res) => {
  try {
    const { id_usuario, ciudad, direccion, redirect_url, productos } = req.body;

    // Validaciones
    if (!id_usuario) {
      return res.status(400).json({ mensaje: "Debes iniciar sesión para comprar" });
    }
    if (!ciudad || !direccion) {
      return res.status(400).json({ mensaje: "La ciudad y la dirección son obligatorias" });
    }
    if (!productos || productos.length === 0) {
      return res.status(400).json({ mensaje: "El carrito está vacío" });
    }

    // 1. Revisar cada producto en la base de datos y calcular el subtotal
    let subtotal = 0;

    for (const item of productos) {
      const { data: producto } = await supabase
        .from("producto")
        .select("*")
        .eq("id_producto", item.id_producto)
        .single();

      if (!producto) {
        return res.status(400).json({ mensaje: "Un producto ya no existe" });
      }
      if (producto.stock < item.cantidad) {
        return res.status(400).json({ mensaje: "No hay suficiente stock de " + producto.nombre });
      }

      item.precio = producto.precio;   // se usa el precio real de la base de datos
      subtotal = subtotal + producto.precio * item.cantidad;
    }

    const limitePesos = await obtenerLimitePesos();
    const costos = calcularCostos(subtotal, limitePesos);

    // 2. Guardar el pedido
    const { data: pedido, error } = await supabase
      .from("pedido")
      .insert([
        {
          id_usuario: id_usuario,
          direccion_envio: direccion + ", " + ciudad,
          subtotal: subtotal,
          costo_envio: costos.envio,
          iva: costos.iva,
          total: costos.total,
          estado: "pendiente"   // pasa a "pagado" cuando Wompi aprueba el pago
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // 3. Guardar los productos del pedido
    // (el stock se descuenta cuando Wompi confirma el pago, en pagoController.js)
    for (const item of productos) {
      await supabase.from("detalle_pedido").insert([
        {
          id_pedido: pedido.id_pedido,
          id_producto: item.id_producto,
          cantidad: item.cantidad,
          precio_unitario: item.precio
        }
      ]);
    }

    // 4. Guardar la dirección en el perfil para la próxima compra
    await supabase
      .from("usuario")
      .update({ ciudad: ciudad, direccion: direccion })
      .eq("id_usuario", id_usuario);

    // 5. Crear el enlace de pago (Wompi o pasarela demo)
    const urlPago = crearLinkPago(pedido, redirect_url);

    res.json({ pedido: pedido, url_pago: urlPago });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al crear el pedido" });
  }
};

// GET /api/pedidos/usuario/:id -> pedidos de un usuario con sus productos
exports.listarPedidosUsuario = async (req, res) => {
  try {
    const id = req.params.id;

    const { data, error } = await supabase
      .from("pedido")
      .select("*, detalle_pedido(cantidad, precio_unitario, producto(nombre, imagen_url))")
      .eq("id_usuario", id)
      .order("fecha_pedido", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al cargar los pedidos" });
  }
};
