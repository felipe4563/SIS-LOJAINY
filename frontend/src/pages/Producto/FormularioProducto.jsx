import { useEffect, useState, useId } from "react";
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

  const [imagenes, setImagenes] = useState([]); // Nuevas imágenes (File objects)
  const [imagenesExistentes, setImagenesExistentes] = useState([]); // URLs de imágenes existentes
  const [imagenesAEliminar, setImagenesAEliminar] = useState([]); // IDs o nombres de imágenes a eliminar
  const [cargando, setCargando] = useState(false);
  const [previewImagenes, setPreviewImagenes] = useState([]); // Todas las imágenes para preview
  
  // ID único para el input file
  const fileInputId = useId();

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

        if (producto) {
          setForm({
            id_categoria: producto.id_categoria || "",
            id_color: producto.id_color || "",
            id_talla: producto.id_talla || "",
            id_marca: producto.id_marca || "",
            precio: producto.precio || "",
            descripcion: producto.descripcion || "",
            stock: producto.stock || 1
          });
          
          // Cargar imágenes existentes del producto
          if (producto.imagenes && producto.imagenes.length > 0) {
            // Si producto.imagenes es un array de nombres de archivo
            const urlsExistentes = producto.imagenes.map(img => {
              // Verificar si ya es una URL completa
              if (typeof img === 'string' && (img.startsWith('http') || img.startsWith('blob:'))) {
                return img;
              }
              // Si es solo el nombre del archivo, construir la URL
              return `${import.meta.env.VITE_APP_DOMAIN || 'http://localhost:5000'}/uploads/productos/${img}`;
            });
            
            // Solo guardar nombres de archivo, no URLs completas
            const nombresImagenes = producto.imagenes.map(img => {
              if (typeof img === 'string' && img.includes('/')) {
                // Extraer solo el nombre del archivo de la URL
                return img.split('/').pop();
              }
              return img;
            });
            
            setImagenesExistentes(nombresImagenes); // Guardar solo los nombres
            setPreviewImagenes(urlsExistentes.map((url, index) => ({
              url,
              type: 'existing',
              nombre: nombresImagenes[index],
              id: `existing-${index}-${Date.now()}`
            })));
          }
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };

    cargarDatos();
  }, [producto]);

  // Manejar preview de nuevas imágenes
  useEffect(() => {
    if (imagenes.length > 0) {
      const newPreviews = [];
      const promises = [];
      
      Array.from(imagenes).forEach((img, imgIndex) => {
        if (img instanceof File) {
          const promise = new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              newPreviews.push({
                url: reader.result,
                type: 'new',
                file: img,
                nombre: img.name,
                id: `new-${Date.now()}-${imgIndex}-${Math.random()}`
              });
              resolve();
            };
            reader.readAsDataURL(img);
          });
          promises.push(promise);
        }
      });
      
      Promise.all(promises).then(() => {
        // Combinar imágenes existentes con nuevas
        const previewsExistentes = imagenesExistentes.map((img, index) => ({
          url: `${import.meta.env.VITE_APP_DOMAIN || 'http://localhost:5000'}/uploads/productos/${img}`,
          type: 'existing',
          nombre: img,
          id: `existing-${index}-${img}`
        }));
        
        setPreviewImagenes([...previewsExistentes, ...newPreviews]);
      });
    } else {
      // Solo mostrar imágenes existentes si no hay nuevas
      const previewsExistentes = imagenesExistentes.map((img, index) => ({
        url: `${import.meta.env.VITE_APP_DOMAIN || 'http://localhost:5000'}/uploads/productos/${img}`,
        type: 'existing',
        nombre: img,
        id: `existing-${index}-${img}`
      }));
      setPreviewImagenes(previewsExistentes);
    }
  }, [imagenes, imagenesExistentes]);

  // Limpiar URLs de blob cuando el componente se desmonte
  useEffect(() => {
    return () => {
      previewImagenes.forEach(preview => {
        if (preview && preview.url && preview.url.startsWith('blob:')) {
          URL.revokeObjectURL(preview.url);
        }
      });
    };
  }, [previewImagenes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ 
      ...form, 
      [name]: name === 'stock' || name === 'precio' ? (value === '' ? '' : Number(value)) : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!form.id_categoria || !form.id_color || !form.id_talla || !form.id_marca) {
      alert("Por favor, complete todos los campos obligatorios");
      return;
    }
    
    setCargando(true);

    const fd = new FormData();
    
    // Añadir campos del formulario
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        fd.append(key, value);
      }
    });
    
    // Añadir nuevas imágenes
    if (imagenes.length > 0) {
      imagenes.forEach(img => {
        if (img instanceof File) {
          fd.append("imagenes", img);
        }
      });
    }
    
    // Añadir imágenes a eliminar (solo para actualización)
    if (producto && imagenesAEliminar.length > 0) {
      fd.append("imagenes_a_eliminar", JSON.stringify(imagenesAEliminar));
    }
    
    // Log para depuración
    console.log("Enviando FormData con:", {
      ...form,
      imagenesNuevas: imagenes.length,
      imagenesAEliminar,
      imagenesExistentes: imagenesExistentes.length
    });

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
      alert("Error al guardar el producto: " + (err.response?.data?.message || err.message));
    } finally {
      setCargando(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const nuevasImagenes = Array.from(e.target.files);
      
      // Validar número máximo de imágenes
      const totalImagenes = (imagenesExistentes.length - imagenesAEliminar.length) + 
                           imagenes.length + nuevasImagenes.length;
      if (totalImagenes > 10) {
        alert(`Máximo 10 imágenes permitidas. Actualmente tienes ${totalImagenes - nuevasImagenes.length}`);
        return;
      }
      
      setImagenes(prev => [...prev, ...nuevasImagenes]);
      
      // Limpiar input para permitir seleccionar las mismas imágenes otra vez
      e.target.value = '';
    }
  };

  const handleEliminarImagen = (index) => {
    const imagenAEliminar = previewImagenes[index];
    
    if (!imagenAEliminar) return;
    
    if (imagenAEliminar.type === 'existing') {
      // Si es imagen existente, agregar a la lista de eliminación
      setImagenesAEliminar(prev => [...prev, imagenAEliminar.nombre]);
      
      // Remover de imágenes existentes
      setImagenesExistentes(prev => 
        prev.filter(img => img !== imagenAEliminar.nombre)
      );
    } else if (imagenAEliminar.type === 'new') {
      // Si es imagen nueva, revocar URL y eliminar del array
      if (imagenAEliminar.url && imagenAEliminar.url.startsWith('blob:')) {
        URL.revokeObjectURL(imagenAEliminar.url);
      }
      
      // Encontrar y eliminar el File object correspondiente
      const fileIndex = imagenes.findIndex(img => 
        img.name === imagenAEliminar.file?.name && 
        img.size === imagenAEliminar.file?.size
      );
      
      if (fileIndex !== -1) {
        setImagenes(prev => prev.filter((_, i) => i !== fileIndex));
      }
    }
    
    // Remover del preview
    setPreviewImagenes(prev => prev.filter((_, i) => i !== index));
  };

  const handleEliminarTodas = () => {
    // Revocar todas las URLs de blob
    previewImagenes.forEach(preview => {
      if (preview && preview.url && preview.url.startsWith('blob:')) {
        URL.revokeObjectURL(preview.url);
      }
    });
    
    // Eliminar todas
    setImagenes([]);
    setImagenesExistentes([]);
    setImagenesAEliminar([]);
    setPreviewImagenes([]);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Formulario */}
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="p-6 flex-grow overflow-y-auto">
          <div className="space-y-6">
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
                  <option value="">Seleccionar categoría</option>
                  {categorias.map(c => (
                    <option key={`categoria-${c.id_categoria}`} value={c.id_categoria}>
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
                  <option value="">Seleccionar color</option>
                  {colores.map(c => (
                    <option key={`color-${c.id_color}`} value={c.id_color}>
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
                  <option value="">Seleccionar talla</option>
                  {tallas.map(t => (
                    <option key={`talla-${t.id_talla}`} value={t.id_talla}>
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
                  <option value="">Seleccionar marca</option>
                  {marcas.map(m => (
                    <option key={`marca-${m.id_marca}`} value={m.id_marca}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Descripción */}
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
                Imágenes del producto 
                <span className="text-gray-500 ml-2">
                  ({previewImagenes.length}/10)
                  {imagenesAEliminar.length > 0 && ` | ${imagenesAEliminar.length} marcadas para eliminar`}
                </span>
              </label>
              
              <div className="relative">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id={fileInputId}
                  disabled={cargando}
                />
                
                <label 
                  htmlFor={fileInputId}
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
                      Vista previa de imágenes
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleEliminarTodas}
                        className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 border border-red-200 rounded"
                        disabled={cargando}
                      >
                        Eliminar todas
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {previewImagenes.map((preview, index) => (
                      preview ? (
                        <div key={preview.id || `preview-${index}`} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
                            <img
                              src={preview.url}
                              alt={`Vista previa ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='14' fill='%239ca3af'%3EImagen%3C/text%3E%3C/svg%3E";
                              }}
                            />
                            {preview.nombre && imagenesAEliminar.includes(preview.nombre) && (
                              <div className="absolute inset-0 bg-red-500 bg-opacity-50 flex items-center justify-center">
                                <span className="text-white font-bold">ELIMINAR</span>
                              </div>
                            )}
                          </div>
                          <div className="absolute top-1 left-1">
                            {preview.type === 'existing' && (
                              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                Existente
                              </span>
                            )}
                            {preview.type === 'new' && (
                              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                                Nueva
                              </span>
                            )}
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
                        </div>
                      ) : null
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
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
      </form>
    </div>
  );
};

export default FormularioProducto;