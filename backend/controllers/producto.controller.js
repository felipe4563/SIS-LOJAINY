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

    // Agrupamos las imágenes por producto
    const productosConImagenes = productos.map(prod => {
      const imgs = imagenes.filter(img => img.id_producto === prod.id_producto);
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
  const { id_categoria, id_color, id_talla, id_marca, precio, descripcion, stock = 1 } = req.body;

  try {
    // 1️⃣ Insertar producto
    const [result] = await db.query(
      `INSERT INTO productos (id_categoria, id_color, id_talla, id_marca, precio, descripcion, stock)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id_categoria, id_color, id_talla, id_marca, precio, descripcion, stock]
    );
    const id_producto = result.insertId;

    // 2️⃣ Generar QR
    const dominio = process.env.DOMAIN;
    const qrText = `${dominio}/catalogo/producto/${id_producto}`;
    const qrFileName = `qr_${id_producto}.png`;
    const qrDir = path.join(__dirname, "../uploads/qr");
    if (!fs.existsSync(qrDir)) fs.mkdirSync(qrDir, { recursive: true });
    const qrPath = path.join(qrDir, qrFileName);
    await QRCode.toFile(qrPath, qrText, { width: 300 });

    await db.query("UPDATE productos SET codigo_qr = ? WHERE id_producto = ?", [qrFileName, id_producto]);

    // 3️⃣ Guardar imágenes de productos
    if (req.files && req.files.length > 0) {
      const productosDir = path.join(__dirname, "../uploads/productos");
      if (!fs.existsSync(productosDir)) fs.mkdirSync(productosDir, { recursive: true });

      const imagenesValues = req.files.map((file, index) => [
        id_producto,
        file.filename,
        index === 0 ? 1 : 0 // primera imagen principal
      ]);

      await db.query(
        `INSERT INTO producto_imagenes (id_producto, imagen, es_principal)
         VALUES ?`,
        [imagenesValues]
      );

      req.files.forEach(file => {
        const oldPath = file.path;
        const newPath = path.join(productosDir, file.filename);
        fs.renameSync(oldPath, newPath);
      });
    }

    res.status(201).json({ message: "Producto creado correctamente", id_producto, qr: qrFileName });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear producto" });
  }
};

// ==========================
// ACTUALIZAR PRODUCTO Y AGREGAR IMÁGENES
// ==========================
export const actualizarProducto = async (req, res) => {
  const { id_producto } = req.params;
  const { id_categoria, id_color, id_talla, id_marca, precio, descripcion, stock } = req.body;

  try {
    await db.query(
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

    // Guardar nuevas imágenes
    if (req.files && req.files.length > 0) {
      const productosDir = path.join(__dirname, "../uploads/productos");
      if (!fs.existsSync(productosDir)) fs.mkdirSync(productosDir, { recursive: true });

      const imagenesValues = req.files.map((file) => [
        id_producto,
        file.filename,
        0
      ]);

      await db.query(
        `INSERT INTO producto_imagenes (id_producto, imagen, es_principal)
         VALUES ?`,
        [imagenesValues]
      );

      req.files.forEach(file => {
        const oldPath = file.path;
        const newPath = path.join(productosDir, file.filename);
        fs.renameSync(oldPath, newPath);
      });
    }

    res.json({ message: "Producto actualizado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar producto" });
  }
};

// ==========================
// ELIMINAR PRODUCTO, QR E IMÁGENES
// ==========================
export const eliminarProducto = async (req, res) => {
  const { id_producto } = req.params;

  try {
    // Eliminar QR
    const [rows] = await db.query("SELECT codigo_qr FROM productos WHERE id_producto = ?", [id_producto]);
    if (rows.length && rows[0].codigo_qr) {
      const qrPath = path.join(__dirname, "../uploads/qr", rows[0].codigo_qr);
      if (fs.existsSync(qrPath)) fs.unlinkSync(qrPath);
    }

    // Eliminar imágenes del producto
    const [imagenes] = await db.query("SELECT imagen FROM producto_imagenes WHERE id_producto = ?", [id_producto]);
    for (const img of imagenes) {
      const imgPath = path.join(__dirname, "../uploads/productos", img.imagen);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    // Eliminar de BD
    await db.query("DELETE FROM producto_imagenes WHERE id_producto = ?", [id_producto]);
    await db.query("DELETE FROM productos WHERE id_producto = ?", [id_producto]);

    res.json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar producto" });
  }
};
