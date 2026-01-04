import { AbilityBuilder, Ability } from "@casl/ability";

export const initAbility = (req, res, next) => {
  try {
    if (!req.user || !req.user.permisos) {
      return res.status(401).json({ message: "Permisos no disponibles" });
    }

    const { can, build } = new AbilityBuilder(Ability);

    const permisos = req.user.permisos;

    const subjectMap = {
      categorias: "Categoria",
      tallas: "Talla",
      colores: "Color",
      productos: "Producto",
      clientes: "Cliente",
      ventas: "Venta",
      usuarios: "Usuario",
      roles: "Rol",
      dashboard: "Dashboard",
      reportes: "Reporte",
      marcas: "Marca"
    };

    permisos.forEach(p => {
      const [subjectPlural, action] = p.split(".");
      const subject = subjectMap[subjectPlural];

      if (!subject) return;

      can(action === "manage" ? "manage" : action, subject);
    });

    req.ability = build();

    next();
  } catch (error) {
    console.error("initAbility error", error);
    return res.status(500).json({ message: "Error al inicializar Ability" });
  }
};
