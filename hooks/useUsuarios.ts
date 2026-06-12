"use client";

import { toast } from "sonner";
import { useCallback, useEffect, useState } from "react";
import { User } from "@/models/usuario.model";
import { UsuariosService } from "@/services/usuarios.service";

export function useUsuarios() {

  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await UsuariosService.obtenerTodos();
      setUsuarios(data);

    } catch (err) {
      const mensaje = err instanceof Error
        ? err.message
        : "Error cargando productos.";

      setError(mensaje);

    } finally {
      setLoading(false);
    }
  }, []);

  
  const crearUsuario = async (usuario: User) => {
    try {
      setLoading(true);
      setError(null);
      const response = await UsuariosService.crear(usuario);
      await cargarUsuarios();
      return response;
    }catch (err) {
      const mensaje = err instanceof Error
        ? err.message
        : "Error al crear el usuario.";

      setError(mensaje);
      throw err;

    } finally {
      setLoading(false);
    }
  };

  const actualizarUsuario = async (usuario: User) => {
    try {
      setLoading(true);
      setError(null);
      const response = await UsuariosService.actualizar(usuario);
      await cargarUsuarios();
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

  const actualizarEstadoUsuario = async (userId: string, activo: boolean) => {
    try {
      setLoading(true);
      setError(null);
      const response = await UsuariosService.actualizarEstado(userId, activo);
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
      await cargarUsuarios();
      return response;
    }catch (err) {
      const mensaje = err instanceof Error
        ? err.message
        : "Error al actualizar el estado del usuario.";

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

  const eliminarUsuario = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await UsuariosService.eliminar(id);
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
      await cargarUsuarios();
      return response;
    }catch (err) {
      const mensaje = err instanceof Error
        ? err.message
        : "Error al eliminar el usuario.";

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
    cargarUsuarios();
  }, [cargarUsuarios]);

  return {
    usuarios,
    loading,
    recargar: cargarUsuarios,
    crearUsuario,
    actualizarUsuario,
    actualizarEstadoUsuario,
    eliminarUsuario,
  };
}