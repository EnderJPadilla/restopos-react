import { User, UserRole } from "@/models/usuario.model";
import { UsuarioApi } from "@/models/auth.model";

function mapRole(
  role: string
): UserRole {

  switch (role.toUpperCase()) {

    case "ADMINISTRADOR":
      return "admin";

    case "MESERO":
      return "waiter";

    case "CAJERO":
      return "cashier";

    default:
      return "waiter";
  }
}

export function mapUsuarioToUser(
  usuario: UsuarioApi
): User {

  return {
    id: usuario.id,
    name: usuario.name,
    role: mapRole(usuario.role),
    empresa_id: usuario.empresa_id,
    username: usuario.username,
    firstName: usuario.firstName,
    lastName: usuario.lastName,
  };
}