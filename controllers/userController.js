import bcrypt from "bcrypt";
import Usuario from "../models/Usuario.js";

export const loginView = (req, res) => {
    res.render("login");
};

export const loginPost = async (req, res) => {
    const { email, password } = req.body;

    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario) {
        return res.render("login", { error: "Usuario no encontrado" });
    }

    if (usuario.visible === 0) {
        return res.render("login", { error: "Usuario inhabilitado" });
    }

    // usuario.clave = hash almacenado en BD
    const coincide = await bcrypt.compare(password, usuario.clave);

    if (!coincide) {
        return res.render("login", { error: "Contraseña incorrecta" });
    }

    // Login correcto
    req.session.user = {
        id: usuario.idUsuario,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
        avatar: usuario.avatar
    };

    res.redirect("/users/inicio");
};

export const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error cerrando sesión:", err);
        }
        res.redirect("/users/login");
    });
};

export const dashboard = (req, res) => {
    if (!req.session.user) {
        return res.redirect("/users/login");
    }

    res.render("dashboard", { 
        user: req.session.user 
    });
};