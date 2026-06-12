import { apiFetch } from "./api";
import { ApiResponse } from "@/models/api-response.model";
import { User } from "@/models/usuario.model";


export const UsuariosService = {

  obtenerTodos: async (): Promise<User[]> => {
  
    const response = await apiFetch<ApiResponse<User[]>>(
      "/usuarios/listar_usuarios",
      {
        method: "POST"
      }
    );

    if (!response.success) {
      throw new Error(
        response.message
      );
    }

    return response.data ?? [];
  },

  crear: async (
    usuario: User
  ): Promise<ApiResponse<any>> => {

    const response = await apiFetch<ApiResponse<any>>(
      "/usuarios/nuevo_usuario",
      {
        method: "POST",
        body: JSON.stringify({
          dataUsuario: usuario
        })
      }
    );

    if (!response.success) {
      throw new Error(
        response.message
      );
    }

    return response;
  },

  actualizar: async (
    usuario: User
  ): Promise<ApiResponse<any>> => {

    const response = await apiFetch<ApiResponse<any>>(
      "/usuarios/actualizar_usuario",
      {
        method: "PUT",
        body: JSON.stringify({
          dataUsuario: usuario
        })
      }
    );

    if (!response.success) {
      throw new Error(
        response.message
      );
    }

    return response;
  },

  actualizarEstado: async (
    idProducto: string,
    activo: boolean
  ): Promise<ApiResponse<any>> => {

    const response = await apiFetch<ApiResponse<any>>(
      "/usuarios/usuario_activo",
      {
        method: "PUT",
        body: JSON.stringify({
          usuario_id: idProducto,
          activo
        })
      }
    );

    if (!response.success) {
      throw new Error(
        response.message
      );
    }

    return response;
  },

  eliminar: async (
    usuario_id: string
  ): Promise<ApiResponse<any>> => {

    const response = await apiFetch<ApiResponse<any>>(
      "/usuarios/eliminar_usuario",
      {
        method: "DELETE",
        body: JSON.stringify({
          usuario_id
        })
      }
    );

    if (!response.success) {
      throw new Error(
        response.message
      );
    }

    return response;
  }

};