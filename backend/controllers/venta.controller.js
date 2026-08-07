import db from '../config/db.js';

/**
 * Crear venta con detalles
 */
export const crearVenta = async (req, res) => {
  // req.body ya viene validado por crearVentaSchema (metodo_pago, detalles, cliente)
  const { metodo_pago, detalles, cliente } = req.body;
  const id_usuario = req.user.id_usuario;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1️⃣ Registrar o buscar cliente
    let id_cliente = null;
    if (cliente && cliente.ci) {
      const [clientesExistentes] = await conn.query(
        "SELECT id_cliente FROM clientes WHERE ci = ?",
        [cliente.ci]
      );

      if (clientesExistentes.length > 0) {
        id_cliente = clientesExistentes[0].id_cliente;
      } else {
        const [clienteResult] = await conn.query(
          "INSERT INTO clientes (ci, nombre, apellido, celular) VALUES (?, ?, ?, ?)",
          [cliente.ci, cliente.nombre, cliente.apellido, cliente.celular || null]
        );
        id_cliente = clienteResult.insertId;
      }
    }

    // 2️⃣ Verificar stock y calcular precios/total desde la BD (nunca confiar en el cliente)
    let total = 0;
    const lineas = [];
    for (let item of detalles) {
      const { id_producto, cantidad = 1 } = item;

      const [stockRows] = await conn.query(
        `SELECT stock, precio FROM productos WHERE id_producto = ? FOR UPDATE`,
        [id_producto]
      );
      if (!stockRows.length) {
        await conn.rollback();
        return res.status(404).json({ message: `Producto ${id_producto} no encontrado` });
      }
      if (stockRows[0].stock < cantidad) {
        await conn.rollback();
        return res.status(400).json({ message: `Stock insuficiente para el producto ${id_producto}` });
      }

      const precio = stockRows[0].precio;
      total += Number(precio) * Number(cantidad);
      lineas.push({ id_producto, precio, cantidad });
    }

    // 3️⃣ Insertar venta con el total calculado en el servidor
    const [ventaResult] = await conn.query(
      `INSERT INTO ventas (id_usuario, id_cliente, metodo_pago, total) VALUES (?, ?, ?, ?)`,
      [id_usuario, id_cliente, metodo_pago, total]
    );

    const id_venta = ventaResult.insertId;

    // 4️⃣ Insertar detalle de venta y reducir stock
    for (let linea of lineas) {
      await conn.query(
        `INSERT INTO detalle_venta (id_venta, id_producto, precio, cantidad) VALUES (?, ?, ?, ?)`,
        [id_venta, linea.id_producto, linea.precio, linea.cantidad]
      );

      await conn.query(
        `UPDATE productos SET stock = stock - ? WHERE id_producto = ?`,
        [linea.cantidad, linea.id_producto]
      );
    }

    await conn.commit();
    res.status(201).json({ message: 'Venta registrada', id_venta });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: 'Error al crear venta' });
  } finally {
    conn.release();
  }
};


/**
 * Listar ventas
 */
export const listarVentas = async (req, res) => {
  try {
    const id_usuario = req.user.id_usuario;
    const esAdmin = req.ability?.can('manage', 'Venta') ?? false;

    let sql = `
      SELECT 
        v.id_venta,
        v.id_usuario,
        v.fecha,
        v.metodo_pago,
        v.total,
        u.nombre AS nombre_usuario
      FROM ventas v
      LEFT JOIN usuarios u ON v.id_usuario = u.id_usuario
    `;

    const params = [];

    // Si NO es admin → solo sus ventas
    if (!esAdmin) {
      sql += ` WHERE v.id_usuario = ?`;
      params.push(id_usuario);
    }

    sql += ` ORDER BY v.id_venta DESC`;

    const [ventas] = await db.query(sql, params);

    res.json(ventas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al listar ventas' });
  }
};



/**
 * Obtener venta por ID con detalles
 */
export const obtenerVenta = async (req, res) => {
  const { id } = req.params;
  const id_usuario = req.user.id_usuario;
  const esAdmin = req.ability?.can('manage', 'Venta') ?? false;

  try {
    // Obtener venta y datos del usuario
    const [ventas] = await db.query(
      `SELECT 
        v.id_venta,
        v.id_usuario,
        v.id_cliente,
        v.fecha,
        v.metodo_pago,
        v.total,
        u.nombre AS nombre_usuario,
        c.ci AS cliente_ci,
        c.nombre AS cliente_nombre,
        c.apellido AS cliente_apellido,
        c.celular AS cliente_celular
       FROM ventas v
       LEFT JOIN usuarios u ON v.id_usuario = u.id_usuario
       LEFT JOIN clientes c ON v.id_cliente = c.id_cliente
       WHERE v.id_venta = ?`,
      [id]
    );

    if (ventas.length === 0) {
      return res.status(404).json({ message: 'Venta no encontrada' });
    }

    const venta = ventas[0];

    // 🔐 CONTROL DE ACCESO POR PROPIEDAD
    if (!esAdmin && venta.id_usuario !== id_usuario) {
      return res.status(403).json({ message: 'No tienes acceso a esta venta' });
    }

    // Obtener detalles
    const [detalles] = await db.query(
    `SELECT 
      dv.id_detalle,
      dv.id_producto,
      p.descripcion AS nombre_producto,
      p.precio,
      dv.cantidad,
      c.nombre AS categoria,
      co.nombre AS color,
      t.nombre AS talla
    FROM detalle_venta dv
    LEFT JOIN productos p ON dv.id_producto = p.id_producto
    LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
    LEFT JOIN color co ON p.id_color = co.id_color
    LEFT JOIN tallas t ON p.id_talla = t.id_talla
    WHERE dv.id_venta = ?`,
    [id]
  );
    

    venta.detalles = detalles;

    res.json(venta);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener venta' });
  }
};

/**
 * Buscar cliente por CI (para autocompletar)
 */
export const buscarClientePorCI = async (req, res) => {
  const { ci } = req.params;
  if (!ci || ci.trim().length < 2) {
    return res.status(400).json({ message: "CI demasiado corto" });
  }
  try {
    const [[cliente]] = await db.query(
      "SELECT id_cliente, ci, nombre, apellido, celular FROM clientes WHERE ci LIKE ? LIMIT 1",
      [`${ci.trim()}%`]
    );
    if (!cliente) return res.status(404).json({ message: "Cliente no encontrado" });
    res.json(cliente);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al buscar cliente" });
  }
};

/**
 * Eliminar venta (y restaurar stock)
 */
export const eliminarVenta = async (req, res) => {
  const { id } = req.params;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const id_usuario = req.user.id_usuario;
    const esAdmin = req.ability?.can('manage', 'Venta') ?? false;

    // 1. Verificar si la venta existe
    const [ventas] = await conn.query('SELECT id_usuario FROM ventas WHERE id_venta = ?', [id]);
    if (ventas.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Venta no encontrada' });
    }

    // CONTROL DE ACCESO
    if (!esAdmin && ventas[0].id_usuario !== id_usuario) {
      await conn.rollback();
      return res.status(403).json({ message: 'No tienes permiso para eliminar esta venta' });
    }

    // 2. Obtener detalles para restaurar el stock
    const [detalles] = await conn.query('SELECT id_producto, cantidad FROM detalle_venta WHERE id_venta = ?', [id]);

    // 3. Restaurar stock de cada producto
    for (let item of detalles) {
      await conn.query(
        'UPDATE productos SET stock = stock + ? WHERE id_producto = ?',
        [item.cantidad, item.id_producto]
      );
    }

    // 4. Eliminar detalles y luego la venta
    await conn.query('DELETE FROM detalle_venta WHERE id_venta = ?', [id]);
    await conn.query('DELETE FROM ventas WHERE id_venta = ?', [id]);

    await conn.commit();
    res.json({ message: 'Venta eliminada y stock restaurado exitosamente' });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar venta' });
  } finally {
    conn.release();
  }
};
