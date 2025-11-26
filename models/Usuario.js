import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Usuario = sequelize.define('Usuario', {
    idUsuario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: DataTypes.STRING,
    apellido: DataTypes.STRING,
    email: { type: DataTypes.STRING, unique: true },
    clave: DataTypes.STRING,
    rol: DataTypes.ENUM('admin', 'recepcion', 'enfermeria', 'medico'),
    visible: DataTypes.TINYINT,
    avatar: DataTypes.STRING
});

export default Usuario;