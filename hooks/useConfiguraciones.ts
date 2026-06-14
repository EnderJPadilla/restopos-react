"use client";

import { toast } from "sonner";
import { useCallback, useEffect, useState } from "react";
import { ConfiguracionGeneral } from "@/models/configuracion.model";
import { ConfiguracionService } from "@/services/configuracion.service";

export function useConfiguraciones() {

  const [configuracion, setConfiguracion] = useState<ConfiguracionGeneral | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarConfiguracion = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ConfiguracionService.cargarConfigGeneral();
      setConfiguracion(data);

    } catch (err) {
      const mensaje = err instanceof Error
        ? err.message
        : "Error al cargar la configuración general.";

      setError(mensaje);

    } finally {
      setLoading(false);
    }
  }, []);

  const actualizarConfiguracion = async (config: ConfiguracionGeneral) => {
      try {
        setLoading(true);
        setError(null);
        const response = await ConfiguracionService.actualizar(config);
        await cargarConfiguracion();
        return response;
      }catch (err) {
        const mensaje = err instanceof Error
          ? err.message
          : "Error al actualizar el usuario.";
  
        setError(mensaje);
        throw err;
  
      } finally {
        setLoading(false);
      }
  
    };


  useEffect(() => {
    cargarConfiguracion();
  }, [cargarConfiguracion]);

  return {
    configuracion,
    loading,
    error,
    recargarConfig: cargarConfiguracion,
    actualizarConfiguracion
  };

}