import { User } from "@/models/usuario.model";

export const SessionService = {

  getToken(): string | null {
    return localStorage.getItem(
      "accessToken"
    );
  },

  setToken(token: string) {
    localStorage.setItem(
      "accessToken",
      token
    );
  },

  clear() {
    localStorage.removeItem(
      "accessToken"
    );
  }

};

export function getCurrentUser(): User | null {

  const user = localStorage.getItem("usuario");
  if (!user) {
    return null;
  }
  return JSON.parse(user);

}

export function getEmpresaId(): string {
  
  const user = getCurrentUser();
  if (!user?.empresa_id) {
    throw new Error(
      "Empresa no encontrada en sesión"
    );
  }
  return user.empresa_id;

}