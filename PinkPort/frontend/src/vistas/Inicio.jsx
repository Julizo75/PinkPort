import { useState, useEffect } from "react";
import API_URL from "../config";
import ProductoCard from "../components/ProductoCard";
import ModalCantidad from "../components/ModalCantidad";

// Imagen de cada categoría
const imagenes = {
  Skincare: "/img/cat-skincare.jpg",
  Maquillaje: "/img/cat-maquillaje.jpg",
  Cabello: "/img/cat-cabello.jpg",
  Moda: "/img/cat-moda.jpg",
  Hogar: "/img/cat-hogar.jpg",
  Ofertas: "/img/cat-ofertas.jpg"
};

function Inicio({ categorias, categoriaElegida, textoBuscado, filtrarCategoria, verProducto, agregarAlCarrito, irA }) {
  const [productos, setProductos] = useState([]);
  const [productoParaAgregar, setProductoParaAgregar] = useState(null); // producto de la tarjeta "¿Cuántos quieres?"
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Cada vez que cambia la categoría o la búsqueda, se vuelven a cargar los productos
  useEffect(() => {
    document.title = "PinkPort | Belleza, cabello y moda originales de EE. UU.";

    async function cargarProductos() {
      setCargando(true);
      setError("");
      try {
        let url = API_URL + "/productos";
        if (categoriaElegida) {
          url = url + "?categoria=" + categoriaElegida;
        } else if (textoBuscado) {
          url = url + "?buscar=" + encodeURIComponent(textoBuscado);
        }

        const respuesta = await fetch(url);
        const datos = await respuesta.json();

        if (respuesta.ok) {
          setProductos(datos);
        } else {
          setError(datos.mensaje);
        }
      } catch (err) {
        setError("No se pudo conectar con el servidor. ¿Está encendido el backend?");
      }
      setCargando(false);
    }

    cargarProductos();
  }, [categoriaElegida, textoBuscado]);

  // Título de la sección de productos
  let titulo = "Tendencias de temporada";
  if (textoBuscado) {
    titulo = 'Resultados para "' + textoBuscado + '"';
  } else if (categoriaElegida) {
    const categoria = categorias.find((c) => c.id_categoria === categoriaElegida);
    if (categoria) titulo = categoria.nombre;
  }

  return (
    <>
      {/* Banner (solo cuando no hay filtro ni búsqueda) */}
      {!categoriaElegida && !textoBuscado && (
        <section className="banner">
          <div className="container">
            <div className="row">
              <div className="col-12 col-lg-6">
                <p className="banner-etiqueta">ORIGINALES • CURADOS • SIN SORPRESAS</p>
                <h1>Lo mejor de EE. UU., directo a tu puerta</h1>
                <p className="mt-3 mb-4">Descubre belleza, moda y hogar con precio final en COP y entrega segura en toda Colombia.</p>
                <a href="#productos" className="btn boton-rosa">→ Explorar</a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Categorías */}
      <section className="container mt-5">
        <p className="subtitulo-rosa">ENCUENTRA LO TUYO</p>
        <h2 className="titulo mb-4">Compra por categoría</h2>

        <div className="row text-center">
          {categorias.map((categoria) => (
            <div className="col-4 col-md-2 mb-4" key={categoria.id_categoria}>
              <button className="categoria-boton" onClick={() => filtrarCategoria(categoria.id_categoria)}>
                <img src={imagenes[categoria.nombre]} alt={categoria.nombre} className="categoria-img" />
                <p className="categoria-nombre">{categoria.nombre}</p>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Productos */}
      <section className="container mt-4 mb-5" id="productos">
        <p className="subtitulo-rosa">FAVORITOS DEL MOMENTO</p>
        <h2 className="titulo mb-4">{titulo}</h2>

        {cargando && <p className="texto-gris">Cargando productos...</p>}

        {error && <div className="alert alert-danger">{error}</div>}

        {!cargando && !error && productos.length === 0 && (
          <p className="texto-gris">No encontramos productos.</p>
        )}

        <div className="row">
          {productos.map((producto) => (
            <ProductoCard
              key={producto.id_producto}
              producto={producto}
              verProducto={verProducto}
              abrirAgregar={setProductoParaAgregar}
            />
          ))}
        </div>
      </section>

      {/* Beneficios */}
      <section className="container mb-5">
        <p className="subtitulo-rosa">COMPRA CON TRANQUILIDAD</p>
        <h2 className="titulo mb-4">PinkPort se encarga de todo</h2>
        <div className="row">
          <div className="col-12 col-md-4 mb-3">
            <div className="beneficio">
              <span className="beneficio-icono"><i className="bi bi-patch-check"></i></span>
              <h3>Productos originales</h3>
              <p>Comprados directamente en tiendas autorizadas de EE. UU.</p>
            </div>
          </div>
          <div className="col-12 col-md-4 mb-3">
            <div className="beneficio">
              <span className="beneficio-icono"><i className="bi bi-receipt"></i></span>
              <h3>Precio final sin sorpresas</h3>
              <p>Producto, envío e impuestos claros antes de pagar, en pesos colombianos.</p>
            </div>
          </div>
          <div className="col-12 col-md-4 mb-3">
            <div className="beneficio">
              <span className="beneficio-icono"><i className="bi bi-geo-alt"></i></span>
              <h3>Seguimiento de tu pedido</h3>
              <p>Desde EE. UU. hasta la puerta de tu casa.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tarjeta para elegir la cantidad */}
      {productoParaAgregar && (
        <ModalCantidad
          producto={productoParaAgregar}
          agregarAlCarrito={agregarAlCarrito}
          cerrar={() => setProductoParaAgregar(null)}
          irA={irA}
        />
      )}
    </>
  );
}

export default Inicio;
