
export type CategoryStatus = "active" | "inactive"

export interface Category {
  id: string
  name: string
  icon: string
  slug?: string
  description?: string
  color?: string
  image?: string
  parentCategory?: string // ID of parent for subcategories
  status?: CategoryStatus
  sortOrder?: number
  showInPOS?: boolean
  showInOnline?: boolean
  preparationArea?: "cocina" | "barra" | "parrilla" | "postres" | "bebidas"
  defaultPrinter?: string
  taxRate?: number
  availableFrom?: string // "HH:mm"
  availableTo?: string   // "HH:mm"
  availableDays?: string[] // ["monday","tuesday", ...]
  productCount?: number
  createdAt?: Date
  updatedAt?: Date
}