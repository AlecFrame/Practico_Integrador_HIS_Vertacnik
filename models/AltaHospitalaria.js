import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const AltaHospitalaria = sequelize.define('AltaHospitalaria', {
    idAlaHospitalaria: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fecha: DataTypes.DATE,
    indicacionesAlta: DataTypes.TEXT,
    visible: DataTypes.TINYINT
});

export default AltaHospitalaria;
