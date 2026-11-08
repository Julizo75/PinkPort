import { useState, useEffect } from "react";
import API_URL from "../config";
import { pesos } from "../costos";

function MisPedidos({ usuario, irA }) {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Cargar los pedidos del usuario
  useEffect(() => {
    document.title = "Mis pedidos | PinkPort";

    async function cargarPedidos() {
      try {
        const respuesta = await fetch(API_URL + "/pedidos/usuario/" + usuario.id_usuario);
        const datos = await respuesta.json();

        if (respuesta.ok) {
          setPedidos(datos);
        } else {
          setError(datos.mensaje);
        }
      } catch (err) {
        setError("No se pudo conectar con el servidor");
      }
      setCargando(false);
    }

    cargarPedidos();
  }, [usuario.id_usuario]);

  // Color de la etiqueta según el estado del pedido
  function colorEstado(estado) {
    if (estado === "rechazado") return "bg-danger";
    if (estado === "pendiente") return "bg-secondary";
    return ""; // pagado: rosa
  }

  // Convierte la fecha de la base de datos en una fecha fácil de leer
  function formatearFecha(fecha) {
    return new Date(fecha).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
  }

  return (
    <section className="container my-5">
      <h1 className="titulo">Mis pedidos</h1>

      {/* Dirección guardada en el perfil */}
      <p className="texto-gris mb-4">
        <i className="bi bi-geo-alt"></i>{" "}
        {usuario.direccion
          ? "Dirección guardada: " + usuario.direccion + ", " + usuario.ciudad
          : "Aún no tienes una dirección guardada. Se guardará con tu primera compra."}
      </p>

      {cargando && <p className="texto-gris">Cargando pedidos...</p>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!cargando && !error && pedidos.length === 0 && (
        <div className="caja text-center">
          <p>Todavía no tienes pedidos.</p>
          <button className="btn boton-rosa" onClick={() => irA("inicio")}>Ver productos</button>
        </div>
      )}

      {pedidos.map((pedido) => (
        <div className="caja mb-4" key={pedido.id_pedido}>
          <div className="d-flex justify-content-between flex-wrap mb-3">
            <div>
              <h2 className="fs-5 titulo mb-0">Pedido #{pedido.id_pedido}</h2>
              <p className="texto-gris small mb-0">{formatearFecha(pedido.fecha_pedido)}</p>
            </div>
            <span className={"badge rounded-pill align-self-start px-3 py-2 " + colorEstado(pedido.estado)}>
              {pedido.estado}
            </span>
          </div>

          <div className="row">
            {/* Productos del pedido */}
            <div className="col-12 col-md-7 mb-3">
              {pedido.detalle_pedido.map((detalle, index) => (
                <div className="d-flex align-items-center mb-2" key={index}>
                  <img src={detalle.producto.imagen_url} alt={detalle.producto.nombre} className="carrito-img me-3" />
                  <div>
                    <p className="fw-semibold mb-0">{detalle.producto.nombre}</p>
                    <p className="texto-gris small mb-0">
                      {detalle.cantidad} x {pesos(detalle.precio_unitario)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Totales */}
            <div className="col-12 col-md-5">
              <ul className="list-group">
                {/* Los pedidos viejos no tienen desglose, por eso se revisa */}
                {pedido.subtotal !== null && (
                  <>
                    <li className="list-group-item d-flex justify-content-between">
                      <span>Subtotal</span><span>{pesos(pedido.subtotal)}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between">
                      <span>Envío</span><span>{pesos(pedido.costo_envio)}</span>
                    </li>
                  </>
                )}
                {pedido.iva > 0 && (
                  <li className="list-group-item d-flex justify-content-between">
                    <span>IVA (19%)</span><span>{pesos(pedido.iva)}</span>
                  </li>
                )}
                <li className="list-group-item d-flex justify-content-between fw-bold">
                  <span>Total</span><span>{pesos(pedido.total)} COP</span>
                </li>
              </ul>
              <p className="texto-gris small mt-2 mb-0">Enviado a: {pedido.direccion_envio}</p>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}

export default MisPedidos;
