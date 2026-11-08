// Controlador de productos y categorías
const supabase = require("../config/database");

// GET /api/categorias -> lista todas las categorías
exports.listarCategorias = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("categoria")
      .select("*")
      .order("id_categoria", { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al cargar las categorías" });
  }
};

// GET /api/productos -> lista los productos
// Se puede filtrar: /api/productos?categoria=2  o  /api/productos?buscar=vela
exports.listarProductos = async (req, res) => {
  try {
    const categoria = req.query.categoria;
    const buscar = req.query.buscar;

    let consulta = supabase
      .from("producto")
      .select("*")
      .order("id_producto", { ascending: true });

    if (categoria) {
      consulta = consulta.eq("id_categoria", categoria);
    }

    if (buscar) {
      consulta = consulta.ilike("nombre", "%" + buscar + "%");
    }

    const { data, error } = await consulta;

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al cargar los productos" });
  }
};

// GET /api/productos/:id -> trae un solo producto
exports.verProducto = async (req, res) => {
  try {
    const id = req.params.id;

    const { data, error } = await supabase
      .from("producto")
      .select("*")
      .eq("id_producto", id)
      .single();

    if (error) {
      return res.status(404).json({ mensaje: "El producto no existe" });
    }
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al cargar el producto" });
  }
};
