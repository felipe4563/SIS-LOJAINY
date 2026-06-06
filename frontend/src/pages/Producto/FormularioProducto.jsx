import { useEffect, useState, useId } from "react";
import Select from "react-select";
import {
  listarCategorias,
  listarColores,
  listarTallas,
  listarMarcas,
} from "../../services/atributos";
import { crearProducto, actualizarProducto } from "../../services/producto";
import { Upload, Check, X, AlertCircle } from "lucide-react";

const FormularioProducto = ({ producto, onClose, onSuccess }) => {
  const [categorias, setCategorias] = useState([]);
  const [colores,    setColores]    = useState([]);
  const [tallas,     setTallas]     = useState([]);
  const [marcas,     setMarcas]     = useState([]);

  const [form, setForm] = useState({
    id_categoria: "",
    id_color:     "",
    id_talla:     "",
    id_marca:     "",
    precio:       "",
    descripcion:  "",
    stock:        1,
  });

  const [imagenes,          setImagenes]          = useState([]);
  const [imagenesExistentes,setImagenesExistentes]= useState([]);
  const [imagenesAEliminar, setImagenesAEliminar] = useState([]);
  const [cargando,          setCargando]          = useState(false);
  const [previewImagenes,   setPreviewImagenes]   = useState([]);
  const [errorForm,         setErrorForm]         = useState("");

  const fileInputId = useId();

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [cat, col, tal, mar] = await Promise.all([
          listarCategorias(), listarColores(), listarTallas(), listarMarcas(),
        ]);
        setCategorias(cat); setColores(col); setTallas(tal); setMarcas(mar);

        if (producto) {
          setForm({
            id_categoria: producto.id_categoria || "",
            id_color:     producto.id_color     || "",
            id_talla:     producto.id_talla     || "",
            id_marca:     producto.id_marca     || "",
            precio:       producto.precio       || "",
            descripcion:  producto.descripcion  || "",
            stock:        producto.stock        || 1,
          });

          if (producto.imagenes?.length > 0) {
            const urlsExistentes = producto.imagenes.map(img =>
              typeof img === "string" && (img.startsWith("http") || img.startsWith("blob:"))
                ? img
                : `${import.meta.env.VITE_APP_DOMAIN || "http://localhost:5000"}/uploads/productos/${img}`
            );
            const nombres = producto.imagenes.map(img =>
              typeof img === "string" && img.includes("/") ? img.split("/").pop() : img
            );
            setImagenesExistentes(nombres);
            setPreviewImagenes(urlsExistentes.map((url, i) => ({
              url, type: "existing", nombre: nombres[i], id: `existing-${i}-${Date.now()}`,
            })));
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    cargarDatos();
  }, [producto]);

  useEffect(() => {
    if (imagenes.length > 0) {
      const newPreviews = [];
      const promises = Array.from(imagenes).map((img, idx) =>
        img instanceof File
          ? new Promise(resolve => {
              const reader = new FileReader();
              reader.onloadend = () => {
                newPreviews.push({ url: reader.result, type: "new", file: img, nombre: img.name, id: `new-${Date.now()}-${idx}` });
                resolve();
              };
              reader.readAsDataURL(img);
            })
          : Promise.resolve()
      );
      Promise.all(promises).then(() => {
        const existentes = imagenesExistentes.map((img, i) => ({
          url:    `${import.meta.env.VITE_APP_DOMAIN || "http://localhost:5000"}/uploads/productos/${img}`,
          type:   "existing", nombre: img, id: `existing-${i}-${img}`,
        }));
        setPreviewImagenes([...existentes, ...newPreviews]);
      });
    } else {
      setPreviewImagenes(imagenesExistentes.map((img, i) => ({
        url:    `${import.meta.env.VITE_APP_DOMAIN || "http://localhost:5000"}/uploads/productos/${img}`,
        type:   "existing", nombre: img, id: `existing-${i}-${img}`,
      })));
    }
  }, [imagenes, imagenesExistentes]);

  useEffect(() => {
    return () => {
      previewImagenes.forEach(p => { if (p?.url?.startsWith("blob:")) URL.revokeObjectURL(p.url); });
    };
  }, [previewImagenes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === "stock" || name === "precio" ? (value === "" ? "" : Number(value)) : value });
  };

  const handleSelectChange = (selected, { name }) => {
    setForm({ ...form, [name]: selected ? selected.value : "" });
  };

  const handleFileChange = (e) => {
    if (!e.target.files) return;
    const nuevas = Array.from(e.target.files);
    const total  = (imagenesExistentes.length - imagenesAEliminar.length) + imagenes.length + nuevas.length;
    if (total > 10) {
      setErrorForm(`Máximo 10 imágenes permitidas. Actualmente tienes ${total - nuevas.length}.`);
      setTimeout(() => setErrorForm(""), 4000);
      return;
    }
    setImagenes(prev => [...prev, ...nuevas]);
    e.target.value = "";
  };

  const handleEliminarImagen = (index) => {
    const img = previewImagenes[index];
    if (!img) return;
    if (img.type === "existing") {
      setImagenesAEliminar(prev => [...prev, img.nombre]);
      setImagenesExistentes(prev => prev.filter(n => n !== img.nombre));
    } else if (img.type === "new") {
      if (img.url?.startsWith("blob:")) URL.revokeObjectURL(img.url);
      const fi = imagenes.findIndex(f => f.name === img.file?.name && f.size === img.file?.size);
      if (fi !== -1) setImagenes(prev => prev.filter((_, i) => i !== fi));
    }
    setPreviewImagenes(prev => prev.filter((_, i) => i !== index));
  };

  const handleEliminarTodas = () => {
    previewImagenes.forEach(p => { if (p?.url?.startsWith("blob:")) URL.revokeObjectURL(p.url); });
    setImagenes([]); setImagenesExistentes([]); setImagenesAEliminar([]); setPreviewImagenes([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.id_categoria || !form.id_color || !form.id_talla || !form.id_marca) {
      setErrorForm("Completa todos los campos obligatorios: Categoría, Color, Talla y Marca.");
      setTimeout(() => setErrorForm(""), 4000);
      return;
    }

    setCargando(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== "") fd.append(k, v);
    });
    imagenes.forEach(img => { if (img instanceof File) fd.append("imagenes", img); });
    if (producto && imagenesAEliminar.length > 0) {
      fd.append("imagenes_a_eliminar", JSON.stringify(imagenesAEliminar));
    }

    try {
      if (producto) {
        await actualizarProducto(producto.id_producto, fd);
      } else {
        await crearProducto(fd);
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setErrorForm(err.response?.data?.message || "Error al guardar el producto. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      borderColor: state.isFocused ? "#003087" : "#e2e8f0",
      borderRadius: "12px",
      boxShadow: state.isFocused ? "0 0 0 3px rgba(0,48,135,0.12)" : "none",
      "&:hover": { borderColor: "#003087" },
      fontSize: "14px",
      minHeight: "42px",
    }),
    option: (base, state) => ({
      ...base,
      background: state.isSelected ? "#003087" : state.isFocused ? "#eff6ff" : "white",
      color:      state.isSelected ? "white" : "#1e293b",
      fontSize:   "14px",
    }),
    placeholder: base => ({ ...base, color: "#94a3b8", fontSize: "14px" }),
  };

  const inputCls = "w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]/30 focus:border-[#003087]/50 transition placeholder-slate-400";
  const labelCls = "block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <div className="p-5 space-y-5 overflow-y-auto">

        {/* Banner error */}
        {errorForm && (
          <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-[#C8102E] text-sm font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="flex-1">{errorForm}</span>
            <button type="button" onClick={() => setErrorForm("")} className="shrink-0 hover:opacity-70">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Selects 2×2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Categoría *</label>
            <Select
              name="id_categoria"
              placeholder="Buscar categoría…"
              isClearable isSearchable
              styles={selectStyles}
              value={categorias.map(c => ({ value: c.id_categoria, label: c.nombre })).find(o => o.value === form.id_categoria) || null}
              onChange={handleSelectChange}
              options={categorias.map(c => ({ value: c.id_categoria, label: c.nombre }))}
            />
          </div>
          <div>
            <label className={labelCls}>Color *</label>
            <Select
              name="id_color"
              placeholder="Buscar color…"
              isClearable isSearchable
              styles={selectStyles}
              value={colores.map(c => ({ value: c.id_color, label: c.nombre })).find(o => o.value === form.id_color) || null}
              onChange={handleSelectChange}
              options={colores.map(c => ({ value: c.id_color, label: c.nombre }))}
            />
          </div>
          <div>
            <label className={labelCls}>Talla *</label>
            <Select
              name="id_talla"
              placeholder="Buscar talla…"
              isClearable isSearchable
              styles={selectStyles}
              value={tallas.map(t => ({ value: t.id_talla, label: t.nombre })).find(o => o.value === form.id_talla) || null}
              onChange={handleSelectChange}
              options={tallas.map(t => ({ value: t.id_talla, label: t.nombre }))}
            />
          </div>
          <div>
            <label className={labelCls}>Marca *</label>
            <Select
              name="id_marca"
              placeholder="Buscar marca…"
              isClearable isSearchable
              styles={selectStyles}
              value={marcas.map(m => ({ value: m.id_marca, label: m.nombre })).find(o => o.value === form.id_marca) || null}
              onChange={handleSelectChange}
              options={marcas.map(m => ({ value: m.id_marca, label: m.nombre }))}
            />
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className={labelCls}>Descripción *</label>
          <input
            name="descripcion"
            placeholder="Ej. Camiseta de algodón premium"
            value={form.descripcion}
            onChange={handleChange}
            required
            className={inputCls}
          />
        </div>

        {/* Precio + Stock */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Precio (Bs) *</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-semibold pointer-events-none">Bs</span>
              <input
                name="precio"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={form.precio}
                onChange={handleChange}
                required
                className={`${inputCls} pl-9`}
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>Stock *</label>
            <input
              name="stock"
              type="number"
              min="0"
              placeholder="0"
              value={form.stock}
              onChange={handleChange}
              required
              className={inputCls}
            />
          </div>
        </div>

        {/* Imágenes */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className={labelCls}>
              Imágenes del producto
              <span className="text-slate-400 ml-1 normal-case font-normal">
                ({previewImagenes.length}/10
                {imagenesAEliminar.length > 0 && ` · ${imagenesAEliminar.length} a eliminar`})
              </span>
            </label>
          </div>

          <input
            type="file"
            id={fileInputId}
            multiple
            accept="image/*"
            onChange={handleFileChange}
            disabled={cargando}
            className="hidden"
          />
          <label
            htmlFor={fileInputId}
            className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all duration-200 text-center ${
              cargando
                ? "border-slate-100 bg-slate-50 cursor-not-allowed opacity-60"
                : "border-slate-200 hover:border-[#003087]/50 hover:bg-[#003087]/5"
            }`}
          >
            <Upload className={`w-8 h-8 ${cargando ? "text-slate-300" : "text-slate-400"}`} />
            <div>
              <span className={`text-sm font-semibold ${cargando ? "text-slate-400" : "text-[#003087]"}`}>
                Haz clic para subir
              </span>
              <span className="text-sm text-slate-500"> o arrastra y suelta</span>
            </div>
            <p className="text-xs text-slate-400">PNG, JPG, GIF · Máx. 10 imágenes</p>
          </label>

          {/* Previews */}
          {previewImagenes.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                  Vista previa ({previewImagenes.length})
                </p>
                <button
                  type="button"
                  onClick={handleEliminarTodas}
                  disabled={cargando}
                  className="text-xs text-[#C8102E] hover:opacity-70 font-semibold disabled:opacity-40 flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Eliminar todas
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {previewImagenes.map((preview, index) =>
                  preview ? (
                    <div key={preview.id || `preview-${index}`} className="relative group">
                      <div className={`aspect-square rounded-xl overflow-hidden border-2 transition-colors ${
                        preview.type === "existing" ? "border-[#003087]/30" : "border-green-400/50"
                      }`}>
                        <img
                          src={preview.url}
                          alt={`Vista previa ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={e => {
                            e.target.onerror = null;
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='%23f1f5f9'/%3E%3C/svg%3E";
                          }}
                        />
                        {preview.nombre && imagenesAEliminar.includes(preview.nombre) && (
                          <div className="absolute inset-0 bg-red-500/60 flex items-center justify-center rounded-xl">
                            <span className="text-white text-xs font-bold">ELIMINAR</span>
                          </div>
                        )}
                      </div>

                      <span className={`absolute top-1 left-1 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        preview.type === "existing" ? "bg-[#003087]" : "bg-green-500"
                      }`}>
                        {preview.type === "existing" ? "Exist." : "Nueva"}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleEliminarImagen(index)}
                        disabled={cargando}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#C8102E] text-white rounded-full flex items-center justify-center hover:bg-red-700 transition shadow-sm disabled:opacity-40"
                        aria-label={`Eliminar imagen ${index + 1}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer sticky */}
      <div className="sticky bottom-0 bg-white border-t border-slate-100 px-5 py-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={cargando}
            className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={cargando}
            className="flex-1 py-2.5 bg-[#003087] text-white rounded-xl text-sm font-bold hover:bg-[#003087]/90 transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {cargando ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Guardando…
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                {producto ? "Actualizar Producto" : "Crear Producto"}
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-slate-400 text-center mt-2">Los campos con * son obligatorios</p>
      </div>
    </form>
  );
};

export default FormularioProducto;
