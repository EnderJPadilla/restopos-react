import { apiFetch } from "./api";
import { ApiResponse } from "@/models/api-response.model";
import { Producto } from "@/models/producto.model";

export const ProductosService = {

  obtenerProductos: async (): Promise<Producto[]> => {

    const response = await apiFetch<ApiResponse<Producto[]>>(
      "/productos/listar_productos",
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
    producto: Producto
  ): Promise<ApiResponse<any>> => {

    const response = await apiFetch<ApiResponse<any>>(
      "/productos/nuevo_producto",
      {
        method: "POST",
        body: JSON.stringify({
          dataProducto: producto
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
    producto: Producto
  ): Promise<ApiResponse<any>> => {

    const response = await apiFetch<ApiResponse<any>>(
      "/productos/actualizar_producto",
      {
        method: "PUT",
        body: JSON.stringify({
          dataProducto: producto
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

  actualizarDisponibilidad: async (
    idProducto: string,
    disponible: boolean
  ): Promise<ApiResponse<any>> => {

    const response = await apiFetch<ApiResponse<any>>(
      "/productos/producto_disponible",
      {
        method: "PUT",
        body: JSON.stringify({
          producto_id: idProducto,
          disponible
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
    idProducto: string
  ): Promise<ApiResponse<any>> => {

    const response = await apiFetch<ApiResponse<any>>(
      "/productos/eliminar_producto",
      {
        method: "DELETE",
        body: JSON.stringify({
          producto_id: idProducto
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