import { AbilityBuilder, Ability } from "@casl/ability";

export function defineAbilityFor(permisos = []) {
  const { can, rules } = new AbilityBuilder(Ability);

  permisos.forEach((permiso) => {
    const [recurso, accion] = permiso.split(".");

    // productos -> Producto
    const subject = capitalize(singularize(recurso));

    can(accion, subject);
  });

  return new Ability(rules);
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function singularize(text) {
  return text.endsWith("s") ? text.slice(0, -1) : text;
}
