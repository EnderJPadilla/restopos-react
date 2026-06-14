import { ApiResponse } from "@/models/api-response.model";
import { apiFetch } from "./api";
import { ConfiguracionGeneral } from "@/models/configuracion.model";

export const ConfiguracionService = {

  cargarConfigGeneral: async () : Promise<ConfiguracionGeneral | null> => {

    const response = await apiFetch<ApiResponse<ConfiguracionGeneral | null>>(
      "/settings/listar_configuraciones",
      {
        method: "POST"
      }
    );

    if (!response.success) {
      throw new Error(
        response.message
      );
    }

    return response.data ?? null;
  },

  actualizar: async (
    config: ConfiguracionGeneral
  ): Promise<ApiResponse<any>> => {

    const response = await apiFetch<ApiResponse<any>>(
      "/settings/actualizar_configuraciones",
      {
        method: "PUT",
        body: JSON.stringify({
          dataConfiguraciones: config
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

};
