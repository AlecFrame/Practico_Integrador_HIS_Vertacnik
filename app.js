import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize } from './models/index.js';
import session from 'express-session';

import userRoutes from './routes/userRoutes.js';
import pacienteRoutes from './routes/pacienteRoutes.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import unidadRoutes from './routes/unidadRoutes.js';
import alaRoutes from './routes/alaRoutes.js';
import habitacionRoutes from './routes/habitacionRoutes.js';
import camaRoutes from './routes/camaRoutes.js';
import admisionRoutes from './routes/admisionRoutes.js';
import enfermeriaRoutes from './routes/enfermeriaRoutes.js';
import medicinaRoutes from './routes/medicinaRoutes.js';
import altaHospitalariaRoutes from './routes/altaHospitalariaRoutes.js';

sequelize.authenticate()
    .then(() => console.log('Conexión a MySQL correcta'))
    .catch(err => console.error('Error conectando a MySQL:', err));

sequelize.sync()
    .then(() => console.log("Modelos sincronizados"))
    .catch(err => console.error("Error sincronizando modelos:", err));

const app = express();

// Fix para __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar vistas
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Manejo de sesión
app.use(session({
    secret: 'hospital-secret',
    resave: false,
    saveUninitialized: false
}));

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// Rutas
app.use('/users', userRoutes);
app.use('/pacientes', pacienteRoutes);
app.use('/usuarios', usuarioRoutes);
app.use('/unidades', unidadRoutes);
app.use('/alas', alaRoutes);
app.use('/habitaciones', habitacionRoutes);
app.use('/camas', camaRoutes);
app.use('/admisiones', admisionRoutes);
app.use('/enfermeria', enfermeriaRoutes);
app.use('/medicina', medicinaRoutes);
app.use('/altaHospitalarias', altaHospitalariaRoutes);

// Página principal -> login
app.get('/', (req, res) => {
    res.redirect('/users/login');
});

// Middleware para rutas inexistentes
app.use((req, res) => {
    res.status(404).render("error/404", { user: req.session.user });
});

const PORT = 7250;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
