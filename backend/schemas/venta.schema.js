import { z } from 'zod';

const clienteSchema = z.object({
  ci: z.string().trim().min(1),
  nombre: z.string().trim().min(1),
  apellido: z.string().trim().min(1),
  celular: z.string().trim().optional().nullable()
}).optional().nullable();

const detalleSchema = z.object({
  id_producto: z.coerce.number().int().positive(),
  cantidad: z.coerce.number().int().positive().default(1)
  // precio se ignora si viene: el backend siempre lo recalcula desde productos.precio
});

export const crearVentaSchema = z.object({
  metodo_pago: z.enum(['efectivo', 'qr']),
  cliente: clienteSchema,
  detalles: z.array(detalleSchema).min(1, 'Debe enviar al menos un producto')
});
