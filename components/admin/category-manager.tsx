"use client"

import { useState } from "react"
// import type { Category } from "@/lib/types"
// import { mockCategories } from "@/lib/mock-data"
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
  Plus,
  Edit,
  Trash2,
  GripVertical,
  Clock,
  Eye,
  EyeOff,
  ChefHat,
  Printer,
  Palette,
  Tag,
  FolderTree,
  Search,
  X,
} from "lucide-react"
import { Category } from "@/models/categoria.model"
import { useCategory } from "@/hooks/useCategory"
import { toast } from "sonner"

const PREPARATION_AREAS = [
  { value: "cocina", label: "Cocina" },
  { value: "barra", label: "Barra" },
  { value: "parrilla", label: "Parrilla" },
  { value: "postres", label: "Postres" },
  { value: "bebidas", label: "Bebidas" },
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

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#84cc16",
  "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6",
  "#6366f1", "#a855f7", "#ec4899", "#78716c",
]

const PRESET_ICONS = [
  "🥗", "🍽️", "🍹", "🍰", "⭐", "🍕", "🍔", "🌮",
  "🥩", "🐟", "🍝", "🥐", "☕", "🍺", "🍷", "🧁",
  "🥑", "🍣", "🥤", "🔥",
]

const emptyCategory: Category = {
  id: "",
  name: "",
  icon: "🍽️",
  slug: "",
  description: "",
  color: "#3b82f6",
  parentCategory: "",
  status: "active",
  sortOrder: 0,
  showInPOS: true,
  showInOnline: true,
  preparationArea: "cocina",
  defaultPrinter: "",
  taxRate: 16,
  availableFrom: "",
  availableTo: "",
  availableDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
  productCount: 0,
}

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]
    // mockCategories.map((c, i) => ({
    //   ...c,
    //   status: "active" as const,
    //   sortOrder: i + 1,
    //   showInPOS: true,
    //   showInOnline: true,
    //   color: PRESET_COLORS[i % PRESET_COLORS.length],
    //   preparationArea: (i < 2 ? "cocina" : i === 2 ? "barra" : i === 3 ? "postres" : "cocina") as Category["preparationArea"],
    //   availableDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    //   taxRate: 16,
    //   productCount: [3, 5, 4, 3, 1][i] || 0,
    // }))
  )

  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category>(emptyCategory)
  const [isEditing, setIsEditing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeSection, setActiveSection] = useState<"general" | "display" | "operations" | "schedule">("general")

  // Cargar las categorias
  const { 
    categorias,
    crearCategoria,
    actualizarCategoria,
    actualizarDisponibilidad,
    eliminarCategoria,
  } = useCategory();

  const filteredCategories = categorias.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleNewCategory = () => {
    setEditingCategory({
      ...emptyCategory,
      id: "",
      sortOrder: categorias.length + 1,
    })
    setIsEditing(false)
    setActiveSection("general")
    setDialogOpen(true)
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory({ ...category })
    setIsEditing(true)
    setActiveSection("general")
    setDialogOpen(true)
  }

  const handleSaveCategory = async () => {
    if (!editingCategory.name.trim()) return

    if (isEditing) {
      setCategories((prev) =>
        prev.map((c) => (c.id === editingCategory.id ? { ...editingCategory, updatedAt: new Date() } : c))
      )
    } else {
      setCategories((prev) => [
        ...prev,
        { ...editingCategory, createdAt: new Date(), updatedAt: new Date() },
      ])
    }

    try {
      const response = 
        editingCategory.id
        ? await actualizarCategoria(editingCategory)
        : await crearCategoria(editingCategory);

      toast.success(response.message, {
        style: {
          background: "#16a34a",
          color: "#ffffff",
          border: "1px solid #15803d",
        },
      });

      setDialogOpen(false);
      setEditingCategory(emptyCategory);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error guardando categoria",
        {
          style: {
            background: "#dc2626",
            color: "#ffffff",
            border: "1px solid #b91c1c",
          },
        },
      );

      setDialogOpen(true);
      setEditingCategory(editingCategory);
    }
  }

  const handleRequestDelete = (category: Category) => {
    setCategoryToDelete(category)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (categoryToDelete) {
      setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id))
      try {
        await eliminarCategoria(categoryToDelete.id);
      } catch (error) {
        error instanceof Error ? error.message : "Error al eliminar la categoria.";
      } finally {
        setDeleteDialogOpen(false)
        setCategoryToDelete(null)
      }
    }
  }

  const handleToggleStatus = (id: string) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: c.status === "active" ? ("inactive" as const) : ("active" as const) }
          : c
      )
    )
    
  }

  const toggleDay = (day: string) => {
    setEditingCategory((prev) => {
      const days = prev.availableDays || []
      return {
        ...prev,
        availableDays: days.includes(day) ? days.filter((d) => d !== day) : [...days, day],
      }
    })
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Categorias
            </CardTitle>
            <CardDescription>Organiza el menu en categorias y subcategorias</CardDescription>
          </div>
          <Button size="sm" onClick={handleNewCategory}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Categoria
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        {categories.length > 4 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar categoria..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        {/* Category list */}
        <div className="space-y-2">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                category.status === "inactive"
                  ? "bg-muted/30 border-border/50 opacity-60"
                  : "bg-secondary/50 border-border hover:border-primary/30"
              }`}
            >
              <GripVertical className="w-4 h-4 text-muted-foreground shrink-0 cursor-grab" />

              {/* Color indicator + Icon */}
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
                style={{ backgroundColor: `${category.color || "#3b82f6"}20` }}
              >
                {category.icon}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{category.name}</p>
                  {category.status === "inactive" && (
                    <Badge variant="secondary" className="text-xs">Inactiva</Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                  {category.productCount !== undefined && (
                    <span>{category.productCount} productos</span>
                  )}
                  {category.preparationArea && (
                    <span className="flex items-center gap-1">
                      <ChefHat className="w-3 h-3" />
                      {PREPARATION_AREAS.find((a) => a.value === category.preparationArea)?.label}
                    </span>
                  )}
                  {(category.availableFrom || category.availableTo) && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {category.availableFrom} - {category.availableTo}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    {category.showInPOS ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    POS
                  </span>
                </div>
              </div>

              {/* Color dot */}
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: category.color || "#3b82f6" }}
              />

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <Switch
                  checked={category.status === "active"}
                  onCheckedChange={(checked) => actualizarDisponibilidad(category.id, checked)}
                />
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditCategory(category)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleRequestDelete(category)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}

          {filteredCategories.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "No se encontraron categorias" : "No hay categorias registradas"}
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
          <span>{categorias.length} categorias en total</span>
          <span>{categorias.filter((c) => c.status === "active").length} activas</span>
        </div>
      </CardContent>

      {/* Category Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Categoria" : "Nueva Categoria"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Modifica los datos de la categoria"
                : "Completa los datos para crear una nueva categoria"}
            </DialogDescription>
          </DialogHeader>

          {/* Section tabs */}
          <div className="flex gap-1 border-b border-border pb-2">
            {(
              [
                { id: "general" as const, label: "General", icon: Tag },
                { id: "display" as const, label: "Presentacion", icon: Palette },
                { id: "operations" as const, label: "Operacion", icon: ChefHat },
                { id: "schedule" as const, label: "Horario", icon: Clock },
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
            {/* GENERAL */}
            {activeSection === "general" && (
              <div className="space-y-4">
                <div className="grid grid-cols-[1fr_auto] gap-4">
                  <div className="space-y-2">
                    <Label>Nombre de la Categoria <span className="text-destructive">*</span></Label>
                    <Input
                      placeholder="Ej: Platos Fuertes"
                      value={editingCategory.name}
                      onChange={(e) => {
                        const name = e.target.value
                        setEditingCategory((prev) => ({
                          ...prev,
                          name,
                          slug: prev.slug === generateSlug(prev.name) || !prev.slug
                            ? generateSlug(name)
                            : prev.slug,
                        }))
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Icono</Label>
                    <div className="relative">
                      <button
                        type="button"
                        className="w-12 h-10 rounded-md border border-border flex items-center justify-center text-xl hover:bg-secondary transition-colors"
                        onClick={() => {
                          const currentIdx = PRESET_ICONS.indexOf(editingCategory.icon)
                          const nextIdx = (currentIdx + 1) % PRESET_ICONS.length
                          setEditingCategory((prev) => ({ ...prev, icon: PRESET_ICONS[nextIdx] }))
                        }}
                      >
                        {editingCategory.icon}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Icon picker grid */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Seleccionar Icono</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_ICONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setEditingCategory((prev) => ({ ...prev, icon }))}
                        className={`w-9 h-9 rounded-md flex items-center justify-center text-lg transition-colors border ${
                          editingCategory.icon === icon
                            ? "border-primary bg-primary/10"
                            : "border-transparent hover:bg-secondary"
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Slug / URL</Label>
                  <Input
                    placeholder="platos-fuertes"
                    value={editingCategory.slug || ""}
                    onChange={(e) =>
                      setEditingCategory((prev) => ({ ...prev, slug: e.target.value }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Identificador unico para URLs. Se genera automaticamente.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Descripcion</Label>
                  <Textarea
                    placeholder="Describe brevemente esta categoria..."
                    rows={3}
                    value={editingCategory.description || ""}
                    onChange={(e) =>
                      setEditingCategory((prev) => ({ ...prev, description: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Categoria Padre</Label>
                  <Select
                    value={editingCategory.parentCategory || "none"}
                    onValueChange={(v) =>
                      setEditingCategory((prev) => ({
                        ...prev,
                        parentCategory: v === "none" ? "" : v,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Ninguna (categoria principal)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <span className="flex items-center gap-2">
                          <FolderTree className="w-4 h-4" />
                          Ninguna (categoria principal)
                        </span>
                      </SelectItem>
                      {categorias
                        .filter((c) => c.id !== editingCategory.id)
                        .map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            <span className="flex items-center gap-2">
                              {c.icon} {c.name}
                            </span>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Asigna como subcategoria de otra para crear jerarquias.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Orden de aparicion</Label>
                  <Input
                    type="number"
                    min={1}
                    value={editingCategory.sortOrder || 1}
                    onChange={(e) =>
                      setEditingCategory((prev) => ({
                        ...prev,
                        sortOrder: Number.parseInt(e.target.value) || 1,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div>
                    <p className="font-medium text-sm">Estado</p>
                    <p className="text-xs text-muted-foreground">
                      {editingCategory.status === "active" ? "Visible y activa" : "Oculta e inactiva"}
                    </p>
                  </div>
                  <Switch
                    checked={editingCategory.status === "active"}
                    onCheckedChange={(checked) =>
                      setEditingCategory((prev) => ({
                        ...prev,
                        status: checked ? "active" : "inactive",
                      }))
                    }
                  />
                </div>
              </div>
            )}

            {/* DISPLAY */}
            {activeSection === "display" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Color de Identificacion</Label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setEditingCategory((prev) => ({ ...prev, color }))}
                        className={`w-8 h-8 rounded-full transition-all ${
                          editingCategory.color === color
                            ? "ring-2 ring-offset-2 ring-offset-background ring-primary scale-110"
                            : "hover:scale-110"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Label className="text-xs text-muted-foreground shrink-0">Personalizado:</Label>
                    <Input
                      type="color"
                      className="w-10 h-8 p-0.5 cursor-pointer"
                      value={editingCategory.color || "#3b82f6"}
                      onChange={(e) =>
                        setEditingCategory((prev) => ({ ...prev, color: e.target.value }))
                      }
                    />
                    <Input
                      className="w-28 font-mono text-xs"
                      value={editingCategory.color || "#3b82f6"}
                      onChange={(e) =>
                        setEditingCategory((prev) => ({ ...prev, color: e.target.value }))
                      }
                    />
                  </div>
                </div>

                {/* Preview */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Vista previa</Label>
                  <div className="flex items-center gap-3 p-4 rounded-lg border border-border">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${editingCategory.color || "#3b82f6"}20` }}
                    >
                      {editingCategory.icon}
                    </div>
                    <div>
                      <p className="font-medium">{editingCategory.name || "Nombre de Categoria"}</p>
                      <p className="text-xs text-muted-foreground">
                        {editingCategory.description || "Descripcion de la categoria"}
                      </p>
                    </div>
                    <div className="ml-auto">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: editingCategory.color || "#3b82f6" }}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>URL de Imagen</Label>
                  <Input
                    placeholder="https://ejemplo.com/imagen.jpg"
                    value={editingCategory.image || ""}
                    onChange={(e) =>
                      setEditingCategory((prev) => ({ ...prev, image: e.target.value }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Imagen representativa para el menu online.
                  </p>
                </div>

                <div className="space-y-3">
                  <Label>Visibilidad</Label>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Mostrar en POS</p>
                        <p className="text-xs text-muted-foreground">Visible para meseros y cajeros</p>
                      </div>
                    </div>
                    <Switch
                      checked={editingCategory.showInPOS !== false}
                      onCheckedChange={(checked) =>
                        setEditingCategory((prev) => ({ ...prev, showInPOS: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Mostrar en Menu Online</p>
                        <p className="text-xs text-muted-foreground">Visible en pedidos en linea</p>
                      </div>
                    </div>
                    <Switch
                      checked={editingCategory.showInOnline !== false}
                      onCheckedChange={(checked) =>
                        setEditingCategory((prev) => ({ ...prev, showInOnline: checked }))
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {/* OPERATIONS */}
            {activeSection === "operations" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Area de Preparacion</Label>
                  <Select
                    value={editingCategory.preparationArea || "cocina"}
                    onValueChange={(v) =>
                      setEditingCategory((prev) => ({
                        ...prev,
                        preparationArea: v as Category["preparationArea"],
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PREPARATION_AREAS.map((area) => (
                        <SelectItem key={area.value} value={area.value}>
                          <span className="flex items-center gap-2">
                            <ChefHat className="w-4 h-4" />
                            {area.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Los pedidos de esta categoria se envian a esta area.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Impresora por Defecto</Label>
                  <Select
                    value={editingCategory.defaultPrinter || "auto"}
                    onValueChange={(v) =>
                      setEditingCategory((prev) => ({
                        ...prev,
                        defaultPrinter: v === "auto" ? "" : v,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">
                        <span className="flex items-center gap-2">
                          <Printer className="w-4 h-4" />
                          Automatica (segun area)
                        </span>
                      </SelectItem>
                      <SelectItem value="cocina-principal">
                        <span className="flex items-center gap-2">
                          <Printer className="w-4 h-4" />
                          Cocina Principal (192.168.1.100)
                        </span>
                      </SelectItem>
                      <SelectItem value="caja">
                        <span className="flex items-center gap-2">
                          <Printer className="w-4 h-4" />
                          Caja (192.168.1.101)
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Impresora donde se envian las comandas de esta categoria.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Tasa de Impuesto (%)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      className="w-24"
                      value={editingCategory.taxRate ?? 16}
                      onChange={(e) =>
                        setEditingCategory((prev) => ({
                          ...prev,
                          taxRate: Number.parseFloat(e.target.value) || 0,
                        }))
                      }
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Impuesto aplicado a todos los productos de esta categoria. Sobrescribe el impuesto global si es diferente.
                  </p>
                </div>

                {/* Info box */}
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-sm font-medium text-primary">Herencia de configuracion</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Los productos heredan la configuracion de area de preparacion, impresora e impuesto de su categoria, a menos que tengan una configuracion propia.
                  </p>
                </div>
              </div>
            )}

            {/* SCHEDULE */}
            {activeSection === "schedule" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Horario de Disponibilidad</Label>
                  <p className="text-xs text-muted-foreground">
                    Define en que horario esta disponible esta categoria. Si se deja vacio, estara disponible todo el dia.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Desde</Label>
                      <Input
                        type="time"
                        value={editingCategory.availableFrom || ""}
                        onChange={(e) =>
                          setEditingCategory((prev) => ({ ...prev, availableFrom: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Hasta</Label>
                      <Input
                        type="time"
                        value={editingCategory.availableTo || ""}
                        onChange={(e) =>
                          setEditingCategory((prev) => ({ ...prev, availableTo: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                  {editingCategory.availableFrom && editingCategory.availableTo && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground"
                      onClick={() =>
                        setEditingCategory((prev) => ({
                          ...prev,
                          availableFrom: "",
                          availableTo: "",
                        }))
                      }
                    >
                      <X className="w-3 h-3 mr-1" />
                      Limpiar horario
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Dias Disponibles</Label>
                  <p className="text-xs text-muted-foreground">
                    Selecciona los dias en que esta categoria estara activa.
                  </p>
                  <div className="flex gap-1.5">
                    {DAYS_OF_WEEK.map((day) => {
                      const isSelected = (editingCategory.availableDays || []).includes(day.value)
                      return (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => toggleDay(day.value)}
                          className={`w-10 h-10 rounded-lg text-xs font-medium transition-colors border ${
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-secondary/50 text-muted-foreground border-border hover:bg-secondary"
                          }`}
                        >
                          {day.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Quick presets */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Presets rapidos</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs bg-transparent"
                      onClick={() =>
                        setEditingCategory((prev) => ({
                          ...prev,
                          availableDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
                        }))
                      }
                    >
                      Todos los dias
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs bg-transparent"
                      onClick={() =>
                        setEditingCategory((prev) => ({
                          ...prev,
                          availableDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
                        }))
                      }
                    >
                      Lunes a Viernes
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs bg-transparent"
                      onClick={() =>
                        setEditingCategory((prev) => ({
                          ...prev,
                          availableDays: ["saturday", "sunday"],
                        }))
                      }
                    >
                      Fin de semana
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs bg-transparent"
                      onClick={() =>
                        setEditingCategory((prev) => ({
                          ...prev,
                          availableFrom: "06:00",
                          availableTo: "12:00",
                        }))
                      }
                    >
                      Desayuno (6-12)
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs bg-transparent"
                      onClick={() =>
                        setEditingCategory((prev) => ({
                          ...prev,
                          availableFrom: "12:00",
                          availableTo: "17:00",
                        }))
                      }
                    >
                      Comida (12-17)
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs bg-transparent"
                      onClick={() =>
                        setEditingCategory((prev) => ({
                          ...prev,
                          availableFrom: "17:00",
                          availableTo: "23:00",
                        }))
                      }
                    >
                      Cena (17-23)
                    </Button>
                  </div>
                </div>

                {/* Schedule summary */}
                <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                  <p className="text-sm font-medium mb-1">Resumen de Disponibilidad</p>
                  <p className="text-xs text-muted-foreground">
                    {(editingCategory.availableDays || []).length === 7
                      ? "Todos los dias"
                      : (editingCategory.availableDays || []).length === 0
                        ? "Ningun dia seleccionado"
                        : `${(editingCategory.availableDays || [])
                            .map((d) => DAYS_OF_WEEK.find((dw) => dw.value === d)?.label)
                            .join(", ")}`}
                    {editingCategory.availableFrom && editingCategory.availableTo
                      ? ` de ${editingCategory.availableFrom} a ${editingCategory.availableTo}`
                      : " - Todo el dia"}
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" className="bg-transparent" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveCategory} disabled={!editingCategory.name.trim()}>
              {isEditing ? "Guardar Cambios" : "Crear Categoria"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Categoria</AlertDialogTitle>
            <AlertDialogDescription>
              {categoryToDelete && (
                <>
                  Estas seguro de eliminar la categoria <strong>{categoryToDelete.name}</strong>?
                  {(categoryToDelete.productCount ?? 0) > 0 && (
                    <span className="block mt-2 text-destructive font-medium">
                      Esta categoria tiene {categoryToDelete.productCount} productos asociados.
                      Los productos quedaran sin categoria asignada.
                    </span>
                  )}
                </>
              )}
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
