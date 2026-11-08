# PinkPort

Tienda virtual de productos originales de Estados Unidos (belleza, cabello, moda y hogar) para mujeres en Colombia.

**Curso:** Desarrollo Web · **Integrante:** Juliana Zapata Orrego

## Tecnologías

- **Frontend:** React + Vite, Bootstrap 5, Bootstrap Icons y Google Fonts
- **Backend:** Node.js + Express
- **Base de datos:** Supabase (PostgreSQL)
- **Despliegue:** Vercel

## Estructura del proyecto

```
PinkPort/
├── database/
│   ├── 1_tablas.sql            → crea las 5 tablas
│   ├── 2_datos.sql             → categorías y productos de ejemplo
│   └── 3_cambios.sql           → columnas nuevas (dirección y desglose del pedido)
│
├── backend/                    → Node.js + Express
│   ├── server.js               → servidor y rutas
│   ├── config/
│   │   └── database.js         → conexión con Supabase
│   ├── controllers/
│   │   ├── productoController.js
│   │   ├── usuarioController.js
│   │   ├── pedidoController.js
│   │   ├── trmController.js    → consulta la TRM del día
│   │   └── pagoController.js   → pagos con Wompi (modo de pruebas)
│   ├── .env.example
│   └── package.json
│
└── frontend/                   → React + Vite
    ├── index.html              → SEO y enlaces de Bootstrap
    ├── public/img/             → imágenes
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx             → controla qué vista se muestra
    │   ├── config.js           → dirección del backend
    │   ├── costos.js           → fórmula de envío e IVA
    │   ├── index.css
    │   ├── components/         → Header, Footer, ProductoCard, ModalCantidad
    │   └── vistas/             → Inicio, Detalle, Carrito, Login, MisPedidos, PagoDemo, ResultadoPago
    └── package.json
```

**Patrón MVC:**
- **Modelo:** las tablas de Supabase (`database/`) y la conexión `config/database.js`
- **Vista:** el frontend en React (`frontend/`)
- **Controlador:** los archivos de `backend/controllers/`

## Vistas

1. **Inicio:** banner, categorías, productos y buscador.
2. **Detalle:** información del producto, cantidad y total con envío.
3. **Carrito:** cambiar cantidades, eliminar, datos de envío y pago.
4. **Login:** iniciar sesión o crear cuenta.
5. **Mis pedidos:** historial de compras con su desglose, estado y la dirección guardada.
6. **Resultado del pago:** aparece cuando Wompi devuelve al usuario a la tienda.

## Rutas del backend

| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/api/categorias` | Lista las categorías |
| GET | `/api/productos` | Lista los productos (`?categoria=1` o `?buscar=vela`) |
| GET | `/api/productos/:id` | Muestra un producto |
| POST | `/api/usuarios/registro` | Crea una cuenta |
| POST | `/api/usuarios/login` | Inicia sesión |
| POST | `/api/pedidos` | Guarda el pedido como *pendiente*, guarda la dirección y devuelve el enlace de pago de Wompi |
| GET | `/api/pagos/verificar/:id` | Consulta el pago en Wompi, marca el pedido como *pagado* o *rechazado* y descuenta el stock |
| GET | `/api/pedidos/usuario/:id` | Lista los pedidos de un usuario con sus productos |
| GET | `/api/trm` | TRM del día y cuánto son USD 200 en pesos |

## Costos de importación

La misma fórmula está en `backend/controllers/pedidoController.js` y en `frontend/src/costos.js`.

- **Envío:** $25.000 de base (primera libra y manejo) + 5% del valor de la compra (seguro y libras adicionales).
  Es un aproximado: los casilleros cobran entre USD 2,80 y 9 por libra, más un mínimo por paquete y un seguro cercano al 2%.
- **IVA:** si la compra supera **USD 200** se suma el **19%** sobre el valor de los productos.
  Los USD 200 se pasan a pesos con la **TRM del día**, que el backend consulta en [co.dolarapi.com/v1/trm](https://co.dolarapi.com/v1/trm).
  Si la API no responde, se usa una TRM de respaldo de $3.237,83 (`TRM_RESPALDO` en `trmController.js`).

Ejemplo con TRM de $3.237,83 (límite $647.566):

| Compra | Envío | IVA | Total |
|---|---|---|---|
| $149.900 | $32.495 | $0 | $182.395 |
| $729.900 | $61.495 | $138.681 | $930.076 |

---

## 1. Crear la base de datos en Supabase

1. Crear el proyecto en [supabase.com](https://supabase.com).
2. Ir a **SQL Editor → New query**, pegar `database/1_tablas.sql` y dar **Run**.
3. Abrir otra consulta, pegar `database/2_datos.sql` y dar **Run**.
   > Si ya habías creado las tablas antes, solo ejecuta `database/3_cambios.sql` (una sola vez).
4. En **Table Editor** deben aparecer las 5 tablas con datos.
5. Copiar de **Project Settings → API Keys**:
   - **Project URL** (ej. `https://abcd1234.supabase.co`)
   - **Secret key** (empieza por `sb_secret_`)

> La secret key solo va en el backend. No se pone en React ni se sube a GitHub.

## 2. Configurar Wompi (pagos de prueba, gratis)

> **Sin Wompi también funciona:** si el `.env` no tiene las llaves de Wompi, la tienda usa una
> **pasarela DEMO** propia (`frontend/src/vistas/PagoDemo.jsx`) que imita a Wompi con las mismas
> tarjetas de prueba. Al poner las llaves, se usa Wompi automáticamente.

1. Crear una cuenta gratis en [comercios.wompi.co](https://comercios.wompi.co).
2. En el panel, activar el **modo de pruebas (Sandbox)** e ir a **Desarrolladores**.
3. Copiar:
   - **Llave pública** (empieza por `pub_test_`)
   - **Secreto de integridad** (en *Secretos para integración técnica*, empieza por `test_integrity_`)
4. Agregarlos al archivo `backend/.env` (ver paso 3).

**Cómo funciona el pago:**
1. En el carrito, el backend crea el pedido como *pendiente* y arma el enlace de Wompi con la **firma de integridad**
   (SHA256 de `referencia + monto en centavos + moneda + secreto`).
2. La compradora paga en la página de Wompi.
3. Wompi la devuelve a la tienda con `?id=ID_DE_LA_TRANSACCION`.
4. El backend consulta esa transacción en `https://sandbox.wompi.co/v1/transactions/ID` y marca el pedido como
   *pagado* (y descuenta el stock) o *rechazado*.

**Datos de prueba de Wompi:**

| Método | Dato | Resultado |
|---|---|---|
| Tarjeta | `4242 4242 4242 4242` (cualquier fecha futura y CVC) | Aprobado |
| Tarjeta | `4111 1111 1111 1111` | Rechazado |
| Nequi | `3991111111` | Aprobado |
| Nequi | `3992222222` | Rechazado |
| PSE | "Banco que aprueba" / "Banco que rechaza" | Aprobado / Rechazado |

En modo de pruebas no se cobra dinero real.

## 3. Ejecutar el proyecto en el computador

**Terminal 1 – Backend**
```bash
cd backend
npm install
```
Crear el archivo `backend/.env` (copiando `.env.example`) con los datos de Supabase:
```
SUPABASE_URL=https://abcd1234.supabase.co
SUPABASE_SECRET_KEY=sb_secret_xxxxxxxx
WOMPI_PUBLIC_KEY=pub_test_xxxxxxxx
WOMPI_INTEGRITY_SECRET=test_integrity_xxxxxxxx
```
```bash
npm start
```
Debe aparecer: `Servidor corriendo en http://localhost:3000`

**Terminal 2 – Frontend**
```bash
cd frontend
npm install
npm run dev
```
Abrir **http://localhost:5173**

## 4. Subir a GitHub

```bash
git add .
git commit -m "Proyecto PinkPort con React, Node.js y Supabase"
git push origin main
```

## 5. Desplegar en Vercel

Se crean **dos proyectos** en Vercel desde el mismo repositorio: uno para el backend y otro para el frontend.

### Backend
1. En Vercel: **Add New → Project → Import** el repositorio `PinkPort`.
2. En **Root Directory** dar **Edit** y elegir `backend`.
3. En **Environment Variables** agregar `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `WOMPI_PUBLIC_KEY` y `WOMPI_INTEGRITY_SECRET`.
4. **Deploy**. Copiar la dirección que entrega Vercel (ej. `https://pinkport-backend.vercel.app`).
5. Al abrirla debe decir: *API de PinkPort funcionando*.

### Frontend
1. **Add New → Project → Import** otra vez el repositorio `PinkPort`.
2. En **Root Directory** elegir `frontend` (Vercel detecta **Vite**).
3. En **Environment Variables** agregar:
   `VITE_API_URL` = `https://pinkport-backend.vercel.app/api` (la dirección del backend + `/api`)
4. **Deploy**. Esta es la página que se entrega (ej. `https://pinkport.vercel.app`).

Cada vez que se hace `git push`, Vercel vuelve a desplegar los dos proyectos.

---

## Validaciones

- **Registro:** campos obligatorios, formato de correo, contraseña de mínimo 6 caracteres y confirmar contraseña.
- **Login:** campos obligatorios y formato de correo.
- **Carrito:** ciudad y dirección obligatorias.
- **Pagos:** el backend revisa que el valor pagado en Wompi sea igual al total del pedido, y el stock solo se descuenta una vez aunque se recargue la página.
- **Backend:** repite las validaciones, no permite correos repetidos, revisa el stock y usa el precio real de la base de datos.
- Las contraseñas se guardan cifradas con **bcryptjs**.

## SEO básico

- `title` y `meta description` en `frontend/index.html`
- El título de la pestaña cambia en cada vista
- Textos `alt` en las imágenes y encabezados `h1`, `h2` ordenados
- `robots.txt`
