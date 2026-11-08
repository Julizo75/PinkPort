// Conexión con la base de datos de Supabase
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

// Avisos por si el archivo .env está mal
if (!supabaseUrl || !supabaseKey) {
  console.log("ERROR: falta SUPABASE_URL o SUPABASE_SECRET_KEY en el archivo .env");
}
if (supabaseKey && supabaseKey.startsWith("sb_publishable")) {
  console.log("ERROR: pusiste la Publishable key. En el .env va la SECRET key (empieza por sb_secret_)");
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
