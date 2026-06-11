"use client";

import { toast } from "sonner";
import { useCallback, useEffect, useState } from "react";
import { Producto } from "@/models/producto.model";
import { ProductosService } from "@/services/productos.service";

export function useProductos() {

  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarProductos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ProductosService.obtenerProductos();
      setProductos(data);
    } catch (err) {
      const mensaje = err instanceof Error
        ? err.message
        : "Error cargando productos.";

      setError(mensaje);

    } finally {
      setLoading(false);
    }
  }, []);

  const crearProducto = async (producto: Producto) => {
    try {
      setLoading(true);
      setError(null);
      const response = await ProductosService.crear(producto);
      await cargarProductos();
      return response;
    }catch (err) {
      const mensaje = err instanceof Error
        ? err.message
        : "Error al crear el producto.";

      setError(mensaje);
      throw err;

    } finally {
      setLoading(false);
    }
  };

  const actualizarProducto = async (producto: Producto) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Actualizando producto specialPriceStart:", producto.specialPriceStart);
      console.log("Actualizando producto specialPriceEnd:", producto.specialPriceEnd);

      const response = await ProductosService.actualizar(producto);
      await cargarProductos();
      return response;
    }catch (err) {
      const mensaje = err instanceof Error
        ? err.message
        : "Error al actualizar el producto.";

      setError(mensaje);
      throw err;

    } finally {
      setLoading(false);
    }

  };

  const actualizarDisponibilidad = async (productoId: string, disponible: boolean) => {
    try {
      setLoading(true);
      setError(null);
      const response = await ProductosService.actualizarDisponibilidad(productoId, disponible);
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
      await cargarProductos();
      return response;
    }catch (err) {
      const mensaje = err instanceof Error
        ? err.message
        : "Error al actualizar el estado del producto.";

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

  const eliminarProducto = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await ProductosService.eliminar(id);
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
      await cargarProductos();
      return response;
    }catch (err) {
      const mensaje = err instanceof Error
        ? err.message
        : "Error al eliminar el producto.";

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
    cargarProductos();
  }, [cargarProductos]);



  return {
    productos,
    loading,
    error,
    recargar: cargarProductos,
    crearProducto,
    actualizarProducto,
    actualizarDisponibilidad,
    eliminarProducto,
  };

}