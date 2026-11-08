import { useState, useEffect } from "react";
import API_URL from "../config";
import { calcularCostos, pesos } from "../costos";
import DatosPrueba from "../components/DatosPrueba";

function Carrito({ carrito, trm, usuario, setUsuario, cambiarCantidad, quitarDelCarrito, irA }) {
  // Si el usuario ya tiene una dirección guardada, el formulario empieza lleno
  const [ciudad, setCiudad] = useState(usuario && usuario.ciudad ? usuario.ciudad : "");
  const [direccion, setDireccion] = useState(usuario && usuario.direccion ? usuario.direccion : "");
  const [errores, setErrores] = useState({});
  const [mensajeError, setMensajeError] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    document.title = "Mi carrito | PinkPort";
  }, []);

  // Calcular el subtotal y los costos de importación
  let subtotal = 0;
  carrito.forEach((item) => {
    subtotal = subtotal + item.precio * item.cantidad;
  });
  const costos = calcularCostos(subtotal, trm.limite_pesos);

  // Validar el formulario de envío
  function validar() {
    const nuevosErrores = {};

    if (ciudad.trim() === "") {
      nuevosErrores.ciudad = "Escribe tu ciudad";
    }
    if (direccion.trim().length < 8) {
      nuevosErrores.direccion = "Escribe una dirección completa";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  // Crear el pedido en el backend y luego ir a pagar a Wompi
  async function pagar(e) {
    e.preventDefault();
    setMensajeError("");
    if (!validar()) return;

    setEnviando(true);
    try {
      const respuesta = await fetch(API_URL + "/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario: usuario.id_usuario,
          ciudad: ciudad.trim(),
          direccion: direccion.trim(),
          redirect_url: window.location.origin,  // Wompi devuelve al usuario a esta página
          productos: carrito.map((item) => ({ id_producto: item.id_producto, cantidad: item.cantidad }))
        })
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setMensajeError(datos.mensaje);
        setEnviando(false);
        return;
      }

      // Se guarda la dirección en el usuario para la próxima compra
      setUsuario({ ...usuario, ciudad: ciudad.trim(), direccion: direccion.trim() });

      // Ir a la página de pago de Wompi
      window.location.href = datos.url_pago;
    } catch (error) {
      setMensajeError("No se pudo conectar con el servidor");
      setEnviando(false);
    }
  }

  // Carrito vacío
  if (carrito.length === 0) {
    return (
      <section className="container my-5">
        <div className="caja text-center mx-auto" style={{ maxWidth: "500px" }}>
          <h1 className="titulo">Tu carrito está vacío</h1>
          <p className="texto-gris">Agrega productos desde el catálogo.</p>
          <button className="btn boton-rosa" onClick={() => irA("inicio")}>Ver productos</button>
        </div>
      </section>
    );
  }

  return (
    <section className="container my-5">
      <h1 className="titulo mb-4">Mi carrito</h1>

      <div className="row">
        {/* Lista de productos */}
        <div className="col-12 col-lg-7 mb-4">
          <div className="caja">
            {carrito.map((item) => (
              <div className="d-flex align-items-center border-bottom py-3" key={item.id_producto}>
                <img src={item.imagen_url} alt={item.nombre} className="carrito-img me-3" />
                <div className="flex-grow-1">
                  <p className="marca mb-0">{item.marca}</p>
                  <p className="fw-semibold mb-0">{item.nombre}</p>
                  <p className="mb-1">{pesos(item.precio)}</p>
                  <button className="boton-cantidad" onClick={() => cambiarCantidad(item.id_producto, item.cantidad - 1)}>−</button>
                  <span className="mx-3 fw-bold">{item.cantidad}</span>
                  <button className="boton-cantidad" onClick={() => cambiarCantidad(item.id_producto, item.cantidad + 1)}>+</button>
                  <button className="btn btn-link text-danger ms-2" onClick={() => quitarDelCarrito(item.id_producto)}>
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resumen y pago */}
        <div className="col-12 col-lg-5">
          <div className="caja">
            <h2 className="titulo fs-4">Resumen del pedido</h2>
            <ul className="list-group mb-2">
              <li className="list-group-item d-flex justify-content-between">
                <span>Subtotal</span><span>{pesos(subtotal)}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between">
                <span>Envío desde EE. UU.</span><span>{pesos(costos.envio)}</span>
              </li>
              {costos.iva > 0 && (
                <li className="list-group-item d-flex justify-content-between">
                  <span>IVA (19%)</span><span>{pesos(costos.iva)}</span>
                </li>
              )}
              <li className="list-group-item d-flex justify-content-between fw-bold">
                <span>Total</span><span>{pesos(costos.total)} COP</span>
              </li>
            </ul>
            <p className="texto-gris small mb-4">
              {costos.iva > 0
                ? "Tu compra supera USD 200, por eso se suma el IVA del 19%."
                : "Compras de hasta USD 200 (" + pesos(trm.limite_pesos) + " con la TRM de hoy) no pagan IVA."}
            </p>

            {!usuario ? (
              <div className="alert alert-warning">
                Para pagar debes{" "}
                <button className="btn btn-link p-0 align-baseline" onClick={() => irA("login")}>
                  iniciar sesión o crear una cuenta
                </button>.
              </div>
            ) : (
              <form onSubmit={pagar} noValidate>
                <h3 className="fs-5">Datos de envío</h3>
                {usuario.direccion && (
                  <p className="texto-gris small">Usamos la dirección guardada en tu perfil. Puedes cambiarla si quieres.</p>
                )}

                <div className="mb-3">
                  <label className="form-label" htmlFor="ciudad">Ciudad</label>
                  <input
                    type="text"
                    id="ciudad"
                    className={errores.ciudad ? "form-control is-invalid" : "form-control"}
                    value={ciudad}
                    onChange={(e) => { setCiudad(e.target.value); setErrores({ ...errores, ciudad: "" }); }}
                  />
                  <div className="invalid-feedback">{errores.ciudad}</div>
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="direccion">Dirección</label>
                  <input
                    type="text"
                    id="direccion"
                    placeholder="Calle 10 # 43-20, apto 301"
                    className={errores.direccion ? "form-control is-invalid" : "form-control"}
                    value={direccion}
                    onChange={(e) => { setDireccion(e.target.value); setErrores({ ...errores, direccion: "" }); }}
                  />
                  <div className="invalid-feedback">{errores.direccion}</div>
                </div>

                <DatosPrueba />

                {mensajeError && <div className="alert alert-danger">{mensajeError}</div>}

                <button type="submit" className="btn boton-rosa w-100" disabled={enviando}>
                  {enviando ? "Conectando con la pasarela de pago..." : "Pagar " + pesos(costos.total)}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Carrito;
