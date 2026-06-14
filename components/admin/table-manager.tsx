"use client"

import { useState } from "react"
// import type { Table, TableShape, TableZone } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Plus,
  Edit,
  Trash2,
  Search,
  LayoutGrid,
  Users,
  MapPin,
  Settings2,
  Calendar,
  Armchair,
  Square,
  Circle,
  RectangleHorizontal,
  Plug,
  Wifi,
  Accessibility,
  Baby,
  Umbrella,
  Heater,
  Crown,
  Combine,
  Clock,
  Printer,
  Palette,
  Eye,
  EyeOff,
  Wrench,
  AlertTriangle,
  Copy,
} from "lucide-react"
import { Table, TableShape, TableZone } from "@/models/table.model"
import { useTable } from "@/hooks/useTable"
import { toast } from "sonner"

const ZONES: { value: TableZone; label: string; icon: string }[] = [
  { value: "interior", label: "Interior", icon: "🏠" },
  { value: "terraza", label: "Terraza", icon: "☀️" },
  { value: "privado", label: "Privado", icon: "🚪" },
  { value: "barra", label: "Barra", icon: "🍸" },
  { value: "jardin", label: "Jardin", icon: "🌳" },
  { value: "segundo_piso", label: "Segundo Piso", icon: "⬆️" },
]

const SHAPES: { value: TableShape; label: string; icon: React.ReactNode }[] = [
  { value: "square", label: "Cuadrada", icon: <Square className="w-4 h-4" /> },
  { value: "round", label: "Redonda", icon: <Circle className="w-4 h-4" /> },
  { value: "rectangular", label: "Rectangular", icon: <RectangleHorizontal className="w-4 h-4" /> },
  { value: "oval", label: "Ovalada", icon: <Circle className="w-4 h-4" /> },
  { value: "bar", label: "Barra", icon: <RectangleHorizontal className="w-4 h-4" /> },
]

const PRESET_COLORS = [
  "#3b82f6", "#22c55e", "#f59e0b", "#ef4444",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f97316",
  "#6366f1", "#84cc16", "#06b6d4", "#78716c",
]

const emptyTable: Table = {
  id: "",
  number: 1,
  name: "",
  status: "available",
  capacity: 4,
  minCapacity: 1,
  shape: "square",
  zone: "interior",
  floor: 1,
  isSmokingAllowed: false,
  hasOutlet: false,
  hasWifi: false,
  isWheelchairAccessible: false,
  isHighchair: false,
  hasUmbrella: false,
  hasHeater: false,
  isPremium: false,
  isJoinable: true,
  isReservable: true,
  minReservationTime: 60,
  maxReservationTime: 180,
  autoReleaseMinutes: 15,
  avgTurnoverTime: 90,
  color: "#3b82f6",
  sortOrder: 1,
  showInFloorPlan: true,
  showInList: true,
  enabled: true,
  notes: "",
}

// Mock initial tables
const initialTables: Table[] = Array.from({ length: 12 }, (_, i) => ({
  ...emptyTable,
  id: `table-${i + 1}`,
  number: i + 1,
  capacity: i < 4 ? 2 : i < 8 ? 4 : 6,
  minCapacity: 1,
  shape: (i < 4 ? "square" : i < 8 ? "round" : "rectangular") as TableShape,
  zone: (i < 6 ? "interior" : i < 10 ? "terraza" : "privado") as TableZone,
  isPremium: i >= 10,
  isWheelchairAccessible: i === 0 || i === 6,
  hasOutlet: i < 4,
  sortOrder: i + 1,
  color: PRESET_COLORS[i % PRESET_COLORS.length],
}))

export function TableManager() {
  const [tables, setTables] = useState<Table[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [tableToDelete, setTableToDelete] = useState<Table | null>(null)
  const [deleteReason, setDeleteReason] = useState("");
  const [editingTable, setEditingTable] = useState<Table>(emptyTable)
  const [isEditing, setIsEditing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterZone, setFilterZone] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")

  // Cargar las mesas
  const { 
    mesas,
    crearMesa,
    actualizarMesa,
    eliminarMesa,
  } = useTable();

  const filteredTables = mesas.filter((t) => {
    const matchesSearch =
      // t.number.toString().includes(searchQuery) ||
      String(t.number ?? "").includes(searchQuery) ||
      (t.name && t.name.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesZone = filterZone === "all" || t.zone === filterZone
    return matchesSearch && matchesZone
  })

  const handleNewTable = () => {
    const maxNumber = Math.max(...tables.map((t) => t.number), 0)
    setEditingTable({
      ...emptyTable,
      id: "",
      number: maxNumber + 1,
      sortOrder: tables.length + 1,
    })
    setIsEditing(false)
    setDialogOpen(true)
  }

  const handleEditTable = (table: Table) => {
    setEditingTable({ ...table })
    setIsEditing(true)
    setDialogOpen(true)
  }

  const handleDuplicateTable = (table: Table) => {
    const maxNumber = Math.max(...tables.map((t) => t.number), 0)
    setEditingTable({
      ...table,
      id: "",
      number: maxNumber + 1,
      name: table.name ? `${table.name} (copia)` : "",
      sortOrder: tables.length + 1,
    })
    setIsEditing(false)
    setDialogOpen(true)
  }

  const handleSaveTable = async () => {
    if (editingTable.number < 1) return

    if (isEditing) {
      setTables((prev) =>
        prev.map((t) => (t.id === editingTable.id ? { ...editingTable, updatedAt: new Date() } : t))
      )
    } else {
      setTables((prev) => [
        ...prev,
        { ...editingTable, createdAt: new Date(), updatedAt: new Date() },
      ])
    }

    try {
      const response = 
        editingTable.id
        ? await actualizarMesa(editingTable)
        : await crearMesa(editingTable);

      toast.success(response.message, {
        style: {
          background: "#16a34a",
          color: "#ffffff",
          border: "1px solid #15803d",
        },
      });

      setDialogOpen(false)
      setEditingTable(editingTable);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error guardando mesa",
        {
          style: {
            background: "#dc2626",
            color: "#ffffff",
            border: "1px solid #b91c1c",
          },
        },
      );

      setDialogOpen(true);
      setEditingTable(editingTable);
    }

  }

  const handleRequestDelete = (table: Table) => {
    setTableToDelete(table)
    setDeleteReason("");
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (tableToDelete) {
      if (!deleteReason.trim()) {
        toast.error(
          "Debe indicar un motivo de eliminación."
        );
        return;
      }
      setTables((prev) => prev.filter((t) => t.id !== tableToDelete.id))
      try {
        await eliminarMesa(tableToDelete.id, deleteReason.trim(),);
      } catch (error) {
        error instanceof Error ? error.message : "Error al eliminar la mesa.";
      } finally {
        setDeleteDialogOpen(false)
        setTableToDelete(null)
      }
    }
  }

  const handleToggleEnabled = (id: string) => {
    setTables((prev) =>
      prev.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t))
    )
  }

  const getZoneInfo = (zone?: TableZone) => ZONES.find((z) => z.value === zone)
  const getShapeInfo = (shape?: TableShape) => SHAPES.find((s) => s.value === shape)

  const stats = {
    total: mesas.length,
    enabled: mesas.filter((t) => t.enabled).length,
    totalCapacity: mesas.filter((t) => t.enabled).reduce((sum, t) => sum + t.capacity, 0),
    byZone: ZONES.map((z) => ({
      ...z,
      count: mesas.filter((t) => t.zone === z.value && t.enabled).length,
    })).filter((z) => z.count > 0),
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Armchair className="w-5 h-5" />
              Mesas
            </CardTitle>
            <CardDescription>
              {stats.total} mesas · {stats.totalCapacity} asientos totales
            </CardDescription>
          </div>
          <Button size="sm" onClick={handleNewTable}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Mesa
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por numero o nombre..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filterZone} onValueChange={setFilterZone}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Zona" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las zonas</SelectItem>
              {ZONES.map((zone) => (
                <SelectItem key={zone.value} value={zone.value}>
                  {zone.icon} {zone.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex border border-border rounded-md">
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-r-none"
              onClick={() => setViewMode("list")}
            >
              <RectangleHorizontal className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-l-none"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Zone summary chips */}
        <div className="flex flex-wrap gap-2">
          {stats.byZone.map((zone) => (
            <Badge
              key={zone.value}
              variant="secondary"
              className="cursor-pointer hover:bg-secondary/80"
              onClick={() => setFilterZone(filterZone === zone.value ? "all" : zone.value)}
            >
              {zone.icon} {zone.label}: {zone.count}
            </Badge>
          ))}
        </div>

        {/* Table list */}
        {viewMode === "list" ? (
          <div className="space-y-2">
            {filteredTables.map((table) => (
              <div
                key={table.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  !table.enabled
                    ? "bg-muted/30 border-border/50 opacity-60"
                    : "bg-secondary/50 border-border hover:border-primary/30"
                }`}
              >
                {/* Number badge */}
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold shrink-0"
                  style={{
                    backgroundColor: `${table.color || "#3b82f6"}20`,
                    color: table.color || "#3b82f6",
                  }}
                >
                  {table.number}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      Mesa {table.number}
                      {table.name && <span className="text-muted-foreground ml-1">· {table.name}</span>}
                    </p>
                    {table.isPremium && (
                      <Badge variant="default" className="bg-amber-500/20 text-amber-600 text-xs">
                        <Crown className="w-3 h-3 mr-1" />
                        VIP
                      </Badge>
                    )}
                    {!table.enabled && (
                      <Badge variant="destructive" className="text-xs">
                        <Wrench className="w-3 h-3 mr-1" />
                        Deshabilitada
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {table.minCapacity}-{table.capacity} personas
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {getZoneInfo(table.zone)?.icon} {getZoneInfo(table.zone)?.label}
                    </span>
                    <span className="flex items-center gap-1">
                      {getShapeInfo(table.shape)?.icon}
                      {getShapeInfo(table.shape)?.label}
                    </span>
                    {/* Feature icons */}
                    <span className="flex items-center gap-1">
                      {table.isWheelchairAccessible && <Accessibility className="w-3 h-3 text-blue-500" />}
                      {table.hasOutlet && <Plug className="w-3 h-3 text-green-500" />}
                      {table.hasWifi && <Wifi className="w-3 h-3 text-blue-500" />}
                      {table.isHighchair && <Baby className="w-3 h-3 text-pink-500" />}
                      {table.hasUmbrella && <Umbrella className="w-3 h-3 text-cyan-500" />}
                      {table.hasHeater && <Heater className="w-3 h-3 text-orange-500" />}
                    </span>
                  </div>
                </div>

                {/* Color indicator */}
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: table.color || "#3b82f6" }}
                />

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* <Switch
                    checked={table.enabled}
                    onCheckedChange={() => handleToggleEnabled(table.id)}
                  /> */}
                  {/* <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDuplicateTable(table)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button> */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEditTable(table)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleRequestDelete(table)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Grid view
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filteredTables.map((table) => (
              <div
                key={table.id}
                onClick={() => handleEditTable(table)}
                className={`relative p-4 rounded-lg border cursor-pointer transition-all hover:scale-105 ${
                  !table.enabled
                    ? "bg-muted/30 border-border/50 opacity-60"
                    : "bg-secondary/50 border-border hover:border-primary"
                }`}
              >
                <div
                  className="w-full aspect-square rounded-lg flex flex-col items-center justify-center mb-2"
                  style={{
                    backgroundColor: `${table.color || "#3b82f6"}15`,
                    borderColor: table.color || "#3b82f6",
                    borderWidth: 2,
                    borderStyle: "solid",
                  }}
                >
                  <span
                    className="text-2xl font-bold"
                    style={{ color: table.color || "#3b82f6" }}
                  >
                    {table.number}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {table.capacity}
                  </span>
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium truncate">
                    {table.name || `Mesa ${table.number}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getZoneInfo(table.zone)?.icon} {getZoneInfo(table.zone)?.label}
                  </p>
                </div>
                {table.isPremium && (
                  <div className="absolute top-2 right-2">
                    <Crown className="w-4 h-4 text-amber-500" />
                  </div>
                )}
                {!table.enabled && (
                  <div className="absolute top-2 left-2">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {filteredTables.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery || filterZone !== "all"
              ? "No se encontraron mesas con los filtros aplicados"
              : "No hay mesas registradas"}
          </div>
        )}

        {/* Summary footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
          <span>{stats.total} mesas en total</span>
          <span>{stats.enabled} habilitadas · {stats.totalCapacity} asientos</span>
        </div>
      </CardContent>

      {/* Table Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Mesa" : "Nueva Mesa"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? `Modifica la configuracion de la Mesa ${editingTable.number}`
                : "Configura los datos de la nueva mesa"}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general" className="text-xs">
                <Armchair className="w-3 h-3 mr-1" />
                General
              </TabsTrigger>
              <TabsTrigger value="features" className="text-xs">
                <Settings2 className="w-3 h-3 mr-1" />
                Caracteristicas
              </TabsTrigger>
              <TabsTrigger value="reservations" className="text-xs">
                <Calendar className="w-3 h-3 mr-1" />
                Reservas
              </TabsTrigger>
              <TabsTrigger value="display" className="text-xs">
                <Palette className="w-3 h-3 mr-1" />
                Presentacion
              </TabsTrigger>
            </TabsList>

            {/* GENERAL TAB */}
            <TabsContent value="general" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Numero de Mesa <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    value={editingTable.number}
                    onChange={(e) =>
                      setEditingTable((prev) => ({
                        ...prev,
                        number: Number.parseInt(e.target.value) || 1,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nombre Personalizado</Label>
                  <Input
                    placeholder="Ej: Mesa Romantica, VIP 1"
                    value={editingTable.name || ""}
                    onChange={(e) =>
                      setEditingTable((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Capacidad Maxima</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0 bg-transparent"
                      onClick={() =>
                        setEditingTable((prev) => ({
                          ...prev,
                          capacity: Math.max(1, prev.capacity - 1),
                        }))
                      }
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      min={1}
                      className="text-center"
                      value={editingTable.capacity}
                      onChange={(e) =>
                        setEditingTable((prev) => ({
                          ...prev,
                          capacity: Number.parseInt(e.target.value) || 1,
                        }))
                      }
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0 bg-transparent"
                      onClick={() =>
                        setEditingTable((prev) => ({
                          ...prev,
                          capacity: prev.capacity + 1,
                        }))
                      }
                    >
                      +
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Capacidad Minima</Label>
                  <Input
                    type="number"
                    min={1}
                    max={editingTable.capacity}
                    value={editingTable.minCapacity || 1}
                    onChange={(e) =>
                      setEditingTable((prev) => ({
                        ...prev,
                        minCapacity: Number.parseInt(e.target.value) || 1,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Zona</Label>
                  <Select
                    value={editingTable.zone || "interior"}
                    onValueChange={(v) =>
                      setEditingTable((prev) => ({ ...prev, zone: v as TableZone }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ZONES.map((zone) => (
                        <SelectItem key={zone.value} value={zone.value}>
                          {zone.icon} {zone.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Piso</Label>
                  <Select
                    value={String(editingTable.floor || 1)}
                    onValueChange={(v) =>
                      setEditingTable((prev) => ({ ...prev, floor: Number.parseInt(v) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Planta Baja</SelectItem>
                      <SelectItem value="2">Segundo Piso</SelectItem>
                      <SelectItem value="3">Tercer Piso</SelectItem>
                      <SelectItem value="-1">Sotano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Forma de la Mesa</Label>
                <div className="flex flex-wrap gap-2">
                  {SHAPES.map((shape) => (
                    <button
                      key={shape.value}
                      type="button"
                      onClick={() =>
                        setEditingTable((prev) => ({ ...prev, shape: shape.value }))
                      }
                      className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-colors ${
                        editingTable.shape === shape.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:bg-secondary"
                      }`}
                    >
                      {shape.icon}
                      <span className="text-sm">{shape.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tiempo Promedio de Rotacion (minutos)</Label>
                <Input
                  type="number"
                  min={15}
                  step={15}
                  value={editingTable.avgTurnoverTime || 90}
                  onChange={(e) =>
                    setEditingTable((prev) => ({
                      ...prev,
                      avgTurnoverTime: Number.parseInt(e.target.value) || 90,
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Tiempo estimado que los comensales ocupan la mesa.
                </p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div>
                  <p className="font-medium text-sm flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-500" />
                    Mesa Premium / VIP
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Marcar como mesa especial o preferencial
                  </p>
                </div>
                <Switch
                  checked={editingTable.isPremium}
                  onCheckedChange={(checked) =>
                    setEditingTable((prev) => ({ ...prev, isPremium: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div>
                  <p className="font-medium text-sm">Mesa Habilitada</p>
                  <p className="text-xs text-muted-foreground">
                    {editingTable.enabled
                      ? "Visible y disponible para asignar"
                      : "Oculta del sistema (mantenimiento)"}
                  </p>
                </div>
                <Switch
                  checked={editingTable.enabled}
                  onCheckedChange={(checked) =>
                    setEditingTable((prev) => ({ ...prev, enabled: checked }))
                  }
                />
              </div>
            </TabsContent>

            {/* FEATURES TAB */}
            <TabsContent value="features" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">
                Selecciona las caracteristicas y amenidades de esta mesa.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    key: "isWheelchairAccessible",
                    icon: <Accessibility className="w-4 h-4" />,
                    label: "Accesible",
                    description: "Acceso para silla de ruedas",
                  },
                  {
                    key: "hasOutlet",
                    icon: <Plug className="w-4 h-4" />,
                    label: "Enchufe",
                    description: "Toma de corriente disponible",
                  },
                  {
                    key: "hasWifi",
                    icon: <Wifi className="w-4 h-4" />,
                    label: "WiFi",
                    description: "Buena senal WiFi",
                  },
                  {
                    key: "isHighchair",
                    icon: <Baby className="w-4 h-4" />,
                    label: "Periquera",
                    description: "Puede acomodar silla para bebe",
                  },
                  {
                    key: "hasUmbrella",
                    icon: <Umbrella className="w-4 h-4" />,
                    label: "Sombrilla",
                    description: "Cuenta con sombrilla/toldo",
                  },
                  {
                    key: "hasHeater",
                    icon: <Heater className="w-4 h-4" />,
                    label: "Calefactor",
                    description: "Calefaccion exterior",
                  },
                  {
                    key: "isSmokingAllowed",
                    icon: <span className="text-sm">🚬</span>,
                    label: "Fumadores",
                    description: "Se permite fumar",
                  },
                  {
                    key: "isJoinable",
                    icon: <Combine className="w-4 h-4" />,
                    label: "Combinable",
                    description: "Se puede unir con otras mesas",
                  },
                ].map((feature) => (
                  <div
                    key={feature.key}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      editingTable[feature.key as keyof Table]
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-secondary/50"
                    }`}
                    onClick={() =>
                      setEditingTable((prev) => ({
                        ...prev,
                        [feature.key]: !prev[feature.key as keyof Table],
                      }))
                    }
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        editingTable[feature.key as keyof Table]
                          ? "bg-primary/10 text-primary"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {feature.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{feature.label}</p>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                    <Switch
                      checked={!!editingTable[feature.key as keyof Table]}
                      onCheckedChange={(checked) =>
                        setEditingTable((prev) => ({ ...prev, [feature.key]: checked }))
                      }
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-4 border-t border-border">
                <Label>Notas de Mantenimiento</Label>
                <Textarea
                  placeholder="Ej: Pata floja, silla rota, etc."
                  rows={3}
                  value={editingTable.maintenanceNotes || ""}
                  onChange={(e) =>
                    setEditingTable((prev) => ({
                      ...prev,
                      maintenanceNotes: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Notas Generales</Label>
                <Textarea
                  placeholder="Informacion adicional sobre esta mesa..."
                  rows={2}
                  value={editingTable.notes || ""}
                  onChange={(e) =>
                    setEditingTable((prev) => ({ ...prev, notes: e.target.value }))
                  }
                />
              </div>
            </TabsContent>

            {/* RESERVATIONS TAB */}
            <TabsContent value="reservations" className="space-y-4 mt-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div>
                  <p className="font-medium text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Permitir Reservaciones
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Esta mesa puede ser reservada por clientes
                  </p>
                </div>
                <Switch
                  checked={editingTable.isReservable}
                  onCheckedChange={(checked) =>
                    setEditingTable((prev) => ({ ...prev, isReservable: checked }))
                  }
                />
              </div>

              {editingTable.isReservable && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tiempo Minimo de Reserva</Label>
                      <Select
                        value={String(editingTable.minReservationTime || 60)}
                        onValueChange={(v) =>
                          setEditingTable((prev) => ({
                            ...prev,
                            minReservationTime: Number.parseInt(v),
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 minutos</SelectItem>
                          <SelectItem value="60">1 hora</SelectItem>
                          <SelectItem value="90">1.5 horas</SelectItem>
                          <SelectItem value="120">2 horas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tiempo Maximo de Reserva</Label>
                      <Select
                        value={String(editingTable.maxReservationTime || 180)}
                        onValueChange={(v) =>
                          setEditingTable((prev) => ({
                            ...prev,
                            maxReservationTime: Number.parseInt(v),
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="60">1 hora</SelectItem>
                          <SelectItem value="120">2 horas</SelectItem>
                          <SelectItem value="180">3 horas</SelectItem>
                          <SelectItem value="240">4 horas</SelectItem>
                          <SelectItem value="300">5 horas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Tolerancia de No-Show (minutos)</Label>
                    <Input
                      type="number"
                      min={5}
                      max={60}
                      step={5}
                      value={editingTable.autoReleaseMinutes || 15}
                      onChange={(e) =>
                        setEditingTable((prev) => ({
                          ...prev,
                          autoReleaseMinutes: Number.parseInt(e.target.value) || 15,
                        }))
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Tiempo de espera antes de liberar la reservacion automaticamente.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Deposito Requerido</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">$</span>
                      <Input
                        type="number"
                        min={0}
                        step={50}
                        placeholder="0 = sin deposito"
                        value={editingTable.reservationDeposit || ""}
                        onChange={(e) =>
                          setEditingTable((prev) => ({
                            ...prev,
                            reservationDeposit: Number.parseInt(e.target.value) || 0,
                          }))
                        }
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Monto a cobrar al hacer la reservacion (0 = sin deposito).
                    </p>
                  </div>

                  {/* Quick deposit buttons */}
                  <div className="flex flex-wrap gap-2">
                    {[0, 100, 200, 300, 500].map((amount) => (
                      <Button
                        key={amount}
                        type="button"
                        variant={editingTable.reservationDeposit === amount ? "default" : "outline"}
                        size="sm"
                        className={editingTable.reservationDeposit !== amount ? "bg-transparent" : ""}
                        onClick={() =>
                          setEditingTable((prev) => ({
                            ...prev,
                            reservationDeposit: amount,
                          }))
                        }
                      >
                        {amount === 0 ? "Sin deposito" : `$${amount}`}
                      </Button>
                    ))}
                  </div>
                </>
              )}
            </TabsContent>

            {/* DISPLAY TAB */}
            <TabsContent value="display" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Color de Identificacion</Label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setEditingTable((prev) => ({ ...prev, color }))}
                      className={`w-8 h-8 rounded-full transition-all ${
                        editingTable.color === color
                          ? "ring-2 ring-offset-2 ring-offset-background ring-primary scale-110"
                          : "hover:scale-110"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Label className="text-xs text-muted-foreground">Personalizado:</Label>
                  <Input
                    type="color"
                    className="w-10 h-8 p-0.5 cursor-pointer"
                    value={editingTable.color || "#3b82f6"}
                    onChange={(e) =>
                      setEditingTable((prev) => ({ ...prev, color: e.target.value }))
                    }
                  />
                  <span className="text-xs text-muted-foreground">
                    {editingTable.color?.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <Label>Vista Previa</Label>
                <div className="flex items-center justify-center p-6 rounded-lg bg-secondary/50 border border-border">
                  <div
                    className="w-24 h-24 rounded-lg flex flex-col items-center justify-center"
                    style={{
                      backgroundColor: `${editingTable.color || "#3b82f6"}15`,
                      borderColor: editingTable.color || "#3b82f6",
                      borderWidth: 3,
                      borderStyle: "solid",
                    }}
                  >
                    <span
                      className="text-3xl font-bold"
                      style={{ color: editingTable.color || "#3b82f6" }}
                    >
                      {editingTable.number}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {editingTable.capacity}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Orden de Aparicion</Label>
                <Input
                  type="number"
                  min={1}
                  value={editingTable.sortOrder || 1}
                  onChange={(e) =>
                    setEditingTable((prev) => ({
                      ...prev,
                      sortOrder: Number.parseInt(e.target.value) || 1,
                    }))
                  }
                />
              </div>

              <div className="space-y-3">
                <Label>Visibilidad</Label>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-2">
                    {editingTable.showInFloorPlan ? (
                      <Eye className="w-4 h-4 text-primary" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium text-sm">Mostrar en Plano</p>
                      <p className="text-xs text-muted-foreground">Visible en el mapa del restaurante</p>
                    </div>
                  </div>
                  <Switch
                    checked={editingTable.showInFloorPlan}
                    onCheckedChange={(checked) =>
                      setEditingTable((prev) => ({ ...prev, showInFloorPlan: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-2">
                    {editingTable.showInList ? (
                      <Eye className="w-4 h-4 text-primary" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium text-sm">Mostrar en Lista</p>
                      <p className="text-xs text-muted-foreground">Visible en la lista de mesas</p>
                    </div>
                  </div>
                  <Switch
                    checked={editingTable.showInList}
                    onCheckedChange={(checked) =>
                      setEditingTable((prev) => ({ ...prev, showInList: checked }))
                    }
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="bg-transparent">
              Cancelar
            </Button>
            <Button onClick={handleSaveTable} disabled={editingTable.number < 1}>
              {isEditing ? "Guardar Cambios" : "Crear Mesa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Mesa {tableToDelete?.number}</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. Se eliminara permanentemente la mesa
              {tableToDelete?.name && ` "${tableToDelete.name}"`} del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Motivo de eliminación *
            </label>

            <Textarea
              value={deleteReason}
              onChange={(e) =>
                setDeleteReason(
                  e.target.value
                )
              }
              placeholder="Ingrese el motivo de eliminación de la mesa..."
              rows={4}
            />

            {
              deleteReason.trim() === "" &&
              (
                <p className="text-xs text-red-500">
                  Debe ingresar un motivo.
                </p>
              )
            }
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={
                deleteReason.trim() === ""
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
