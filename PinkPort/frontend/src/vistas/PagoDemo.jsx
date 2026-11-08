import { useState, useEffect } from "react";
import { pesos } from "../costos";

// Pasarela de pago DEMO: imita la página de Wompi para el proyecto académico.
// Se usa cuando el backend no tiene llaves de Wompi configuradas.
function PagoDemo({ referencia, montoCentavos, irA }) {
  const [tarjeta, setTarjeta] = useState("");
  const [nombre, setNombre] = useState("");
  const [fecha, setFecha] = useState("");
  const [cvc, setCvc] = useState("");
  const [errores, setErrores] = useState({});
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    document.title = "Pago seguro (demo) | PinkPort";
  }, []);

  const total = montoCentavos / 100;

  function validar() {
    const nuevosErrores = {};
    const numero = tarjeta.replaceAll(" ", "");

    if (numero.length !== 16 || isNaN(numero)) {
      nuevosErrores.tarjeta = "El número de tarjeta debe tener 16 dígitos";
    }
    if (nombre.trim() === "") {
      nuevosErrores.nombre = "Escribe el nombre que aparece en la tarjeta";
    }
    if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(fecha)) {
      nuevosErrores.fecha = "Usa el formato MM/AA";
    }
    if (!/^[0-9]{3}$/.test(cvc)) {
      nuevosErrores.cvc = "El CVC tiene 3 números";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  function pagar(e) {
    e.preventDefault();
    if (!validar()) return;

    // Igual que en Wompi: 4242... se aprueba, cualquier otra se rechaza
    const numero = tarjeta.replaceAll(" ", "");
    let estado = "DECLINED";
    if (numero === "4242424242424242") {
      estado = "APPROVED";
    }

    setProcesando(true);

    // Se espera un momento para simular que el banco procesa el pago
    setTimeout(() => {
      window.location.href = "/?id=DEMO-" + estado + "-" + referencia;
    }, 1500);
  }

  return (
    <section className="container my-5">
      <div className="caja mx-auto" style={{ maxWidth: "460px" }}>
        <div className="text-center mb-4">
          <span className="badge rounded-pill bg-secondary mb-2">MODO DEMO · No se cobra dinero real</span>
          <h1 className="titulo fs-3 mb-1"><i className="bi bi-shield-lock"></i> Pago seguro</h1>
          <p className="texto-gris small mb-2">Referencia: {referencia}</p>
          <p className="precio fs-2 mb-0">{pesos(total)} COP</p>
        </div>

        <div className="alert alert-light border small">
          Tarjeta de prueba: <strong>4242 4242 4242 4242</strong> (aprobada) o{" "}
          <strong>4111 1111 1111 1111</strong> (rechazada). Cualquier fecha futura y CVC.
        </div>

        <form onSubmit={pagar} noValidate>
          <div className="mb-3">
            <label className="form-label" htmlFor="tarjeta">Número de tarjeta</label>
            <input type="text" id="tarjeta" placeholder="4242 4242 4242 4242" maxLength="19"
              className={errores.tarjeta ? "form-control is-invalid" : "form-control"}
              value={tarjeta} onChange={(e) => { setTarjeta(e.target.value); setErrores({ ...errores, tarjeta: "" }); }} />
            <div className="invalid-feedback">{errores.tarjeta}</div>
          </div>

          <div className="mb-3">
            <label className="form-label" htmlFor="nombreTarjeta">Nombre en la tarjeta</label>
            <input type="text" id="nombreTarjeta"
              className={errores.nombre ? "form-control is-invalid" : "form-control"}
              value={nombre} onChange={(e) => { setNombre(e.target.value); setErrores({ ...errores, nombre: "" }); }} />
            <div className="invalid-feedback">{errores.nombre}</div>
          </div>

          <div className="row">
            <div className="col-6 mb-3">
              <label className="form-label" htmlFor="fecha">Vence (MM/AA)</label>
              <input type="text" id="fecha" placeholder="12/28" maxLength="5"
                className={errores.fecha ? "form-control is-invalid" : "form-control"}
                value={fecha} onChange={(e) => { setFecha(e.target.value); setErrores({ ...errores, fecha: "" }); }} />
              <div className="invalid-feedback">{errores.fecha}</div>
            </div>
            <div className="col-6 mb-3">
              <label className="form-label" htmlFor="cvc">CVC</label>
              <input type="text" id="cvc" placeholder="123" maxLength="3"
                className={errores.cvc ? "form-control is-invalid" : "form-control"}
                value={cvc} onChange={(e) => { setCvc(e.target.value); setErrores({ ...errores, cvc: "" }); }} />
              <div className="invalid-feedback">{errores.cvc}</div>
            </div>
          </div>

          <button type="submit" className="btn boton-rosa w-100 mb-2" disabled={procesando}>
            {procesando ? "Procesando pago..." : "Pagar " + pesos(total)}
          </button>
          <button type="button" className="btn boton-borde w-100" disabled={procesando} onClick={() => irA("carrito")}>
            Cancelar y volver al carrito
          </button>
        </form>
      </div>
    </section>
  );
}

export default PagoDemo;
