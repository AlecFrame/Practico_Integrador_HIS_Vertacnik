import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
import { Usuario } from '../models/index.js';
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
        await Usuario.create({
            nombre,
            apellido,
            email,
            rol,
            clave: hash,
            visible,
            avatar
        });

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

        return res.json({ ok: true });

    } catch (error) {
        console.log(error);
        return res.json({ ok: false, error: "Error al actualizar usuario" });
    }
};

export const darDeBaja = async (req, res) => {
  try {
    await Usuario.update(
      { visible: 0 },
      { where: { idUsuario: req.params.id } }
    );
    return res.json({ ok: true });
  } catch (err) {
    return res.json({ ok: false, error: "Error al dar de baja" });
  }
};

export const darDeAlta = async (req, res) => {
  try {
    await Usuario.update(
      { visible: 1 },
      { where: { idUsuario: req.params.id } }
    );
    return res.json({ ok: true });
  } catch (err) {
    return res.json({ ok: false, error: "Error al dar de alta" });
  }
};
