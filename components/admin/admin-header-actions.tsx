"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Bell,
  Printer,
  Package,
  AlertTriangle,
  CheckCircle2,
  ShoppingBag,
  Clock,
  FileText,
  Receipt,
  BarChart3,
  Users,
  DollarSign,
  Check,
} from "lucide-react"

interface NotificationItem {
  id: string
  type: "order" | "stock" | "payment" | "system" | "reservation"
  title: string
  description: string
  time: string
  read: boolean
}

const initialNotifications: NotificationItem[] = [
  {
    id: "n1",
    type: "stock",
    title: "Stock bajo",
    description: "Coca-Cola 600ml: quedan 8 unidades",
    time: "Hace 5 min",
    read: false,
  },
  {
    id: "n2",
    type: "order",
    title: "Nuevo pedido",
    description: "Mesa 7 registró un pedido de $485.00",
    time: "Hace 12 min",
    read: false,
  },
  {
    id: "n3",
    type: "payment",
    title: "Pago procesado",
    description: "Mesa 3 pagó $1,250.00 con tarjeta",
    time: "Hace 18 min",
    read: false,
  },
  {
    id: "n4",
    type: "reservation",
    title: "Nueva reservación",
    description: "Laura Méndez · 4 personas · 20:30",
    time: "Hace 32 min",
    read: true,
  },
  {
    id: "n5",
    type: "system",
    title: "Impresora reconectada",
    description: "Cocina Principal está en línea nuevamente",
    time: "Hace 1 hora",
    read: true,
  },
]

const notificationConfig: Record<
  NotificationItem["type"],
  { icon: typeof Bell; color: string; bg: string }
> = {
  order: { icon: ShoppingBag, color: "text-primary", bg: "bg-primary/10" },
  stock: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
  payment: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
  system: { icon: Package, color: "text-muted-foreground", bg: "bg-secondary" },
  reservation: { icon: Clock, color: "text-primary", bg: "bg-primary/10" },
}

const printOptions = [
  { id: "sales-report", label: "Reporte de Ventas del Día", description: "Resumen completo de ventas", icon: BarChart3 },
  { id: "cash-cut", label: "Corte de Caja", description: "Estado actual de la caja", icon: DollarSign },
  { id: "active-orders", label: "Pedidos Activos", description: "Comandas en preparación", icon: ShoppingBag },
  { id: "inventory", label: "Reporte de Inventario", description: "Existencias y stock bajo", icon: Package },
  { id: "staff-report", label: "Reporte de Personal", description: "Rendimiento por empleado", icon: Users },
  { id: "menu-list", label: "Lista de Menú", description: "Productos y precios", icon: FileText },
]

export function AdminHeaderActions() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications)
  const [lastPrinted, setLastPrinted] = useState<string | null>(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const handlePrint = (id: string, label: string) => {
    console.log("[v0] Printing report:", id)
    setLastPrinted(label)
    setTimeout(() => setLastPrinted(null), 3000)
  }

  return (
    <div className="flex items-center gap-2">
      {/* Notifications */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="relative bg-transparent">
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 p-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div>
              <p className="font-semibold">Notificaciones</p>
              <p className="text-xs text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} sin leer` : "Todo al día"}
              </p>
            </div>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={markAllAsRead}>
                <Check className="w-3.5 h-3.5 mr-1" />
                Marcar leídas
              </Button>
            )}
          </div>
          <ScrollArea className="max-h-96">
            <div className="divide-y divide-border">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No hay notificaciones
                </div>
              ) : (
                notifications.map((notification) => {
                  const config = notificationConfig[notification.type]
                  const Icon = config.icon
                  return (
                    <button
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-secondary/50 transition-colors ${
                        !notification.read ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-full ${config.bg} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-4 h-4 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{notification.title}</p>
                          {!notification.read && (
                            <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{notification.description}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{notification.time}</p>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </ScrollArea>
          <div className="px-4 py-2 border-t border-border">
            <Button variant="ghost" size="sm" className="w-full text-xs">
              Ver todas las notificaciones
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Print */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="bg-transparent">
            <Printer className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 p-0">
          <div className="px-4 py-3 border-b border-border">
            <p className="font-semibold">Imprimir</p>
            <p className="text-xs text-muted-foreground">Selecciona un documento para imprimir</p>
          </div>
          <div className="p-2">
            {printOptions.map((option) => {
              const Icon = option.icon
              return (
                <button
                  key={option.id}
                  onClick={() => handlePrint(option.id, option.label)}
                  className="w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 hover:bg-secondary/50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{option.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{option.description}</p>
                  </div>
                  <Printer className="w-4 h-4 text-muted-foreground shrink-0" />
                </button>
              )
            })}
          </div>
          {lastPrinted && (
            <div className="px-4 py-3 border-t border-border bg-success/10">
              <p className="text-xs text-success flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Enviado a impresora: {lastPrinted}
              </p>
            </div>
          )}
          <div className="px-4 py-2 border-t border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Receipt className="w-3.5 h-3.5" />
              Impresora predeterminada: Caja
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
