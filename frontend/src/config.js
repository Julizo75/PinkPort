// Dirección del backend (Node.js)
// En tu computador usa localhost. En Vercel se cambia con la variable VITE_API_URL.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default API_URL;
