function Footer({ irA }) {
  return (
    <footer className="pie">
      <div className="container">
        <div className="row">
          <div className="col-12 col-md-6 mb-4">
            <p className="logo">
              <span className="logo-circulo">P</span> PinkPort
            </p>
            <p>Tus favoritos originales de EE. UU., con precio final y entrega segura en Colombia.</p>
          </div>
          <div className="col-6 col-md-2 mb-4">
            <h4>Comprar</h4>
            <button className="btn btn-link p-0 text-white" onClick={() => irA("inicio")}>Catálogo</button><br />
            <button className="btn btn-link p-0 text-white" onClick={() => irA("carrito")}>Mi carrito</button><br />
            <button className="btn btn-link p-0 text-white" onClick={() => irA("login")}>Mi cuenta</button>
          </div>
          <div className="col-6 col-md-2 mb-4">
            <h4>Ayuda</h4>
            <p className="mb-1">Cómo comprar</p>
            <p className="mb-1">Envíos</p>
            <p className="mb-1">Devoluciones</p>
          </div>
          <div className="col-6 col-md-2 mb-4">
            <h4>PinkPort</h4>
            <p className="mb-1">Nuestra historia</p>
            <p className="mb-1">Productos originales</p>
            <p className="mb-1">Privacidad</p>
          </div>
        </div>

        <hr />
        <p className="pb-3 mb-0">© 2026 PinkPort Colombia. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}

export default Footer;
