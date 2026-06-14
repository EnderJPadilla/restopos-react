import { User, UserRole } from "@/models/usuario.model";
import { UsuarioApi } from "@/models/auth.model";


export function mapRole(
  role: string
): UserRole {

  switch (role.toUpperCase()) {
    case "ADMINISTRADOR":
    case "ADMIN":
    case "admin":
      return "admin";

    case "MESERO":
    case "WAITER":
    case "waiter":
      return "waiter";

    case "CAJERO":
    case "CASHIER":
    case "cashier":
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
    avatar: usuario.avatar,
    requirePasswordChange: usuario.requirePasswordChange
  };
}