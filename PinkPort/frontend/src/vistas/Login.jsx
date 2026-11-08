import { useState, useEffect } from "react";
import API_URL from "../config";

function Login({ setUsuario, irA, hayCarrito }) {
  // true = formulario de registro, false = formulario de inicio de sesión
  const [esRegistro, setEsRegistro] = useState(false);

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [errores, setErrores] = useState({});
  const [mensajeError, setMensajeError] = useState("");

  useEffect(() => {
    document.title = esRegistro ? "Crear cuenta | PinkPort" : "Iniciar sesión | PinkPort";
  }, [esRegistro]);

  function cambiarFormulario(registro) {
    setEsRegistro(registro);
    setErrores({});
    setMensajeError("");
  }

  // Validaciones del formulario
  function validar() {
    const nuevosErrores = {};
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (esRegistro && nombre.trim() === "") {
      nuevosErrores.nombre = "El nombre es obligatorio";
    }

    if (correo.trim() === "") {
      nuevosErrores.correo = "El correo es obligatorio";
    } else if (!regexCorreo.test(correo)) {
      nuevosErrores.correo = "Escribe un correo válido";
    }

    if (contrasena === "") {
      nuevosErrores.contrasena = "La contraseña es obligatoria";
    } else if (esRegistro && contrasena.length < 6) {
      nuevosErrores.contrasena = "Mínimo 6 caracteres";
    }

    if (esRegistro && confirmar !== contrasena) {
      nuevosErrores.confirmar = "Las contraseñas no coinciden";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  async function enviar(e) {
    e.preventDefault();
    setMensajeError("");
    if (!validar()) return;

    // Según el formulario, se llama a una ruta u otra del backend
    let ruta = "/usuarios/login";
    let datosEnviar = { correo: correo, contrasena: contrasena };

    if (esRegistro) {
      ruta = "/usuarios/registro";
      datosEnviar = { nombre: nombre, correo: correo, telefono: telefono, contrasena: contrasena };
    }

    try {
      const respuesta = await fetch(API_URL + ruta, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosEnviar)
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setMensajeError(datos.mensaje);
        return;
      }

      setUsuario(datos);
      // Si tenía productos en el carrito, vuelve al carrito
      irA(hayCarrito ? "carrito" : "inicio");
    } catch (error) {
      setMensajeError("No se pudo conectar con el servidor");
    }
  }

  return (
    <section className="container my-5">
      <div className="caja mx-auto" style={{ maxWidth: "460px" }}>

        <div className="mb-4">
          <button className={esRegistro ? "pestana" : "pestana pestana-activa"} onClick={() => cambiarFormulario(false)}>
            Iniciar sesión
          </button>
          <button className={esRegistro ? "pestana pestana-activa" : "pestana"} onClick={() => cambiarFormulario(true)}>
            Crear cuenta
          </button>
        </div>

        <form onSubmit={enviar} noValidate>
          {esRegistro && (
            <div className="mb-3">
              <label className="form-label" htmlFor="nombre">Nombre completo</label>
              <input type="text" id="nombre"
                className={errores.nombre ? "form-control is-invalid" : "form-control"}
                value={nombre} onChange={(e) => { setNombre(e.target.value); setErrores({ ...errores, nombre: "" }); }} />
              <div className="invalid-feedback">{errores.nombre}</div>
            </div>
          )}

          <div className="mb-3">
            <label className="form-label" htmlFor="correo">Correo electrónico</label>
            <input type="email" id="correo"
              className={errores.correo ? "form-control is-invalid" : "form-control"}
              value={correo} onChange={(e) => { setCorreo(e.target.value); setErrores({ ...errores, correo: "" }); }} />
            <div className="invalid-feedback">{errores.correo}</div>
          </div>

          {esRegistro && (
            <div className="mb-3">
              <label className="form-label" htmlFor="telefono">Teléfono (opcional)</label>
              <input type="tel" id="telefono" className="form-control"
                value={telefono} onChange={(e) => { setTelefono(e.target.value); setErrores({ ...errores, telefono: "" }); }} />
            </div>
          )}

          <div className="mb-3">
            <label className="form-label" htmlFor="contrasena">Contraseña</label>
            <input type="password" id="contrasena"
              className={errores.contrasena ? "form-control is-invalid" : "form-control"}
              value={contrasena} onChange={(e) => { setContrasena(e.target.value); setErrores({ ...errores, contrasena: "" }); }} />
            <div className="invalid-feedback">{errores.contrasena}</div>
          </div>

          {esRegistro && (
            <div className="mb-3">
              <label className="form-label" htmlFor="confirmar">Confirmar contraseña</label>
              <input type="password" id="confirmar"
                className={errores.confirmar ? "form-control is-invalid" : "form-control"}
                value={confirmar} onChange={(e) => { setConfirmar(e.target.value); setErrores({ ...errores, confirmar: "" }); }} />
              <div className="invalid-feedback">{errores.confirmar}</div>
            </div>
          )}

          {mensajeError && <div className="alert alert-danger">{mensajeError}</div>}

          <button type="submit" className="btn boton-rosa w-100">
            {esRegistro ? "Crear mi cuenta" : "Entrar"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default Login;
