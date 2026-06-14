"use client";

import { toast } from "sonner";
import { useCallback, useEffect, useState } from "react";
import { Table } from "@/models/table.model";
import { TableService } from "@/services/table.service";

export function useTable() {

  const [mesas, setMesas] = useState<Table[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarMesas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await TableService.obtenerMesas();
      setMesas(data);
    } catch (err) {
      const mensaje = err instanceof Error
        ? err.message
        : "Error cargando mesas.";

      setError(mensaje);

    } finally {
      setLoading(false);
    }
  }, []);

  const crearMesa = async (mesa: Table) => {
    try {
      setLoading(true);
      setError(null);
      const response = await TableService.crear(mesa);
      await cargarMesas();
      return response;
    }catch (err) {
      const mensaje = err instanceof Error
        ? err.message
        : "Error al crear la mesa.";

      setError(mensaje);
      throw err;

    } finally {
      setLoading(false);
    }
  };

  const actualizarMesa = async (mesa: Table) => {
    try {
      setLoading(true);
      setError(null);
      const response = await TableService.actualizar(mesa);
      await cargarMesas();
      return response;
    }catch (err) {
      const mensaje = err instanceof Error
        ? err.message
        : "Error al actualizar la mesa.";

      setError(mensaje);
      throw err;

    } finally {
      setLoading(false);
    }

  };

  // const actualizarDisponibilidad = async (mesa_id: string, disponible: boolean) => {
  //   try {
  //     setLoading(true);
  //     setError(null);
  //     const response = await TableService.actualizarDisponibilidad(mesa_id, (disponible? 'active' : 'inactive'));
  //     toast.success(
  //       response.message,
  //       {
  //         style: {
  //           background: "#16a34a",
  //           color: "#ffffff",
  //           border: "1px solid #15803d",
  //         },
  //       }
  //     );
  //     await cargarMesas();
  //     return response;
  //   }catch (err) {
  //     const mensaje = err instanceof Error
  //       ? err.message
  //       : "Error al actualizar el estado de la mesa.";

  //     toast.error(
  //       err instanceof Error
  //         ? err.message
  //         : mensaje,
  //       {
  //         style: {
  //           background: "#dc2626",
  //           color: "#ffffff",
  //           border: "1px solid #b91c1c",
  //         },
  //       }
  //     );

  //     setError(mensaje);
  //     throw err;

  //   } finally {
  //     setLoading(false);
  //   }

  // };

  const eliminarMesa = async (id: string, motivo: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await TableService.eliminar(id, motivo);
      toast.success(
        response.message,
        {
          style: {
            background: "#16a34a",
            color: "#ffffff",
            border: "1px solid #15803d",
          },
        }
      );
      await cargarMesas();
      return response;
    }catch (err) {
      const mensaje = err instanceof Error
        ? err.message
        : "Error al eliminar la mesa.";

      toast.error(
        err instanceof Error
          ? err.message
          : mensaje,
        {
          style: {
            background: "#dc2626",
            color: "#ffffff",
            border: "1px solid #b91c1c",
          },
        }
      );

      setError(mensaje);
      throw err;

    } finally {
      setLoading(false);
    }

  };

  useEffect(() => {
    cargarMesas();
  }, [cargarMesas]);



  return {
    mesas,
    error,
    recargar: cargarMesas,
    crearMesa,
    actualizarMesa,
    // actualizarDisponibilidad,
    eliminarMesa,
  };

}