import { useState, useEffect } from "react";
import API_URL from "./config";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Inicio from "./vistas/Inicio";
import Detalle from "./vistas/Detalle";
import Carrito from "./vistas/Carrito";
import Login from "./vistas/Login";
import MisPedidos from "./vistas/MisPedidos";
import ResultadoPago from "./vistas/ResultadoPago";
import PagoDemo from "./vistas/PagoDemo";

// Cuando Wompi devuelve al usuario, la dirección trae ?id=ID_DE_LA_TRANSACCION
// En la pasarela demo, la dirección trae ?pago_demo=REFERENCIA&monto=CENTAVOS
const parametrosURL = new URLSearchParams(window.location.search);
const idTransaccion = parametrosURL.get("id");
const referenciaDemo = parametrosURL.get("pago_demo");
const montoDemo = parametrosURL.get("monto");

// Vista con la que abre la página
let vistaInicial = "inicio";
if (idTransaccion) {
  vistaInicial = "resultado";
} else if (referenciaDemo) {
  vistaInicial = "pagoDemo";
}

// Lee un dato guardado en el navegador (localStorage)
function leerGuardado(clave, valorInicial) {
  const guardado = localStorage.getItem(clave);
  if (guardado) {
    return JSON.parse(guardado);
  }
  return valorInicial;
}

function App() {
  // Vista que se está mostrando: "inicio", "detalle", "carrito", "login", "pedidos", "pagoDemo" o "resultado"
  const [vista, setVista] = useState(vistaInicial);

  const [categorias, setCategorias] = useState([]);
  const [categoriaElegida, setCategoriaElegida] = useState(null);
  const [textoBuscado, setTextoBuscado] = useState("");
  const [productoElegido, setProductoElegido] = useState(null);
  // El carrito y el usuario se guardan en el navegador para no perderlos al ir a pagar a Wompi
  const [carrito, setCarrito] = useState(leerGuardado("carrito", []));
  const [usuario, setUsuario] = useState(leerGuardado("usuario", null));

  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }, [carrito]);

  useEffect(() => {
    localStorage.setItem("usuario", JSON.stringify(usuario));
  }, [usuario]);

  // TRM del día: sirve para saber cuánto son USD 200 en pesos (límite para el IVA)
  const [trm, setTrm] = useState({ trm: 3237.83, limite_pesos: 647566 });

  // Cargar las categorías una sola vez al abrir la página
  useEffect(() => {
    async function cargarCategorias() {
      try {
        const respuesta = await fetch(API_URL + "/categorias");
        const datos = await respuesta.json();

        // Si el backend responde con error, no se cambian las categorías
        if (!respuesta.ok) {
          console.error(datos.mensaje);
          return;
        }
        setCategorias(datos);
      } catch (error) {
        console.error("Error al cargar categorías", error);
      }
    }
    async function cargarTRM() {
      try {
        const respuesta = await fetch(API_URL + "/trm");
        const datos = await respuesta.json();
        if (respuesta.ok) {
          setTrm(datos);
        }
      } catch (error) {
        console.error("Error al cargar la TRM", error);
      }
    }

    cargarCategorias();
    cargarTRM();
  }, []);

  // ===== Navegación =====
  function irA(nuevaVista) {
    setVista(nuevaVista);
    window.scrollTo(0, 0);
    // Se quitan los datos del pago (?id=... o ?pago_demo=...) de la dirección
    window.history.replaceState(null, "", "/");
  }

  function verProducto(id) {
    setProductoElegido(id);
    irA("detalle");
  }

  function filtrarCategoria(id) {
    setCategoriaElegida(id);
    setTextoBuscado("");
    irA("inicio");
  }

  function buscarProductos(texto) {
    setTextoBuscado(texto);
    setCategoriaElegida(null);
    irA("inicio");
  }

  // ===== Carrito =====
  function agregarAlCarrito(producto, cantidad) {
    const existe = carrito.find((item) => item.id_producto === producto.id_producto);

    if (existe) {
      const nuevoCarrito = carrito.map((item) => {
        if (item.id_producto === producto.id_producto) {
          return { ...item, cantidad: item.cantidad + cantidad };
        }
        return item;
      });
      setCarrito(nuevoCarrito);
    } else {
      setCarrito([...carrito, { ...producto, cantidad: cantidad }]);
    }
  }

  function cambiarCantidad(id, cantidad) {
    if (cantidad < 1) return;
    const nuevoCarrito = carrito.map((item) => {
      if (item.id_producto === id) {
        return { ...item, cantidad: cantidad };
      }
      return item;
    });
    setCarrito(nuevoCarrito);
  }

  function quitarDelCarrito(id) {
    setCarrito(carrito.filter((item) => item.id_producto !== id));
  }

  // Cantidad total de productos (para el número del carrito)
  let totalProductos = 0;
  carrito.forEach((item) => {
    totalProductos = totalProductos + item.cantidad;
  });

  // ===== Elegir qué vista mostrar =====
  let contenido;

  switch (vista) {
    case "detalle":
      contenido = (
        <Detalle id={productoElegido} trm={trm} agregarAlCarrito={agregarAlCarrito} irA={irA} />
      );
      break;
    case "carrito":
      contenido = (
        <Carrito
          carrito={carrito}
          trm={trm}
          usuario={usuario}
          setUsuario={setUsuario}
          cambiarCantidad={cambiarCantidad}
          quitarDelCarrito={quitarDelCarrito}
          irA={irA}
        />
      );
      break;
    case "login":
      contenido = <Login setUsuario={setUsuario} irA={irA} hayCarrito={carrito.length > 0} />;
      break;
    case "pagoDemo":
      contenido = <PagoDemo referencia={referenciaDemo} montoCentavos={Number(montoDemo)} irA={irA} />;
      break;
    case "resultado":
      contenido = <ResultadoPago idTransaccion={idTransaccion} vaciarCarrito={() => setCarrito([])} irA={irA} />;
      break;
    case "pedidos":
      // Solo se pueden ver los pedidos si hay una sesión iniciada
      if (usuario) {
        contenido = <MisPedidos usuario={usuario} irA={irA} />;
      } else {
        contenido = <Login setUsuario={setUsuario} irA={irA} hayCarrito={carrito.length > 0} />;
      }
      break;
    default:
      contenido = (
        <Inicio
          categorias={categorias}
          categoriaElegida={categoriaElegida}
          textoBuscado={textoBuscado}
          filtrarCategoria={filtrarCategoria}
          verProducto={verProducto}
          agregarAlCarrito={agregarAlCarrito}
          irA={irA}
        />
      );
  }

  return (
    <>
      <Header
        categorias={categorias}
        totalProductos={totalProductos}
        usuario={usuario}
        cerrarSesion={() => {
          setUsuario(null);
          irA("inicio");
        }}
        irA={irA}
        filtrarCategoria={filtrarCategoria}
        buscarProductos={buscarProductos}
      />
      <main>{contenido}</main>
      <Footer irA={irA} />
    </>
  );
}

export default App;
