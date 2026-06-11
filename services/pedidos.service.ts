import { Pedido } from "@/models/pedido.model";
import { apiFetch } from "./api";

export const PedidosService = {

  obtenerTodos() {
    return apiFetch<Pedido[]>(
      "/pedidos"
    );
  },

  obtenerPorId(
    id: number
  ) {
    return apiFetch<Pedido>(
      `/pedidos/${id}`
    );
  },

  crear(
    pedido: Pedido
  ) {

    return apiFetch(
      "/pedidos",
      {
        method: "POST",
        body: JSON.stringify(
          pedido
        ),
      }
    );
  },

};