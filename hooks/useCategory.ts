"use client";

import { toast } from "sonner";
import { useCallback, useEffect, useState } from "react";
import { Category } from "@/models/categoria.model";
import { CategoriasService } from "@/services/categorias.service";

export function useCategory() {

  const [categorias, setCategorias] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarCategorias = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await CategoriasService.obtenerCategorias();
      setCategorias(data);
    } catch (err) {
      const mensaje = err instanceof Error
        ? err.message
        : "Error cargando categorias.";

      setError(mensaje);

    } finally {
      setLoading(false);
    }
  }, []);

  const crearCategoria = async (categoria: Category) => {
    try {
      setLoading(true);
      setError(null);
      const response = await CategoriasService.crear(categoria);
      await cargarCategorias();
      return response;
    }catch (err) {
      const mensaje = err instanceof Error
        ? err.message
        : "Error al crear la categoria.";

      setError(mensaje);
      throw err;

    } finally {
      setLoading(false);
    }
  };

  const actualizarCategoria = async (categoria: Category) => {
    try {
      setLoading(true);
      setError(null);
      const response = await CategoriasService.actualizar(categoria);
      await cargarCategorias();
      return response;
    }catch (err) {
      const mensaje = err instanceof Error
        ? err.message
        : "Error al actualizar la categoria.";

      setError(mensaje);
      throw err;

    } finally {
      setLoading(false);
    }

  };

  const actualizarDisponibilidad = async (categoria_id: string, disponible: boolean) => {
    try {
      setLoading(true);
      setError(null);
      const response = await CategoriasService.actualizarDisponibilidad(categoria_id, (disponible? 'active' : 'inactive'));
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
      await cargarCategorias();
      return response;
    }catch (err) {
      const mensaje = err instanceof Error
        ? err.message
        : "Error al actualizar el estado de la categoria.";

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

  const eliminarCategoria = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await CategoriasService.eliminar(id);
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
      await cargarCategorias();
      return response;
    }catch (err) {
      const mensaje = err instanceof Error
        ? err.message
        : "Error al eliminar la categoria.";

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
    cargarCategorias();
  }, [cargarCategorias]);



  return {
    categorias,
    error,
    recargar: cargarCategorias,
    crearCategoria,
    actualizarCategoria,
    actualizarDisponibilidad,
    eliminarCategoria,
  };

}