import { useState } from "react";

function Header({ categorias, totalProductos, usuario, cerrarSesion, irA, filtrarCategoria, buscarProductos }) {
  const [texto, setTexto] = useState("");

  function buscar(e) {
    e.preventDefault();
    buscarProductos(texto.trim());
  }

  return (
    <header className="encabezado">
      <div className="container">
        <div className="row align-items-center py-3">

          {/* Logo */}
          <div className="col-12 col-md-3 mb-2 mb-md-0">
            <button className="logo btn p-0 border-0" onClick={() => filtrarCategoria(null)}>
              <span className="logo-circulo">P</span> PinkPort
            </button>
          </div>

          {/* Buscador */}
          <div className="col-12 col-md-5 mb-2 mb-md-0">
            <form onSubmit={buscar}>
              <input
                type="search"
                className="form-control rounded-pill"
                placeholder="Busca productos originales de EE. UU."
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
              />
            </form>
          </div>

          {/* Cuenta y carrito */}
          <div className="col-12 col-md-4">
            <div className="iconos">
              {usuario ? (
                <>
                  <button className="icono" onClick={() => irA("pedidos")}>
                    <i className="bi bi-box-seam"></i>
                    <span>Mis pedidos</span>
                  </button>

                  <div className="icono">
                    <i className="bi bi-person-check"></i>
                    <span>
                      Hola, {usuario.nombre.split(" ")[0]} ·{" "}
                      <button className="salir" onClick={cerrarSesion}>Salir</button>
                    </span>
                  </div>
                </>
              ) : (
                <button className="icono" onClick={() => irA("login")}>
                  <i className="bi bi-person"></i>
                  <span>Cuenta</span>
                </button>
              )}

              <button className="icono" onClick={() => irA("carrito")}>
                <span className="icono-carrito">
                  <i className="bi bi-bag"></i>
                  <span className="badge rounded-pill">{totalProductos}</span>
                </span>
                <span>Carrito</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Menú de categorías */}
      <nav className="navbar navbar-expand-md menu">
        <div className="container">
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menuCategorias">
            <i className="bi bi-list"></i> Categorías
          </button>
          <div className="collapse navbar-collapse" id="menuCategorias">
            <ul className="navbar-nav">
              <li className="nav-item">
                <button className="nav-link" onClick={() => filtrarCategoria(null)}>Todo</button>
              </li>
              {categorias.map((categoria) => (
                <li className="nav-item" key={categoria.id_categoria}>
                  <button className="nav-link" onClick={() => filtrarCategoria(categoria.id_categoria)}>
                    {categoria.nombre}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
