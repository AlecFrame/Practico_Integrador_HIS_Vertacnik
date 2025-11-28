import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Admision = sequelize.define('Admision', {
    idAdmision: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fechaIngreso: DataTypes.DATE,
    tipoIngreso: DataTypes.ENUM('cita', 'derivacion', 'emergencia'),
    estado: DataTypes.ENUM('activa', 'cancelada', 'finalizada'),
    motivoInternacion: DataTypes.TEXT,
    visible: DataTypes.TINYINT,
    derivadoPor: DataTypes.STRING
});

export default Admision;
