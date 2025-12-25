import { useEffect, useState, useRef } from "react";
import {
  listarCategorias,
  listarColores,
  listarTallas
} from "../../services/atributos";
import { crearProducto, actualizarProducto } from "../../services/producto";
import { FiX, FiUpload, FiTag, FiDollarSign, FiPackage, FiType, FiCheck } from "react-icons/fi";
import { MdColorLens, MdStraighten } from "react-icons/md";

const FormularioProducto = ({ producto, onClose, onSuccess }) => {
  const [categorias, setCategorias] = useState([]);
  const [colores, setColores] = useState([]);
  const [tallas, setTallas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imagenes, setImagenes] = useState([]);
  const [imagenPreviews, setImagenPreviews] = useState([]);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    id_categoria: "",
    id_color: "",
    id_talla: "",
    precio: "",
    descripcion: "",
    stock: 1
  });

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      try {
        const [cats, cols, talls] = await Promise.all([
          listarCategorias(),
          listarColores(),
          listarTallas()
        ]);
        setCategorias(cats);
        setColores(cols);
        setTallas(talls);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();

    if (producto) {
      setForm({
        id_categoria: producto.id_categoria,
        id_color: producto.id_color,
        id_talla: producto.id_talla,
        precio: producto.precio,
        descripcion: producto.descripcion,
        stock: producto.stock
      });
    }
  }, [producto]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === "precio" || name === "stock" ? parseFloat(value) || 0 : value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImagenes(files);
    
    // Crear previews para mostrar
    const previews = files.map(file => ({
      name: file.name,
      url: URL.createObjectURL(file),
      size: (file.size / 1024).toFixed(2) // Tamaño en KB
    }));
    setImagenPreviews(previews);
  };

  const removeImage = (index) => {
    const newImagenes = [...imagenes];
    const newPreviews = [...imagenPreviews];
    
    // Revocar URL para evitar memory leaks
    URL.revokeObjectURL(newPreviews[index].url);
    
    newImagenes.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setImagenes(newImagenes);
    setImagenPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fd = new FormData();
      
      // Agregar campos del formulario
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          fd.append(key, value);
        }
      });
      
      // Agregar imágenes
      imagenes.forEach(img => fd.append("imagenes", img));

      if (producto) {
        await actualizarProducto(producto.id_producto, fd);
      } else {
        await crearProducto(fd);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error guardando producto:", error);
      alert("Error al guardar el producto. Por favor, intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, name, value, onChange, type = "text", placeholder, icon: Icon, step, min = 0 }) => (
    <div className="mb-4">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
        {Icon && <Icon className="text-gray-400" size={16} />}
        {label}
      </label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        step={step}
        min={min}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
        required
      />
    </div>
  );

  const SelectField = ({ label, name, value, onChange, options, icon: Icon, placeholder }) => (
    <div className="mb-4">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
        {Icon && <Icon className="text-gray-400" size={16} />}
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition appearance-none"
        required
      >
        <option value="">{placeholder || `Selecciona ${label.toLowerCase()}`}</option>
        {options.map(opt => (
          <option key={opt[`id_${name}`]} value={opt[`id_${name}`]}>
            {opt.nombre}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {producto ? "✏️ Editar Producto" : "✨ Nuevo Producto"}
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {producto ? "Modifica los detalles del producto" : "Agrega un nuevo producto a tu tienda"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <FiX size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Columna izquierda */}
              <div className="space-y-4">
                <SelectField
                  label="Categoría"
                  name="id_categoria"
                  value={form.id_categoria}
                  onChange={handleChange}
                  options={categorias}
                  icon={FiTag}
                  placeholder="Selecciona una categoría"
                />

                <SelectField
                  label="Color"
                  name="id_color"
                  value={form.id_color}
                  onChange={handleChange}
                  options={colores}
                  icon={MdColorLens}
                  placeholder="Selecciona un color"
                />

                <SelectField
                  label="Talla"
                  name="id_talla"
                  value={form.id_talla}
                  onChange={handleChange}
                  options={tallas}
                  icon={MdStraighten}
                  placeholder="Selecciona una talla"
                />

                <InputField
                  label="Precio (Bs)"
                  name="precio"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.precio}
                  onChange={handleChange}
                  placeholder="0.00"
                  icon={FiDollarSign}
                />
              </div>

              {/* Columna derecha */}
              <div className="space-y-4">
                <InputField
                  label="Descripción"
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  placeholder="Ej: Camiseta básica algodón 100%"
                  icon={FiType}
                />

                <InputField
                  label="Stock"
                  name="stock"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="Cantidad disponible"
                  icon={FiPackage}
                />

                {/* Upload de imágenes */}
                <div className="mb-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <FiUpload className="text-gray-400" size={16} />
                    Imágenes del Producto
                    <span className="text-xs text-gray-500 ml-auto">
                      Máx. 5 imágenes
                    </span>
                  </label>
                  
                  <div 
                    onClick={() => fileInputRef.current.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  >
                    <FiUpload className="mx-auto text-gray-400 mb-2" size={24} />
                    <p className="text-sm text-gray-600">
                      Haz clic para subir imágenes
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG o WEBP (máx. 5MB cada una)
                    </p>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {/* Previews de imágenes */}
                  {imagenPreviews.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Imágenes seleccionadas ({imagenPreviews.length})
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {imagenPreviews.map((img, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square overflow-hidden rounded-lg border border-gray-200">
                              <img
                                src={img.url}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <FiX size={14} />
                            </button>
                            <div className="text-xs text-gray-500 mt-1 truncate px-1">
                              {img.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex-1 flex items-center justify-center gap-2"
            >
              <FiX size={18} />
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition shadow-md hover:shadow-lg flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <FiCheck size={18} />
                  {producto ? "Actualizar Producto" : "Crear Producto"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioProducto;