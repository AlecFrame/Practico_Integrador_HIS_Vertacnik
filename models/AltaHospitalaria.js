import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const AltaHospitalaria = sequelize.define('AltaHospitalaria', {
    idAltaHospitalaria: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fecha: DataTypes.DATE,
    diagnosticoFinal: DataTypes.TEXT,
    indicacionesAlta: DataTypes.TEXT,
    seguimientoFuturo: DataTypes.TEXT,
    visible: DataTypes.TINYINT
});

export default AltaHospitalaria;
