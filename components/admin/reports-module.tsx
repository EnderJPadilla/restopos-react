"use client"

import { useState, useMemo } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  CalendarDays,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Utensils,
  CreditCard,
  Banknote,
  Repeat,
} from "lucide-react"

// Computed colors (not CSS variables - Recharts requirement)
const COLORS = {
  amber: "#d4a24e",
  teal: "#3eb489",
  blue: "#5b8def",
  rose: "#e5635d",
  purple: "#a07be5",
  orange: "#e08a4a",
  cyan: "#4ac2c9",
  lime: "#8bc34a",
  pink: "#e57baf",
  indigo: "#6366f1",
}

const CHART_COLORS = [COLORS.amber, COLORS.teal, COLORS.blue, COLORS.rose, COLORS.purple, COLORS.orange, COLORS.cyan, COLORS.lime]

// ---- MOCK DATA GENERATORS ----
function generateMonthlySales() {
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
  return months.map((month, i) => {
    const base = 280000 + Math.random() * 120000
    const seasonality = Math.sin((i / 12) * Math.PI * 2 - 1) * 40000
    const total = Math.round(base + seasonality)
    return {
      month,
      ventas: total,
      costos: Math.round(total * (0.32 + Math.random() * 0.06)),
      ganancia: 0,
      ordenes: Math.round(total / (420 + Math.random() * 80)),
    }
  }).map(d => ({ ...d, ganancia: d.ventas - d.costos }))
}

function generateDailySales(days: number) {
  const data = []
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6
    const base = isWeekend ? 18000 : 12000
    const amount = Math.round(base + Math.random() * 8000)
    data.push({
      fecha: date.toLocaleDateString("es-MX", { day: "2-digit", month: "short" }),
      fullDate: date.toISOString().split("T")[0],
      dayName: date.toLocaleDateString("es-MX", { weekday: "short" }),
      ventas: amount,
      ordenes: Math.round(amount / (430 + Math.random() * 70)),
      ticketPromedio: 0,
    })
  }
  return data.map(d => ({ ...d, ticketPromedio: Math.round(d.ventas / d.ordenes) }))
}

function generateHourlySales() {
  const hours = []
  for (let h = 8; h <= 23; h++) {
    let base = 500
    if (h >= 12 && h <= 15) base = 3500 // lunch peak
    if (h >= 19 && h <= 22) base = 4200 // dinner peak
    if (h >= 10 && h <= 11) base = 1200 // brunch
    if (h >= 16 && h <= 18) base = 800  // slow
    hours.push({
      hora: `${h.toString().padStart(2, "0")}:00`,
      ventas: Math.round(base + Math.random() * base * 0.3),
      ordenes: Math.round((base + Math.random() * base * 0.3) / 450),
    })
  }
  return hours
}

function generateTopProducts() {
  const products = [
    { name: "Filete de Res", category: "Platos Fuertes", price: 320 },
    { name: "Margarita", category: "Bebidas", price: 95 },
    { name: "Ensalada Cesar", category: "Entradas", price: 85 },
    { name: "Pasta Alfredo", category: "Platos Fuertes", price: 165 },
    { name: "Tacos de Carnitas", category: "Platos Fuertes", price: 145 },
    { name: "Cerveza Nacional", category: "Bebidas", price: 55 },
    { name: "Nachos con Guacamole", category: "Entradas", price: 120 },
    { name: "Parrillada Especial", category: "Especialidades", price: 550 },
    { name: "Pollo a la Parrilla", category: "Platos Fuertes", price: 195 },
    { name: "Flan Napolitano", category: "Postres", price: 75 },
  ]
  return products.map((p, i) => ({
    ...p,
    cantidad: Math.round(55 - i * 4.5 + Math.random() * 8),
    ingresos: 0,
  })).map(p => ({ ...p, ingresos: p.cantidad * p.price }))
    .sort((a, b) => b.cantidad - a.cantidad)
}

function generateDayOfWeekSales() {
  const days = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"]
  return days.map((day, i) => {
    const isWeekend = i >= 4
    const base = isWeekend ? 22000 : 14000
    return {
      dia: day,
      shortDay: day.substring(0, 3),
      ventas: Math.round(base + Math.random() * 6000),
      ordenes: Math.round((base + Math.random() * 6000) / 440),
    }
  })
}

function generateCategorySales() {
  const categories = [
    { name: "Platos Fuertes", ventas: 142000, porcentaje: 38 },
    { name: "Bebidas", ventas: 78500, porcentaje: 21 },
    { name: "Entradas", ventas: 56000, porcentaje: 15 },
    { name: "Especialidades", ventas: 48000, porcentaje: 13 },
    { name: "Postres", ventas: 28500, porcentaje: 8 },
    { name: "Otros", ventas: 18000, porcentaje: 5 },
  ]
  return categories
}

function generateWaiterPerformance() {
  return [
    { nombre: "Maria Mesera", ordenes: 145, ventas: 67800, ticketPromedio: 468, propinas: 8450, calificacion: 4.8 },
    { nombre: "Pedro Lopez", ordenes: 132, ventas: 58200, ticketPromedio: 441, propinas: 7200, calificacion: 4.6 },
    { nombre: "Ana Garcia", ordenes: 128, ventas: 61500, ticketPromedio: 480, propinas: 8100, calificacion: 4.9 },
    { nombre: "Luis Torres", ordenes: 98, ventas: 42300, ticketPromedio: 432, propinas: 5400, calificacion: 4.3 },
    { nombre: "Sofia Ruiz", ordenes: 115, ventas: 52400, ticketPromedio: 456, propinas: 6800, calificacion: 4.7 },
  ]
}

function generatePaymentMethods() {
  return [
    { metodo: "Efectivo", monto: 156000, porcentaje: 42, transacciones: 280 },
    { metodo: "Tarjeta Credito", monto: 128000, porcentaje: 35, transacciones: 195 },
    { metodo: "Tarjeta Debito", monto: 52000, porcentaje: 14, transacciones: 98 },
    { metodo: "Transferencia", monto: 33000, porcentaje: 9, transacciones: 42 },
  ]
}

function generateTablePerformance() {
  return Array.from({ length: 12 }, (_, i) => ({
    mesa: `Mesa ${i + 1}`,
    numero: i + 1,
    rotaciones: Math.round(3 + Math.random() * 5),
    ventas: Math.round(8000 + Math.random() * 20000),
    tiempoPromedio: Math.round(35 + Math.random() * 35),
    ocupacion: Math.round(40 + Math.random() * 50),
  }))
}

function generateCancelledOrders() {
  return [
    { motivo: "Cliente cambio de opinion", cantidad: 12, porcentaje: 35 },
    { motivo: "Tiempo de espera largo", cantidad: 8, porcentaje: 24 },
    { motivo: "Producto agotado", cantidad: 6, porcentaje: 18 },
    { motivo: "Error en pedido", cantidad: 4, porcentaje: 12 },
    { motivo: "Otro", cantidad: 4, porcentaje: 11 },
  ]
}

// ---- KPI CARD ----
function KPICard({
  title,
  value,
  subtitle,
  change,
  icon: Icon,
  trend,
}: {
  title: string
  value: string
  subtitle?: string
  change?: string
  icon: React.ElementType
  trend?: "up" | "down" | "neutral"
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        </div>
        {change && (
          <div className="flex items-center gap-1 mt-3">
            {trend === "up" && <ArrowUpRight className="w-3.5 h-3.5 text-success" />}
            {trend === "down" && <ArrowDownRight className="w-3.5 h-3.5 text-destructive" />}
            <span
              className={`text-xs font-medium ${
                trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              {change}
            </span>
            <span className="text-xs text-muted-foreground">vs periodo anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
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
export function ReportsModule() {
  const [activeReport, setActiveReport] = useState("overview")
  const [dateRange, setDateRange] = useState("30")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const monthlySales = useMemo(() => generateMonthlySales(), [])
  const dailySales = useMemo(() => generateDailySales(Number(dateRange)), [dateRange])
  const hourlySales = useMemo(() => generateHourlySales(), [])
  const topProducts = useMemo(() => generateTopProducts(), [])
  const dayOfWeekSales = useMemo(() => generateDayOfWeekSales(), [])
  const categorySales = useMemo(() => generateCategorySales(), [])
  const waiterPerformance = useMemo(() => generateWaiterPerformance(), [])
  const paymentMethods = useMemo(() => generatePaymentMethods(), [])
  const tablePerformance = useMemo(() => generateTablePerformance(), [])
  const cancelledOrders = useMemo(() => generateCancelledOrders(), [])

  const totalSales = dailySales.reduce((sum, d) => sum + d.ventas, 0)
  const totalOrders = dailySales.reduce((sum, d) => sum + d.ordenes, 0)
  const avgTicket = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0
  const avgDailySales = Math.round(totalSales / dailySales.length)

  const reportTabs = [
    { id: "overview", label: "Resumen" },
    { id: "sales", label: "Ventas" },
    { id: "products", label: "Productos" },
    { id: "waiters", label: "Meseros" },
    { id: "payments", label: "Pagos" },
    { id: "tables", label: "Mesas" },
    { id: "cancelled", label: "Cancelaciones" },
  ]

  const formatCurrency = (value: number) => `$${value.toLocaleString()}`

  return (
    <div className="space-y-6">
      {/* Filters bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Periodo rapido</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Ultimos 7 dias</SelectItem>
                  <SelectItem value="15">Ultimos 15 dias</SelectItem>
                  <SelectItem value="30">Ultimos 30 dias</SelectItem>
                  <SelectItem value="60">Ultimos 60 dias</SelectItem>
                  <SelectItem value="90">Ultimos 90 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Desde</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Hasta</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-40"
              />
            </div>
            <Button variant="outline" className="bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report tabs */}
      <Tabs value={activeReport} onValueChange={setActiveReport}>
        <TabsList className="flex-wrap h-auto gap-1 p-1">
          {reportTabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="text-xs">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ========== OVERVIEW ========== */}
        <TabsContent value="overview" className="space-y-6 mt-4">
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Ventas Totales"
              value={formatCurrency(totalSales)}
              subtitle={`${dailySales.length} dias`}
              change="+12.5%"
              trend="up"
              icon={DollarSign}
            />
            <KPICard
              title="Total Ordenes"
              value={totalOrders.toLocaleString()}
              subtitle={`~${Math.round(totalOrders / dailySales.length)}/dia`}
              change="+8.3%"
              trend="up"
              icon={ShoppingBag}
            />
            <KPICard
              title="Ticket Promedio"
              value={formatCurrency(avgTicket)}
              change="+3.7%"
              trend="up"
              icon={CreditCard}
            />
            <KPICard
              title="Promedio Diario"
              value={formatCurrency(avgDailySales)}
              change="-2.1%"
              trend="down"
              icon={CalendarDays}
            />
          </div>

          {/* Main charts row */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Sales trend */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Tendencia de Ventas</CardTitle>
                <CardDescription>Ventas diarias del periodo seleccionado</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailySales}>
                      <defs>
                        <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.amber} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={COLORS.amber} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: "#a1a1aa" }} interval="preserveStartEnd" />
                      <YAxis tick={{ fontSize: 11, fill: "#a1a1aa" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
                      <Area
                        type="monotone"
                        dataKey="ventas"
                        name="Ventas"
                        stroke={COLORS.amber}
                        fill="url(#salesGradient)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Sales by category pie */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Ventas por Categoria</CardTitle>
                <CardDescription>Distribucion del periodo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categorySales}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="ventas"
                        nameKey="name"
                        stroke="none"
                      >
                        {categorySales.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1.5 mt-2">
                  {categorySales.map((cat, i) => (
                    <div key={cat.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i] }} />
                        <span className="text-muted-foreground">{cat.name}</span>
                      </div>
                      <span className="font-medium">{cat.porcentaje}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Second row */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Top products mini */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Top 5 Productos</CardTitle>
                    <CardDescription>Mas vendidos del periodo</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setActiveReport("products")}>
                    Ver todos
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topProducts.slice(0, 5).map((product, index) => (
                    <div key={product.name} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: `${CHART_COLORS[index]}20`, color: CHART_COLORS[index] }}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{product.cantidad} uds</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(product.ingresos)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Days of week */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Ventas por Dia de la Semana</CardTitle>
                <CardDescription>Promedio del periodo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dayOfWeekSales}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="shortDay" tick={{ fontSize: 11, fill: "#a1a1aa" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#a1a1aa" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
                      <Bar dataKey="ventas" name="Ventas" radius={[4, 4, 0, 0]}>
                        {dayOfWeekSales.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index >= 4 ? COLORS.amber : COLORS.blue} fillOpacity={index >= 4 ? 1 : 0.6} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ========== SALES ========== */}
        <TabsContent value="sales" className="space-y-6 mt-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard title="Ventas del Periodo" value={formatCurrency(totalSales)} change="+12.5%" trend="up" icon={DollarSign} />
            <KPICard title="Promedio Diario" value={formatCurrency(avgDailySales)} change="-2.1%" trend="down" icon={CalendarDays} />
            <KPICard title="Mejor Dia" value={formatCurrency(Math.max(...dailySales.map(d => d.ventas)))} icon={TrendingUp} />
            <KPICard title="Peor Dia" value={formatCurrency(Math.min(...dailySales.map(d => d.ventas)))} icon={TrendingDown} />
          </div>

          {/* Daily sales detail */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Ventas Diarias</CardTitle>
              <CardDescription>Desglose de ventas y ordenes por dia</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailySales}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="fecha" tick={{ fontSize: 10, fill: "#a1a1aa" }} interval={Math.floor(dailySales.length / 10)} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#a1a1aa" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#a1a1aa" }} />
                    <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="ventas" name="Ventas" fill={COLORS.amber} radius={[3, 3, 0, 0]} fillOpacity={0.8} />
                    <Line yAxisId="right" type="monotone" dataKey="ordenes" name="Ordenes" stroke={COLORS.teal} strokeWidth={2} dot={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Monthly sales */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Ventas Mensuales</CardTitle>
                <CardDescription>Ventas, costos y ganancia por mes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlySales}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#a1a1aa" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#a1a1aa" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
                      <Legend />
                      <Bar dataKey="ventas" name="Ventas" fill={COLORS.amber} radius={[3, 3, 0, 0]} fillOpacity={0.8} />
                      <Bar dataKey="costos" name="Costos" fill={COLORS.rose} radius={[3, 3, 0, 0]} fillOpacity={0.6} />
                      <Bar dataKey="ganancia" name="Ganancia" fill={COLORS.teal} radius={[3, 3, 0, 0]} fillOpacity={0.8} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Hourly sales */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Ventas por Hora</CardTitle>
                <CardDescription>Patrones de venta por horario</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={hourlySales}>
                      <defs>
                        <linearGradient id="hourlyGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.blue} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="hora" tick={{ fontSize: 11, fill: "#a1a1aa" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#a1a1aa" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
                      <Area type="monotone" dataKey="ventas" name="Ventas" stroke={COLORS.blue} fill="url(#hourlyGradient)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-6 mt-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Pico comida: 12:00-15:00</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Pico cena: 19:00-22:00</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Day of week detail */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Dias de Mayores Ventas</CardTitle>
              <CardDescription>Comparativa por dia de la semana</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dayOfWeekSales} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: "#a1a1aa" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="dia" tick={{ fontSize: 12, fill: "#a1a1aa" }} width={80} />
                    <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
                    <Bar dataKey="ventas" name="Ventas" radius={[0, 4, 4, 0]}>
                      {dayOfWeekSales.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={index >= 4 ? COLORS.amber : COLORS.blue} fillOpacity={index >= 4 ? 1 : 0.6} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-4 mt-3 justify-center">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.amber }} />
                  <span className="text-xs text-muted-foreground">Fin de semana</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.blue, opacity: 0.6 }} />
                  <span className="text-xs text-muted-foreground">Entre semana</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== PRODUCTS ========== */}
        <TabsContent value="products" className="space-y-6 mt-4">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Top 10 bar chart */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Top 10 Productos Mas Vendidos</CardTitle>
                <CardDescription>Por cantidad vendida en el periodo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topProducts} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis type="number" tick={{ fontSize: 11, fill: "#a1a1aa" }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#a1a1aa" }} width={140} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="cantidad" name="Unidades vendidas" radius={[0, 4, 4, 0]}>
                        {topProducts.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} fillOpacity={1 - index * 0.06} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product detail table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Detalle de Productos</CardTitle>
              <CardDescription>Tabla completa de rendimiento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-muted-foreground font-medium">#</th>
                      <th className="text-left py-3 px-2 text-muted-foreground font-medium">Producto</th>
                      <th className="text-left py-3 px-2 text-muted-foreground font-medium">Categoria</th>
                      <th className="text-right py-3 px-2 text-muted-foreground font-medium">Precio</th>
                      <th className="text-right py-3 px-2 text-muted-foreground font-medium">Cantidad</th>
                      <th className="text-right py-3 px-2 text-muted-foreground font-medium">Ingresos</th>
                      <th className="text-right py-3 px-2 text-muted-foreground font-medium">% del Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((product, index) => {
                      const totalIngresos = topProducts.reduce((s, p) => s + p.ingresos, 0)
                      const pct = ((product.ingresos / totalIngresos) * 100).toFixed(1)
                      return (
                        <tr key={product.name} className="border-b border-border/50 hover:bg-secondary/30">
                          <td className="py-3 px-2">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: `${CHART_COLORS[index]}20`, color: CHART_COLORS[index] }}>
                              {index + 1}
                            </div>
                          </td>
                          <td className="py-3 px-2 font-medium">{product.name}</td>
                          <td className="py-3 px-2">
                            <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                          </td>
                          <td className="py-3 px-2 text-right">{formatCurrency(product.price)}</td>
                          <td className="py-3 px-2 text-right font-medium">{product.cantidad}</td>
                          <td className="py-3 px-2 text-right font-medium">{formatCurrency(product.ingresos)}</td>
                          <td className="py-3 px-2 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: CHART_COLORS[index] }} />
                              </div>
                              <span className="text-xs text-muted-foreground w-10 text-right">{pct}%</span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Category breakdown */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Ingresos por Categoria</CardTitle>
              <CardDescription>Comparativa de categorias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categorySales}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#a1a1aa" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#a1a1aa" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
                    <Bar dataKey="ventas" name="Ventas" radius={[4, 4, 0, 0]}>
                      {categorySales.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== WAITERS ========== */}
        <TabsContent value="waiters" className="space-y-6 mt-4">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Waiter comparison chart */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Rendimiento por Mesero</CardTitle>
                <CardDescription>Comparativa de ventas y ordenes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={waiterPerformance}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="nombre" tick={{ fontSize: 11, fill: "#a1a1aa" }} />
                      <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#a1a1aa" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#a1a1aa" }} />
                      <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="ventas" name="Ventas" fill={COLORS.amber} radius={[3, 3, 0, 0]} fillOpacity={0.8} />
                      <Bar yAxisId="right" dataKey="ordenes" name="Ordenes" fill={COLORS.teal} radius={[3, 3, 0, 0]} fillOpacity={0.8} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Waiter detail table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Detalle por Mesero</CardTitle>
              <CardDescription>Estadisticas completas del periodo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-muted-foreground font-medium">Mesero</th>
                      <th className="text-right py-3 px-2 text-muted-foreground font-medium">Ordenes</th>
                      <th className="text-right py-3 px-2 text-muted-foreground font-medium">Ventas</th>
                      <th className="text-right py-3 px-2 text-muted-foreground font-medium">Ticket Prom.</th>
                      <th className="text-right py-3 px-2 text-muted-foreground font-medium">Propinas</th>
                      <th className="text-right py-3 px-2 text-muted-foreground font-medium">Calificacion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {waiterPerformance
                      .sort((a, b) => b.ventas - a.ventas)
                      .map((waiter, index) => (
                        <tr key={waiter.nombre} className="border-b border-border/50 hover:bg-secondary/30">
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: `${CHART_COLORS[index]}20`, color: CHART_COLORS[index] }}>
                                {waiter.nombre.split(" ").map(n => n[0]).join("")}
                              </div>
                              <span className="font-medium">{waiter.nombre}</span>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-right">{waiter.ordenes}</td>
                          <td className="py-3 px-2 text-right font-medium">{formatCurrency(waiter.ventas)}</td>
                          <td className="py-3 px-2 text-right">{formatCurrency(waiter.ticketPromedio)}</td>
                          <td className="py-3 px-2 text-right">{formatCurrency(waiter.propinas)}</td>
                          <td className="py-3 px-2 text-right">
                            <Badge variant="secondary" className="text-xs">
                              {"*".repeat(Math.round(waiter.calificacion))} {waiter.calificacion}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Tips chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Propinas por Mesero</CardTitle>
              <CardDescription>Total de propinas acumuladas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={waiterPerformance.sort((a, b) => b.propinas - a.propinas)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="nombre" tick={{ fontSize: 11, fill: "#a1a1aa" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#a1a1aa" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
                    <Bar dataKey="propinas" name="Propinas" fill={COLORS.teal} radius={[4, 4, 0, 0]}>
                      {waiterPerformance.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== PAYMENTS ========== */}
        <TabsContent value="payments" className="space-y-6 mt-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {paymentMethods.map((method, i) => (
              <KPICard
                key={method.metodo}
                title={method.metodo}
                value={formatCurrency(method.monto)}
                subtitle={`${method.transacciones} transacciones`}
                icon={i === 0 ? Banknote : i === 3 ? Repeat : CreditCard}
              />
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Payment pie chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Distribucion de Metodos de Pago</CardTitle>
                <CardDescription>Por monto total</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentMethods}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        dataKey="monto"
                        nameKey="metodo"
                        stroke="none"
                      >
                        {paymentMethods.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {paymentMethods.map((method, i) => (
                    <div key={method.metodo} className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i] }} />
                      <span className="text-muted-foreground">{method.metodo}</span>
                      <span className="font-medium ml-auto">{method.porcentaje}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment comparison bar */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Transacciones por Metodo</CardTitle>
                <CardDescription>Numero de operaciones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={paymentMethods} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis type="number" tick={{ fontSize: 11, fill: "#a1a1aa" }} />
                      <YAxis type="category" dataKey="metodo" tick={{ fontSize: 11, fill: "#a1a1aa" }} width={110} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="transacciones" name="Transacciones" radius={[0, 4, 4, 0]}>
                        {paymentMethods.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ========== TABLES ========== */}
        <TabsContent value="tables" className="space-y-6 mt-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard title="Mesa Mas Rentable" value={`Mesa ${tablePerformance.sort((a, b) => b.ventas - a.ventas)[0]?.numero}`} subtitle={formatCurrency(tablePerformance.sort((a, b) => b.ventas - a.ventas)[0]?.ventas || 0)} icon={Utensils} />
            <KPICard title="Mayor Rotacion" value={`Mesa ${tablePerformance.sort((a, b) => b.rotaciones - a.rotaciones)[0]?.numero}`} subtitle={`${tablePerformance.sort((a, b) => b.rotaciones - a.rotaciones)[0]?.rotaciones} rotaciones/dia`} icon={Repeat} />
            <KPICard title="Tiempo Prom. Mesa" value={`${Math.round(tablePerformance.reduce((s, t) => s + t.tiempoPromedio, 0) / tablePerformance.length)} min`} icon={Clock} />
            <KPICard title="Ocupacion Promedio" value={`${Math.round(tablePerformance.reduce((s, t) => s + t.ocupacion, 0) / tablePerformance.length)}%`} icon={Users} />
          </div>

          {/* Table performance chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Rendimiento por Mesa</CardTitle>
              <CardDescription>Ventas y rotaciones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tablePerformance.sort((a, b) => a.numero - b.numero)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="mesa" tick={{ fontSize: 11, fill: "#a1a1aa" }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#a1a1aa" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#a1a1aa" }} />
                    <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="ventas" name="Ventas" fill={COLORS.amber} radius={[3, 3, 0, 0]} fillOpacity={0.8} />
                    <Line yAxisId="right" type="monotone" dataKey="rotaciones" name="Rotaciones" stroke={COLORS.teal} strokeWidth={2} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Table detail */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Detalle por Mesa</CardTitle>
              <CardDescription>Estadisticas completas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-muted-foreground font-medium">Mesa</th>
                      <th className="text-right py-3 px-2 text-muted-foreground font-medium">Ventas</th>
                      <th className="text-right py-3 px-2 text-muted-foreground font-medium">Rotaciones/dia</th>
                      <th className="text-right py-3 px-2 text-muted-foreground font-medium">Tiempo Prom.</th>
                      <th className="text-right py-3 px-2 text-muted-foreground font-medium">Ocupacion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tablePerformance
                      .sort((a, b) => b.ventas - a.ventas)
                      .map((table) => (
                        <tr key={table.mesa} className="border-b border-border/50 hover:bg-secondary/30">
                          <td className="py-3 px-2 font-medium">{table.mesa}</td>
                          <td className="py-3 px-2 text-right font-medium">{formatCurrency(table.ventas)}</td>
                          <td className="py-3 px-2 text-right">{table.rotaciones}</td>
                          <td className="py-3 px-2 text-right">{table.tiempoPromedio} min</td>
                          <td className="py-3 px-2 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${table.ocupacion}%`, backgroundColor: table.ocupacion > 70 ? COLORS.teal : table.ocupacion > 40 ? COLORS.amber : COLORS.rose }} />
                              </div>
                              <span className="text-xs w-8 text-right">{table.ocupacion}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== CANCELLED ========== */}
        <TabsContent value="cancelled" className="space-y-6 mt-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <KPICard
              title="Total Cancelaciones"
              value={cancelledOrders.reduce((s, c) => s + c.cantidad, 0).toString()}
              subtitle="en el periodo"
              change="-15.2%"
              trend="up"
              icon={ShoppingBag}
            />
            <KPICard
              title="Tasa de Cancelacion"
              value={`${((cancelledOrders.reduce((s, c) => s + c.cantidad, 0) / totalOrders) * 100).toFixed(1)}%`}
              subtitle={`de ${totalOrders} ordenes`}
              icon={TrendingDown}
            />
            <KPICard
              title="Motivo Principal"
              value="Cambio de opinion"
              subtitle={`${cancelledOrders[0]?.porcentaje}% de cancelaciones`}
              icon={Users}
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Reasons pie */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Motivos de Cancelacion</CardTitle>
                <CardDescription>Distribucion por causa</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={cancelledOrders}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        dataKey="cantidad"
                        nameKey="motivo"
                        stroke="none"
                      >
                        {cancelledOrders.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-2">
                  {cancelledOrders.map((item, i) => (
                    <div key={item.motivo} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i] }} />
                        <span className="text-muted-foreground">{item.motivo}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{item.cantidad}</span>
                        <span className="text-muted-foreground">{item.porcentaje}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reasons horizontal bar */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Cancelaciones por Motivo</CardTitle>
                <CardDescription>Cantidad de ordenes canceladas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cancelledOrders} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis type="number" tick={{ fontSize: 11, fill: "#a1a1aa" }} />
                      <YAxis type="category" dataKey="motivo" tick={{ fontSize: 11, fill: "#a1a1aa" }} width={150} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="cantidad" name="Cancelaciones" radius={[0, 4, 4, 0]}>
                        {cancelledOrders.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
