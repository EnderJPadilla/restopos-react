import { Table } from "@/models/table.model";
import { apiFetch } from "./api";
import { ApiResponse } from "@/models/api-response.model";

export const TableService = {

  obtenerMesas: async (): Promise<Table[]> => {

    const response = await apiFetch<ApiResponse<Table[]>>(
      "/tables/listar_mesas",
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
    mesa: Table
  ): Promise<ApiResponse<any>> => {

    const response = await apiFetch<ApiResponse<any>>(
      "/tables/nueva_mesa",
      {
        method: "POST",
        body: JSON.stringify({
          dataTable: mesa
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
    mesa: Table
  ): Promise<ApiResponse<any>> => {

    const response = await apiFetch<ApiResponse<any>>(
      "/tables/actualizar_mesa",
      {
        method: "PUT",
        body: JSON.stringify({
          dataTable: mesa
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

  // actualizarDisponibilidad: async (
  //   idMesa: string,
  //   activo: string
  // ): Promise<ApiResponse<any>> => {

  //   const response = await apiFetch<ApiResponse<any>>(
  //     "/tables/mesa_activa",
  //     {
  //       method: "PUT",
  //       body: JSON.stringify({
  //         categoria_id: idMesa,
  //         activo
  //       })
  //     }
  //   );

  //   if (!response.success) {
  //     throw new Error(
  //       response.message
  //     );
  //   }

  //   return response;
  // },

  eliminar: async (
    idMesa: string,
    motivo: string
  ): Promise<ApiResponse<any>> => {

    const response = await apiFetch<ApiResponse<any>>(
      "/tables/eliminar_mesa",
      {
        method: "DELETE",
        body: JSON.stringify({
          mesa_id: idMesa,
          motivo
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