import { pesos } from "../costos";

// Tarjeta de un producto
function ProductoCard({ producto, verProducto, abrirAgregar }) {
  return (
    <div className="col-12 col-md-6 col-lg-3 mb-4">
      <div className="producto h-100">
        <img
          src={producto.imagen_url}
          alt={producto.nombre}
          className="producto-foto-img"
          onClick={() => verProducto(producto.id_producto)}
        />
        <div className="p-3">
          <p className="marca">{producto.marca}</p>
          <h3 className="producto-nombre">{producto.nombre}</h3>
          <p className="precio">{pesos(producto.precio)} COP</p>
          <button className="btn boton-rosa w-100" onClick={() => abrirAgregar(producto)} disabled={producto.stock === 0}>
            {producto.stock === 0 ? "Agotado" : "+ Agregar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductoCard;
