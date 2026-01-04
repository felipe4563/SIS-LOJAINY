import { useEffect, useState } from "react";
import {
  listarCategorias,
  listarColores,
  listarTallas,
  listarMarcas
} from "../../services/atributos";
import { crearProducto, actualizarProducto } from "../../services/producto";

const FormularioProducto = ({ producto, onClose, onSuccess }) => {
  const [categorias, setCategorias] = useState([]);
  const [colores, setColores] = useState([]);
  const [tallas, setTallas] = useState([]);
  const [marcas, setMarcas] = useState([]);

  const [form, setForm] = useState({
    id_categoria: "",
    id_color: "",
    id_talla: "",
    id_marca: "",
    precio: "",
    descripcion: "",
    stock: 1
  });

  const [imagenes, setImagenes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [previewImagenes, setPreviewImagenes] = useState([]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [cat, col, tal, mar] = await Promise.all([
          listarCategorias(),
          listarColores(),
          listarTallas(),
          listarMarcas()
        ]);
        
        setCategorias(cat);
        setColores(col);
        setTallas(tal);
        setMarcas(mar);

        // Si estamos editando, rellenar form
        if (producto) {
          setForm({
            id_categoria: producto.id_categoria,
            id_color: producto.id_color,
            id_talla: producto.id_talla,
            id_marca: producto.id_marca,
            precio: producto.precio,
            descripcion: producto.descripcion,
            stock: producto.stock
          });
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };

    cargarDatos();
  }, [producto]);

  // Manejar preview de imágenes
  useEffect(() => {
    if (imagenes.length > 0) {
      const previews = [];
      Array.from(imagenes).forEach(img => {
        const reader = new FileReader();
        reader.onloadend = () => {
          previews.push(reader.result);
          if (previews.length === imagenes.length) {
            setPreviewImagenes(previews);
          }
        };
        reader.readAsDataURL(img);
      });
    } else {
      setPreviewImagenes([]);
    }
  }, [imagenes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ 
      ...form, 
      [name]: name === 'stock' || name === 'precio' ? (value === '' ? '' : Number(value)) : value 
    });
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    
    setCargando(true);

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') {
        fd.append(k, v);
      }
    });
    
    imagenes.forEach(img => fd.append("imagenes", img));

    try {
      if (producto) {
        await actualizarProducto(producto.id_producto, fd);
      } else {
        await crearProducto(fd);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error al guardar producto:", err);
      alert("Error al guardar el producto. Por favor, intente nuevamente.");
    } finally {
      setCargando(false);
    }
  };

  const handleEliminarImagen = (index) => {
    const nuevasImagenes = [...imagenes];
    nuevasImagenes.splice(index, 1);
    setImagenes(nuevasImagenes);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Formulario */}
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Grid responsivo para los campos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Categoría */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Categoría *
              </label>
              <select
                name="id_categoria"
                onChange={handleChange}
                value={form.id_categoria}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-800"
              >
                <option value="" className="text-gray-400">Seleccionar categoría</option>
                {categorias.map(c => (
                  <option key={c.id_categoria} value={c.id_categoria}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Color */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Color *
              </label>
              <select
                name="id_color"
                onChange={handleChange}
                value={form.id_color}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-800"
              >
                <option value="" className="text-gray-400">Seleccionar color</option>
                {colores.map(c => (
                  <option key={c.id_color} value={c.id_color}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Talla */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Talla *
              </label>
              <select
                name="id_talla"
                onChange={handleChange}
                value={form.id_talla}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-800"
              >
                <option value="" className="text-gray-400">Seleccionar talla</option>
                {tallas.map(t => (
                  <option key={t.id_talla} value={t.id_talla}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Marca */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Marca *
              </label>
              <select
                name="id_marca"
                onChange={handleChange}
                value={form.id_marca}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-800"
              >
                <option value="" className="text-gray-400">Seleccionar marca</option>
                {marcas.map(m => (
                  <option key={m.id_marca} value={m.id_marca}>
                    {m.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Descripción (ancho completo) */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Descripción *
            </label>
            <input
              name="descripcion"
              placeholder="Ej. Camiseta de algodón premium"
              onChange={handleChange}
              value={form.descripcion}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder-gray-400"
              required
            />
          </div>

          {/* Grid para precio y stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Precio */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Precio (Bs) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  Bs
                </span>
                <input
                  name="precio"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  onChange={handleChange}
                  value={form.precio}
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                />
              </div>
            </div>

            {/* Stock */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Stock *
              </label>
              <input
                name="stock"
                type="number"
                min="1"
                placeholder="Cantidad disponible"
                onChange={handleChange}
                value={form.stock}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                required
              />
            </div>
          </div>

          {/* Subida de archivos */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Imágenes del producto {imagenes.length > 0 && `(${imagenes.length})`}
            </label>
            
            <div className="relative">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files) {
                    const nuevasImagenes = [...imagenes, ...Array.from(e.target.files)];
                    setImagenes(nuevasImagenes.slice(0, 10)); // Máximo 10 imágenes
                  }
                }}
                className="hidden"
                id="file-upload"
                disabled={cargando}
              />
              
              <label 
                htmlFor="file-upload" 
                className={`block border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 ${
                  cargando 
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                <div className="flex flex-col items-center">
                  <svg className={`w-12 h-12 mb-3 ${cargando ? 'text-gray-300' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <p className={`text-sm ${cargando ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span className={`font-medium ${cargando ? 'text-gray-400' : 'text-blue-600 hover:text-blue-500'}`}>
                      Haz clic para subir
                    </span>{' '}
                    o arrastra y suelta
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF • Máx. 10 imágenes
                  </p>
                </div>
              </label>
            </div>
            
            {/* Vista previa de imágenes seleccionadas */}
            {previewImagenes.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-700">
                    Vista previa
                  </p>
                  <button
                    type="button"
                    onClick={() => setImagenes([])}
                    className="text-xs text-red-600 hover:text-red-800 font-medium"
                    disabled={cargando}
                  >
                    Eliminar todas
                  </button>
                </div>
                
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {previewImagenes.map((preview, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={preview}
                          alt={`Vista previa ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleEliminarImagen(index)}
                        disabled={cargando}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition shadow-md"
                        aria-label={`Eliminar imagen ${index + 1}`}
                      >
                        ×
                      </button>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition rounded-lg"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Footer con botones */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex-1 font-medium"
            disabled={cargando}
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={cargando}
            className={`px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg transition shadow-md flex items-center justify-center gap-2 flex-1 font-medium ${
              cargando 
                ? 'opacity-70 cursor-not-allowed' 
                : 'hover:from-blue-700 hover:to-blue-800 hover:shadow-lg'
            }`}
          >
            {cargando ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Guardando...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {producto ? 'Actualizar Producto' : 'Crear Producto'}
              </>
            )}
          </button>
        </div>
        
        {/* Mensaje de ayuda */}
        <p className="text-xs text-gray-500 text-center mt-2">
          Todos los campos marcados con * son obligatorios
        </p>
      </div>
    </div>
  );
};

export default FormularioProducto;