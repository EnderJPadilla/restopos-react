"use client"

import { useState, useRef } from "react"
// import type { MenuItem, ProductVariation, NutritionalInfo } from "@/lib/types"
import { mockCategories } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  X,
  Plus,
  ImageIcon,
  Trash2,
  Save,
  ArrowLeft,
  Package,
  DollarSign,
  Clock,
  Leaf,
  AlertTriangle,
  Palette,
  Tags,
  BarChart3,
  Utensils,
  GripVertical,
} from "lucide-react"

import { formatCurrency } from "@/lib/formatters";
import { UploadService } from "@/services/upload.service"
import { toast } from "sonner"
import { getImageUrl } from "@/lib/images"
import { formatDateTimeLocal } from "@/lib/date-utils"
import { MenuItem, NutritionalInfo, ProductVariation } from "@/models/producto.model"

interface ProductFormProps {
  product?: MenuItem
  onSave: (product: MenuItem) => void
  onCancel: () => void
}

const preparationAreas = [
  { id: "cocina", name: "Cocina" },
  { id: "barra", name: "Barra" },
  { id: "parrilla", name: "Parrilla" },
  { id: "postres", name: "Postres" },
  { id: "bebidas", name: "Bebidas" },
]

const units = [
  { id: "pieza", name: "Pieza" },
  { id: "kg", name: "Kilogramo" },
  { id: "litro", name: "Litro" },
  { id: "porción", name: "Porción" },
  { id: "orden", name: "Orden" },
]

const allergensList = [
  "Gluten",
  "Crustáceos",
  "Huevo",
  "Pescado",
  "Cacahuate",
  "Soya",
  "Lácteos",
  "Nueces",
  "Apio",
  "Mostaza",
  "Sésamo",
  "Sulfitos",
  "Moluscos",
  "Altramuces",
]

const defaultProduct: Partial<MenuItem> = {
  name: "",
  price: 0,
  category: "",
  available: true,
  description: "",
  trackInventory: false,
  taxIncluded: true,
  taxRate: 16,
  priceType: "fixed",
  unit: "pieza",
  showInPOS: true,
  showInOnline: true,
  featured: false,
  isVegetarian: false,
  isVegan: false,
  isGlutenFree: false,
  isSpicy: false,
  variations: [],
  allergens: [],
  tags: [],
  relatedProducts: [],
}

export function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    ...defaultProduct,
    ...product,
  })
  const [newTag, setNewTag] = useState("")
  const [newVariation, setNewVariation] = useState<Partial<ProductVariation>>({
    name: "",
    priceModifier: 0,
    available: true,
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      if (!file.type.startsWith("image/")) {
        toast.error(
          "Por favor selecciona una imagen válida.",
          {
            style: {
              background: "#dc2626",
              color: "#ffffff",
              border: "1px solid #b91c1c",
            },
          }
        );
        return;
      }

      if ( file.size > 5 * 1024 * 1024 ) {
        toast.error(
          "La imagen no debe superar los 5MB.",
          {
            style: {
              background: "#dc2626",
              color: "#ffffff",
              border: "1px solid #b91c1c",
            },
          }
        );
        return;
      }

      const imageUrl = await UploadService.subirImagen(file, "img_producto");
      // Vista previa
      setImagePreview(imageUrl);
      // Guardar URL para enviar a PostgreSQL
      updateField("image", imageUrl);

    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error subiendo imagen",
        {
          style: {
            background: "#dc2626",
            color: "#ffffff",
            border: "1px solid #b91c1c",
          },
        }
      );
    } finally {
      setUploadingImage(false);
    }

  };

  const updateField = <K extends keyof MenuItem>(field: K, value: MenuItem[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const updateNutritionalInfo = <K extends keyof NutritionalInfo>(
    field: K,
    value: NutritionalInfo[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      nutritionalInfo: { ...prev.nutritionalInfo, [field]: value },
    }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      updateField("tags", [...(formData.tags || []), newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tag: string) => {
    updateField(
      "tags",
      formData.tags?.filter((t) => t !== tag) || []
    )
  }

  const toggleAllergen = (allergen: string) => {
    const current = formData.allergens || []
    if (current.includes(allergen)) {
      updateField(
        "allergens",
        current.filter((a) => a !== allergen)
      )
    } else {
      updateField("allergens", [...current, allergen])
    }
  }

  const addVariation = () => {
    if (newVariation.name?.trim()) {
      const variation: ProductVariation = {
        id: `var-${Date.now()}`,
        name: newVariation.name.trim(),
        priceModifier: newVariation.priceModifier || 0,
        available: newVariation.available ?? true,
      }
      updateField("variations", [...(formData.variations || []), variation])
      setNewVariation({ name: "", priceModifier: 0, available: true })
    }
  }

  const removeVariation = (id: string) => {
    updateField(
      "variations",
      formData.variations?.filter((v) => v.id !== id) || []
    )
  }

  const handleSubmit = () => {
    const productData: MenuItem = {
      id: formData.id || '',
      name: formData.name || "",
      price: formData.price || 0,
      category: formData.category || "",
      available: formData.available ?? true,
      removeImage: formData.removeImage ?? false,
      ...formData,
      createdAt: formData.createdAt || new Date(),
      updatedAt: new Date(),
    }
    onSave(productData)
  }

  const marginPercent =
    formData.price && formData.cost
      ? (((formData.price - formData.cost) / formData.price) * 100).toFixed(1)
      : null

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-background sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold">
              {product ? "Editar Producto" : "Nuevo Producto"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Complete la información del producto
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onCancel} className="bg-transparent">
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            <Save className="w-4 h-4 mr-2" />
            Guardar Producto
          </Button>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-auto p-6">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid grid-cols-6 w-full max-w-3xl">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="pricing">Precios</TabsTrigger>
            <TabsTrigger value="inventory">Inventario</TabsTrigger>
            <TabsTrigger value="preparation">Preparación</TabsTrigger>
            <TabsTrigger value="dietary">Dieta</TabsTrigger>
            <TabsTrigger value="display">Presentación</TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Info */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Información General
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre del Producto *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        placeholder="Ej: Hamburguesa Clásica"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sku">SKU / Código Interno</Label>
                      <Input
                        id="sku"
                        value={formData.sku || ""}
                        onChange={(e) => updateField("sku", e.target.value)}
                        placeholder="Ej: HAM-001"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="barcode">Código de Barras</Label>
                      <Input
                        id="barcode"
                        value={formData.barcode || ""}
                        onChange={(e) => updateField("barcode", e.target.value)}
                        placeholder="Ej: 7501234567890"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Categoría *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => updateField("category", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockCategories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.icon} {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shortDescription">Descripción Corta</Label>
                    <Input
                      id="shortDescription"
                      value={formData.shortDescription || ""}
                      onChange={(e) => updateField("shortDescription", e.target.value)}
                      placeholder="Descripción breve para el ticket"
                      maxLength={50}
                    />
                    <p className="text-xs text-muted-foreground">
                      Máximo 50 caracteres. Se muestra en tickets y POS.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción Completa</Label>
                    <Textarea
                      id="description"
                      value={formData.description || ""}
                      onChange={(e) => updateField("description", e.target.value)}
                      placeholder="Descripción detallada del producto, ingredientes, etc."
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div>
                      <p className="font-medium">Producto Disponible</p>
                      <p className="text-sm text-muted-foreground">
                        Mostrar en menú y permitir pedidos
                      </p>
                    </div>
                    <Switch
                      checked={formData.available}
                      onCheckedChange={(checked) => updateField("available", checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Image */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Imagen
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-lg border-2 border-dashed border-border bg-secondary/30 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-secondary/50 transition-colors overflow-hidden relative group"
                  >
                    {formData.image ? (
                      <>
                        <img
                          src={getImageUrl(formData.image) || "/placeholder.svg"}
                          alt={formData.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-background/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button variant="secondary" size="sm">
                            <ImageIcon className="w-4 h-4 mr-2" />
                            Cambiar Imagen
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* <ImageIcon className="w-10 h-10 text-muted-foreground" /> */}
                        {
                          imagePreview
                            ? (
                              <img
                                src={getImageUrl(imagePreview)}
                                alt="Vista previa de la imagen"
                                className="w-full h-full object-cover rounded-md"
                              />
                            )
                            : (
                              <ImageIcon
                                className="
                                  w-10
                                  h-10
                                  text-muted-foreground
                                "
                              />
                            )
                        }
                        <p className="text-sm text-muted-foreground text-center px-4">
                          Clic para subir
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="bg-transparent"
                          disabled={uploadingImage}
                          onClick={(e) => {
                            e.stopPropagation()
                            fileInputRef.current?.click()
                          }}
                        >
                          {
                            uploadingImage
                              ? "Subiendo..."
                              : "Seleccionar Archivo"
                          }
                        </Button>
                      </>
                    )}
                  </div>
                  {formData.image && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full bg-transparent text-destructive hover:text-destructive"
                      onClick={() => {
                        updateField("imageAnt", formData.image)
                        updateField("image", "")
                        updateField("removeImage", true)
                        setImagePreview(null);
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Quitar Imagen
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground text-center">
                    Formatos: JPG, PNG, WebP. Tamaño máximo: 5MB
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Tags className="w-5 h-5" />
                  Etiquetas
                </CardTitle>
                <CardDescription>
                  Agrega etiquetas para organizar y filtrar productos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Nueva etiqueta..."
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  />
                  <Button onClick={addTag} variant="outline" className="bg-transparent">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags?.map((tag) => (
                    <Badge key={tag} variant="secondary" className="px-3 py-1">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="ml-2 hover:text-destructive">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                  {(!formData.tags || formData.tags.length === 0) && (
                    <p className="text-sm text-muted-foreground">
                      No hay etiquetas agregadas
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Precio y Costo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="priceType">Tipo de Precio</Label>
                    <Select
                      value={formData.priceType}
                      onValueChange={(value: "fixed" | "variable" | "by_weight") =>
                        updateField("priceType", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Precio Fijo</SelectItem>
                        <SelectItem value="variable">Precio Variable</SelectItem>
                        <SelectItem value="by_weight">Por Peso</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Precio de Venta *</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          $
                        </span>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.price}
                          onChange={(e) => updateField("price", Number.parseFloat(e.target.value) || 0)}
                          className="pl-7"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cost">Costo</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          $
                        </span>
                        <Input
                          id="cost"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.cost || ""}
                          onChange={(e) => updateField("cost", Number.parseFloat(e.target.value) || 0)}
                          className="pl-7"
                        />
                      </div>
                    </div>
                  </div>

                  {marginPercent && (
                    <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                      <p className="text-sm font-medium text-success">
                        Margen de ganancia: {marginPercent}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {/* Ganancia: ${(formData.price! - formData.cost!).toFixed(2)} por unidad */}
                        Ganancia: {formatCurrency(formData.price! - formData.cost!)} por unidad
                      </p>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="taxRate">Tasa de Impuesto (%)</Label>
                      <Input
                        id="taxRate"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={formData.taxRate || 16}
                        onChange={(e) => updateField("taxRate", Number.parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-7">
                      <Switch
                        checked={formData.taxIncluded}
                        onCheckedChange={(checked) => updateField("taxIncluded", checked)}
                      />
                      <Label>Impuesto incluido en precio</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Precio Especial / Promoción</CardTitle>
                  <CardDescription>
                    Configura un precio promocional temporal
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="specialPrice">Precio Especial</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        id="specialPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.specialPrice || ""}
                        onChange={(e) =>
                          updateField("specialPrice", Number.parseFloat(e.target.value) || undefined)
                        }
                        className="pl-7"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="specialPriceStart">Fecha Inicio</Label>
                      <Input
                        id="specialPriceStart"
                        type="datetime-local"
                        value={formatDateTimeLocal(formData.specialPriceStart)}
                        onChange={(e) =>
                          updateField("specialPriceStart", e.target.value ? new Date(e.target.value) : undefined)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="specialPriceEnd">Fecha Fin</Label>
                      <Input
                        id="specialPriceEnd"
                        type="datetime-local"
                        value={formatDateTimeLocal(formData.specialPriceEnd)}
                        onChange={(e) =>
                          updateField("specialPriceEnd", e.target.value ? new Date(e.target.value) : undefined)
                        }
                      />
                    </div>
                  </div>

                  {formData.specialPrice && formData.price && (
                    <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                      <p className="text-sm font-medium text-warning">
                        Descuento:{" "}
                        {(((formData.price - formData.specialPrice) / formData.price) * 100).toFixed(0)}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Ahorro: {formatCurrency(formData.price - formData.specialPrice)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Variations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Variaciones del Producto</CardTitle>
                <CardDescription>
                  Agrega opciones como tamaños, sabores, o presentaciones
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <Switch
                    checked={formData.hasVariations}
                    onCheckedChange={(checked) => updateField("hasVariations", checked)}
                  />
                  <div>
                    <p className="font-medium">Producto con variaciones</p>
                    <p className="text-sm text-muted-foreground">
                      Permite seleccionar opciones al agregar al pedido
                    </p>
                  </div>
                </div>

                {formData.hasVariations && (
                  <>
                    <div className="grid md:grid-cols-4 gap-2">
                      <Input
                        value={newVariation.name || ""}
                        onChange={(e) =>
                          setNewVariation((prev) => ({ ...prev, name: e.target.value }))
                        }
                        placeholder="Nombre (ej: Grande)"
                        className="md:col-span-2"
                      />
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                          +$
                        </span>
                        <Input
                          type="number"
                          step="0.01"
                          value={newVariation.priceModifier || ""}
                          onChange={(e) =>
                            setNewVariation((prev) => ({
                              ...prev,
                              priceModifier: Number.parseFloat(e.target.value) || 0,
                            }))
                          }
                          placeholder="Diferencia"
                          className="pl-8"
                        />
                      </div>
                      <Button onClick={addVariation} variant="outline" className="bg-transparent">
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {formData.variations?.map((variation) => (
                        <div
                          key={variation.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                        >
                          <div className="flex items-center gap-3">
                            <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                            <div>
                              <p className="font-medium">{variation.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {variation.priceModifier >= 0 ? "+" : ""}$
                                {variation.priceModifier.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={variation.available}
                              onCheckedChange={(checked) => {
                                updateField(
                                  "variations",
                                  formData.variations?.map((v) =>
                                    v.id === variation.id ? { ...v, available: checked } : v
                                  )
                                )
                              }}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeVariation(variation.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {(!formData.variations || formData.variations.length === 0) && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No hay variaciones agregadas
                        </p>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Control de Inventario
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <Switch
                    checked={formData.trackInventory}
                    onCheckedChange={(checked) => updateField("trackInventory", checked)}
                  />
                  <div>
                    <p className="font-medium">Controlar inventario</p>
                    <p className="text-sm text-muted-foreground">
                      Llevar control de existencias y recibir alertas de stock bajo
                    </p>
                  </div>
                </div>

                {formData.trackInventory && (
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stockQuantity">Cantidad en Stock</Label>
                      <Input
                        id="stockQuantity"
                        type="number"
                        min="0"
                        value={formData.stockQuantity || ""}
                        onChange={(e) =>
                          updateField("stockQuantity", Number.parseInt(e.target.value) || 0)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lowStockThreshold">Alerta de Stock Bajo</Label>
                      <Input
                        id="lowStockThreshold"
                        type="number"
                        min="0"
                        value={formData.lowStockThreshold || ""}
                        onChange={(e) =>
                          updateField("lowStockThreshold", Number.parseInt(e.target.value) || 0)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit">Unidad de Medida</Label>
                      <Select
                        value={formData.unit}
                        onValueChange={(value: "pieza" | "kg" | "litro" | "porción" | "orden") =>
                          updateField("unit", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map((unit) => (
                            <SelectItem key={unit.id} value={unit.id}>
                              {unit.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preparation Tab */}
          <TabsContent value="preparation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Preparación y Cocina
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="preparationTime">Tiempo de Preparación (minutos)</Label>
                    <Input
                      id="preparationTime"
                      type="number"
                      min="0"
                      value={formData.preparationTime || ""}
                      onChange={(e) =>
                        updateField("preparationTime", Number.parseInt(e.target.value) || 0)
                      }
                      placeholder="Ej: 15"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preparationArea">Área de Preparación</Label>
                    <Select
                      value={formData.preparationArea}
                      onValueChange={(value: "cocina" | "barra" | "parrilla" | "postres" | "bebidas") =>
                        updateField("preparationArea", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar área" />
                      </SelectTrigger>
                      <SelectContent>
                        {preparationAreas.map((area) => (
                          <SelectItem key={area.id} value={area.id}>
                            {area.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="printer">Impresora de Comandas</Label>
                  <Select
                    value={formData.printer}
                    onValueChange={(value) => updateField("printer", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar impresora" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cocina-principal">Cocina Principal</SelectItem>
                      <SelectItem value="barra">Barra</SelectItem>
                      <SelectItem value="parrilla">Parrilla</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas de Preparación</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes || ""}
                    onChange={(e) => updateField("notes", e.target.value)}
                    placeholder="Instrucciones especiales para la preparación..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dietary Tab */}
          <TabsContent value="dietary" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Leaf className="w-5 h-5" />
                    Información Dietética
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                      <Switch
                        checked={formData.isVegetarian}
                        onCheckedChange={(checked) => updateField("isVegetarian", checked)}
                      />
                      <Label>Vegetariano</Label>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                      <Switch
                        checked={formData.isVegan}
                        onCheckedChange={(checked) => updateField("isVegan", checked)}
                      />
                      <Label>Vegano</Label>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                      <Switch
                        checked={formData.isGlutenFree}
                        onCheckedChange={(checked) => updateField("isGlutenFree", checked)}
                      />
                      <Label>Sin Gluten</Label>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                      <Switch
                        checked={formData.isSpicy}
                        onCheckedChange={(checked) => updateField("isSpicy", checked)}
                      />
                      <Label>Picante</Label>
                    </div>
                  </div>

                  {formData.isSpicy && (
                    <div className="space-y-2">
                      <Label>Nivel de Picante</Label>
                      <div className="flex gap-2">
                        {[1, 2, 3].map((level) => (
                          <Button
                            key={level}
                            variant={formData.spicyLevel === level ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateField("spicyLevel", level as 1 | 2 | 3)}
                            className={formData.spicyLevel !== level ? "bg-transparent" : ""}
                          >
                            {"🌶️".repeat(level)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Alérgenos
                  </CardTitle>
                  <CardDescription>
                    Selecciona los alérgenos presentes en el producto
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {allergensList.map((allergen) => (
                      <Badge
                        key={allergen}
                        variant={formData.allergens?.includes(allergen) ? "default" : "outline"}
                        className={`cursor-pointer transition-colors ${
                          formData.allergens?.includes(allergen)
                            ? "bg-destructive text-destructive-foreground"
                            : "hover:bg-secondary"
                        }`}
                        onClick={() => toggleAllergen(allergen)}
                      >
                        {allergen}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Información Nutricional
                </CardTitle>
                <CardDescription>
                  Valores por porción (opcional)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="servingSize">Porción</Label>
                    <Input
                      id="servingSize"
                      value={formData.nutritionalInfo?.servingSize || ""}
                      onChange={(e) => updateNutritionalInfo("servingSize", e.target.value)}
                      placeholder="Ej: 200g"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="calories">Calorías (kcal)</Label>
                    <Input
                      id="calories"
                      type="number"
                      min="0"
                      value={formData.nutritionalInfo?.calories || ""}
                      onChange={(e) =>
                        updateNutritionalInfo("calories", Number.parseInt(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="protein">Proteína (g)</Label>
                    <Input
                      id="protein"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.nutritionalInfo?.protein || ""}
                      onChange={(e) =>
                        updateNutritionalInfo("protein", Number.parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="carbohydrates">Carbohidratos (g)</Label>
                    <Input
                      id="carbohydrates"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.nutritionalInfo?.carbohydrates || ""}
                      onChange={(e) =>
                        updateNutritionalInfo("carbohydrates", Number.parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fat">Grasas (g)</Label>
                    <Input
                      id="fat"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.nutritionalInfo?.fat || ""}
                      onChange={(e) =>
                        updateNutritionalInfo("fat", Number.parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="saturatedFat">Grasas Sat. (g)</Label>
                    <Input
                      id="saturatedFat"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.nutritionalInfo?.saturatedFat || ""}
                      onChange={(e) =>
                        updateNutritionalInfo("saturatedFat", Number.parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sugar">Azúcar (g)</Label>
                    <Input
                      id="sugar"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.nutritionalInfo?.sugar || ""}
                      onChange={(e) =>
                        updateNutritionalInfo("sugar", Number.parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sodium">Sodio (mg)</Label>
                    <Input
                      id="sodium"
                      type="number"
                      min="0"
                      value={formData.nutritionalInfo?.sodium || ""}
                      onChange={(e) =>
                        updateNutritionalInfo("sodium", Number.parseInt(e.target.value) || 0)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Display Tab */}
          <TabsContent value="display" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Apariencia
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="color">Color de Identificación</Label>
                    <div className="flex gap-2">
                      {["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"].map(
                        (color) => (
                          <button
                            key={color}
                            type="button"
                            className={`w-8 h-8 rounded-full border-2 transition-all ${
                              formData.color === color
                                ? "border-foreground scale-110"
                                : "border-transparent"
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => updateField("color", color)}
                          />
                        )
                      )}
                      <Input
                        type="color"
                        value={formData.color || "#3b82f6"}
                        onChange={(e) => updateField("color", e.target.value)}
                        className="w-8 h-8 p-0 border-0 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sortOrder">Orden de Visualización</Label>
                    <Input
                      id="sortOrder"
                      type="number"
                      min="0"
                      value={formData.sortOrder || ""}
                      onChange={(e) =>
                        updateField("sortOrder", Number.parseInt(e.target.value) || 0)
                      }
                      placeholder="Ej: 1, 2, 3..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Números menores aparecen primero
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Utensils className="w-5 h-5" />
                    Visibilidad
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div>
                      <p className="font-medium">Destacado</p>
                      <p className="text-sm text-muted-foreground">
                        Mostrar en sección de destacados
                      </p>
                    </div>
                    <Switch
                      checked={formData.featured}
                      onCheckedChange={(checked) => updateField("featured", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div>
                      <p className="font-medium">Mostrar en POS</p>
                      <p className="text-sm text-muted-foreground">
                        Visible para meseros y cajeros
                      </p>
                    </div>
                    <Switch
                      checked={formData.showInPOS}
                      onCheckedChange={(checked) => updateField("showInPOS", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div>
                      <p className="font-medium">Mostrar en Menú Online</p>
                      <p className="text-sm text-muted-foreground">
                        Visible en pedidos online
                      </p>
                    </div>
                    <Switch
                      checked={formData.showInOnline}
                      onCheckedChange={(checked) => updateField("showInOnline", checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
