"use client"

import { useState, useEffect, useMemo } from "react"
import type { OrderItem, MenuItem, Table, Order, Reservation } from "@/lib/types"
import { mockMenuItems, mockCategories, mockTables, mockOrders } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChangePasswordDialog } from "@/components/change-password"
import {
  LogOut,
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  Check,
  Clock,
  ChefHat,
  UtensilsCrossed,
  X,
  History,
  Grid3X3,
  Users,
  ArrowLeft,
  AlertTriangle,
  ArrowRightLeft,
  Receipt,
  MessageSquare,
  Timer,
  Pencil,
  Send,
  CirclePlus,
  UserRoundPlus,
  CalendarPlus,
  CalendarClock,
  Phone,
  Mail,
  MapPin,
  Baby,
  Accessibility,
  PartyPopper,
  Cake,
  Heart,
  Briefcase,
  Wine,
  Gift,
  MessageCircle,
  Bell,
  Banknote,
  KeyRound,
  UserCheck,
} from "lucide-react"
import { User } from "@/models/usuario.model"

interface WaiterInterfaceProps {
  user: User
  onLogout: () => void
}

type ViewMode = "tables" | "table-detail" | "order" | "history" | "reservations"

interface TableState extends Table {
  guests?: number
  openedAt?: Date
  waiterName?: string
  order?: Order
  reservation?: Reservation
}

// Mock reservations
const mockReservations: Reservation[] = [
  {
    id: "res-1",
    customerName: "Roberto Sanchez",
    customerPhone: "+52 55 1234 5678",
    customerEmail: "roberto@email.com",
    partySize: 4,
    tableId: "table-11",
    tableNumber: 11,
    date: new Date().toISOString().split("T")[0],
    time: "20:00",
    duration: 120,
    status: "confirmed",
    occasion: "birthday",
    specialRequests: "Pastel sorpresa a las 21:00. Decorar mesa con globos.",
    preferredZone: "interior",
    source: "phone",
    depositAmount: 500,
    depositPaid: true,
    highchair: false,
    wheelchairAccessible: false,
    createdAt: new Date(Date.now() - 86400000),
  },
  {
    id: "res-2",
    customerName: "Ana Gutierrez",
    customerPhone: "+52 55 8765 4321",
    partySize: 2,
    date: new Date().toISOString().split("T")[0],
    time: "21:30",
    duration: 90,
    status: "pending",
    occasion: "date",
    preferredZone: "terraza",
    source: "website",
    highchair: false,
    wheelchairAccessible: false,
    createdAt: new Date(Date.now() - 3600000),
  },
  {
    id: "res-3",
    customerName: "Grupo Ejecutivo Corp.",
    customerPhone: "+52 55 2222 3333",
    customerEmail: "asistente@corp.mx",
    partySize: 6,
    date: new Date().toISOString().split("T")[0],
    time: "14:00",
    duration: 150,
    status: "confirmed",
    occasion: "business",
    specialRequests: "Necesitan proyector y factura fiscal.",
    preferredZone: "privado",
    source: "phone",
    depositAmount: 1000,
    depositPaid: true,
    highchair: false,
    wheelchairAccessible: true,
    createdAt: new Date(Date.now() - 172800000),
  },
]

const emptyReservation: Omit<Reservation, "id" | "createdAt"> = {
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  partySize: 2,
  date: new Date().toISOString().split("T")[0],
  time: "20:00",
  duration: 120,
  status: "confirmed",
  occasion: undefined,
  specialRequests: "",
  internalNotes: "",
  highchair: false,
  wheelchairAccessible: false,
  preferredZone: "any",
  depositAmount: 0,
  depositPaid: false,
  source: "phone",
  remindByWhatsApp: true,
  remindBySMS: false,
}

const occasionConfig: Record<string, { icon: typeof PartyPopper; label: string }> = {
  birthday: { icon: Cake, label: "Cumpleanos" },
  anniversary: { icon: Heart, label: "Aniversario" },
  business: { icon: Briefcase, label: "Negocios" },
  date: { icon: Wine, label: "Cita" },
  family: { icon: Users, label: "Familiar" },
  other: { icon: Gift, label: "Otro" },
}

const zoneLabels: Record<string, string> = {
  interior: "Interior",
  terraza: "Terraza",
  privado: "Privado",
  barra: "Barra",
  any: "Sin preferencia",
}

export function WaiterInterface({ user, onLogout }: WaiterInterfaceProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("tables")
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [selectedTable, setSelectedTable] = useState<TableState | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({})
  const [isEditing, setIsEditing] = useState(false)
  const [showGuestsDialog, setShowGuestsDialog] = useState(false)
  const [guestCount, setGuestCount] = useState(2)
  const [showTransferDialog, setShowTransferDialog] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelItemId, setCancelItemId] = useState<string | null>(null)
  const [elapsedTimes, setElapsedTimes] = useState<Record<string, string>>({})
  const [tableFilter, setTableFilter] = useState<"all" | "available" | "occupied" | "reserved">("all")
  const [pendingTable, setPendingTable] = useState<TableState | null>(null)

  // Reservation state
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations)
  const [showReservationForm, setShowReservationForm] = useState(false)
  const [showReservationDetail, setShowReservationDetail] = useState(false)
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null)
  const [reservationForm, setReservationForm] = useState(emptyReservation)
  const [preselectedTableForReservation, setPreselectedTableForReservation] = useState<TableState | null>(null)
  const [reservationFormTab, setReservationFormTab] = useState<"info" | "details" | "options">("info")

  const tableStates: TableState[] = useMemo(() => {
    return mockTables.map((table) => {
      const order = mockOrders.find((o) => o.tableNumber === table.number)
      const reservation = reservations.find(
        (r) => r.tableNumber === table.number && r.status !== "cancelled" && r.status !== "no_show"
      )
      return {
        ...table,
        guests: order ? Math.floor(Math.random() * table.capacity) + 1 : undefined,
        openedAt: order ? order.createdAt : undefined,
        waiterName: order ? order.waiter.name : undefined,
        order,
        reservation,
      }
    })
  }, [reservations])

  useEffect(() => {
    const interval = setInterval(() => {
      const times: Record<string, string> = {}
      for (const t of tableStates) {
        if (t.openedAt) {
          const diff = Date.now() - t.openedAt.getTime()
          const mins = Math.floor(diff / 60000)
          const hrs = Math.floor(mins / 60)
          times[t.id] = hrs > 0 ? `${hrs}h ${mins % 60}m` : `${mins}m`
        }
      }
      setElapsedTimes(times)
    }, 1000)
    return () => clearInterval(interval)
  }, [tableStates])

  const filteredTables = tableStates.filter((t) => {
    if (tableFilter === "all") return true
    return t.status === tableFilter
  })

  const filteredMenuItems = mockMenuItems.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch && item.available
  })

  const occupiedCount = tableStates.filter((t) => t.status === "occupied").length
  const availableCount = tableStates.filter((t) => t.status === "available").length
  const reservedCount = tableStates.filter((t) => t.status === "reserved").length
  const todayReservations = reservations.filter(
    (r) => r.date === new Date().toISOString().split("T")[0] && r.status !== "cancelled"
  )

  // --- Table handlers ---

  const handleSelectTable = (table: TableState) => {
    setSelectedTable(table)
    if (table.status === "occupied" && table.order) {
      setViewMode("table-detail")
    } else if (table.status === "available") {
      setPendingTable(table)
      setGuestCount(2)
      setShowGuestsDialog(true)
    } else if (table.status === "reserved" && table.reservation) {
      setEditingReservation(table.reservation)
      setShowReservationDetail(true)
    }
  }

  const handleConfirmGuests = () => {
    if (!pendingTable) return
    setSelectedTable({ ...pendingTable, guests: guestCount, openedAt: new Date(), waiterName: user.name })
    setShowGuestsDialog(false)
    setPendingTable(null)
    setOrderItems([])
    setItemNotes({})
    setIsEditing(false)
    setViewMode("order")
  }

  const handleEditExistingOrder = () => {
    if (!selectedTable?.order) return
    setOrderItems(selectedTable.order.items.map((item) => ({ ...item })))
    const notes: Record<string, string> = {}
    for (const item of selectedTable.order.items) {
      if (item.notes) notes[item.id] = item.notes
    }
    setItemNotes(notes)
    setIsEditing(true)
    setViewMode("order")
  }

  const handleAddMoreItems = () => {
    if (!selectedTable?.order) return
    setOrderItems(selectedTable.order.items.map((item) => ({ ...item })))
    const notes: Record<string, string> = {}
    for (const item of selectedTable.order.items) {
      if (item.notes) notes[item.id] = item.notes
    }
    setItemNotes(notes)
    setIsEditing(true)
    setViewMode("order")
  }

  const handleAddItem = (menuItem: MenuItem) => {
    const existingItem = orderItems.find((item) => item.menuItem.id === menuItem.id)
    if (existingItem) {
      setOrderItems(
        orderItems.map((item) =>
          item.menuItem.id === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      )
    } else {
      setOrderItems([
        ...orderItems,
        {
          id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          menuItem,
          quantity: 1,
        },
      ])
    }
  }

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setOrderItems(
      orderItems
        .map((item) => {
          if (item.id === itemId) {
            const newQuantity = item.quantity + delta
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : item
          }
          return item
        })
        .filter((item) => item.quantity > 0)
    )
  }

  const handleRemoveItem = (itemId: string) => {
    if (isEditing && selectedTable?.order) {
      const isExistingItem = selectedTable.order.items.some((i) => i.id === itemId)
      if (isExistingItem) {
        setCancelItemId(itemId)
        setShowCancelDialog(true)
        return
      }
    }
    setOrderItems(orderItems.filter((item) => item.id !== itemId))
  }

  const handleConfirmCancelItem = () => {
    if (cancelItemId) {
      setOrderItems(orderItems.filter((item) => item.id !== cancelItemId))
    }
    setCancelItemId(null)
    setShowCancelDialog(false)
  }

  const handleUpdateNotes = (itemId: string, notes: string) => {
    setItemNotes({ ...itemNotes, [itemId]: notes })
  }

  const calculateTotal = () => {
    const subtotal = orderItems.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0)
    const tax = subtotal * 0.16
    return { subtotal, tax, total: subtotal + tax }
  }

  const handleConfirmOrder = () => {
    setShowConfirmDialog(true)
  }

  const handleFinalConfirm = () => {
    setShowConfirmDialog(false)
    setOrderItems([])
    setItemNotes({})
    setSelectedTable(null)
    setIsEditing(false)
    setViewMode("tables")
  }

  const handleRequestBill = () => {
    alert(`Cuenta solicitada para Mesa ${selectedTable?.number}. Enviando a caja...`)
  }

  const handleBackToTables = () => {
    setViewMode("tables")
    setSelectedTable(null)
    setOrderItems([])
    setItemNotes({})
    setIsEditing(false)
  }

  // --- Reservation handlers ---

  const handleOpenNewReservation = (table?: TableState) => {
    setEditingReservation(null)
    const form = { ...emptyReservation }
    if (table) {
      form.partySize = Math.min(2, table.capacity)
      setPreselectedTableForReservation(table)
    } else {
      setPreselectedTableForReservation(null)
    }
    setReservationForm(form)
    setReservationFormTab("info")
    setShowReservationForm(true)
  }

  const handleEditReservation = (res: Reservation) => {
    setEditingReservation(res)
    setReservationForm({
      customerName: res.customerName,
      customerPhone: res.customerPhone,
      customerEmail: res.customerEmail || "",
      partySize: res.partySize,
      date: res.date,
      time: res.time,
      duration: res.duration || 120,
      status: res.status,
      occasion: res.occasion,
      specialRequests: res.specialRequests || "",
      internalNotes: res.internalNotes || "",
      highchair: res.highchair || false,
      wheelchairAccessible: res.wheelchairAccessible || false,
      preferredZone: res.preferredZone || "any",
      depositAmount: res.depositAmount || 0,
      depositPaid: res.depositPaid || false,
      source: res.source || "phone",
      remindByWhatsApp: res.remindByWhatsApp ?? true,
      remindBySMS: res.remindBySMS ?? false,
    })
    const matchedTable = tableStates.find((t) => t.number === res.tableNumber) || null
    setPreselectedTableForReservation(matchedTable)
    setReservationFormTab("info")
    setShowReservationDetail(false)
    setShowReservationForm(true)
  }

  const handleSaveReservation = () => {
    if (!reservationForm.customerName || !reservationForm.customerPhone || !reservationForm.time) return

    const tableNumber = preselectedTableForReservation?.number
    const tableId = preselectedTableForReservation?.id

    if (editingReservation) {
      setReservations(
        reservations.map((r) =>
          r.id === editingReservation.id
            ? { ...r, ...reservationForm, tableNumber, tableId, updatedAt: new Date() }
            : r
        )
      )
    } else {
      const newRes: Reservation = {
        ...reservationForm,
        id: `res-${Date.now()}`,
        tableNumber,
        tableId,
        createdBy: user.name,
        createdAt: new Date(),
      }
      setReservations([...reservations, newRes])
    }

    setShowReservationForm(false)
    setEditingReservation(null)
    setPreselectedTableForReservation(null)
  }

  const handleCancelReservation = (resId: string) => {
    setReservations(reservations.map((r) => (r.id === resId ? { ...r, status: "cancelled" as const } : r)))
    setShowReservationDetail(false)
  }

  const handleSeatReservation = (res: Reservation) => {
    // Mark as seated and open table
    setReservations(reservations.map((r) => (r.id === res.id ? { ...r, status: "seated" as const } : r)))
    setShowReservationDetail(false)
    const table = tableStates.find((t) => t.number === res.tableNumber)
    if (table) {
      setPendingTable(table)
      setGuestCount(res.partySize)
      setShowGuestsDialog(true)
    }
  }

  const updateReservationField = (field: string, value: unknown) => {
    setReservationForm((prev) => ({ ...prev, [field]: value }))
  }

  const totals = calculateTotal()
  const originalItemIds = selectedTable?.order?.items.map((i) => i.id) || []
  const availableTablesForReservation = tableStates.filter((t) => t.status === "available")

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {(viewMode === "table-detail" || viewMode === "order") && (
              <Button variant="ghost" size="icon" onClick={handleBackToTables} className="mr-1">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            {viewMode === "reservations" && (
              <Button variant="ghost" size="icon" onClick={() => setViewMode("tables")} className="mr-1">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <ChefHat className="w-6 h-6 text-primary" />
            <div>
              <h1 className="font-bold text-lg leading-tight">RestoPOS</h1>
              <p className="text-xs text-muted-foreground">Hola, {user.name.split(" ")[0]}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(viewMode === "tables" || viewMode === "history" || viewMode === "reservations") && (
              <>
                <Button
                  variant={viewMode === "tables" ? "default" : "outline"}
                  size="sm"
                  className={viewMode !== "tables" ? "bg-transparent" : ""}
                  onClick={() => setViewMode("tables")}
                >
                  <Grid3X3 className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Mesas</span>
                </Button>
                <Button
                  variant={viewMode === "reservations" ? "default" : "outline"}
                  size="sm"
                  className={viewMode !== "reservations" ? "bg-transparent" : ""}
                  onClick={() => setViewMode("reservations")}
                >
                  <CalendarClock className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Reservas</span>
                  {todayReservations.length > 0 && (
                    <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                      {todayReservations.length}
                    </Badge>
                  )}
                </Button>
                <Button
                  variant={viewMode === "history" ? "default" : "outline"}
                  size="sm"
                  className={viewMode !== "history" ? "bg-transparent" : ""}
                  onClick={() => setViewMode("history")}
                >
                  <History className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Historial</span>
                </Button>
              </>
            )}
            {viewMode === "table-detail" && selectedTable && (
              <Badge variant="outline" className="text-sm px-3 py-1">
                Mesa {selectedTable.number}
              </Badge>
            )}
            {viewMode === "order" && selectedTable && (
              <Badge variant="outline" className="text-sm px-3 py-1">
                Mesa {selectedTable.number} {isEditing ? "- Editando" : "- Nuevo"}
              </Badge>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="bg-transparent gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-[10px] font-medium text-primary">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground font-normal">Mesero</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowChangePassword(true)}>
                  <KeyRound className="w-4 h-4 mr-2" />
                  Cambiar Contraseña
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* ========== TABLES VIEW ========== */}
        {viewMode === "tables" && (
          <div className="p-4">
            {/* Summary bar */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              <button
                onClick={() => setTableFilter(tableFilter === "available" ? "all" : "available")}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  tableFilter === "available"
                    ? "border-success bg-success/15"
                    : "border-border bg-card hover:border-success/50"
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                  <span className="text-lg font-bold text-success">{availableCount}</span>
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium">Disponibles</p>
                  <p className="text-xs text-muted-foreground">Listas</p>
                </div>
              </button>
              <button
                onClick={() => setTableFilter(tableFilter === "occupied" ? "all" : "occupied")}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  tableFilter === "occupied"
                    ? "border-warning bg-warning/15"
                    : "border-border bg-card hover:border-warning/50"
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                  <span className="text-lg font-bold text-warning">{occupiedCount}</span>
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium">Ocupadas</p>
                  <p className="text-xs text-muted-foreground">Activas</p>
                </div>
              </button>
              <button
                onClick={() => setTableFilter(tableFilter === "reserved" ? "all" : "reserved")}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  tableFilter === "reserved"
                    ? "border-info bg-info/15"
                    : "border-border bg-card hover:border-info/50"
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-info/20 flex items-center justify-center">
                  <span className="text-lg font-bold text-info">{reservedCount}</span>
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium">Reservadas</p>
                  <p className="text-xs text-muted-foreground">Pendientes</p>
                </div>
              </button>
              <button
                onClick={() => handleOpenNewReservation()}
                className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 hover:border-primary transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
                  <CalendarPlus className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-primary">Reservar</p>
                  <p className="text-xs text-muted-foreground">Nueva</p>
                </div>
              </button>
            </div>

            {/* Tables grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {filteredTables.map((table) => {
                const isOccupied = table.status === "occupied"
                const isReserved = table.status === "reserved"
                const isAvailable = table.status === "available"

                return (
                  <button
                    key={table.id}
                    onClick={() => handleSelectTable(table)}
                    className={`relative rounded-xl border-2 p-3 flex flex-col items-center justify-center transition-all active:scale-95 min-h-[130px] ${
                      isAvailable
                        ? "border-success/60 bg-success/5 hover:bg-success/15 hover:border-success"
                        : isOccupied
                          ? "border-warning/60 bg-warning/5 hover:bg-warning/15 hover:border-warning"
                          : "border-info/60 bg-info/5 hover:bg-info/15 hover:border-info cursor-pointer"
                    }`}
                  >
                    <div
                      className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ${
                        isAvailable ? "bg-success" : isOccupied ? "bg-warning animate-pulse" : "bg-info"
                      }`}
                    />

                    <span className="text-2xl font-bold">{table.number}</span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Users className="w-3 h-3" />
                      <span>{table.capacity}</span>
                    </div>

                    {isOccupied && table.order && (
                      <div className="mt-2 space-y-1 w-full">
                        <Badge
                          variant="outline"
                          className={`w-full justify-center text-[10px] ${
                            table.order.status === "preparing"
                              ? "border-warning/50 text-warning"
                              : table.order.status === "ready"
                                ? "border-success/50 text-success"
                                : "border-info/50 text-info"
                          }`}
                        >
                          {table.order.status === "preparing"
                            ? "Preparando"
                            : table.order.status === "ready"
                              ? "Listo"
                              : "Registrado"}
                        </Badge>
                        <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                          <Timer className="w-2.5 h-2.5" />
                          <span>{elapsedTimes[table.id] || "0m"}</span>
                        </div>
                      </div>
                    )}

                    {isReserved && table.reservation && (
                      <div className="mt-2 space-y-1 w-full">
                        <Badge variant="outline" className="w-full justify-center text-[10px] border-info/50 text-info">
                          <CalendarClock className="w-2.5 h-2.5 mr-1" />
                          {table.reservation.time}
                        </Badge>
                        <p className="text-[10px] text-muted-foreground text-center truncate px-1">
                          {table.reservation.customerName}
                        </p>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {tableFilter !== "all" && (
              <div className="flex justify-center mt-4">
                <Button variant="ghost" size="sm" onClick={() => setTableFilter("all")}>
                  Mostrar todas las mesas
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ========== RESERVATIONS LIST VIEW ========== */}
        {viewMode === "reservations" && (
          <div className="p-4 max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold">Reservaciones de Hoy</h2>
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString("es-MX", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
              <Button onClick={() => handleOpenNewReservation()}>
                <CalendarPlus className="w-4 h-4 mr-2" />
                Nueva Reserva
              </Button>
            </div>

            {todayReservations.length === 0 ? (
              <Card>
                <CardContent className="py-12 flex flex-col items-center text-center">
                  <CalendarClock className="w-12 h-12 text-muted-foreground/40 mb-3" />
                  <p className="font-medium text-muted-foreground">No hay reservaciones para hoy</p>
                  <p className="text-sm text-muted-foreground mt-1">Crea una nueva reservacion con el boton de arriba</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {todayReservations
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((res) => {
                    const OccasionIcon = res.occasion ? occasionConfig[res.occasion]?.icon : undefined
                    const isPast = (() => {
                      const [h, m] = res.time.split(":").map(Number)
                      const now = new Date()
                      return now.getHours() > h || (now.getHours() === h && now.getMinutes() > m + 15)
                    })()

                    return (
                      <Card
                        key={res.id}
                        className={`cursor-pointer transition-all hover:border-primary/50 ${
                          res.status === "seated" ? "border-success/30 bg-success/5" : 
                          isPast && res.status !== "seated" ? "opacity-60" : ""
                        }`}
                        onClick={() => {
                          setEditingReservation(res)
                          setShowReservationDetail(true)
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className="w-14 h-14 rounded-xl bg-info/10 flex flex-col items-center justify-center border border-info/20">
                                <span className="text-lg font-bold text-info leading-tight">{res.time.split(":")[0]}</span>
                                <span className="text-[10px] text-info/80">:{res.time.split(":")[1]}</span>
                              </div>
                              <div>
                                <h3 className="font-semibold">{res.customerName}</h3>
                                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Users className="w-3.5 h-3.5" />
                                    {res.partySize}
                                  </span>
                                  {res.tableNumber && (
                                    <span className="flex items-center gap-1">
                                      <Grid3X3 className="w-3.5 h-3.5" />
                                      Mesa {res.tableNumber}
                                    </span>
                                  )}
                                  {res.preferredZone && res.preferredZone !== "any" && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-3.5 h-3.5" />
                                      {zoneLabels[res.preferredZone]}
                                    </span>
                                  )}
                                </div>
                                {res.specialRequests && (
                                  <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1">
                                    <MessageSquare className="w-3 h-3 shrink-0 mt-0.5" />
                                    <span className="line-clamp-1">{res.specialRequests}</span>
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge
                                variant="outline"
                                className={
                                  res.status === "confirmed"
                                    ? "border-success/50 text-success"
                                    : res.status === "pending"
                                      ? "border-warning/50 text-warning"
                                      : res.status === "seated"
                                        ? "border-primary/50 text-primary"
                                        : "border-muted text-muted-foreground"
                                }
                              >
                                {res.status === "confirmed" ? "Confirmada" : res.status === "pending" ? "Pendiente" : res.status === "seated" ? "Sentados" : res.status}
                              </Badge>
                              {OccasionIcon && (
                                <OccasionIcon className="w-4 h-4 text-muted-foreground" />
                              )}
                              {res.depositPaid && (
                                <span className="text-[10px] text-success flex items-center gap-0.5">
                                  <Banknote className="w-3 h-3" /> Deposito
                                </span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
              </div>
            )}
          </div>
        )}

        {/* ========== TABLE DETAIL VIEW (occupied) ========== */}
        {viewMode === "table-detail" && selectedTable && selectedTable.order && (
          <div className="p-4 max-w-3xl mx-auto">
            <Card className="mb-4">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-warning/15 border-2 border-warning flex items-center justify-center">
                      <span className="text-2xl font-bold text-warning">{selectedTable.number}</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Mesa {selectedTable.number}</h2>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {selectedTable.guests || "?"} comensales
                        </span>
                        <span className="flex items-center gap-1">
                          <Timer className="w-3.5 h-3.5" />
                          {elapsedTimes[selectedTable.id] || "0m"}
                        </span>
                        <span className="flex items-center gap-1">
                          <ChefHat className="w-3.5 h-3.5" />
                          {selectedTable.waiterName || user.name}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge
                    className={`text-sm px-3 py-1 ${
                      selectedTable.order.status === "preparing"
                        ? "bg-warning/15 text-warning border-warning/30"
                        : selectedTable.order.status === "ready"
                          ? "bg-success/15 text-success border-success/30"
                          : "bg-info/15 text-info border-info/30"
                    }`}
                    variant="outline"
                  >
                    {selectedTable.order.status === "preparing"
                      ? "En preparacion"
                      : selectedTable.order.status === "ready"
                        ? "Listo para servir"
                        : "Registrado"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <Button variant="outline" className="h-auto py-3 flex-col gap-1.5 bg-transparent" onClick={handleAddMoreItems}>
                <CirclePlus className="w-5 h-5 text-primary" />
                <span className="text-xs">Agregar Items</span>
              </Button>
              <Button variant="outline" className="h-auto py-3 flex-col gap-1.5 bg-transparent" onClick={handleEditExistingOrder}>
                <Pencil className="w-5 h-5 text-info" />
                <span className="text-xs">Editar Pedido</span>
              </Button>
              <Button variant="outline" className="h-auto py-3 flex-col gap-1.5 bg-transparent" onClick={() => setShowTransferDialog(true)}>
                <ArrowRightLeft className="w-5 h-5 text-muted-foreground" />
                <span className="text-xs">Transferir Mesa</span>
              </Button>
              <Button variant="outline" className="h-auto py-3 flex-col gap-1.5 bg-transparent" onClick={handleRequestBill}>
                <Receipt className="w-5 h-5 text-success" />
                <span className="text-xs">Pedir Cuenta</span>
              </Button>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Pedido Actual</CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {selectedTable.order.items.length} {selectedTable.order.items.length === 1 ? "item" : "items"}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedTable.order.items.map((item) => (
                    <div key={item.id} className="flex items-start justify-between p-3 rounded-lg bg-secondary/40">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-sm font-bold text-primary">{item.quantity}x</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{item.menuItem.name}</p>
                          <p className="text-xs text-muted-foreground">${item.menuItem.price.toFixed(2)} c/u</p>
                          {item.notes && (
                            <div className="flex items-start gap-1.5 mt-1.5">
                              <MessageSquare className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
                              <span className="text-xs text-muted-foreground italic">{item.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="font-bold text-sm whitespace-nowrap">${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 pt-4 border-t border-border space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${selectedTable.order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">IVA (16%)</span>
                    <span>${selectedTable.order.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-1">
                    <span>Total</span>
                    <span className="text-primary">${selectedTable.order.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-5 flex gap-3">
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <Printer className="w-4 h-4 mr-2" />
                    Reimprimir
                  </Button>
                  <Button className="flex-1" onClick={handleRequestBill}>
                    <Receipt className="w-4 h-4 mr-2" />
                    Solicitar Cuenta
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ========== ORDER VIEW (new or edit) ========== */}
        {viewMode === "order" && selectedTable && (
          <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)]">
            <div className="flex-1 flex flex-col min-w-0 border-r border-border">
              {isEditing && selectedTable.order && (
                <div className="px-3 py-2 bg-info/10 border-b border-info/20 flex items-center gap-2">
                  <Pencil className="w-3.5 h-3.5 text-info" />
                  <span className="text-xs text-info font-medium">Editando pedido existente - Los items nuevos se resaltaran</span>
                </div>
              )}

              <div className="flex gap-2 p-3 overflow-x-auto border-b border-border bg-card">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  size="sm"
                  className={selectedCategory !== "all" ? "bg-transparent" : ""}
                  onClick={() => setSelectedCategory("all")}
                >
                  Todos
                </Button>
                {mockCategories.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? "default" : "outline"}
                    size="sm"
                    className={`whitespace-nowrap ${selectedCategory !== cat.id ? "bg-transparent" : ""}`}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    <span className="mr-1">{cat.icon}</span>
                    {cat.name}
                  </Button>
                ))}
              </div>

              <div className="p-3 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar producto..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-auto p-3">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredMenuItems.map((item) => {
                    const inOrder = orderItems.find((oi) => oi.menuItem.id === item.id)
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleAddItem(item)}
                        className={`relative p-3 rounded-xl border bg-card text-left transition-all active:scale-95 ${
                          inOrder
                            ? "border-primary ring-1 ring-primary/30"
                            : "border-border hover:border-primary/50 hover:bg-primary/5"
                        }`}
                      >
                        {inOrder && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-xs font-bold text-primary-foreground">{inOrder.quantity}</span>
                          </div>
                        )}
                        <div className="w-full aspect-[4/3] rounded-lg bg-secondary/60 flex items-center justify-center mb-2">
                          <UtensilsCrossed className="w-7 h-7 text-muted-foreground" />
                        </div>
                        <h3 className="font-medium text-sm truncate">{item.name}</h3>
                        {item.description && (
                          <p className="text-[11px] text-muted-foreground truncate mt-0.5">{item.description}</p>
                        )}
                        <p className="text-primary font-bold mt-1">${item.price.toFixed(2)}</p>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="w-full lg:w-[400px] flex flex-col bg-card">
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold">Mesa {selectedTable.number}</h2>
                    <p className="text-sm text-muted-foreground">
                      {isEditing ? "Modificando pedido" : "Nuevo pedido"}
                      {selectedTable.guests && (
                        <span className="ml-2 inline-flex items-center gap-1">
                          <Users className="w-3 h-3" /> {selectedTable.guests}
                        </span>
                      )}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (isEditing && selectedTable.order) {
                        setViewMode("table-detail")
                        setIsEditing(false)
                      } else {
                        handleBackToTables()
                      }
                    }}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-4">
                {orderItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                    <UtensilsCrossed className="w-12 h-12 mb-3 opacity-40" />
                    <p className="font-medium">Sin productos</p>
                    <p className="text-sm mt-1">Selecciona del menu para agregar</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orderItems.map((item) => {
                      const isNew = isEditing && !originalItemIds.includes(item.id)
                      return (
                        <div
                          key={item.id}
                          className={`rounded-xl border p-3 transition-all ${
                            isNew ? "border-primary/40 bg-primary/5" : "border-border bg-secondary/30"
                          }`}
                        >
                          {isNew && (
                            <div className="flex items-center gap-1.5 mb-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                              <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">Nuevo</span>
                            </div>
                          )}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{item.menuItem.name}</h4>
                              <p className="text-sm text-muted-foreground">${item.menuItem.price.toFixed(2)} c/u</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent" onClick={() => handleUpdateQuantity(item.id, -1)}>
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-8 text-center font-bold">{item.quantity}</span>
                              <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent" onClick={() => handleUpdateQuantity(item.id, 1)}>
                                <Plus className="w-3 h-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleRemoveItem(item.id)}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="mt-2">
                            <Textarea
                              placeholder="Notas (sin cebolla, termino medio...)"
                              className="text-sm min-h-[48px] resize-none"
                              value={itemNotes[item.id] || ""}
                              onChange={(e) => handleUpdateNotes(item.id, e.target.value)}
                            />
                          </div>
                          <div className="flex justify-end mt-2">
                            <span className="font-bold text-primary text-sm">${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {orderItems.length > 0 && (
                <div className="p-4 border-t border-border bg-secondary/20">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal ({orderItems.reduce((s, i) => s + i.quantity, 0)} items)</span>
                      <span>${totals.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">IVA (16%)</span>
                      <span>${totals.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">${totals.total.toFixed(2)}</span>
                    </div>
                  </div>
                  <Button className="w-full h-12 text-base font-semibold" onClick={handleConfirmOrder}>
                    <Send className="w-5 h-5 mr-2" />
                    {isEditing ? "Actualizar Pedido" : "Enviar a Cocina"}
                  </Button>
                  <p className="text-[11px] text-center text-muted-foreground mt-2">
                    Se imprimiran tickets en cocina y barra automaticamente
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========== HISTORY VIEW ========== */}
        {viewMode === "history" && (
          <div className="p-4 max-w-3xl mx-auto">
            <h2 className="text-xl font-bold mb-4">Mis Pedidos del Dia</h2>
            <div className="space-y-3">
              {mockOrders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <span className="text-lg font-bold text-primary">{order.tableNumber}</span>
                        </div>
                        <div>
                          <h3 className="font-medium">Mesa {order.tableNumber}</h3>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {order.createdAt.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          order.status === "preparing"
                            ? "border-warning/40 text-warning"
                            : order.status === "ready"
                              ? "border-success/40 text-success"
                              : order.status === "registered"
                                ? "border-info/40 text-info"
                                : "border-muted text-muted-foreground"
                        }
                      >
                        {order.status === "preparing"
                          ? "Preparando"
                          : order.status === "ready"
                            ? "Listo"
                            : order.status === "registered"
                              ? "Registrado"
                              : order.status === "paid"
                                ? "Pagado"
                                : order.status}
                      </Badge>
                    </div>
                    <div className="space-y-1.5 mb-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {item.quantity}x {item.menuItem.name}
                          </span>
                          <span>${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <span className="font-bold">Total: ${order.total.toFixed(2)}</span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="bg-transparent">
                          <Printer className="w-4 h-4 mr-1" />
                          Reimprimir
                        </Button>
                        {(order.status === "registered" || order.status === "preparing") && (
                          <Button variant="outline" size="sm" className="bg-transparent">
                            <Pencil className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ========== DIALOGS ========== */}

      {/* Guests count dialog */}
      <Dialog open={showGuestsDialog} onOpenChange={setShowGuestsDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Abrir Mesa {pendingTable?.number}</DialogTitle>
            <DialogDescription>Indica cuantos comensales se sentaran en la mesa</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" className="h-12 w-12 bg-transparent" onClick={() => setGuestCount(Math.max(1, guestCount - 1))}>
                <Minus className="w-5 h-5" />
              </Button>
              <div className="flex flex-col items-center">
                <span className="text-4xl font-bold">{guestCount}</span>
                <span className="text-sm text-muted-foreground">comensales</span>
              </div>
              <Button variant="outline" size="icon" className="h-12 w-12 bg-transparent" onClick={() => setGuestCount(Math.min(pendingTable?.capacity || 10, guestCount + 1))}>
                <Plus className="w-5 h-5" />
              </Button>
            </div>
            {pendingTable && (
              <p className="text-xs text-muted-foreground">Capacidad maxima: {pendingTable.capacity} personas</p>
            )}
            <div className="flex gap-2">
              {Array.from({ length: Math.min(pendingTable?.capacity || 6, 6) }, (_, i) => i + 1).map((n) => (
                <Button
                  key={n}
                  variant={guestCount === n ? "default" : "outline"}
                  size="sm"
                  className={guestCount !== n ? "bg-transparent" : ""}
                  onClick={() => setGuestCount(n)}
                >
                  {n}
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="bg-transparent" onClick={() => setShowGuestsDialog(false)}>Cancelar</Button>
            <Button onClick={handleConfirmGuests}>
              <UserRoundPlus className="w-4 h-4 mr-2" />
              Abrir Mesa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer table dialog */}
      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Transferir Mesa {selectedTable?.number}</DialogTitle>
            <DialogDescription>Selecciona la mesa destino para mover el pedido</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-2 py-4">
            {tableStates
              .filter((t) => t.status === "available" && t.id !== selectedTable?.id)
              .map((t) => (
                <button
                  key={t.id}
                  className="p-3 rounded-xl border-2 border-success/50 bg-success/5 hover:bg-success/15 hover:border-success transition-all flex flex-col items-center"
                  onClick={() => {
                    alert(`Pedido transferido de Mesa ${selectedTable?.number} a Mesa ${t.number}`)
                    setShowTransferDialog(false)
                    handleBackToTables()
                  }}
                >
                  <span className="text-lg font-bold">{t.number}</span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <Users className="w-2.5 h-2.5" /> {t.capacity}
                  </span>
                </button>
              ))}
          </div>
          <DialogFooter>
            <Button variant="outline" className="bg-transparent" onClick={() => setShowTransferDialog(false)}>Cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm order dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Confirmar cambios" : "Confirmar pedido"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? `Se actualizara el pedido de la Mesa ${selectedTable?.number}`
                : `Se enviara el pedido a cocina para la Mesa ${selectedTable?.number}`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-3">
            <div className="rounded-lg bg-secondary/40 p-3 space-y-1.5 max-h-48 overflow-auto">
              {orderItems.map((item) => {
                const isNew = isEditing && !originalItemIds.includes(item.id)
                return (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className={isNew ? "text-primary font-medium" : "text-muted-foreground"}>
                      {isNew && "+ "}{item.quantity}x {item.menuItem.name}
                    </span>
                    <span>${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between font-bold text-lg mt-3 pt-3 border-t border-border">
              <span>Total</span>
              <span className="text-primary">${totals.total.toFixed(2)}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="bg-transparent" onClick={() => setShowConfirmDialog(false)}>Revisar</Button>
            <Button onClick={handleFinalConfirm}>
              <Check className="w-4 h-4 mr-2" />
              {isEditing ? "Actualizar" : "Enviar a Cocina"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel item confirmation dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Cancelar producto
            </DialogTitle>
            <DialogDescription>
              Este producto ya fue enviado a cocina. Confirma que deseas cancelarlo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" className="bg-transparent" onClick={() => setShowCancelDialog(false)}>No, mantener</Button>
            <Button variant="destructive" onClick={handleConfirmCancelItem}>Si, cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========== RESERVATION DETAIL DIALOG ========== */}
      <Dialog open={showReservationDetail} onOpenChange={setShowReservationDetail}>
        <DialogContent className="max-w-md">
          {editingReservation && (() => {
            const res = editingReservation
            const OccasionIcon = res.occasion ? occasionConfig[res.occasion]?.icon : undefined
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <CalendarClock className="w-5 h-5 text-info" />
                    Reservacion
                  </DialogTitle>
                  <DialogDescription>Detalles de la reservacion</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  {/* Customer info */}
                  <div className="rounded-xl bg-secondary/40 p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-lg">{res.customerName}</h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{res.customerPhone}</span>
                        </div>
                        {res.customerEmail && (
                          <div className="flex items-center gap-2 mt-0.5 text-sm text-muted-foreground">
                            <Mail className="w-3.5 h-3.5" />
                            <span>{res.customerEmail}</span>
                          </div>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          res.status === "confirmed" ? "border-success/50 text-success" :
                          res.status === "pending" ? "border-warning/50 text-warning" :
                          res.status === "seated" ? "border-primary/50 text-primary" :
                          "border-muted text-muted-foreground"
                        }
                      >
                        {res.status === "confirmed" ? "Confirmada" : res.status === "pending" ? "Pendiente" : res.status === "seated" ? "Sentados" : res.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{res.time}</p>
                          <p className="text-xs text-muted-foreground">{res.duration} min</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{res.partySize} personas</p>
                          <p className="text-xs text-muted-foreground">{res.tableNumber ? `Mesa ${res.tableNumber}` : "Sin mesa"}</p>
                        </div>
                      </div>
                    </div>

                    {(res.occasion || res.preferredZone) && (
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                        {res.occasion && OccasionIcon && (
                          <Badge variant="secondary" className="gap-1">
                            <OccasionIcon className="w-3 h-3" />
                            {occasionConfig[res.occasion]?.label}
                          </Badge>
                        )}
                        {res.preferredZone && res.preferredZone !== "any" && (
                          <Badge variant="secondary" className="gap-1">
                            <MapPin className="w-3 h-3" />
                            {zoneLabels[res.preferredZone]}
                          </Badge>
                        )}
                        {res.highchair && (
                          <Badge variant="secondary" className="gap-1">
                            <Baby className="w-3 h-3" />
                            Periquera
                          </Badge>
                        )}
                        {res.wheelchairAccessible && (
                          <Badge variant="secondary" className="gap-1">
                            <Accessibility className="w-3 h-3" />
                            Accesible
                          </Badge>
                        )}
                      </div>
                    )}

                    {res.depositAmount && res.depositAmount > 0 && (
                      <div className="flex items-center justify-between pt-2 border-t border-border text-sm">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Banknote className="w-4 h-4" />
                          Deposito: ${res.depositAmount.toFixed(2)}
                        </span>
                        <Badge variant={res.depositPaid ? "default" : "secondary"} className={res.depositPaid ? "bg-success text-success-foreground" : ""}>
                          {res.depositPaid ? "Pagado" : "Pendiente"}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {res.specialRequests && (
                    <div className="rounded-xl bg-warning/5 border border-warning/20 p-3">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-warning" />
                        <span className="text-xs font-semibold text-warning uppercase tracking-wider">Solicitudes Especiales</span>
                      </div>
                      <p className="text-sm">{res.specialRequests}</p>
                    </div>
                  )}
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                  {res.status !== "seated" && res.status !== "cancelled" && (
                    <>
                      <Button variant="outline" className="bg-transparent text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => handleCancelReservation(res.id)}>
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                      <Button variant="outline" className="bg-transparent" onClick={() => handleEditReservation(res)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      <Button onClick={() => handleSeatReservation(res)}>
                        <UserCheck className="w-4 h-4 mr-2" />
                        Sentar Cliente
                      </Button>
                    </>
                  )}
                  {res.status === "seated" && (
                    <Button variant="outline" className="bg-transparent" onClick={() => setShowReservationDetail(false)}>
                      Cerrar
                    </Button>
                  )}
                </DialogFooter>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>

      {/* ========== RESERVATION FORM DIALOG ========== */}
      <Dialog open={showReservationForm} onOpenChange={setShowReservationForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarPlus className="w-5 h-5 text-primary" />
              {editingReservation ? "Editar Reservacion" : "Nueva Reservacion"}
            </DialogTitle>
            <DialogDescription>
              {editingReservation ? "Modifica los datos de la reservacion" : "Completa los datos para crear una reservacion"}
            </DialogDescription>
          </DialogHeader>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-secondary/50 rounded-lg">
            {(
              [
                { id: "info" as const, label: "Contacto" },
                { id: "details" as const, label: "Detalles" },
                { id: "options" as const, label: "Opciones" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setReservationFormTab(tab.id)}
                className={`flex-1 text-sm font-medium py-2 px-3 rounded-md transition-all ${
                  reservationFormTab === tab.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-auto space-y-4 py-2">
            {/* TAB: Info (Contact) */}
            {reservationFormTab === "info" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Nombre del cliente *</Label>
                  <Input
                    placeholder="Nombre completo"
                    value={reservationForm.customerName}
                    onChange={(e) => updateReservationField("customerName", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Telefono *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        className="pl-9"
                        placeholder="+52 55 1234 5678"
                        value={reservationForm.customerPhone}
                        onChange={(e) => updateReservationField("customerPhone", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        className="pl-9"
                        placeholder="correo@email.com"
                        type="email"
                        value={reservationForm.customerEmail}
                        onChange={(e) => updateReservationField("customerEmail", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Origen de reserva</Label>
                  <Select
                    value={reservationForm.source || "phone"}
                    onValueChange={(v) => updateReservationField("source", v)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phone">Telefono</SelectItem>
                      <SelectItem value="walk_in">En persona</SelectItem>
                      <SelectItem value="website">Sitio web</SelectItem>
                      <SelectItem value="app">App</SelectItem>
                      <SelectItem value="third_party">Terceros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3 pt-2">
                  <Label className="text-sm font-medium">Recordatorios</Label>
                  <div className="flex items-center justify-between rounded-lg bg-secondary/40 p-3">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-success" />
                      <span className="text-sm">WhatsApp</span>
                    </div>
                    <Switch
                      checked={reservationForm.remindByWhatsApp}
                      onCheckedChange={(v) => updateReservationField("remindByWhatsApp", v)}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-secondary/40 p-3">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-info" />
                      <span className="text-sm">SMS</span>
                    </div>
                    <Switch
                      checked={reservationForm.remindBySMS}
                      onCheckedChange={(v) => updateReservationField("remindBySMS", v)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Details */}
            {reservationFormTab === "details" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Fecha *</Label>
                    <Input
                      type="date"
                      value={reservationForm.date}
                      onChange={(e) => updateReservationField("date", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Hora *</Label>
                    <Input
                      type="time"
                      value={reservationForm.time}
                      onChange={(e) => updateReservationField("time", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Comensales *</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 bg-transparent"
                        onClick={() => updateReservationField("partySize", Math.max(1, (reservationForm.partySize || 2) - 1))}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <div className="flex-1 text-center">
                        <span className="text-2xl font-bold">{reservationForm.partySize}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 bg-transparent"
                        onClick={() => updateReservationField("partySize", Math.min(20, (reservationForm.partySize || 2) + 1))}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Duracion (min)</Label>
                    <Select
                      value={String(reservationForm.duration || 120)}
                      onValueChange={(v) => updateReservationField("duration", Number(v))}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="60">1 hora</SelectItem>
                        <SelectItem value="90">1.5 horas</SelectItem>
                        <SelectItem value="120">2 horas</SelectItem>
                        <SelectItem value="150">2.5 horas</SelectItem>
                        <SelectItem value="180">3 horas</SelectItem>
                        <SelectItem value="240">4 horas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Table selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Mesa asignada</Label>
                  <div className="grid grid-cols-6 gap-2">
                    <button
                      onClick={() => setPreselectedTableForReservation(null)}
                      className={`p-2 rounded-lg border-2 text-center transition-all text-xs ${
                        !preselectedTableForReservation
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      Auto
                    </button>
                    {availableTablesForReservation.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setPreselectedTableForReservation(t)}
                        className={`p-2 rounded-lg border-2 text-center transition-all ${
                          preselectedTableForReservation?.id === t.id
                            ? "border-primary bg-primary/10"
                            : "border-success/40 bg-success/5 hover:border-success"
                        }`}
                      >
                        <span className="text-sm font-bold">{t.number}</span>
                        <span className="text-[10px] text-muted-foreground flex items-center justify-center gap-0.5">
                          <Users className="w-2.5 h-2.5" />{t.capacity}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Zona preferida</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {(["any", "interior", "terraza", "privado", "barra"] as const).map((zone) => (
                      <button
                        key={zone}
                        onClick={() => updateReservationField("preferredZone", zone)}
                        className={`p-2 rounded-lg border text-xs font-medium text-center transition-all ${
                          reservationForm.preferredZone === zone
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        {zoneLabels[zone]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Ocasion</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(occasionConfig).map(([key, config]) => {
                      const Icon = config.icon
                      return (
                        <button
                          key={key}
                          onClick={() => updateReservationField("occasion", reservationForm.occasion === key ? undefined : key)}
                          className={`p-2.5 rounded-lg border flex items-center gap-2 text-sm transition-all ${
                            reservationForm.occasion === key
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {config.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Options */}
            {reservationFormTab === "options" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Solicitudes especiales</Label>
                  <Textarea
                    placeholder="Pastel sorpresa, decoracion, dieta especial, alergias..."
                    className="min-h-[80px]"
                    value={reservationForm.specialRequests}
                    onChange={(e) => updateReservationField("specialRequests", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Notas internas</Label>
                  <Textarea
                    placeholder="Notas para el equipo (no visibles al cliente)..."
                    className="min-h-[60px]"
                    value={reservationForm.internalNotes}
                    onChange={(e) => updateReservationField("internalNotes", e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Necesidades especiales</Label>
                  <div className="flex items-center justify-between rounded-lg bg-secondary/40 p-3">
                    <div className="flex items-center gap-2">
                      <Baby className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Periquera / silla para bebe</span>
                    </div>
                    <Switch
                      checked={reservationForm.highchair}
                      onCheckedChange={(v) => updateReservationField("highchair", v)}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-secondary/40 p-3">
                    <div className="flex items-center gap-2">
                      <Accessibility className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Acceso para silla de ruedas</span>
                    </div>
                    <Switch
                      checked={reservationForm.wheelchairAccessible}
                      onCheckedChange={(v) => updateReservationField("wheelchairAccessible", v)}
                    />
                  </div>
                </div>

                {/* Deposit */}
                <div className="space-y-3 pt-2 border-t border-border">
                  <Label className="text-sm font-medium">Deposito / Anticipo</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Monto</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                        <Input
                          type="number"
                          className="pl-7"
                          placeholder="0.00"
                          value={reservationForm.depositAmount || ""}
                          onChange={(e) => updateReservationField("depositAmount", Number(e.target.value))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Estado</Label>
                      <div className="flex items-center justify-between rounded-lg border p-3 h-10">
                        <span className="text-sm">{reservationForm.depositPaid ? "Pagado" : "Pendiente"}</span>
                        <Switch
                          checked={reservationForm.depositPaid}
                          onCheckedChange={(v) => updateReservationField("depositPaid", v)}
                        />
                      </div>
                    </div>
                  </div>
                  {/* Quick amounts */}
                  <div className="flex gap-2">
                    {[200, 500, 1000, 1500].map((amount) => (
                      <Button
                        key={amount}
                        variant={reservationForm.depositAmount === amount ? "default" : "outline"}
                        size="sm"
                        className={reservationForm.depositAmount !== amount ? "bg-transparent" : ""}
                        onClick={() => updateReservationField("depositAmount", amount)}
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Status */}
                {editingReservation && (
                  <div className="space-y-2 pt-2 border-t border-border">
                    <Label className="text-sm font-medium">Estado de la reservacion</Label>
                    <Select
                      value={reservationForm.status}
                      onValueChange={(v) => updateReservationField("status", v)}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="confirmed">Confirmada</SelectItem>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="cancelled">Cancelada</SelectItem>
                        <SelectItem value="no_show">No se presento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="pt-2 border-t border-border">
            <Button variant="outline" className="bg-transparent" onClick={() => setShowReservationForm(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveReservation}
              disabled={!reservationForm.customerName || !reservationForm.customerPhone || !reservationForm.time}
            >
              <Check className="w-4 h-4 mr-2" />
              {editingReservation ? "Guardar Cambios" : "Crear Reservacion"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ChangePasswordDialog
        open={showChangePassword}
        onOpenChange={setShowChangePassword}
        currentPasswordValue="mesero123"
      />
    </div>
  )
}
