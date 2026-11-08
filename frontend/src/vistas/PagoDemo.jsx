import { useState, useEffect } from "react";
import { pesos } from "../costos";
import DatosPrueba from "../components/DatosPrueba";

// Pasarela de pago DEMO: imita la página de Wompi para el proyecto académico.
// Se usa cuando el backend no tiene llaves de Wompi configuradas.
// Responde igual que el Sandbox de Wompi:
//   Tarjeta 4242 4242 4242 4242 -> APPROVED | 4111 1111 1111 1111 -> DECLINED | otra -> ERROR
//   Nequi   3991111111          -> APPROVED | 3992222222          -> DECLINED | otro -> ERROR
function PagoDemo({ referencia, montoCentavos, irA }) {
  const [metodo, setMetodo] = useState("tarjeta"); // "tarjeta" o "nequi"
  const [tarjeta, setTarjeta] = useState("");
  const [nombre, setNombre] = useState("");
  const [fecha, setFecha] = useState("");
  const [cvc, setCvc] = useState("");
  const [celular, setCelular] = useState("");
  const [errores, setErrores] = useState({});
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    document.title = "Pago seguro (demo) | PinkPort";
  }, []);

  const total = montoCentavos / 100;

  function validar() {
    const nuevosErrores = {};

    if (metodo === "tarjeta") {
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
    } else {
      if (!/^[0-9]{10}$/.test(celular)) {
        nuevosErrores.celular = "El celular debe tener 10 números";
      }
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  // Decide el resultado del pago, igual que el Sandbox de Wompi
  function resultadoDelPago() {
    if (metodo === "tarjeta") {
      const numero = tarjeta.replaceAll(" ", "");
      if (numero === "4242424242424242") return "APPROVED";
      if (numero === "4111111111111111") return "DECLINED";
      return "ERROR";
    }

    if (celular === "3991111111") return "APPROVED";
    if (celular === "3992222222") return "DECLINED";
    return "ERROR";
  }

  function pagar(e) {
    e.preventDefault();
    if (!validar()) return;

    const estado = resultadoDelPago();
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

        <DatosPrueba />

        {/* Elegir método de pago */}
        <div className="mb-3">
          <button className={metodo === "tarjeta" ? "pestana pestana-activa" : "pestana"} onClick={() => setMetodo("tarjeta")}>
            <i className="bi bi-credit-card"></i> Tarjeta
          </button>
          <button className={metodo === "nequi" ? "pestana pestana-activa" : "pestana"} onClick={() => setMetodo("nequi")}>
            <i className="bi bi-phone"></i> Nequi
          </button>
        </div>

        <form onSubmit={pagar} noValidate>
          {metodo === "tarjeta" ? (
            <>
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
            </>
          ) : (
            <div className="mb-3">
              <label className="form-label" htmlFor="celular">Celular registrado en Nequi</label>
              <input type="text" id="celular" placeholder="3991111111" maxLength="10"
                className={errores.celular ? "form-control is-invalid" : "form-control"}
                value={celular} onChange={(e) => { setCelular(e.target.value); setErrores({ ...errores, celular: "" }); }} />
              <div className="invalid-feedback">{errores.celular}</div>
            </div>
          )}

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
