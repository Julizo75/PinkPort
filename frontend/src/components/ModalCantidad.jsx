import { useState } from "react";
import { pesos } from "../costos";

// Tarjeta que aparece encima de la página para elegir cuántas unidades agregar
function ModalCantidad({ producto, agregarAlCarrito, cerrar, irA }) {
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);

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
    setAgregado(true);
  }

  return (
    <>
      {/* Fondo oscuro: al hacer clic afuera se cierra */}
      <div className="modal-backdrop fade show" onClick={cerrar}></div>

      <div className="modal d-block" tabIndex="-1" onClick={cerrar}>
        <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content modal-pinkport">

            <div className="modal-header border-0 pb-0">
              <h2 className="modal-title fs-5 titulo">
                {agregado ? "¡Agregado al carrito!" : "¿Cuántos quieres agregar?"}
              </h2>
              <button type="button" className="btn-close" onClick={cerrar}></button>
            </div>

            <div className="modal-body">
              <div className="d-flex align-items-center mb-3">
                <img src={producto.imagen_url} alt={producto.nombre} className="carrito-img me-3" />
                <div>
                  <p className="marca mb-0">{producto.marca}</p>
                  <p className="fw-semibold mb-0">{producto.nombre}</p>
                  <p className="texto-gris small mb-0">{pesos(producto.precio)} c/u · {producto.stock} disponibles</p>
                </div>
              </div>

              {agregado ? (
                <div className="alert alert-success mb-0">
                  Agregaste {cantidad} {cantidad === 1 ? "unidad" : "unidades"} a tu carrito.
                </div>
              ) : (
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <button className="boton-cantidad" onClick={restar}>−</button>
                    <span className="mx-3 fw-bold fs-5">{cantidad}</span>
                    <button className="boton-cantidad" onClick={sumar}>+</button>
                  </div>
                  <p className="precio mb-0">{pesos(producto.precio * cantidad)}</p>
                </div>
              )}
            </div>

            <div className="modal-footer border-0 pt-0">
              {agregado ? (
                <>
                  <button className="btn boton-borde" onClick={cerrar}>Seguir comprando</button>
                  <button className="btn boton-rosa" onClick={() => irA("carrito")}>Ir al carrito</button>
                </>
              ) : (
                <>
                  <button className="btn boton-borde" onClick={cerrar}>Cancelar</button>
                  <button className="btn boton-rosa" onClick={agregar}>Agregar al carrito</button>
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default ModalCantidad;
