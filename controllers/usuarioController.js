import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
import { Usuario } from '../models/index.js';
import { auditar } from '../controllers/auditoriaController.js';
import { agregarCambio } from '../middleware/helper.js';
import { Op } from "sequelize";

export const listar = async (req, res) => {
  const estado = req.query.estado || "activos";
  const buscar = req.query.buscar || "";
  const page = parseInt(req.query.page) || 1;
  const pageSize = 10;

  let where = {};

  // Filtro por estado
  if (estado === "activos") where.visible = 1;
  if (estado === "inactivos") where.visible = 0;

  // Filtro por texto (nombre, apellido o email)
  if (buscar.trim() !== "") {
    where[Op.or] = [
      { nombre: { [Op.like]: `%${buscar}%` } },
      { apellido: { [Op.like]: `%${buscar}%` } },
      { email: { [Op.like]: `%${buscar}%` } }
    ];
  }

  const { count, rows } = await Usuario.findAndCountAll({
    where,
    limit: pageSize,
    offset: (page - 1) * pageSize
  });

  const totalPages = Math.ceil(count / pageSize);

  res.render("usuario/index", {
    usuarios: rows,
    estado,
    buscar,
    page,
    totalPages
  });
};

export const crear = async (req, res) => {
    const { nombre, apellido, email, rol, clave, visible = 1 } = req.body;

    const avatar = req.file ? `/uploads/avatars/${req.file.filename}` : null;
    const hash = await bcrypt.hash(clave, 10);

    try {
        const usuario = await Usuario.create({
            nombre,
            apellido,
            email,
            rol,
            clave: hash,
            visible,
            avatar
        });

        await auditar(
            req.session.user.id,
            "Usuario",
            usuario.idUsuario,
            "Crear",
            `Creó al Usuario#${usuario.idUsuario} ${usuario.nombre} ${usuario.apellido} con el rol ${usuario.rol}`,
            `/usuarios?estado=${usuario.visible? 'activos':'inactivos'}&buscar=${usuario.email}`,
            null
        );

        return res.json({ ok: true });
    } catch (error) {
        return res.json({ ok: false, error: "Error al crear usuario" });
    }
};

export const actualizar = async (req, res) => {
    let { nombre, apellido, email, rol, clave, flagEliminarAvatar } = req.body;

    try {
        const usuario = await Usuario.findByPk(req.params.id);

        if (!usuario) {
            return res.json({ ok: false, error: "Usuario no encontrado" });
        }

        const usuarioAntes = {
          nombre: usuario.nombre, 
          apellido: usuario.apellido, 
          email: usuario.email, 
          rol: usuario.rol, 
          clave: usuario.clave, 
          avatar: usuario.avatar
        };

        // ----------- CLAVE -----------
        if (!clave || clave.trim() === "") {
            clave = usuario.clave;
        } else {
            clave = await bcrypt.hash(clave, 10);
        }

        // ----------- AVATAR -----------
        let avatar = usuario.avatar; // avatar actual en DB

        // Si viene un archivo, es un avatar nuevo → reemplazar
        if (req.file) {

            // Si tenía avatar anterior y existe en disco → eliminarlo
            if (usuario.avatar) {
                const oldPath = path.join("public", usuario.avatar);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }

            // Asignar nuevo avatar
            avatar = `/uploads/avatars/${req.file.filename}`;
        }

        // Si NO viene archivo pero el flag dice eliminar → borrar actual
        if (!req.file && flagEliminarAvatar === "true") {

            if (usuario.avatar) {
                const oldPath = path.join("public", usuario.avatar);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }

            avatar = null; // quitar avatar en BD
        }

        // ----------- ACTUALIZAR EN BD -----------
        await Usuario.update(
            { nombre, apellido, email, rol, clave, avatar },
            { where: { idUsuario: req.params.id } }
        );

        // ----------- ACTUALIZAR SESIÓN SI ES EL MISMO USUARIO -----------
        if (req.session.user && req.session.user.id === usuario.idUsuario) {
            req.session.user.nombre = nombre;
            req.session.user.apellido = apellido;
            req.session.user.email = email;
            req.session.user.rol = rol;
            req.session.user.avatar = avatar;
        }

        const cambios = [];
        agregarCambio(cambios, "nombre", usuarioAntes.nombre, nombre);
        agregarCambio(cambios, "apellido", usuarioAntes.apellido, apellido);
        agregarCambio(cambios, "email", usuarioAntes.email, email);
        agregarCambio(cambios, "rol", usuarioAntes.rol, rol);
        agregarCambio(cambios, "avatar", usuarioAntes.avatar, !flagEliminarAvatar? "Se eliminó":avatar);
        agregarCambio(cambios, "clave", usuarioAntes.clave, clave);
  
        const descripcion = cambios.length > 0
          ? `Cambios: ${cambios.join(", ")}`
          : "No hubo cambios en los datos";
        
        await auditar(
            req.session.user.id,
            "Usuario",
            usuario.idUsuario,
            "Editar",
            descripcion,
            `/usuarios?estado=${usuario.visible==1? 'activos':'inactivos'}&buscar=${email}`,
            null
        )

        return res.json({ ok: true });
    } catch (error) {
        console.log("Usuario error: ", error);
        return res.json({ ok: false, error: "Error al actualizar usuario" });
    }
};

export const darDeBaja = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);

    if (!usuario)
      return res.json({ ok: false, error: "No se encontro al Usuario" });
    
    await Usuario.update(
      { visible: 0 },
      { where: { idUsuario: req.params.id } }
    );

    await auditar(
        req.session.user.id,
        "Usuario",
        usuario.idUsuario,
        "Dar de Baja",
        `Dio de baja al Usuario#${usuario.idUsuario} ${usuario.nombre} ${usuario.apellido}`,
        `/usuarios?estado=${usuario.visible? 'activos':'inactivos'}&buscar=${usuario.email}`,
        null
    );

    return res.json({ ok: true });
  } catch (err) {
    return res.json({ ok: false, error: "Error al dar de baja" });
  }
};

export const darDeAlta = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);

    if (!usuario)
      return res.json({ ok: false, error: "No se encontro al Usuario" });

    await Usuario.update(
      { visible: 1 },
      { where: { idUsuario: req.params.id } }
    );

    await auditar(
        req.session.user.id,
        "Usuario",
        usuario.idUsuario,
        "Dar de Alta",
        `Dio de alta al Usuario#${usuario.idUsuario} ${usuario.nombre} ${usuario.apellido}`,
        `/usuarios?estado=${usuario.visible? 'activos':'inactivos'}&buscar=${usuario.email}`,
        null
    );

    return res.json({ ok: true });
  } catch (err) {
    return res.json({ ok: false, error: "Error al dar de alta" });
  }
};
