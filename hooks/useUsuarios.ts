"use client";

import {
  useEffect,
  useState,
} from "react";
import { Usuario } from "@/models/usuario.model";
import { UsuariosService } from "@/services/usuarios.service";

export function useUsuarios() {

  const [
    usuarios,
    setUsuarios,
  ] = useState<Usuario[]>(
    []
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  useEffect(() => {

    cargar();

  }, []);

  async function cargar() {

    try {

      const data =
        await UsuariosService.obtenerTodos();

      setUsuarios(data);

    } finally {

      setLoading(false);

    }
  }

  return {
    usuarios,
    loading,
    recargar: cargar,
  };
}