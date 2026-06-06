import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from './routes/auth.routes.js';
import usuarioRoutes from './routes/user.routes.js';
import rolRoutes from './routes/rol.routes.js';
import productoRoutes from './routes/producto.routes.js'
import ventaRoutes from './routes/venta.route.js'
import dashboardRoutes from './routes/dashboard.routes.js'
import reporteRoutes from './routes/reporte.routes.js'
import catalogoRoutes from './routes/catalogo.routes.js'
import atributosRoutes from './routes/atributos.route.js'
import perfilRoutes    from './routes/perfil.routes.js'

dotenv.config();
const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://boutique.lojainy.com',
];

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow serving /uploads images
}));

app.use(
  cors({
    origin: (origin, callback) => {
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

app.use(express.json({ limit: '2mb' }));
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
app.use('/api/perfil',   perfilRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
