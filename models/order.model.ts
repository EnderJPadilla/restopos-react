import { User } from "@/lib/types"
import { MenuItem } from "./producto.model"

export interface OrderItem {
  id: string
  menuItem: MenuItem
  quantity: number
  notes?: string
}

export interface Order {
  id: string
  tableNumber: number
  items: OrderItem[]
  status: "registered" | "preparing" | "ready" | "paid" | "closed"
  waiter: User
  createdAt: Date
  updatedAt: Date
  subtotal: number
  tax: number
  tip?: number
  total: number
  paymentMethod?: "cash" | "card" | "transfer"
  paymentReference?: string
}
