import { z } from 'zod';

export const crearUsuarioSchema = z.object({
  nombre: z.string().trim().min(1, 'Nombre es requerido'),
  apellido: z.string().trim().optional().nullable(),
  usuario: z.string().trim().min(1, 'Usuario es requerido'),
  ci: z.string().trim().optional().nullable(),
  correo: z.string().trim().email('Correo inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  id_rol: z.coerce.number().int().positive('Rol es requerido'),
  activo: z.coerce.number().int().min(0).max(1).default(1)
});

export const actualizarUsuarioSchema = z.object({
  nombre: z.string().trim().min(1, 'Nombre es requerido'),
  apellido: z.string().trim().optional().nullable(),
  usuario: z.string().trim().min(1, 'Usuario es requerido'),
  ci: z.string().trim().optional().nullable(),
  correo: z.string().trim().email('Correo inválido'),
  id_rol: z.coerce.number().int().positive('Rol es requerido'),
  // opcional: solo se actualiza si se envía una nueva
  password: z.union([z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'), z.literal('')]).optional()
});
