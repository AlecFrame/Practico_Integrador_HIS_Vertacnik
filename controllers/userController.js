import bcrypt from "bcrypt";
import { Usuario, Auditoria } from "../models/index.js";
import { Op } from "sequelize";

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

export const dashboard = async (req, res) => {
    const user = req.session.user;
    const accion = req.query.accion || '';
    const entidad = req.query.entidad || '';
    const fecha1 = req.query.fecha1 || null;
    const fecha2 = req.query.fecha2 || null;
    const accionAdmin = req.query.accionAdmin || '';
    const entidadAdmin = req.query.entidadAdmin || '';
    const fecha1Admin = req.query.fecha1Admin || null;
    const fecha2Admin = req.query.fecha2Admin || null;
    const qUsuario = req.query.qUsuario || '';
    
    const page = parseInt(req.query.page) || 1;
    const pageAdmin = parseInt(req.query.pageAdmin) || 1;
    const pageSize = 6;

    let where = { usuarioId: user.id };

    if (fecha1 && fecha2) {
        const inicio = new Date(fecha1);
        const fin = new Date(fecha2);

        // Asegurar que fecha2 incluya todo el día:
        fin.setHours(23, 59, 59, 999);

        where.fechaHora = {
            [Op.between]: [inicio, fin]
        };
    }


    if (accion != '') where.accion = accion;
    if (entidad != '') where.entidad = entidad;

    // Acciones recientes del usuario
    const { count, rows: recientes } = await Auditoria.findAndCountAll({
        where,
        order: [['fechaHora', 'DESC']],
        limit: pageSize,
        offset: (page - 1) * pageSize,
        include: [{
            model: Usuario,
            as: 'Usuario'
        }]
    });

    const totalPages = Math.ceil(count / pageSize);

    // Si el usuario es admin, puede ver todo el sistema
    let admin = { count: 1, rows: 0 };

    if (user.rol === "admin") {
        where = {}

        if (fecha1Admin && fecha2Admin) {
            const inicio = new Date(fecha1Admin);
            const fin = new Date(fecha2Admin);

            // Asegurar que fecha2 incluya todo el día:
            fin.setHours(23, 59, 59, 999);

            where.fechaHora = {
                [Op.between]: [inicio, fin]
            };
        }


        if (accionAdmin != '') where.accion = accionAdmin;
        if (entidadAdmin != '') where.entidad = entidadAdmin;

        if (qUsuario.trim() !== "") {
            where[Op.or] = [
                { ["$Usuario.nombre$"]: { [Op.like]: `%${qUsuario}%` } },
                { ["$Usuario.apellido$"]: { [Op.like]: `%${qUsuario}%` } },
                { ["$Usuario.email$"]: { [Op.like]: `%${qUsuario}%` } },
                { ["$Usuario.rol$"]: { [Op.like]: `%${qUsuario}%` } }
            ];
        }

        admin = await Auditoria.findAndCountAll({
            where,
            order: [['fechaHora', 'DESC']],
            limit: pageSize,
            offset: (pageAdmin - 1) * pageSize,
            include: [{
                model: Usuario,
                as: 'Usuario'
            }]
        });
    }

    const totalPagesAdmin = Math.ceil(admin.count / pageSize);

    res.render("dashboard", {
        user,
        accion, entidad, fecha1, fecha2, page, totalPages,
        accionAdmin, entidadAdmin, fecha1Admin, fecha2Admin, pageAdmin, totalPagesAdmin, qUsuario,
        recientes,
        recientesSistema: admin.rows
    });
};