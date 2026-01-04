import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from "path";
import { fileURLToPath } from "url";

import { authMiddleware } from './middlewares/authMiddleware.js';
import authRoutes from './routes/auth.routes.js';
import usuarioRoutes from './routes/user.routes.js';
import rolRoutes from './routes/rol.routes.js';
import productoRoutes from './routes/producto.routes.js'
import ventaRoutes from './routes/venta.route.js'
import dashboardRoutes from './routes/dashboard.routes.js'
import reporteRoutes from './routes/reporte.routes.js'
import catalogoRoutes from './routes/catalogo.routes.js'
import atributosRoutes from './routes/atributos.route.js'

dotenv.config();
const app = express();

const allowedOrigins = [
  'http://192.168.1.6:5173',
  'https://boutique.lojainy.com',  
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Permite requests sin origen (Postman, cURL)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Origen no permitido por CORS'));
      }
    },
    credentials: true,
  })
);


app.use(express.json());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware para inicializar Ability CASL en cada request
app.use((req, res, next) => {
  if (req.user && req.user.permisos) {
    req.ability = defineAbilitiesFor(req.user.permisos);
  }
  next();
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/roles', rolRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/venta', ventaRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/catalogo', catalogoRoutes);
app.use('/api/atributos', atributosRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
