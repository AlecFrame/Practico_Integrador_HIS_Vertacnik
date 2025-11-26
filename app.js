import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize } from './models/index.js';
import session from 'express-session';
import userRoutes from './routes/userRoutes.js';
import pacienteRoutes from './routes/pacienteRoutes.js';

sequelize.authenticate()
    .then(() => console.log('Conexión a MySQL correcta'))
    .catch(err => console.error('Error conectando a MySQL:', err));

sequelize.sync({ alter: true })
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
app.use('/usuarios', userRoutes);
app.use('/pacientes', pacienteRoutes);

// Página principal -> login
app.get('/', (req, res) => {
    res.redirect('/usuarios/login');
});

// Middleware para rutas inexistentes
app.use((req, res) => {
    res.status(404).render("error/404", { user: req.session.user });
});

const PORT = 7250;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
