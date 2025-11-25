import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('vertacnik_hospital2025', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
});

export default sequelize;