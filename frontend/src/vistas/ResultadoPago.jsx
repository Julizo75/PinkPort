import { useState, useEffect } from "react";
import API_URL from "../config";
import { pesos } from "../costos";

// Vista que aparece cuando Wompi devuelve al usuario a la tienda
function ResultadoPago({ idTransaccion, vaciarCarrito, irA }) {
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Resultado del pago | PinkPort";

    async function verificar() {
      try {
        const respuesta = await fetch(API_URL + "/pagos/verificar/" + idTransaccion);
        const datos = await respuesta.json();

        if (!respuesta.ok) {
          setError(datos.mensaje);
          return;
        }

        setResultado(datos);
        if (datos.estado === "pagado") {
          vaciarCarrito();
        }
      } catch (err) {
        setError("No se pudo conectar con el servidor");
      }
    }

    verificar();
  }, [idTransaccion]);

  if (error) {
    return (
      <section className="container my-5">
        <div className="caja text-center mx-auto" style={{ maxWidth: "500px" }}>
          <div className="alert alert-danger">{error}</div>
          <button className="btn boton-rosa" onClick={() => irA("inicio")}>Volver al inicio</button>
        </div>
      </section>
    );
  }

  if (!resultado) {
    return <p className="container my-5">Verificando tu pago con Wompi...</p>;
  }

  // Mensaje según el estado del pedido
  let titulo;
  let texto;
  switch (resultado.estado) {
    case "pagado":
      titulo = "¡Gracias por tu compra!";
      texto = "Tu pago fue aprobado y tu pedido ya está en camino.";
      break;
    case "rechazado":
      titulo = "El pago fue rechazado";
      texto = "No se realizó ningún cobro. Puedes intentarlo de nuevo desde tu carrito.";
      break;
    default:
      titulo = "Tu pago está en proceso";
      texto = "Wompi todavía está procesando el pago. Revisa el estado en Mis pedidos.";
  }

  return (
    <section className="container my-5">
      <div className="caja text-center mx-auto" style={{ maxWidth: "500px" }}>
        <h1 className="titulo">{titulo}</h1>
        <p>{texto}</p>
        <p>Pedido <strong>#{resultado.id_pedido}</strong></p>
        <p className="precio">{pesos(resultado.total)} COP</p>
        <p className="texto-gris small">Se enviará a: {resultado.direccion_envio}</p>

        {resultado.estado === "rechazado" ? (
          <button className="btn boton-rosa me-2" onClick={() => irA("carrito")}>Volver al carrito</button>
        ) : (
          <button className="btn boton-rosa me-2" onClick={() => irA("pedidos")}>Ver mis pedidos</button>
        )}
        <button className="btn boton-borde" onClick={() => irA("inicio")}>Seguir comprando</button>
      </div>
    </section>
  );
}

export default ResultadoPago;
