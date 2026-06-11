"use client"

import { useState, useEffect, useMemo } from "react"
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
  ChefHat,
  CreditCard,
  Banknote,
  AlertTriangle,
  CheckCircle2,
  Timer,
  Utensils,
  ArrowUpRight,
  ArrowDownRight,
  CircleDot,
  Flame,
  Eye,
  Wifi,
  WifiOff,
  RefreshCw,
} from "lucide-react"
import { mockOrders } from "@/lib/mock-data"

// Computed colors for Recharts
const COLORS = {
  amber: "#d4a24e",
  teal: "#3eb489",
  blue: "#5b8def",
  rose: "#e5635d",
  purple: "#a07be5",
  orange: "#e08a4a",
  cyan: "#4ac2c9",
  lime: "#8bc34a",
}

// ---- LIVE DATA SIMULATION ----
function generateLiveHourlySales() {
  const now = new Date()
  const currentHour = now.getHours()
  const data = []
  for (let h = 8; h <= Math.min(currentHour, 23); h++) {
    let base = 800
    if (h >= 12 && h <= 15) base = 4200
    if (h >= 19 && h <= 22) base = 4800
    if (h >= 10 && h <= 11) base = 1500
    if (h >= 16 && h <= 18) base = 900
    const isCurrent = h === currentHour
    data.push({
      hora: `${h.toString().padStart(2, "0")}:00`,
      ventas: isCurrent ? Math.round(base * (now.getMinutes() / 60) + Math.random() * 500) : Math.round(base + Math.random() * base * 0.3),
      isCurrent,
    })
  }
  return data
}

function generateTableStatus() {
  const statuses: Array<{ id: number; status: "available" | "occupied" | "reserved" | "cleaning"; waiter?: string; guests?: number; order?: number; time?: number; total?: number }> = []
  for (let i = 1; i <= 12; i++) {
    const rand = Math.random()
    if (rand < 0.25) {
      statuses.push({ id: i, status: "available" })
    } else if (rand < 0.4) {
      statuses.push({ id: i, status: "reserved" })
    } else if (rand < 0.45) {
      statuses.push({ id: i, status: "cleaning" })
    } else {
      statuses.push({
        id: i,
        status: "occupied",
        waiter: ["Maria M.", "Pedro L.", "Ana G.", "Luis T.", "Sofia R."][Math.floor(Math.random() * 5)],
        guests: Math.floor(Math.random() * 6) + 1,
        order: Math.floor(Math.random() * 900) + 100,
        time: Math.floor(Math.random() * 90) + 5,
        total: Math.round(Math.random() * 2500 + 200),
      })
    }
  }
  return statuses
}

function generateRecentActivity() {
  const activities = [
    { id: 1, type: "order_new" as const, message: "Nuevo pedido Mesa 7", detail: "3 platillos - $685.00", time: "Hace 2 min", icon: ShoppingBag },
    { id: 2, type: "order_ready" as const, message: "Pedido listo Mesa 3", detail: "Filete de Res, Ensalada Cesar", time: "Hace 5 min", icon: CheckCircle2 },
    { id: 3, type: "payment" as const, message: "Pago recibido Mesa 1", detail: "Tarjeta de credito - $1,240.00", time: "Hace 8 min", icon: CreditCard },
    { id: 4, type: "order_new" as const, message: "Nuevo pedido Mesa 11", detail: "5 platillos - $1,120.00", time: "Hace 12 min", icon: ShoppingBag },
    { id: 5, type: "alert" as const, message: "Stock bajo: Filete de Res", detail: "Quedan 3 porciones", time: "Hace 15 min", icon: AlertTriangle },
    { id: 6, type: "payment" as const, message: "Pago recibido Mesa 5", detail: "Efectivo - $850.00", time: "Hace 18 min", icon: Banknote },
    { id: 7, type: "order_ready" as const, message: "Pedido listo Mesa 9", detail: "Parrillada Especial x2", time: "Hace 22 min", icon: CheckCircle2 },
    { id: 8, type: "user_login" as const, message: "Sofia Ruiz inicio turno", detail: "Mesera - Zona B", time: "Hace 30 min", icon: Users },
  ]
  return activities
}

function generateOrdersInKitchen() {
  return [
    { id: "K-001", table: 7, items: ["Filete de Res", "Pasta Alfredo"], time: 3, priority: "normal" as const, waiter: "Maria M." },
    { id: "K-002", table: 3, items: ["Parrillada Especial", "Nachos"], time: 12, priority: "high" as const, waiter: "Pedro L." },
    { id: "K-003", table: 11, items: ["Ensalada Cesar", "Tacos Carnitas x2", "Pollo Parrilla"], time: 8, priority: "normal" as const, waiter: "Ana G." },
    { id: "K-004", table: 9, items: ["Flan Napolitano x3"], time: 2, priority: "low" as const, waiter: "Luis T." },
    { id: "K-005", table: 2, items: ["Filete de Res x2", "Ensalada Cesar"], time: 18, priority: "urgent" as const, waiter: "Sofia R." },
  ]
}

function generateStaffOnline() {
  return [
    { name: "Maria Mesera", role: "Mesera", zone: "Zona A", status: "active" as const, orders: 8, sales: 4250 },
    { name: "Pedro Lopez", role: "Mesero", zone: "Zona B", status: "active" as const, orders: 6, sales: 3100 },
    { name: "Ana Garcia", role: "Mesera", zone: "Zona C", status: "active" as const, orders: 7, sales: 3800 },
    { name: "Luis Torres", role: "Mesero", zone: "Barra", status: "break" as const, orders: 4, sales: 1900 },
    { name: "Sofia Ruiz", role: "Mesera", zone: "Terraza", status: "active" as const, orders: 5, sales: 2600 },
    { name: "Juan Cajero", role: "Cajero", zone: "Caja 1", status: "active" as const, orders: 0, sales: 0 },
  ]
}

function generatePaymentBreakdown() {
  return [
    { method: "Efectivo", amount: 8450, count: 12, color: COLORS.teal },
    { method: "T. Credito", amount: 6200, count: 8, color: COLORS.blue },
    { method: "T. Debito", amount: 3100, count: 5, color: COLORS.purple },
    { method: "Transferencia", amount: 1850, count: 2, color: COLORS.orange },
  ]
}

function generateAlerts() {
  return [
    { id: 1, severity: "warning" as const, message: "Filete de Res - Stock bajo (3 uds)", time: "15 min" },
    { id: 2, severity: "info" as const, message: "Mesa 2 lleva 18 min esperando pedido", time: "18 min" },
    { id: 3, severity: "error" as const, message: "Impresora Cocina sin respuesta", time: "5 min" },
    { id: 4, severity: "warning" as const, message: "Cerveza Nacional - Stock bajo (6 uds)", time: "45 min" },
  ]
}

// ---- CUSTOM TOOLTIP ----
function CustomTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
  formatter?: (value: number) => string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-popover p-3 shadow-md">
      <p className="text-sm font-medium text-popover-foreground mb-1.5">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-xs">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium text-popover-foreground">
            {formatter ? formatter(entry.value) : entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  )
}

// ---- MAIN COMPONENT ----
export function DashboardModule() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isLive, setIsLive] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  const hourlySales = useMemo(() => generateLiveHourlySales(), [currentTime])
  const tables = useMemo(() => generateTableStatus(), [])
  const recentActivity = useMemo(() => generateRecentActivity(), [])
  const kitchenOrders = useMemo(() => generateOrdersInKitchen(), [])
  const staffOnline = useMemo(() => generateStaffOnline(), [])
  const paymentBreakdown = useMemo(() => generatePaymentBreakdown(), [])
  const alerts = useMemo(() => generateAlerts(), [])

  const occupiedTables = tables.filter((t) => t.status === "occupied").length
  const availableTables = tables.filter((t) => t.status === "available").length
  const totalTables = tables.length
  const occupancyRate = Math.round((occupiedTables / totalTables) * 100)

  const todaySales = hourlySales.reduce((sum, h) => sum + h.ventas, 0)
  const todayOrders = mockOrders.length + Math.floor(Math.random() * 20) + 15
  const avgTicket = Math.round(todaySales / todayOrders)
  const activeStaff = staffOnline.filter((s) => s.status === "active").length
  const totalPayments = paymentBreakdown.reduce((sum, p) => sum + p.amount, 0)

  const formatCurrency = (value: number) => `$${value.toLocaleString()}`

  const getTableStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-success/15 border-success/30 text-success"
      case "occupied": return "bg-amber-500/15 border-amber-500/30 text-amber-400"
      case "reserved": return "bg-blue-500/15 border-blue-500/30 text-blue-400"
      case "cleaning": return "bg-purple-500/15 border-purple-500/30 text-purple-400"
      default: return "bg-secondary border-border text-muted-foreground"
    }
  }

  const getTableStatusLabel = (status: string) => {
    switch (status) {
      case "available": return "Libre"
      case "occupied": return "Ocupada"
      case "reserved": return "Reservada"
      case "cleaning": return "Limpieza"
      default: return status
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-destructive text-destructive-foreground"
      case "high": return "bg-amber-500/20 text-amber-400"
      case "normal": return "bg-secondary text-muted-foreground"
      case "low": return "bg-secondary text-muted-foreground"
      default: return "bg-secondary text-muted-foreground"
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "urgent": return "Urgente"
      case "high": return "Alta"
      case "normal": return "Normal"
      case "low": return "Baja"
      default: return priority
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "order_new": return "text-blue-400"
      case "order_ready": return "text-success"
      case "payment": return "text-amber-400"
      case "alert": return "text-destructive"
      case "user_login": return "text-purple-400"
      default: return "text-muted-foreground"
    }
  }

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "error": return "border-destructive/30 bg-destructive/10 text-destructive"
      case "warning": return "border-amber-500/30 bg-amber-500/10 text-amber-400"
      case "info": return "border-blue-500/30 bg-blue-500/10 text-blue-400"
      default: return "border-border bg-secondary text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      {/* Live status bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {isLive ? (
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
              </span>
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-destructive" />
            )}
            <span className="text-sm font-medium">{isLive ? "En vivo" : "Desconectado"}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {currentTime.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
        <Button variant="outline" size="sm" className="bg-transparent gap-2" onClick={() => setIsLive(!isLive)}>
          <RefreshCw className="w-3.5 h-3.5" />
          Actualizar
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground">Ventas Hoy</p>
              <DollarSign className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold">{formatCurrency(todaySales)}</p>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3 h-3 text-success" />
              <span className="text-xs text-success font-medium">+12.5%</span>
              <span className="text-xs text-muted-foreground">vs ayer</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground">Pedidos Hoy</p>
              <ShoppingBag className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold">{todayOrders}</p>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3 h-3 text-success" />
              <span className="text-xs text-success font-medium">+8 pedidos</span>
              <span className="text-xs text-muted-foreground">vs ayer</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground">Ticket Promedio</p>
              <CreditCard className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold">{formatCurrency(avgTicket)}</p>
            <div className="flex items-center gap-1 mt-1">
              <ArrowDownRight className="w-3 h-3 text-destructive" />
              <span className="text-xs text-destructive font-medium">-$18</span>
              <span className="text-xs text-muted-foreground">vs ayer</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground">Ocupacion</p>
              <Utensils className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold">{occupancyRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">{occupiedTables} de {totalTables} mesas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground">Staff Activo</p>
              <Users className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold">{activeStaff}/{staffOnline.length}</p>
            <p className="text-xs text-muted-foreground mt-1">{staffOnline.filter(s => s.status === "break").length} en descanso</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-start gap-3 p-3 rounded-lg border ${getSeverityStyles(alert.severity)}`}
            >
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium leading-snug">{alert.message}</p>
                <p className="text-xs opacity-60 mt-0.5">Hace {alert.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main grid: Tables + Kitchen + Sales Chart */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Table Map */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Mapa de Mesas</CardTitle>
              <div className="flex items-center gap-1.5">
                <Badge variant="secondary" className="text-[10px] py-0 px-1.5 bg-success/15 text-success border-success/20">{availableTables}</Badge>
                <Badge variant="secondary" className="text-[10px] py-0 px-1.5 bg-amber-500/15 text-amber-400 border-amber-500/20">{occupiedTables}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2.5">
              {tables.map((table) => (
                <div
                  key={table.id}
                  className={`relative rounded-lg border p-2.5 text-center cursor-pointer transition-all hover:scale-[1.03] ${getTableStatusColor(table.status)}`}
                >
                  <p className="text-[10px] font-medium opacity-70">{getTableStatusLabel(table.status)}</p>
                  <p className="text-lg font-bold">{table.id}</p>
                  {table.status === "occupied" && (
                    <>
                      <p className="text-[10px] opacity-70">{table.guests}p - {table.time}min</p>
                      <p className="text-[10px] font-medium">{formatCurrency(table.total || 0)}</p>
                    </>
                  )}
                  {table.status === "available" && (
                    <p className="text-[10px] opacity-50">Disponible</p>
                  )}
                  {table.status === "reserved" && (
                    <p className="text-[10px] opacity-70">20:00</p>
                  )}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-4 pt-3 border-t border-border">
              {[
                { label: "Libre", color: "bg-success" },
                { label: "Ocupada", color: "bg-amber-500" },
                { label: "Reservada", color: "bg-blue-500" },
                { label: "Limpieza", color: "bg-purple-500" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span className="text-[10px] text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Kitchen Orders */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <ChefHat className="w-4 h-4" />
                  Cocina en Vivo
                </CardTitle>
                <CardDescription>{kitchenOrders.length} pedidos en preparacion</CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs">
                <Flame className="w-3 h-3 mr-1" />
                {kitchenOrders.filter(o => o.priority === "urgent" || o.priority === "high").length} prioritarios
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {kitchenOrders
                .sort((a, b) => {
                  const priority = { urgent: 0, high: 1, normal: 2, low: 3 }
                  return priority[a.priority] - priority[b.priority]
                })
                .map((order) => (
                  <div
                    key={order.id}
                    className={`p-3 rounded-lg border transition-all ${
                      order.priority === "urgent"
                        ? "border-destructive/40 bg-destructive/5"
                        : order.priority === "high"
                          ? "border-amber-500/30 bg-amber-500/5"
                          : "border-border bg-secondary/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">Mesa {order.table}</span>
                        <Badge className={`text-[10px] py-0 ${getPriorityColor(order.priority)}`}>
                          {getPriorityLabel(order.priority)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Timer className="w-3 h-3" />
                        <span className={`text-xs font-medium ${order.time > 15 ? "text-destructive" : order.time > 10 ? "text-amber-400" : "text-muted-foreground"}`}>
                          {order.time} min
                        </span>
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      {order.items.map((item, i) => (
                        <p key={i} className="text-xs text-muted-foreground">{item}</p>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                      <span className="text-[10px] text-muted-foreground">{order.waiter}</span>
                      <span className="text-[10px] text-muted-foreground">{order.id}</span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Hourly sales today */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Ventas por Hora - Hoy</CardTitle>
            <CardDescription>Rendimiento en tiempo real</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlySales}>
                  <defs>
                    <linearGradient id="dashGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.amber} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={COLORS.amber} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="hora" tick={{ fontSize: 10, fill: "#a1a1aa" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#a1a1aa" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
                  <Area type="monotone" dataKey="ventas" name="Ventas" stroke={COLORS.amber} fill="url(#dashGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Payment breakdown mini */}
            <div className="mt-4 pt-3 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground mb-2.5">Metodos de pago hoy</p>
              <div className="space-y-2">
                {paymentBreakdown.map((pm) => (
                  <div key={pm.method} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{pm.method}</span>
                      <span className="font-medium">{formatCurrency(pm.amount)} <span className="text-muted-foreground font-normal">({pm.count})</span></span>
                    </div>
                    <Progress value={(pm.amount / totalPayments) * 100} className="h-1.5" style={{ ["--progress-foreground" as string]: pm.color } as React.CSSProperties} />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row: Staff + Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Staff online */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Personal en Turno</CardTitle>
              <Badge variant="secondary" className="text-xs gap-1">
                <Wifi className="w-3 h-3" />
                {activeStaff} activos
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {staffOnline.map((person) => (
                <div key={person.name} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">
                        {person.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${person.status === "active" ? "bg-success" : "bg-amber-500"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{person.name}</p>
                    <p className="text-[10px] text-muted-foreground">{person.role} - {person.zone}</p>
                  </div>
                  {person.role !== "Cajero" && (
                    <div className="text-right">
                      <p className="text-xs font-medium">{person.orders} ord.</p>
                      <p className="text-[10px] text-muted-foreground">{formatCurrency(person.sales)}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Actividad Reciente</CardTitle>
                <CardDescription>Registro de operaciones en tiempo real</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                <Eye className="w-3.5 h-3.5 mr-1.5" />
                Ver todo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {recentActivity.map((activity, index) => {
                const Icon = activity.icon
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 py-2.5 border-b border-border/30 last:border-0"
                  >
                    <div className={`mt-0.5 ${getActivityColor(activity.type)}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.detail}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap mt-0.5">{activity.time}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
