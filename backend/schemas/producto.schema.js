import { z } from 'zod';

// multer entrega los campos de multipart/form-data como strings, por eso los
// campos numéricos usan z.coerce.number()
const camposComunes = {
  id_categoria: z.coerce.number().int().positive('Categoría es obligatoria'),
  id_color: z.coerce.number().int().positive('Color es obligatorio'),
  id_talla: z.coerce.number().int().positive('Talla es obligatoria'),
  id_marca: z.coerce.number().int().positive('Marca es obligatoria'),
  precio: z.coerce.number().positive('El precio debe ser mayor a 0'),
  descripcion: z.string().trim().max(2000).optional().nullable(),
  stock: z.coerce.number().int().min(0, 'El stock no puede ser negativo').default(1)
};

export const crearProductoSchema = z.object(camposComunes);

export const actualizarProductoSchema = z.object({
  ...camposComunes,
  imagenes_a_eliminar: z.string().optional()
});
