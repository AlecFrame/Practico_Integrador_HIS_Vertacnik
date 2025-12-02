import { Auditoria, Usuario } from '../models/index.js';
import { Op } from "sequelize";

export const auditar = async (usuarioId, entidad, entidadId, accion, descripcion, link, linkR) => {
    try {
        await Auditoria.create({
            usuarioId,
            entidad,
            entidadId,
            accion,
            descripcion,
            fechaHora: new Date(),
            link,
            linkR
        });

        return { ok: true };

    } catch (error) {
        console.error("Error creando auditoría:", error);
        return { ok: false, error: "Error al crear la auditoría" };
    }
};