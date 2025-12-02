import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Auditoria = sequelize.define('Auditoria', {
    idAuditoria: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    entidad: DataTypes.STRING,
    entidadId: DataTypes.INTEGER,
    accion: DataTypes.STRING,
    descripcion: DataTypes.TEXT,
    fechaHora: DataTypes.DATE,
    link: DataTypes.STRING,
    linkR: DataTypes.STRING
});

export default Auditoria;
