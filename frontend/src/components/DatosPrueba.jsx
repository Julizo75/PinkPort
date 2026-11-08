// Datos de prueba de Wompi (Sandbox) para hacer pagos sin dinero real
// Fuente: https://docs.wompi.co/docs/colombia/datos-de-prueba-en-sandbox/
function DatosPrueba() {
  return (
    <div className="datos-prueba mb-4">
      <p className="fw-bold mb-2">
        <i className="bi bi-info-circle"></i> Datos de prueba (Sandbox) · No se cobra dinero real
      </p>

      {/* Tarjetas */}
      <p className="subtitulo-rosa mb-1">TARJETAS</p>
      <ul className="list-unstyled mb-1">
        <li className="d-flex justify-content-between align-items-center mb-1">
          <span className="numero-prueba">4242 4242 4242 4242</span>
          <span className="badge bg-success">Aprobada</span>
        </li>
        <li className="d-flex justify-content-between align-items-center mb-1">
          <span className="numero-prueba">4111 1111 1111 1111</span>
          <span className="badge bg-danger">Declinada</span>
        </li>
      </ul>
      <p className="small texto-gris mb-3">
        Cualquier fecha de expiración en el futuro y CVC de 3 dígitos son válidos.
        Con cualquier otra tarjeta el resultado será ERROR.
      </p>

      {/* Nequi */}
      <p className="subtitulo-rosa mb-1">NEQUI</p>
      <ul className="list-unstyled mb-0">
        <li className="d-flex justify-content-between align-items-center mb-1">
          <span className="numero-prueba">3991111111</span>
          <span className="badge bg-success">Aprobada</span>
        </li>
        <li className="d-flex justify-content-between align-items-center">
          <span className="numero-prueba">3992222222</span>
          <span className="badge bg-danger">Declinada</span>
        </li>
      </ul>
    </div>
  );
}

export default DatosPrueba;
