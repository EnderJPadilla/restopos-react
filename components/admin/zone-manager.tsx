"use client"

import { useState } from "react"
import type { Zone, ZoneType, ZoneStatus } from "@/lib/types"
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
  MapPin,
  Settings2,
  Calendar,
  Palette,
  Home,
  Sun,
  Lock,
  Wine,
  TreeDeciduous,
  Wifi,
  Plug,
  Tv,
  Music,
  Accessibility,
  PawPrint,
  Baby,
  Umbrella,
  Heater,
  Fan,
  Thermometer,
  Users,
  Clock,
  DollarSign,
  Printer,
  Layers,
  ArrowUpDown,
  Eye,
  CalendarCheck,
} from "lucide-react"

const ZONE_TYPES: { value: ZoneType; label: string; icon: React.ReactNode; emoji: string }[] = [
  { value: "interior", label: "Interior", icon: <Home className="w-4 h-4" />, emoji: "🏠" },
  { value: "exterior", label: "Exterior", icon: <Sun className="w-4 h-4" />, emoji: "☀️" },
  { value: "privado", label: "Privado", icon: <Lock className="w-4 h-4" />, emoji: "🚪" },
  { value: "barra", label: "Barra", icon: <Wine className="w-4 h-4" />, emoji: "🍸" },
  { value: "mixto", label: "Mixto", icon: <Layers className="w-4 h-4" />, emoji: "🔄" },
]

const ZONE_STATUS: { value: ZoneStatus; label: string; color: string }[] = [
  { value: "active", label: "Activa", color: "bg-green-500" },
  { value: "inactive", label: "Inactiva", color: "bg-gray-500" },
  { value: "maintenance", label: "Mantenimiento", color: "bg-amber-500" },
]

const PRESET_COLORS = [
  "#3b82f6", "#22c55e", "#f59e0b", "#ef4444",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f97316",
  "#6366f1", "#84cc16", "#06b6d4", "#78716c",
]

const ZONE_ICONS = [
  { value: "home", icon: <Home className="w-4 h-4" />, label: "Interior" },
  { value: "sun", icon: <Sun className="w-4 h-4" />, label: "Terraza" },
  { value: "lock", icon: <Lock className="w-4 h-4" />, label: "Privado" },
  { value: "wine", icon: <Wine className="w-4 h-4" />, label: "Barra" },
  { value: "tree", icon: <TreeDeciduous className="w-4 h-4" />, label: "Jardin" },
  { value: "layers", icon: <Layers className="w-4 h-4" />, label: "Piso" },
]

const DAYS_OF_WEEK = [
  { value: "monday", label: "Lun" },
  { value: "tuesday", label: "Mar" },
  { value: "wednesday", label: "Mie" },
  { value: "thursday", label: "Jue" },
  { value: "friday", label: "Vie" },
  { value: "saturday", label: "Sab" },
  { value: "sunday", label: "Dom" },
]

const emptyZone: Zone = {
  id: "",
  name: "",
  slug: "",
  description: "",
  type: "interior",
  status: "active",
  color: "#3b82f6",
  icon: "home",
  floor: 1,
  tableCount: 0,
  totalCapacity: 0,
  area: 0,
  hasRoof: true,
  isClimatized: false,
  isSmokingAllowed: false,
  hasWifi: false,
  hasOutlets: false,
  hasTV: false,
  hasSoundSystem: false,
  isWheelchairAccessible: false,
  isPetFriendly: false,
  hasChildArea: false,
  hasUmbrellas: false,
  hasHeaters: false,
  hasFans: false,
  isReservable: true,
  reservationPriority: 5,
  minReservationSize: 1,
  depositRequired: false,
  depositAmount: 0,
  openingTime: "08:00",
  closingTime: "23:00",
  availableDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
  sortOrder: 1,
  showInFloorPlan: true,
  showInReservations: true,
  notes: "",
  enabled: true,
}

// Mock initial zones
const initialZones: Zone[] = [
  {
    ...emptyZone,
    id: "zone-1",
    name: "Interior Principal",
    slug: "interior-principal",
    type: "interior",
    description: "Zona principal del restaurante con aire acondicionado",
    floor: 1,
    tableCount: 8,
    totalCapacity: 32,
    area: 120,
    hasRoof: true,
    isClimatized: true,
    hasWifi: true,
    hasOutlets: true,
    hasTV: true,
    hasSoundSystem: true,
    isWheelchairAccessible: true,
    color: "#3b82f6",
    icon: "home",
    sortOrder: 1,
  },
  {
    ...emptyZone,
    id: "zone-2",
    name: "Terraza",
    slug: "terraza",
    type: "exterior",
    description: "Terraza al aire libre con vista al jardin",
    floor: 1,
    tableCount: 6,
    totalCapacity: 24,
    area: 80,
    hasRoof: false,
    isClimatized: false,
    isSmokingAllowed: true,
    hasWifi: true,
    hasUmbrellas: true,
    hasHeaters: true,
    hasFans: true,
    isPetFriendly: true,
    color: "#22c55e",
    icon: "sun",
    sortOrder: 2,
  },
  {
    ...emptyZone,
    id: "zone-3",
    name: "Salon Privado",
    slug: "salon-privado",
    type: "privado",
    description: "Salon privado para eventos y reuniones",
    floor: 1,
    tableCount: 2,
    totalCapacity: 20,
    area: 45,
    hasRoof: true,
    isClimatized: true,
    hasWifi: true,
    hasOutlets: true,
    hasTV: true,
    hasSoundSystem: true,
    isWheelchairAccessible: true,
    depositRequired: true,
    depositAmount: 500,
    minReservationSize: 6,
    reservationPriority: 8,
    color: "#8b5cf6",
    icon: "lock",
    sortOrder: 3,
  },
  {
    ...emptyZone,
    id: "zone-4",
    name: "Barra",
    slug: "barra",
    type: "barra",
    description: "Area de barra con servicio de bebidas",
    floor: 1,
    tableCount: 1,
    totalCapacity: 8,
    area: 25,
    hasRoof: true,
    isClimatized: true,
    hasWifi: true,
    hasOutlets: true,
    hasTV: true,
    isReservable: false,
    color: "#f59e0b",
    icon: "wine",
    sortOrder: 4,
  },
]

export function ZoneManager() {
  const [zones, setZones] = useState<Zone[]>(initialZones)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [zoneToDelete, setZoneToDelete] = useState<Zone | null>(null)
  const [editingZone, setEditingZone] = useState<Zone>(emptyZone)
  const [isEditing, setIsEditing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")

  const filteredZones = zones.filter((z) => {
    const matchesSearch = z.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === "all" || z.type === filterType
    return matchesSearch && matchesType
  })

  const handleNewZone = () => {
    setEditingZone({
      ...emptyZone,
      id: `zone-${Date.now()}`,
      sortOrder: zones.length + 1,
    })
    setIsEditing(false)
    setDialogOpen(true)
  }

  const handleEditZone = (zone: Zone) => {
    setEditingZone({ ...zone })
    setIsEditing(true)
    setDialogOpen(true)
  }

  const handleSaveZone = () => {
    if (!editingZone.name.trim()) return

    // Generate slug
    const slug = editingZone.slug || editingZone.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")

    if (isEditing) {
      setZones((prev) =>
        prev.map((z) =>
          z.id === editingZone.id ? { ...editingZone, slug, updatedAt: new Date() } : z
        )
      )
    } else {
      setZones((prev) => [
        ...prev,
        { ...editingZone, slug, createdAt: new Date(), updatedAt: new Date() },
      ])
    }
    setDialogOpen(false)
  }

  const handleRequestDelete = (zone: Zone) => {
    setZoneToDelete(zone)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (zoneToDelete) {
      setZones((prev) => prev.filter((z) => z.id !== zoneToDelete.id))
    }
    setDeleteDialogOpen(false)
    setZoneToDelete(null)
  }

  const handleToggleEnabled = (id: string) => {
    setZones((prev) =>
      prev.map((z) => (z.id === id ? { ...z, enabled: !z.enabled } : z))
    )
  }

  const handleToggleDay = (day: string) => {
    const currentDays = editingZone.availableDays || []
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day]
    setEditingZone((prev) => ({ ...prev, availableDays: newDays }))
  }

  const getTypeInfo = (type?: ZoneType) => ZONE_TYPES.find((t) => t.value === type)
  const getStatusInfo = (status?: ZoneStatus) => ZONE_STATUS.find((s) => s.value === status)

  const stats = {
    total: zones.length,
    active: zones.filter((z) => z.status === "active" && z.enabled).length,
    totalTables: zones.reduce((sum, z) => sum + (z.tableCount || 0), 0),
    totalCapacity: zones.reduce((sum, z) => sum + (z.totalCapacity || 0), 0),
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Zonas
            </CardTitle>
            <CardDescription>
              {stats.total} zonas · {stats.totalTables} mesas · {stats.totalCapacity} asientos
            </CardDescription>
          </div>
          <Button size="sm" onClick={handleNewZone}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Zona
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar zona..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {ZONE_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.emoji} {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Zone list */}
        <div className="space-y-2">
          {filteredZones.map((zone) => (
            <div
              key={zone.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                !zone.enabled
                  ? "bg-muted/30 border-border/50 opacity-60"
                  : "bg-secondary/50 border-border hover:border-primary/30"
              }`}
            >
              {/* Color indicator */}
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: `${zone.color || "#3b82f6"}20`,
                  color: zone.color || "#3b82f6",
                }}
              >
                {getTypeInfo(zone.type)?.icon}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{zone.name}</p>
                  <Badge
                    variant="secondary"
                    className="text-xs"
                    style={{
                      backgroundColor: `${zone.color || "#3b82f6"}20`,
                      color: zone.color || "#3b82f6",
                    }}
                  >
                    {getTypeInfo(zone.type)?.label}
                  </Badge>
                  {zone.status === "maintenance" && (
                    <Badge variant="outline" className="text-xs text-amber-600 border-amber-600">
                      Mantenimiento
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {zone.tableCount || 0} mesas · {zone.totalCapacity || 0} personas
                  </span>
                  {zone.floor && (
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      Piso {zone.floor}
                    </span>
                  )}
                  {zone.area && zone.area > 0 && (
                    <span>{zone.area} m²</span>
                  )}
                  {/* Feature icons */}
                  <span className="flex items-center gap-1">
                    {zone.isClimatized && <Thermometer className="w-3 h-3 text-blue-500" />}
                    {zone.hasWifi && <Wifi className="w-3 h-3 text-blue-500" />}
                    {zone.hasOutlets && <Plug className="w-3 h-3 text-green-500" />}
                    {zone.hasTV && <Tv className="w-3 h-3 text-purple-500" />}
                    {zone.hasSoundSystem && <Music className="w-3 h-3 text-pink-500" />}
                    {zone.isWheelchairAccessible && <Accessibility className="w-3 h-3 text-blue-500" />}
                    {zone.isPetFriendly && <PawPrint className="w-3 h-3 text-amber-500" />}
                    {zone.hasChildArea && <Baby className="w-3 h-3 text-pink-500" />}
                  </span>
                </div>
              </div>

              {/* Status indicator */}
              <div
                className={`w-2 h-2 rounded-full shrink-0 ${getStatusInfo(zone.status)?.color || "bg-gray-500"}`}
              />

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <Switch
                  checked={zone.enabled}
                  onCheckedChange={() => handleToggleEnabled(zone.id)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleEditZone(zone)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleRequestDelete(zone)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredZones.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery || filterType !== "all"
              ? "No se encontraron zonas con los filtros aplicados"
              : "No hay zonas registradas"}
          </div>
        )}

        {/* Summary footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
          <span>{stats.total} zonas en total</span>
          <span>{stats.active} activas · {stats.totalCapacity} asientos</span>
        </div>
      </CardContent>

      {/* Zone Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Zona" : "Nueva Zona"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? `Modifica la configuracion de ${editingZone.name}`
                : "Configura los datos de la nueva zona"}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general" className="text-xs">
                <MapPin className="w-3 h-3 mr-1" />
                General
              </TabsTrigger>
              <TabsTrigger value="features" className="text-xs">
                <Settings2 className="w-3 h-3 mr-1" />
                Servicios
              </TabsTrigger>
              <TabsTrigger value="reservations" className="text-xs">
                <Calendar className="w-3 h-3 mr-1" />
                Reservas
              </TabsTrigger>
              <TabsTrigger value="schedule" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                Horario
              </TabsTrigger>
            </TabsList>

            {/* GENERAL TAB */}
            <TabsContent value="general" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Nombre <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    placeholder="Ej: Terraza Principal"
                    value={editingZone.name}
                    onChange={(e) =>
                      setEditingZone((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug / Identificador</Label>
                  <Input
                    placeholder="terraza-principal"
                    value={editingZone.slug || ""}
                    onChange={(e) =>
                      setEditingZone((prev) => ({ ...prev, slug: e.target.value }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Se genera automaticamente del nombre
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Zona</Label>
                  <Select
                    value={editingZone.type}
                    onValueChange={(v) =>
                      setEditingZone((prev) => ({ ...prev, type: v as ZoneType }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ZONE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <span className="flex items-center gap-2">
                            {type.icon}
                            {type.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select
                    value={editingZone.status}
                    onValueChange={(v) =>
                      setEditingZone((prev) => ({ ...prev, status: v as ZoneStatus }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ZONE_STATUS.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          <span className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${status.color}`} />
                            {status.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descripcion</Label>
                <Textarea
                  placeholder="Describe esta zona..."
                  value={editingZone.description || ""}
                  onChange={(e) =>
                    setEditingZone((prev) => ({ ...prev, description: e.target.value }))
                  }
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Piso</Label>
                  <Input
                    type="number"
                    min={-2}
                    max={10}
                    value={editingZone.floor || 1}
                    onChange={(e) =>
                      setEditingZone((prev) => ({
                        ...prev,
                        floor: Number.parseInt(e.target.value) || 1,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Area (m²)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={editingZone.area || ""}
                    onChange={(e) =>
                      setEditingZone((prev) => ({
                        ...prev,
                        area: Number.parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Orden</Label>
                  <Input
                    type="number"
                    min={1}
                    value={editingZone.sortOrder || 1}
                    onChange={(e) =>
                      setEditingZone((prev) => ({
                        ...prev,
                        sortOrder: Number.parseInt(e.target.value) || 1,
                      }))
                    }
                  />
                </div>
              </div>

              {/* Color selection */}
              <div className="space-y-2">
                <Label>Color de Identificacion</Label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full transition-all ${
                        editingZone.color === color
                          ? "ring-2 ring-offset-2 ring-primary"
                          : "hover:scale-110"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setEditingZone((prev) => ({ ...prev, color }))}
                    />
                  ))}
                  <Input
                    type="color"
                    className="w-8 h-8 p-0 border-0 cursor-pointer"
                    value={editingZone.color || "#3b82f6"}
                    onChange={(e) =>
                      setEditingZone((prev) => ({ ...prev, color: e.target.value }))
                    }
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="p-4 rounded-lg border border-border bg-secondary/30">
                <p className="text-xs text-muted-foreground mb-2">Vista previa</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: `${editingZone.color || "#3b82f6"}20`,
                      color: editingZone.color || "#3b82f6",
                    }}
                  >
                    {getTypeInfo(editingZone.type)?.icon}
                  </div>
                  <div>
                    <p className="font-medium">{editingZone.name || "Nueva Zona"}</p>
                    <p className="text-xs text-muted-foreground">
                      {getTypeInfo(editingZone.type)?.label} · Piso {editingZone.floor || 1}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* FEATURES TAB */}
            <TabsContent value="features" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-3">Infraestructura</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <Label className="flex items-center gap-2 cursor-pointer">
                        <Home className="w-4 h-4 text-muted-foreground" />
                        Tiene Techo
                      </Label>
                      <Switch
                        checked={editingZone.hasRoof}
                        onCheckedChange={(v) =>
                          setEditingZone((prev) => ({ ...prev, hasRoof: v }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <Label className="flex items-center gap-2 cursor-pointer">
                        <Thermometer className="w-4 h-4 text-muted-foreground" />
                        Climatizada (A/C)
                      </Label>
                      <Switch
                        checked={editingZone.isClimatized}
                        onCheckedChange={(v) =>
                          setEditingZone((prev) => ({ ...prev, isClimatized: v }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Servicios</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <Label className="flex items-center gap-2 cursor-pointer">
                        <Wifi className="w-4 h-4 text-muted-foreground" />
                        WiFi
                      </Label>
                      <Switch
                        checked={editingZone.hasWifi}
                        onCheckedChange={(v) =>
                          setEditingZone((prev) => ({ ...prev, hasWifi: v }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <Label className="flex items-center gap-2 cursor-pointer">
                        <Plug className="w-4 h-4 text-muted-foreground" />
                        Enchufes
                      </Label>
                      <Switch
                        checked={editingZone.hasOutlets}
                        onCheckedChange={(v) =>
                          setEditingZone((prev) => ({ ...prev, hasOutlets: v }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <Label className="flex items-center gap-2 cursor-pointer">
                        <Tv className="w-4 h-4 text-muted-foreground" />
                        Television
                      </Label>
                      <Switch
                        checked={editingZone.hasTV}
                        onCheckedChange={(v) =>
                          setEditingZone((prev) => ({ ...prev, hasTV: v }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <Label className="flex items-center gap-2 cursor-pointer">
                        <Music className="w-4 h-4 text-muted-foreground" />
                        Sistema de Sonido
                      </Label>
                      <Switch
                        checked={editingZone.hasSoundSystem}
                        onCheckedChange={(v) =>
                          setEditingZone((prev) => ({ ...prev, hasSoundSystem: v }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Accesibilidad y Comodidades</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <Label className="flex items-center gap-2 cursor-pointer">
                        <Accessibility className="w-4 h-4 text-muted-foreground" />
                        Accesible (Silla de ruedas)
                      </Label>
                      <Switch
                        checked={editingZone.isWheelchairAccessible}
                        onCheckedChange={(v) =>
                          setEditingZone((prev) => ({ ...prev, isWheelchairAccessible: v }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <Label className="flex items-center gap-2 cursor-pointer">
                        <PawPrint className="w-4 h-4 text-muted-foreground" />
                        Pet Friendly
                      </Label>
                      <Switch
                        checked={editingZone.isPetFriendly}
                        onCheckedChange={(v) =>
                          setEditingZone((prev) => ({ ...prev, isPetFriendly: v }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <Label className="flex items-center gap-2 cursor-pointer">
                        <Baby className="w-4 h-4 text-muted-foreground" />
                        Area Infantil
                      </Label>
                      <Switch
                        checked={editingZone.hasChildArea}
                        onCheckedChange={(v) =>
                          setEditingZone((prev) => ({ ...prev, hasChildArea: v }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <Label className="flex items-center gap-2 cursor-pointer">
                        <Sun className="w-4 h-4 text-muted-foreground" />
                        Permite Fumar
                      </Label>
                      <Switch
                        checked={editingZone.isSmokingAllowed}
                        onCheckedChange={(v) =>
                          setEditingZone((prev) => ({ ...prev, isSmokingAllowed: v }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Exterior (Terraza/Jardin)</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <Label className="flex items-center gap-2 cursor-pointer">
                        <Umbrella className="w-4 h-4 text-muted-foreground" />
                        Sombrillas
                      </Label>
                      <Switch
                        checked={editingZone.hasUmbrellas}
                        onCheckedChange={(v) =>
                          setEditingZone((prev) => ({ ...prev, hasUmbrellas: v }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <Label className="flex items-center gap-2 cursor-pointer">
                        <Heater className="w-4 h-4 text-muted-foreground" />
                        Calefactores
                      </Label>
                      <Switch
                        checked={editingZone.hasHeaters}
                        onCheckedChange={(v) =>
                          setEditingZone((prev) => ({ ...prev, hasHeaters: v }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <Label className="flex items-center gap-2 cursor-pointer">
                        <Fan className="w-4 h-4 text-muted-foreground" />
                        Ventiladores
                      </Label>
                      <Switch
                        checked={editingZone.hasFans}
                        onCheckedChange={(v) =>
                          setEditingZone((prev) => ({ ...prev, hasFans: v }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* RESERVATIONS TAB */}
            <TabsContent value="reservations" className="space-y-4 mt-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div>
                  <Label className="text-base">Acepta Reservaciones</Label>
                  <p className="text-xs text-muted-foreground">
                    Permitir que esta zona aparezca como opcion de reserva
                  </p>
                </div>
                <Switch
                  checked={editingZone.isReservable}
                  onCheckedChange={(v) =>
                    setEditingZone((prev) => ({ ...prev, isReservable: v }))
                  }
                />
              </div>

              {editingZone.isReservable && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Prioridad de Reserva</Label>
                      <Select
                        value={String(editingZone.reservationPriority || 5)}
                        onValueChange={(v) =>
                          setEditingZone((prev) => ({
                            ...prev,
                            reservationPriority: Number.parseInt(v),
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                            <SelectItem key={n} value={String(n)}>
                              {n} {n >= 8 ? "(Alta)" : n >= 4 ? "(Media)" : "(Baja)"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Las zonas con mayor prioridad se sugieren primero
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Comensales Minimos</Label>
                      <Input
                        type="number"
                        min={1}
                        max={50}
                        value={editingZone.minReservationSize || 1}
                        onChange={(e) =>
                          setEditingZone((prev) => ({
                            ...prev,
                            minReservationSize: Number.parseInt(e.target.value) || 1,
                          }))
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Numero minimo de personas para reservar
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                    <div>
                      <Label className="text-base">Requiere Deposito</Label>
                      <p className="text-xs text-muted-foreground">
                        Solicitar deposito para confirmar reserva
                      </p>
                    </div>
                    <Switch
                      checked={editingZone.depositRequired}
                      onCheckedChange={(v) =>
                        setEditingZone((prev) => ({ ...prev, depositRequired: v }))
                      }
                    />
                  </div>

                  {editingZone.depositRequired && (
                    <div className="space-y-2">
                      <Label>Monto del Deposito</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="number"
                            min={0}
                            className="pl-9"
                            value={editingZone.depositAmount || ""}
                            onChange={(e) =>
                              setEditingZone((prev) => ({
                                ...prev,
                                depositAmount: Number.parseFloat(e.target.value) || 0,
                              }))
                            }
                          />
                        </div>
                        <div className="flex gap-1">
                          {[200, 500, 1000].map((amount) => (
                            <Button
                              key={amount}
                              type="button"
                              variant={editingZone.depositAmount === amount ? "default" : "outline"}
                              size="sm"
                              onClick={() =>
                                setEditingZone((prev) => ({ ...prev, depositAmount: amount }))
                              }
                              className="bg-transparent"
                            >
                              ${amount}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Visibility options */}
                  <div className="space-y-3 pt-4 border-t border-border">
                    <h4 className="text-sm font-medium">Visibilidad</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                        <Label className="flex items-center gap-2 cursor-pointer">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                          Mostrar en Plano
                        </Label>
                        <Switch
                          checked={editingZone.showInFloorPlan}
                          onCheckedChange={(v) =>
                            setEditingZone((prev) => ({ ...prev, showInFloorPlan: v }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                        <Label className="flex items-center gap-2 cursor-pointer">
                          <CalendarCheck className="w-4 h-4 text-muted-foreground" />
                          Mostrar en Reservas
                        </Label>
                        <Switch
                          checked={editingZone.showInReservations}
                          onCheckedChange={(v) =>
                            setEditingZone((prev) => ({ ...prev, showInReservations: v }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            {/* SCHEDULE TAB */}
            <TabsContent value="schedule" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Hora de Apertura</Label>
                  <Input
                    type="time"
                    value={editingZone.openingTime || "08:00"}
                    onChange={(e) =>
                      setEditingZone((prev) => ({ ...prev, openingTime: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hora de Cierre</Label>
                  <Input
                    type="time"
                    value={editingZone.closingTime || "23:00"}
                    onChange={(e) =>
                      setEditingZone((prev) => ({ ...prev, closingTime: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Dias Disponibles</Label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = editingZone.availableDays?.includes(day.value)
                    return (
                      <Button
                        key={day.value}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleToggleDay(day.value)}
                        className={!isSelected ? "bg-transparent" : ""}
                      >
                        {day.label}
                      </Button>
                    )
                  })}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-transparent"
                    onClick={() =>
                      setEditingZone((prev) => ({
                        ...prev,
                        availableDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
                      }))
                    }
                  >
                    Lun-Vie
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-transparent"
                    onClick={() =>
                      setEditingZone((prev) => ({
                        ...prev,
                        availableDays: ["saturday", "sunday"],
                      }))
                    }
                  >
                    Fin de Semana
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-transparent"
                    onClick={() =>
                      setEditingZone((prev) => ({
                        ...prev,
                        availableDays: DAYS_OF_WEEK.map((d) => d.value),
                      }))
                    }
                  >
                    Todos
                  </Button>
                </div>
              </div>

              {/* Schedule summary */}
              <div className="p-4 rounded-lg border border-border bg-secondary/30">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Resumen de Horario</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {editingZone.openingTime || "08:00"} - {editingZone.closingTime || "23:00"}
                  {" · "}
                  {editingZone.availableDays?.length === 7
                    ? "Todos los dias"
                    : editingZone.availableDays?.length === 5 &&
                      !editingZone.availableDays.includes("saturday") &&
                      !editingZone.availableDays.includes("sunday")
                      ? "Lunes a Viernes"
                      : editingZone.availableDays?.length === 2 &&
                        editingZone.availableDays.includes("saturday") &&
                        editingZone.availableDays.includes("sunday")
                        ? "Fines de Semana"
                        : `${editingZone.availableDays?.length || 0} dias`}
                </p>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>Notas</Label>
                <Textarea
                  placeholder="Notas adicionales sobre la zona..."
                  value={editingZone.notes || ""}
                  onChange={(e) =>
                    setEditingZone((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  rows={3}
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="pt-4">
            <Button variant="outline" className="bg-transparent" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveZone} disabled={!editingZone.name.trim()}>
              {isEditing ? "Guardar Cambios" : "Crear Zona"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Zona</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estas seguro de eliminar la zona "{zoneToDelete?.name}"? Las mesas asignadas a esta
              zona deberan reasignarse manualmente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
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
