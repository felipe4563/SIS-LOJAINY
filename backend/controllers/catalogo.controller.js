import db from "../config/db.js";

export const listarCatalogo = async (req, res) => {
  try {
    const [productos] = await db.query(`
      SELECT 
        p.id_producto,
        p.precio,
        p.descripcion,
        c.nombre AS categoria,
        co.nombre AS color,
        t.nombre AS talla,
        (
          SELECT imagen 
          FROM producto_imagenes pi
          WHERE pi.id_producto = p.id_producto
          ORDER BY es_principal DESC
          LIMIT 1
        ) AS imagen
      FROM productos p
      INNER JOIN categorias c ON p.id_categoria = c.id_categoria
      INNER JOIN color co ON p.id_color = co.id_color
      INNER JOIN tallas t ON p.id_talla = t.id_talla
      ORDER BY p.fecha_registro DESC
    `);

    res.json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al cargar catálogo" });
  }
};

export const verProductoCatalogo = async (req, res) => {
  const { id_producto } = req.params;

  try {
    const [[producto]] = await db.query(`
      SELECT 
        p.id_producto,
        p.precio,
        p.descripcion,
        c.nombre AS categoria,
        co.nombre AS color,
        t.nombre AS talla
      FROM productos p
      INNER JOIN categorias c ON p.id_categoria = c.id_categoria
      INNER JOIN color co ON p.id_color = co.id_color
      INNER JOIN tallas t ON p.id_talla = t.id_talla
      WHERE p.id_producto = ?
    `, [id_producto]);

    if (!producto) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const [imagenes] = await db.query(`
      SELECT imagen, es_principal
      FROM producto_imagenes
      WHERE id_producto = ?
      ORDER BY es_principal DESC
    `, [id_producto]);

    res.json({
      ...producto,
      imagenes
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener producto" });
  }
};
