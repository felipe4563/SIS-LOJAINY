import db from "../config/db.js";
import QRCode from "qrcode";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================
// LISTAR PRODUCTOS CON IMAGEN PRINCIPAL Y MARCA
// ==========================
export const listarProductos = async (req, res) => {
  try {
    // Traemos todos los productos con sus relaciones
    const [productos] = await db.query(`
      SELECT 
        p.*,
        c.nombre AS categoria,
        co.nombre AS color,
        t.nombre AS talla,
        m.nombre AS marca
      FROM productos p
      INNER JOIN categorias c ON p.id_categoria = c.id_categoria
      INNER JOIN color co ON p.id_color = co.id_color
      INNER JOIN tallas t ON p.id_talla = t.id_talla
      INNER JOIN marcas m ON p.id_marca = m.id_marca
      ORDER BY p.id_producto DESC
    `);

    // Traemos todas las imágenes de todos los productos
    const [imagenes] = await db.query(`
      SELECT id_producto, imagen, es_principal
      FROM producto_imagenes
      ORDER BY id_producto, es_principal DESC
    `);

    // Agrupamos las imágenes por producto en un solo recorrido (Map en vez de
    // .filter() por cada producto, que era O(productos × imágenes))
    const imagenesPorProducto = new Map();
    for (const img of imagenes) {
      if (!imagenesPorProducto.has(img.id_producto)) imagenesPorProducto.set(img.id_producto, []);
      imagenesPorProducto.get(img.id_producto).push(img);
    }

    const productosConImagenes = productos.map(prod => {
      const imgs = imagenesPorProducto.get(prod.id_producto) || [];
      return {
        ...prod,
        imagen_principal: imgs.length ? imgs[0].imagen : null, // primera imagen como principal
        imagenes: imgs.map(img => img.imagen) // todas las imágenes en un array
      };
    });

    res.json(productosConImagenes);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al listar productos" });
  }
};


// ==========================
// OBTENER PRODUCTO POR ID
// ==========================
export const obtenerProducto = async (req, res) => {
  const { id_producto } = req.params;
  try {
    const [rows] = await db.query(`
      SELECT p.*, m.nombre AS marca
      FROM productos p
      INNER JOIN marcas m ON p.id_marca = m.id_marca
      WHERE p.id_producto = ?
    `, [id_producto]);

    if (rows.length === 0) return res.status(404).json({ message: "Producto no encontrado" });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener producto" });
  }
};

// ==========================
// CREAR PRODUCTO CON MARCA, QR Y MÚLTIPLES IMÁGENES
// ==========================
export const crearProducto = async (req, res) => {
  // req.body ya viene validado y coaccionado (números, etc.) por crearProductoSchema
  const { id_categoria, id_color, id_talla, id_marca, precio, descripcion, stock } = req.body;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1️⃣ Insertar producto
    const [result] = await conn.query(
      `INSERT INTO productos (id_categoria, id_color, id_talla, id_marca, precio, descripcion, stock)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id_categoria, id_color, id_talla, id_marca, precio, descripcion, stock]
    );
    const id_producto = result.insertId;

    const qrFileName = `qr_${id_producto}.png`;
    await conn.query("UPDATE productos SET codigo_qr = ? WHERE id_producto = ?", [qrFileName, id_producto]);

    // 2️⃣ Registrar imágenes de producto
    if (req.files && req.files.length > 0) {
      const imagenesValues = req.files.map((file, index) => [
        id_producto,
        file.filename,
        index === 0 ? 1 : 0 // primera imagen principal
      ]);

      await conn.query(
        `INSERT INTO producto_imagenes (id_producto, imagen, es_principal)
         VALUES ?`,
        [imagenesValues]
      );
    }

    await conn.commit();

    // 3️⃣ Efectos en disco (no transaccionales), solo después de confirmar en BD
    const dominio = process.env.DOMAIN;
    const qrText = `${dominio}/catalogo/producto/${id_producto}`;
    const qrDir = path.join(__dirname, "../uploads/qr");
    if (!fs.existsSync(qrDir)) fs.mkdirSync(qrDir, { recursive: true });
    await QRCode.toFile(path.join(qrDir, qrFileName), qrText, { width: 300 });

    if (req.files && req.files.length > 0) {
      const productosDir = path.join(__dirname, "../uploads/productos");
      if (!fs.existsSync(productosDir)) fs.mkdirSync(productosDir, { recursive: true });
      req.files.forEach(file => {
        const oldPath = file.path;
        const newPath = path.join(productosDir, file.filename);
        fs.renameSync(oldPath, newPath);
      });
    }

    res.status(201).json({ message: "Producto creado correctamente", id_producto, qr: qrFileName });
  } catch (error) {
    await conn.rollback();
    console.error(error);
    res.status(500).json({ message: "Error al crear producto" });
  } finally {
    conn.release();
  }
};

// ==========================
// ACTUALIZAR PRODUCTO Y AGREGAR IMÁGENES
// ==========================
export const actualizarProducto = async (req, res) => {
  const { id_producto } = req.params;
  // req.body ya viene validado y coaccionado por actualizarProductoSchema
  const {
    id_categoria,
    id_color,
    id_talla,
    id_marca,
    precio,
    descripcion,
    stock,
    imagenes_a_eliminar
  } = req.body;

  let imagenesEliminar = [];
  if (imagenes_a_eliminar && imagenes_a_eliminar.trim() !== '') {
    try {
      imagenesEliminar = JSON.parse(imagenes_a_eliminar);
    } catch (parseError) {
      return res.status(400).json({ message: "imagenes_a_eliminar no es un JSON válido" });
    }
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Actualizar datos básicos del producto
    await conn.query(
      `UPDATE productos SET
        id_categoria = ?,
        id_color = ?,
        id_talla = ?,
        id_marca = ?,
        precio = ?,
        descripcion = ?,
        stock = ?
      WHERE id_producto = ?`,
      [id_categoria, id_color, id_talla, id_marca, precio, descripcion, stock, id_producto]
    );

    // 2. Eliminar imágenes marcadas para eliminar (en BD; el archivo se borra tras el commit)
    const archivosAEliminar = [];
    for (const imgNombre of imagenesEliminar) {
      if (imgNombre && typeof imgNombre === 'string') {
        // path.basename prevents path traversal (e.g. "../../app.js" → "app.js" not found)
        const safeFilename = path.basename(imgNombre);

        await conn.query(
          "DELETE FROM producto_imagenes WHERE id_producto = ? AND imagen = ?",
          [id_producto, safeFilename]
        );
        archivosAEliminar.push(safeFilename);
      }
    }

    // 3. Guardar nuevas imágenes
    if (req.files && req.files.length > 0) {
      // Verificar si ya hay imágenes principales
      const [imagenesExistentes] = await conn.query(
        "SELECT COUNT(*) as count FROM producto_imagenes WHERE id_producto = ? AND es_principal = 1",
        [id_producto]
      );

      const tienePrincipal = imagenesExistentes[0].count > 0;

      const imagenesValues = req.files.map((file, index) => [
        id_producto,
        file.filename,
        index === 0 && !tienePrincipal ? 1 : 0
      ]);

      await conn.query(
        `INSERT INTO producto_imagenes (id_producto, imagen, es_principal) VALUES ?`,
        [imagenesValues]
      );
    }

    // 4. Verificar si queda al menos una imagen principal después de las eliminaciones
    const [imagenesRestantes] = await conn.query(
      "SELECT COUNT(*) as count FROM producto_imagenes WHERE id_producto = ? AND es_principal = 1",
      [id_producto]
    );

    if (imagenesRestantes[0].count === 0) {
      // Si no hay imagen principal, establecer la primera imagen como principal
      const [primeraImagen] = await conn.query(
        "SELECT imagen FROM producto_imagenes WHERE id_producto = ? ORDER BY id_imagen ASC LIMIT 1",
        [id_producto]
      );

      if (primeraImagen.length > 0) {
        await conn.query(
          "UPDATE producto_imagenes SET es_principal = 1 WHERE id_producto = ? AND imagen = ?",
          [id_producto, primeraImagen[0].imagen]
        );
      }
    }

    await conn.commit();

    // 5. Efectos en disco (no transaccionales), solo después de confirmar en BD
    for (const safeFilename of archivosAEliminar) {
      const imgPath = path.join(__dirname, "../uploads/productos", safeFilename);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    if (req.files && req.files.length > 0) {
      const productosDir = path.join(__dirname, "../uploads/productos");
      if (!fs.existsSync(productosDir)) fs.mkdirSync(productosDir, { recursive: true });
      req.files.forEach(file => {
        const oldPath = file.path;
        const newPath = path.join(productosDir, file.filename);
        if (fs.existsSync(oldPath)) fs.renameSync(oldPath, newPath);
      });
    }

    res.json({
      message: "Producto actualizado correctamente",
      imagenesEliminadas: archivosAEliminar.length,
      nuevasImagenes: req.files ? req.files.length : 0
    });

  } catch (error) {
    await conn.rollback();
    console.error("Error al actualizar producto:", error);
    res.status(500).json({ message: "Error al actualizar producto" });
  } finally {
    conn.release();
  }
};

// ==========================
// ELIMINAR PRODUCTO, QR E IMÁGENES
// ==========================
export const eliminarProducto = async (req, res) => {
  const { id_producto } = req.params;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query("SELECT codigo_qr FROM productos WHERE id_producto = ?", [id_producto]);
    if (!rows.length) {
      await conn.rollback();
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const [imagenes] = await conn.query("SELECT imagen FROM producto_imagenes WHERE id_producto = ?", [id_producto]);

    // Eliminar de BD (falla con FK si el producto ya tiene ventas registradas)
    await conn.query("DELETE FROM producto_imagenes WHERE id_producto = ?", [id_producto]);
    await conn.query("DELETE FROM productos WHERE id_producto = ?", [id_producto]);

    await conn.commit();

    // Limpieza de archivos, solo después de confirmar en BD
    if (rows[0].codigo_qr) {
      const qrPath = path.join(__dirname, "../uploads/qr", rows[0].codigo_qr);
      if (fs.existsSync(qrPath)) fs.unlinkSync(qrPath);
    }
    for (const img of imagenes) {
      const imgPath = path.join(__dirname, "../uploads/productos", img.imagen);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    res.json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    await conn.rollback();
    if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
      return res.status(409).json({ message: "No se puede eliminar: el producto tiene ventas registradas" });
    }
    console.error(error);
    res.status(500).json({ message: "Error al eliminar producto" });
  } finally {
    conn.release();
  }
};
