// Middleware genérico: valida/normaliza req.body contra un esquema Zod.
// Si es válido, reemplaza req.body por los datos ya parseados (con coerciones
// de tipo aplicadas, por ejemplo strings de multipart convertidos a number).
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errores = result.error.issues.map((issue) => ({
      campo: issue.path.join('.'),
      mensaje: issue.message
    }));
    return res.status(400).json({ message: 'Datos inválidos', errores });
  }

  req.body = result.data;
  next();
};
