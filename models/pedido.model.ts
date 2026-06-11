export interface Pedido {
  idPedido: number;
  mesa: string;
  fecha: string;
  total: number;
  estado:
    | "PENDIENTE"
    | "PREPARANDO"
    | "ENTREGADO"
    | "PAGADO";
}