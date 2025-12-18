import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Usuario = sequelize.define('Usuario', {
    idUsuario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: DataTypes.STRING(50),
    apellido: DataTypes.STRING(50),
    email: { type: DataTypes.STRING(125), unique: true },
    clave: DataTypes.STRING, // Hook
    rol: DataTypes.ENUM('admin', 'recepcion', 'enfermeria', 'medico'),
    visible: DataTypes.TINYINT,
    avatar: DataTypes.STRING
});

export default Usuario;