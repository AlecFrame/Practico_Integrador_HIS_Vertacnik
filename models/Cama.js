import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Cama = sequelize.define('Cama', {
    idCama: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    numero: DataTypes.INTEGER,
    estado: DataTypes.ENUM('libre', 'ocupada', 'sucia', 'mantenimiento'),
    visible: DataTypes.TINYINT
});

export default Cama;