import db from "../config/db.js";

// ==========================
// CATEGORIAS / TALLAS / COLORES
// ==========================
// ==========================
// LISTAR
// ==========================
export const listar = (tabla, subject) => async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM ${tabla} ORDER BY 1 ASC`);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: `Error al listar ${subject}` });
  }
};

// ==========================
// OBTENER POR ID
// ==========================
export const obtener = (tabla, pk, subject) => async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(`SELECT * FROM ${tabla} WHERE ${pk} = ?`, [id]);
    if (rows.length === 0) return res.status(404).json({ message: `${subject} no encontrado` });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: `Error al obtener ${subject}` });
  }
};

// ==========================
// CREAR
// ==========================
export const crear = (tabla, campos, subject) => async (req, res) => {
  const values = campos.map(c => req.body[c]);
  try {
    const [result] = await db.query(
      `INSERT INTO ${tabla} (${campos.join(",")}) VALUES (${campos.map(() => "?").join(",")})`,
      values
    );
    res.status(201).json({ message: `${subject} creado`, id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: `Error al crear ${subject}` });
  }
};

// ==========================
// ACTUALIZAR
// ==========================
export const actualizar = (tabla, pk, campos, subject) => async (req, res) => {
  const { id } = req.params;
  const values = campos.map(c => req.body[c]);
  try {
    await db.query(
      `UPDATE ${tabla} SET ${campos.map(c => c + " = ?").join(", ")} WHERE ${pk} = ?`,
      [...values, id]
    );
    res.json({ message: `${subject} actualizado` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: `Error al actualizar ${subject}` });
  }
};

// ==========================
// ELIMINAR
// ==========================
export const eliminar = (tabla, pk, subject) => async (req, res) => {
  const { id } = req.params;
  try {
    await db.query(`DELETE FROM ${tabla} WHERE ${pk} = ?`, [id]);
    res.json({ message: `${subject} eliminado` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: `Error al eliminar ${subject}` });
  }
};

