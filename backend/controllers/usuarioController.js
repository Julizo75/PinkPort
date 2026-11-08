// Controlador de usuarios: registro e inicio de sesión
const supabase = require("../config/database");
const bcrypt = require("bcryptjs");

// Valida el formato del correo
function correoValido(correo) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(correo);
}

// POST /api/usuarios/registro -> crea una cuenta nueva
exports.registrar = async (req, res) => {
  try {
    const { nombre, correo, contrasena, telefono } = req.body;

    // Validaciones
    if (!nombre || !correo || !contrasena) {
      return res.status(400).json({ mensaje: "Nombre, correo y contraseña son obligatorios" });
    }
    if (!correoValido(correo)) {
      return res.status(400).json({ mensaje: "El correo no es válido" });
    }
    if (contrasena.length < 6) {
      return res.status(400).json({ mensaje: "La contraseña debe tener mínimo 6 caracteres" });
    }

    // Revisar si el correo ya está registrado
    const { data: existe } = await supabase
      .from("usuario")
      .select("id_usuario")
      .eq("correo", correo.toLowerCase())
      .maybeSingle();

    if (existe) {
      return res.status(400).json({ mensaje: "Ya existe una cuenta con ese correo" });
    }

    // Cifrar la contraseña antes de guardarla
    const contrasenaCifrada = await bcrypt.hash(contrasena, 10);

    const { data, error } = await supabase
      .from("usuario")
      .insert([
        {
          nombre: nombre,
          correo: correo.toLowerCase(),
          contrasena: contrasenaCifrada,
          telefono: telefono
        }
      ])
      .select("id_usuario, nombre, correo, ciudad, direccion")
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al crear la cuenta" });
  }
};

// POST /api/usuarios/login -> inicia sesión
exports.login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res.status(400).json({ mensaje: "Escribe tu correo y tu contraseña" });
    }

    // Buscar el usuario por correo
    const { data: usuario } = await supabase
      .from("usuario")
      .select("*")
      .eq("correo", correo.toLowerCase())
      .maybeSingle();

    if (!usuario) {
      return res.status(401).json({ mensaje: "Correo o contraseña incorrectos" });
    }

    // Comparar la contraseña escrita con la guardada
    const esCorrecta = await bcrypt.compare(contrasena, usuario.contrasena);

    if (!esCorrecta) {
      return res.status(401).json({ mensaje: "Correo o contraseña incorrectos" });
    }

    // Se envía el usuario SIN la contraseña
    res.json({
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre,
      correo: usuario.correo,
      ciudad: usuario.ciudad,
      direccion: usuario.direccion
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al iniciar sesión" });
  }
};
