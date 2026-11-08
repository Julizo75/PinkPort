import { useState, useEffect } from "react";
import API_URL from "../config";
import { calcularCostos, pesos } from "../costos";

function Detalle({ id, trm, agregarAlCarrito, irA }) {
  const [producto, setProducto] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  // Cargar el producto elegido
  useEffect(() => {
    async function cargarProducto() {
      try {
        const respuesta = await fetch(API_URL + "/productos/" + id);
        const datos = await respuesta.json();

        if (!respuesta.ok) {
          setError(datos.mensaje);
          return;
        }
        setProducto(datos);
        document.title = datos.nombre + " | PinkPort";
      } catch (err) {
        setError("No se pudo conectar con el servidor");
      }
    }
    cargarProducto();
  }, [id]);

  function sumar() {
    if (cantidad < producto.stock) {
      setCantidad(cantidad + 1);
    }
  }

  function restar() {
    if (cantidad > 1) {
      setCantidad(cantidad - 1);
    }
  }

  function agregar() {
    agregarAlCarrito(producto, cantidad);
    setMensaje("Agregaste " + cantidad + " al carrito");
  }

  if (error) {
    return (
      <div className="container my-5">
        <div className="alert alert-danger">{error}</div>
        <button className="btn boton-rosa" onClick={() => irA("inicio")}>Volver al inicio</button>
      </div>
    );
  }

  if (!producto) {
    return <p className="container my-5">Cargando producto...</p>;
  }

  const subtotal = producto.precio * cantidad;
  const costos = calcularCostos(subtotal, trm.limite_pesos);

  return (
    <section className="container my-5">
      <button className="btn btn-link p-0 mb-3" onClick={() => irA("inicio")}>← Volver al catálogo</button>

      <div className="row">
        <div className="col-12 col-md-6 mb-4">
          <img src={producto.imagen_url} alt={producto.nombre} className="detalle-img" />
        </div>

        <div className="col-12 col-md-6">
          <div className="caja">
            <p className="marca">{producto.marca}</p>
            <h1 className="titulo">{producto.nombre}</h1>
            <p className="precio fs-2">{pesos(producto.precio)} COP</p>
            <p className="texto-gris">{producto.stock} unidades disponibles</p>

            {/* Cantidad */}
            <div className="d-flex align-items-center mb-4">
              <span className="me-3">Cantidad:</span>
              <button className="boton-cantidad" onClick={restar}>−</button>
              <span className="mx-3 fw-bold">{cantidad}</span>
              <button className="boton-cantidad" onClick={sumar}>+</button>
            </div>

            {/* Desglose del precio */}
            <ul className="list-group mb-2">
              <li className="list-group-item d-flex justify-content-between">
                <span>Producto</span>
                <span>{pesos(subtotal)}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between">
                <span>Envío desde EE. UU.</span>
                <span>{pesos(costos.envio)}</span>
              </li>
              {costos.iva > 0 && (
                <li className="list-group-item d-flex justify-content-between">
                  <span>IVA (19%)</span>
                  <span>{pesos(costos.iva)}</span>
                </li>
              )}
              <li className="list-group-item d-flex justify-content-between fw-bold">
                <span>Total</span>
                <span>{pesos(costos.total)} COP</span>
              </li>
            </ul>
            <p className="texto-gris small mb-4">
              Compras de más de USD 200 ({pesos(trm.limite_pesos)} con la TRM de hoy: {pesos(trm.trm)}) pagan IVA del 19%.
            </p>

            <button className="btn boton-rosa w-100 mb-2" onClick={agregar} disabled={producto.stock === 0}>
              Agregar al carrito
            </button>
            <button className="btn boton-borde w-100" onClick={() => irA("carrito")}>
              Ir al carrito
            </button>

            {mensaje && <div className="alert alert-success mt-3 mb-0">{mensaje}</div>}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Detalle;
