// =============================================
// PinkPort - Servidor (Node.js + Express)
// =============================================
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const productoController = require("./controllers/productoController");
const usuarioController = require("./controllers/usuarioController");
const pedidoController = require("./controllers/pedidoController");
const trmController = require("./controllers/trmController");
const pagoController = require("./controllers/pagoController");

const app = express();

app.use(cors());          // permite que el frontend (React) se comunique con el backend
app.use(express.json());  // permite recibir datos en formato JSON

// ===== RUTAS =====

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("API de PinkPort funcionando");
});

// Productos y categorías
app.get("/api/categorias", productoController.listarCategorias);
app.get("/api/productos", productoController.listarProductos);
app.get("/api/productos/:id", productoController.verProducto);

// Usuarios
app.post("/api/usuarios/registro", usuarioController.registrar);
app.post("/api/usuarios/login", usuarioController.login);

// TRM del día
app.get("/api/trm", trmController.verTRM);

// Pedidos
app.post("/api/pedidos", pedidoController.crearPedido);
app.get("/api/pedidos/usuario/:id", pedidoController.listarPedidosUsuario);

// Pagos con Wompi
app.get("/api/pagos/verificar/:id", pagoController.verificarPago);

// ===== SERVIDOR =====
app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});
