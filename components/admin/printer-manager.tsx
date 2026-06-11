"use client"

import { useState } from "react"
import type { Printer, PrinterConnectionType, PrinterModel, PaperWidth } from "@/lib/types"
import { mockCategories } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
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
  Printer as PrinterIcon,
  Plus,
  Edit,
  Trash2,
  Wifi,
  Usb,
  Bluetooth,
  Cable,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Settings2,
  FileText,
  Volume2,
  Monitor,
  RefreshCw,
  Zap,
  TestTube2,
} from "lucide-react"

const CONNECTION_TYPES: { value: PrinterConnectionType; label: string; icon: typeof Wifi }[] = [
  { value: "network", label: "Red (TCP/IP)", icon: Wifi },
  { value: "usb", label: "USB", icon: Usb },
  { value: "bluetooth", label: "Bluetooth", icon: Bluetooth },
  { value: "serial", label: "Puerto Serie", icon: Cable },
]

const PRINTER_MODELS: { value: PrinterModel; label: string }[] = [
  { value: "epson_tm20", label: "Epson TM-T20" },
  { value: "epson_tm80", label: "Epson TM-T80" },
  { value: "star_tsp100", label: "Star TSP100" },
  { value: "star_sp700", label: "Star SP700" },
  { value: "bixolon_srp350", label: "Bixolon SRP-350" },
  { value: "generic_esc_pos", label: "ESC/POS Generico" },
  { value: "custom", label: "Otro / Personalizado" },
]

const PAPER_WIDTHS: { value: PaperWidth; label: string }[] = [
  { value: "58mm", label: "58mm (Mini)" },
  { value: "80mm", label: "80mm (Estandar)" },
]

const ASSIGNED_AREAS = [
  { value: "cocina", label: "Cocina" },
  { value: "barra", label: "Barra" },
  { value: "parrilla", label: "Parrilla" },
  { value: "postres", label: "Postres" },
  { value: "bebidas", label: "Bebidas" },
  { value: "caja", label: "Caja" },
]

const FONT_SIZES = [
  { value: "small", label: "Pequeno" },
  { value: "medium", label: "Mediano" },
  { value: "large", label: "Grande" },
]

const COMMAND_SETS = [
  { value: "esc_pos", label: "ESC/POS (Epson)" },
  { value: "star_line", label: "StarLine (Star)" },
  { value: "star_graphic", label: "StarGraphic (Star)" },
]

const emptyPrinter: Printer = {
  id: "",
  name: "",
  alias: "",
  model: "generic_esc_pos",
  connectionType: "network",
  ipAddress: "",
  port: 9100,
  macAddress: "",
  serialPort: "",
  baudRate: 9600,
  usbVendorId: "",
  usbProductId: "",
  paperWidth: "80mm",
  dpi: 203,
  status: "disconnected",
  isDefault: false,
  assignedAreas: [],
  printCategories: [],
  autoCut: true,
  openCashDrawer: false,
  printLogo: false,
  logoUrl: "",
  copies: 1,
  fontSize: "medium",
  printHeader: true,
  headerText: "",
  printFooter: true,
  footerText: "Gracias por su visita",
  printQR: false,
  qrContent: "",
  buzzerOnPrint: false,
  buzzerDuration: 200,
  characterEncoding: "UTF-8",
  commandSet: "esc_pos",
  testPagePrinted: false,
  enabled: true,
  notes: "",
}

const defaultPrinters: Printer[] = [
  {
    ...emptyPrinter,
    id: "printer-1",
    name: "Cocina Principal",
    alias: "IMP-COCINA",
    model: "epson_tm20",
    connectionType: "network",
    ipAddress: "192.168.1.100",
    port: 9100,
    paperWidth: "80mm",
    status: "connected",
    isDefault: false,
    assignedAreas: ["cocina", "parrilla"],
    autoCut: true,
    buzzerOnPrint: true,
    buzzerDuration: 300,
    copies: 1,
    enabled: true,
  },
  {
    ...emptyPrinter,
    id: "printer-2",
    name: "Caja",
    alias: "IMP-CAJA",
    model: "star_tsp100",
    connectionType: "network",
    ipAddress: "192.168.1.101",
    port: 9100,
    paperWidth: "80mm",
    status: "connected",
    isDefault: true,
    assignedAreas: ["caja"],
    autoCut: true,
    openCashDrawer: true,
    printLogo: true,
    printHeader: true,
    headerText: "RestoPOS - Restaurante",
    printFooter: true,
    footerText: "Gracias por su preferencia",
    copies: 1,
    enabled: true,
  },
]

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  connected: { label: "Conectada", color: "bg-success text-success-foreground", icon: CheckCircle2 },
  disconnected: { label: "Desconectada", color: "bg-muted text-muted-foreground", icon: XCircle },
  error: { label: "Error", color: "bg-destructive text-destructive-foreground", icon: AlertTriangle },
  paper_out: { label: "Sin Papel", color: "bg-warning text-warning-foreground", icon: AlertTriangle },
  cover_open: { label: "Tapa Abierta", color: "bg-warning text-warning-foreground", icon: AlertTriangle },
}

export function PrinterManager() {
  const [printers, setPrinters] = useState<Printer[]>(defaultPrinters)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [printerToDelete, setPrinterToDelete] = useState<Printer | null>(null)
  const [editingPrinter, setEditingPrinter] = useState<Printer>(emptyPrinter)
  const [isEditing, setIsEditing] = useState(false)
  const [activeSection, setActiveSection] = useState<"connection" | "areas" | "ticket" | "advanced">("connection")

  const handleNewPrinter = () => {
    setEditingPrinter({
      ...emptyPrinter,
      id: `printer-${Date.now()}`,
    })
    setIsEditing(false)
    setActiveSection("connection")
    setDialogOpen(true)
  }

  const handleEditPrinter = (printer: Printer) => {
    setEditingPrinter({ ...printer })
    setIsEditing(true)
    setActiveSection("connection")
    setDialogOpen(true)
  }

  const handleSavePrinter = () => {
    if (!editingPrinter.name.trim()) return

    if (isEditing) {
      setPrinters((prev) =>
        prev.map((p) => (p.id === editingPrinter.id ? { ...editingPrinter, updatedAt: new Date() } : p))
      )
    } else {
      setPrinters((prev) => [
        ...prev,
        { ...editingPrinter, createdAt: new Date(), updatedAt: new Date() },
      ])
    }
    setDialogOpen(false)
  }

  const handleRequestDelete = (printer: Printer) => {
    setPrinterToDelete(printer)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (printerToDelete) {
      setPrinters((prev) => prev.filter((p) => p.id !== printerToDelete.id))
    }
    setDeleteDialogOpen(false)
    setPrinterToDelete(null)
  }

  const handleToggleEnabled = (id: string) => {
    setPrinters((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    )
  }

  const handleSetDefault = (id: string) => {
    setPrinters((prev) =>
      prev.map((p) => ({ ...p, isDefault: p.id === id }))
    )
  }

  const toggleArea = (area: string) => {
    setEditingPrinter((prev) => {
      const areas = prev.assignedAreas || []
      return {
        ...prev,
        assignedAreas: areas.includes(area as typeof areas[number])
          ? areas.filter((a) => a !== area)
          : [...areas, area as typeof areas[number]],
      }
    })
  }

  const toggleCategory = (catId: string) => {
    setEditingPrinter((prev) => {
      const cats = prev.printCategories || []
      return {
        ...prev,
        printCategories: cats.includes(catId) ? cats.filter((c) => c !== catId) : [...cats, catId],
      }
    })
  }

  const getConnectionIcon = (type?: PrinterConnectionType) => {
    const found = CONNECTION_TYPES.find((c) => c.value === type)
    return found ? found.icon : Wifi
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <PrinterIcon className="w-5 h-5" />
              Impresoras
            </CardTitle>
            <CardDescription>Gestiona las impresoras de tickets y comandas</CardDescription>
          </div>
          <Button size="sm" onClick={handleNewPrinter}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Printer list */}
        {printers.map((printer) => {
          const ConnIcon = getConnectionIcon(printer.connectionType)
          const statusInfo = statusConfig[printer.status || "disconnected"]
          const StatusIcon = statusInfo.icon
          return (
            <div
              key={printer.id}
              className={`p-3 rounded-lg border transition-colors ${
                !printer.enabled
                  ? "bg-muted/30 border-border/50 opacity-60"
                  : "bg-secondary/50 border-border hover:border-primary/30"
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Icon */}
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <PrinterIcon className="w-5 h-5 text-primary" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{printer.name}</p>
                    {printer.isDefault && (
                      <Badge variant="outline" className="text-xs border-primary text-primary">
                        Principal
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    {printer.alias && <span className="font-mono">{printer.alias}</span>}
                    <span className="flex items-center gap-1">
                      <ConnIcon className="w-3 h-3" />
                      {printer.connectionType === "network" && printer.ipAddress
                        ? `${printer.ipAddress}:${printer.port}`
                        : CONNECTION_TYPES.find((c) => c.value === printer.connectionType)?.label}
                    </span>
                    {printer.model && (
                      <span>
                        {PRINTER_MODELS.find((m) => m.value === printer.model)?.label}
                      </span>
                    )}
                  </div>
                  {(printer.assignedAreas?.length || 0) > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {printer.assignedAreas?.map((area) => (
                        <Badge key={area} variant="secondary" className="text-xs py-0 px-1.5">
                          {ASSIGNED_AREAS.find((a) => a.value === area)?.label}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status + Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Badge className={`${statusInfo.color} text-xs gap-1`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusInfo.label}
                  </Badge>
                  <Switch
                    checked={printer.enabled}
                    onCheckedChange={() => handleToggleEnabled(printer.id)}
                  />
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditPrinter(printer)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleRequestDelete(printer)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )
        })}

        {printers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No hay impresoras configuradas
          </div>
        )}

        {/* Summary */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
          <span>{printers.length} impresora{printers.length !== 1 ? "s" : ""} configurada{printers.length !== 1 ? "s" : ""}</span>
          <span>{printers.filter((p) => p.status === "connected").length} conectada{printers.filter((p) => p.status === "connected").length !== 1 ? "s" : ""}</span>
        </div>
      </CardContent>

      {/* Printer Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Impresora" : "Nueva Impresora"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Modifica la configuracion de la impresora"
                : "Configura una nueva impresora para tickets y comandas"}
            </DialogDescription>
          </DialogHeader>

          {/* Section tabs */}
          <div className="flex gap-1 border-b border-border pb-2">
            {(
              [
                { id: "connection" as const, label: "Conexion", icon: Wifi },
                { id: "areas" as const, label: "Areas", icon: Monitor },
                { id: "ticket" as const, label: "Ticket", icon: FileText },
                { id: "advanced" as const, label: "Avanzado", icon: Settings2 },
              ] as const
            ).map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    activeSection === section.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {section.label}
                </button>
              )
            })}
          </div>

          <div className="space-y-5 py-2">
            {/* CONNECTION */}
            {activeSection === "connection" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre <span className="text-destructive">*</span></Label>
                    <Input
                      placeholder="Ej: Cocina Principal"
                      value={editingPrinter.name}
                      onChange={(e) => setEditingPrinter((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Alias / Codigo</Label>
                    <Input
                      placeholder="Ej: IMP-COCINA"
                      value={editingPrinter.alias || ""}
                      onChange={(e) => setEditingPrinter((prev) => ({ ...prev, alias: e.target.value.toUpperCase() }))}
                      className="font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Modelo</Label>
                    <Select
                      value={editingPrinter.model || "generic_esc_pos"}
                      onValueChange={(v) => {
                        const model = v as PrinterModel
                        setEditingPrinter((prev) => ({
                          ...prev,
                          model,
                          commandSet: model.startsWith("star") ? "star_line" : "esc_pos",
                        }))
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRINTER_MODELS.map((m) => (
                          <SelectItem key={m.value} value={m.value}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de Conexion</Label>
                    <Select
                      value={editingPrinter.connectionType || "network"}
                      onValueChange={(v) =>
                        setEditingPrinter((prev) => ({
                          ...prev,
                          connectionType: v as PrinterConnectionType,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONNECTION_TYPES.map((c) => {
                          const CIcon = c.icon
                          return (
                            <SelectItem key={c.value} value={c.value}>
                              <span className="flex items-center gap-2">
                                <CIcon className="w-4 h-4" />
                                {c.label}
                              </span>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Connection fields based on type */}
                {editingPrinter.connectionType === "network" && (
                  <div className="space-y-4 p-4 rounded-lg border border-border bg-secondary/30">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Wifi className="w-4 h-4" />
                      Configuracion de Red
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2 space-y-2">
                        <Label>Direccion IP <span className="text-destructive">*</span></Label>
                        <Input
                          placeholder="192.168.1.100"
                          value={editingPrinter.ipAddress || ""}
                          onChange={(e) => setEditingPrinter((prev) => ({ ...prev, ipAddress: e.target.value }))}
                          className="font-mono"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Puerto</Label>
                        <Input
                          type="number"
                          value={editingPrinter.port || 9100}
                          onChange={(e) => setEditingPrinter((prev) => ({ ...prev, port: Number.parseInt(e.target.value) || 9100 }))}
                          className="font-mono"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Direccion MAC (opcional)</Label>
                      <Input
                        placeholder="00:11:22:33:44:55"
                        value={editingPrinter.macAddress || ""}
                        onChange={(e) => setEditingPrinter((prev) => ({ ...prev, macAddress: e.target.value }))}
                        className="font-mono"
                      />
                      <p className="text-xs text-muted-foreground">Util para identificar la impresora en la red.</p>
                    </div>
                  </div>
                )}

                {editingPrinter.connectionType === "usb" && (
                  <div className="space-y-4 p-4 rounded-lg border border-border bg-secondary/30">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Usb className="w-4 h-4" />
                      Configuracion USB
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Vendor ID</Label>
                        <Input
                          placeholder="0x04b8"
                          value={editingPrinter.usbVendorId || ""}
                          onChange={(e) => setEditingPrinter((prev) => ({ ...prev, usbVendorId: e.target.value }))}
                          className="font-mono"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Product ID</Label>
                        <Input
                          placeholder="0x0202"
                          value={editingPrinter.usbProductId || ""}
                          onChange={(e) => setEditingPrinter((prev) => ({ ...prev, usbProductId: e.target.value }))}
                          className="font-mono"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Puedes encontrar estos valores en la configuracion de dispositivos del sistema.
                    </p>
                  </div>
                )}

                {editingPrinter.connectionType === "bluetooth" && (
                  <div className="space-y-4 p-4 rounded-lg border border-border bg-secondary/30">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Bluetooth className="w-4 h-4" />
                      Configuracion Bluetooth
                    </p>
                    <div className="space-y-2">
                      <Label>Direccion MAC del dispositivo <span className="text-destructive">*</span></Label>
                      <Input
                        placeholder="00:11:22:33:44:55"
                        value={editingPrinter.macAddress || ""}
                        onChange={(e) => setEditingPrinter((prev) => ({ ...prev, macAddress: e.target.value }))}
                        className="font-mono"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Asegurate de que la impresora este emparejada con el dispositivo.
                    </p>
                  </div>
                )}

                {editingPrinter.connectionType === "serial" && (
                  <div className="space-y-4 p-4 rounded-lg border border-border bg-secondary/30">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Cable className="w-4 h-4" />
                      Configuracion Puerto Serie
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Puerto <span className="text-destructive">*</span></Label>
                        <Input
                          placeholder="COM3 o /dev/ttyUSB0"
                          value={editingPrinter.serialPort || ""}
                          onChange={(e) => setEditingPrinter((prev) => ({ ...prev, serialPort: e.target.value }))}
                          className="font-mono"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Velocidad (baud rate)</Label>
                        <Select
                          value={String(editingPrinter.baudRate || 9600)}
                          onValueChange={(v) => setEditingPrinter((prev) => ({ ...prev, baudRate: Number.parseInt(v) }))}
                        >
                          <SelectTrigger className="font-mono">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[9600, 19200, 38400, 57600, 115200].map((rate) => (
                              <SelectItem key={rate} value={String(rate)}>
                                {rate.toLocaleString()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ancho de Papel</Label>
                    <Select
                      value={editingPrinter.paperWidth || "80mm"}
                      onValueChange={(v) => setEditingPrinter((prev) => ({ ...prev, paperWidth: v as PaperWidth }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAPER_WIDTHS.map((pw) => (
                          <SelectItem key={pw.value} value={pw.value}>
                            {pw.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Resolucion (DPI)</Label>
                    <Select
                      value={String(editingPrinter.dpi || 203)}
                      onValueChange={(v) => setEditingPrinter((prev) => ({ ...prev, dpi: Number.parseInt(v) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="180">180 DPI</SelectItem>
                        <SelectItem value="203">203 DPI</SelectItem>
                        <SelectItem value="300">300 DPI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Default + Status */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div>
                    <p className="font-medium text-sm">Impresora Principal</p>
                    <p className="text-xs text-muted-foreground">
                      Usar como impresora predeterminada para tickets de venta
                    </p>
                  </div>
                  <Switch
                    checked={editingPrinter.isDefault || false}
                    onCheckedChange={(checked) => setEditingPrinter((prev) => ({ ...prev, isDefault: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div>
                    <p className="font-medium text-sm">Habilitada</p>
                    <p className="text-xs text-muted-foreground">
                      {editingPrinter.enabled ? "La impresora esta activa y recibira trabajos" : "La impresora esta deshabilitada"}
                    </p>
                  </div>
                  <Switch
                    checked={editingPrinter.enabled ?? true}
                    onCheckedChange={(checked) => setEditingPrinter((prev) => ({ ...prev, enabled: checked }))}
                  />
                </div>
              </div>
            )}

            {/* AREAS */}
            {activeSection === "areas" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-base font-medium">Areas Asignadas</Label>
                  <p className="text-sm text-muted-foreground">
                    Selecciona en que areas se usara esta impresora para imprimir comandas.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {ASSIGNED_AREAS.map((area) => {
                    const isSelected = editingPrinter.assignedAreas?.includes(area.value as typeof editingPrinter.assignedAreas[number])
                    return (
                      <button
                        key={area.value}
                        type="button"
                        onClick={() => toggleArea(area.value)}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                          isSelected
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/30"
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                          isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                        }`}>
                          {isSelected && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
                        </div>
                        <span className="text-sm font-medium">{area.label}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Quick presets */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs bg-transparent"
                    onClick={() => setEditingPrinter((prev) => ({
                      ...prev,
                      assignedAreas: ["cocina", "parrilla"] as Printer["assignedAreas"],
                    }))}
                  >
                    Solo Cocina
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs bg-transparent"
                    onClick={() => setEditingPrinter((prev) => ({
                      ...prev,
                      assignedAreas: ["barra", "bebidas"] as Printer["assignedAreas"],
                    }))}
                  >
                    Solo Barra
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs bg-transparent"
                    onClick={() => setEditingPrinter((prev) => ({
                      ...prev,
                      assignedAreas: ["caja"] as Printer["assignedAreas"],
                    }))}
                  >
                    Solo Caja
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs bg-transparent"
                    onClick={() => setEditingPrinter((prev) => ({
                      ...prev,
                      assignedAreas: ASSIGNED_AREAS.map((a) => a.value) as unknown as Printer["assignedAreas"],
                    }))}
                  >
                    Todas
                  </Button>
                </div>

                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Categorias del Menu</Label>
                    <p className="text-sm text-muted-foreground">
                      Filtra que categorias se imprimen en esta impresora. Si no seleccionas ninguna, se imprimen todas.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {mockCategories.map((cat) => {
                      const isSelected = editingPrinter.printCategories?.includes(cat.id)
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => toggleCategory(cat.id)}
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                            isSelected
                              ? "border-primary bg-primary/10 text-foreground"
                              : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/30"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                            isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                          }`}>
                            {isSelected && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
                          </div>
                          <span className="text-sm">
                            {cat.icon} {cat.name}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {(editingPrinter.printCategories?.length || 0) === 0 && (
                    <p className="text-xs text-muted-foreground italic">
                      Sin filtro: se imprimiran comandas de todas las categorias.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* TICKET */}
            {activeSection === "ticket" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div>
                    <p className="font-medium text-sm">Corte Automatico</p>
                    <p className="text-xs text-muted-foreground">Cortar el papel despues de imprimir</p>
                  </div>
                  <Switch
                    checked={editingPrinter.autoCut ?? true}
                    onCheckedChange={(checked) => setEditingPrinter((prev) => ({ ...prev, autoCut: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div>
                    <p className="font-medium text-sm">Abrir Cajon de Dinero</p>
                    <p className="text-xs text-muted-foreground">Enviar pulso para abrir el cajon al imprimir</p>
                  </div>
                  <Switch
                    checked={editingPrinter.openCashDrawer ?? false}
                    onCheckedChange={(checked) => setEditingPrinter((prev) => ({ ...prev, openCashDrawer: checked }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Numero de Copias</Label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 bg-transparent"
                      onClick={() => setEditingPrinter((prev) => ({ ...prev, copies: Math.max(1, (prev.copies || 1) - 1) }))}
                    >
                      -
                    </Button>
                    <span className="text-lg font-bold w-8 text-center">{editingPrinter.copies || 1}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 bg-transparent"
                      onClick={() => setEditingPrinter((prev) => ({ ...prev, copies: Math.min(5, (prev.copies || 1) + 1) }))}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tamano de Fuente</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {FONT_SIZES.map((fs) => (
                      <button
                        key={fs.value}
                        type="button"
                        onClick={() => setEditingPrinter((prev) => ({ ...prev, fontSize: fs.value as Printer["fontSize"] }))}
                        className={`p-2 rounded-lg border text-sm font-medium transition-colors ${
                          editingPrinter.fontSize === fs.value
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/30"
                        }`}
                      >
                        {fs.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div>
                      <p className="font-medium text-sm">Imprimir Logo</p>
                      <p className="text-xs text-muted-foreground">Incluir logo del negocio en el ticket</p>
                    </div>
                    <Switch
                      checked={editingPrinter.printLogo ?? false}
                      onCheckedChange={(checked) => setEditingPrinter((prev) => ({ ...prev, printLogo: checked }))}
                    />
                  </div>

                  {editingPrinter.printLogo && (
                    <div className="space-y-2">
                      <Label>URL del Logo</Label>
                      <Input
                        placeholder="https://..."
                        value={editingPrinter.logoUrl || ""}
                        onChange={(e) => setEditingPrinter((prev) => ({ ...prev, logoUrl: e.target.value }))}
                      />
                      <p className="text-xs text-muted-foreground">
                        Imagen monocromatica de maximo 300px de ancho, formato BMP o PNG.
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div>
                      <p className="font-medium text-sm">Encabezado del Ticket</p>
                      <p className="text-xs text-muted-foreground">Texto en la parte superior del ticket</p>
                    </div>
                    <Switch
                      checked={editingPrinter.printHeader ?? true}
                      onCheckedChange={(checked) => setEditingPrinter((prev) => ({ ...prev, printHeader: checked }))}
                    />
                  </div>

                  {editingPrinter.printHeader && (
                    <div className="space-y-2">
                      <Label>Texto del Encabezado</Label>
                      <Textarea
                        placeholder="Nombre del Restaurante&#10;Direccion, Ciudad&#10;Tel: (555) 123-4567"
                        rows={3}
                        value={editingPrinter.headerText || ""}
                        onChange={(e) => setEditingPrinter((prev) => ({ ...prev, headerText: e.target.value }))}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div>
                      <p className="font-medium text-sm">Pie del Ticket</p>
                      <p className="text-xs text-muted-foreground">Texto en la parte inferior del ticket</p>
                    </div>
                    <Switch
                      checked={editingPrinter.printFooter ?? true}
                      onCheckedChange={(checked) => setEditingPrinter((prev) => ({ ...prev, printFooter: checked }))}
                    />
                  </div>

                  {editingPrinter.printFooter && (
                    <div className="space-y-2">
                      <Label>Texto del Pie</Label>
                      <Textarea
                        placeholder="Gracias por su visita&#10;www.mirestaurante.com"
                        rows={2}
                        value={editingPrinter.footerText || ""}
                        onChange={(e) => setEditingPrinter((prev) => ({ ...prev, footerText: e.target.value }))}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div>
                      <p className="font-medium text-sm">Codigo QR</p>
                      <p className="text-xs text-muted-foreground">Imprimir QR al final del ticket</p>
                    </div>
                    <Switch
                      checked={editingPrinter.printQR ?? false}
                      onCheckedChange={(checked) => setEditingPrinter((prev) => ({ ...prev, printQR: checked }))}
                    />
                  </div>

                  {editingPrinter.printQR && (
                    <div className="space-y-2">
                      <Label>Contenido del QR</Label>
                      <Input
                        placeholder="https://mirestaurante.com/encuesta"
                        value={editingPrinter.qrContent || ""}
                        onChange={(e) => setEditingPrinter((prev) => ({ ...prev, qrContent: e.target.value }))}
                      />
                      <p className="text-xs text-muted-foreground">
                        URL o texto que contendra el codigo QR (encuestas, redes sociales, etc.)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ADVANCED */}
            {activeSection === "advanced" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Juego de Comandos</Label>
                    <Select
                      value={editingPrinter.commandSet || "esc_pos"}
                      onValueChange={(v) => setEditingPrinter((prev) => ({ ...prev, commandSet: v as Printer["commandSet"] }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COMMAND_SETS.map((cs) => (
                          <SelectItem key={cs.value} value={cs.value}>
                            {cs.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Protocolo de comunicacion. Epson usa ESC/POS, Star usa StarLine.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Codificacion de Caracteres</Label>
                    <Select
                      value={editingPrinter.characterEncoding || "UTF-8"}
                      onValueChange={(v) => setEditingPrinter((prev) => ({ ...prev, characterEncoding: v }))}
                    >
                      <SelectTrigger className="font-mono">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTF-8">UTF-8</SelectItem>
                        <SelectItem value="CP437">CP437 (DOS)</SelectItem>
                        <SelectItem value="CP858">CP858 (Multilingue)</SelectItem>
                        <SelectItem value="CP1252">CP1252 (Windows)</SelectItem>
                        <SelectItem value="ISO-8859-1">ISO-8859-1 (Latin1)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    Sonido
                  </p>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div>
                      <p className="font-medium text-sm">Buzzer al Imprimir</p>
                      <p className="text-xs text-muted-foreground">Emitir sonido al recibir una comanda</p>
                    </div>
                    <Switch
                      checked={editingPrinter.buzzerOnPrint ?? false}
                      onCheckedChange={(checked) => setEditingPrinter((prev) => ({ ...prev, buzzerOnPrint: checked }))}
                    />
                  </div>

                  {editingPrinter.buzzerOnPrint && (
                    <div className="space-y-2">
                      <Label>Duracion del Buzzer (ms)</Label>
                      <div className="flex items-center gap-3">
                        <Input
                          type="range"
                          min={100}
                          max={1000}
                          step={100}
                          value={editingPrinter.buzzerDuration || 200}
                          onChange={(e) => setEditingPrinter((prev) => ({ ...prev, buzzerDuration: Number.parseInt(e.target.value) }))}
                          className="flex-1"
                        />
                        <span className="text-sm font-mono w-16 text-right">{editingPrinter.buzzerDuration || 200}ms</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <TestTube2 className="w-4 h-4" />
                    Pruebas y Diagnostico
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="bg-transparent gap-2">
                      <Zap className="w-4 h-4" />
                      Probar Conexion
                    </Button>
                    <Button variant="outline" className="bg-transparent gap-2">
                      <FileText className="w-4 h-4" />
                      Imprimir Prueba
                    </Button>
                    <Button variant="outline" className="bg-transparent gap-2">
                      <RefreshCw className="w-4 h-4" />
                      Reiniciar Impresora
                    </Button>
                    <Button variant="outline" className="bg-transparent gap-2">
                      <Settings2 className="w-4 h-4" />
                      Estado Detallado
                    </Button>
                  </div>

                  {editingPrinter.errorLog && (
                    <div className="space-y-2">
                      <Label>Ultimo Error</Label>
                      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm font-mono text-destructive">
                        {editingPrinter.errorLog}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2 pt-4 border-t border-border">
                  <Label>Notas</Label>
                  <Textarea
                    placeholder="Notas internas sobre esta impresora..."
                    rows={3}
                    value={editingPrinter.notes || ""}
                    onChange={(e) => setEditingPrinter((prev) => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="bg-transparent">
              Cancelar
            </Button>
            <Button onClick={handleSavePrinter} disabled={!editingPrinter.name.trim()}>
              {isEditing ? "Guardar Cambios" : "Agregar Impresora"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar impresora</AlertDialogTitle>
            <AlertDialogDescription>
              Estas seguro de que deseas eliminar la impresora <strong>{printerToDelete?.name}</strong>?
              Las areas asignadas dejaran de imprimir en esta impresora.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
