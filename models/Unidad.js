import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Unidad = sequelize.define('Unidad', {
    idUnidad: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: DataTypes.STRING,
    visible: DataTypes.TINYINT
});

export default Unidad;