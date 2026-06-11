import { Usuario } from "@/models/usuario.model";

import { apiFetch } from "./api";

export const UsuariosService = {

  obtenerTodos() {
    return apiFetch<Usuario[]>(
      "/usuarios"
    );
  },

  obtenerPorId(
    id: number
  ) {
    return apiFetch<Usuario>(
      `/usuarios/${id}`
    );
  },

};