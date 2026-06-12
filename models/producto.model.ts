export interface Producto {
  id: string
  name: string
  sku?: string
  barcode?: string
  price: number
  cost?: number
  category: string
  subcategory?: string
  available: boolean
  description?: string
  shortDescription?: string
  image?: string
  images?: string[]
  removeImage: boolean
  imageAnt?: string
  
  // Inventory
  trackInventory?: boolean
  stockQuantity?: number
  lowStockThreshold?: number
  unit?: "pieza" | "kg" | "litro" | "porción" | "orden"
  
  // Pricing
  priceType?: "fixed" | "variable" | "by_weight"
  specialPrice?: number
  specialPriceStart?: Date
  specialPriceEnd?: Date
  taxRate?: number
  taxIncluded?: boolean
  
  // Preparation
  preparationTime?: number // in minutes
  preparationArea?: "cocina" | "barra" | "parrilla" | "postres" | "bebidas"
  printer?: string
  
  // Variations & Modifiers
  hasVariations?: boolean
  variations?: ProductVariation[]
  modifierGroups?: string[] // IDs of modifier groups
  
  // Dietary & Allergens
  isVegetarian?: boolean
  isVegan?: boolean
  isGlutenFree?: boolean
  isSpicy?: boolean
  spicyLevel?: 1 | 2 | 3
  allergens?: string[]
  calories?: number
  nutritionalInfo?: NutritionalInfo
  
  // Display
  featured?: boolean
  sortOrder?: number
  showInPOS?: boolean
  showInOnline?: boolean
  color?: string
  
  // Additional
  notes?: string
  tags?: string[]
  relatedProducts?: string[]
  createdAt?: Date
  updatedAt?: Date
}


export interface ProductVariation {
  id: string
  name: string
  sku?: string
  priceModifier: number // can be positive or negative
  available: boolean
}

export interface NutritionalInfo {
  servingSize?: string
  calories?: number
  fat?: number
  saturatedFat?: number
  carbohydrates?: number
  sugar?: number
  fiber?: number
  protein?: number
  sodium?: number
}



export interface MenuItem {
  id: string
  name: string
  sku?: string
  barcode?: string
  price: number
  cost?: number
  category: string
  subcategory?: string
  available: boolean
  description?: string
  shortDescription?: string
  image?: string
  images?: string[]
  removeImage: boolean
  imageAnt?: string
  
  // Inventory
  trackInventory?: boolean
  stockQuantity?: number
  lowStockThreshold?: number
  unit?: "pieza" | "kg" | "litro" | "porción" | "orden"
  
  // Pricing
  priceType?: "fixed" | "variable" | "by_weight"
  specialPrice?: number
  specialPriceStart?: Date
  specialPriceEnd?: Date
  taxRate?: number
  taxIncluded?: boolean
  
  // Preparation
  preparationTime?: number // in minutes
  preparationArea?: "cocina" | "barra" | "parrilla" | "postres" | "bebidas"
  printer?: string
  
  // Variations & Modifiers
  hasVariations?: boolean
  variations?: ProductVariation[]
  modifierGroups?: string[] // IDs of modifier groups
  
  // Dietary & Allergens
  isVegetarian?: boolean
  isVegan?: boolean
  isGlutenFree?: boolean
  isSpicy?: boolean
  spicyLevel?: 1 | 2 | 3
  allergens?: string[]
  calories?: number
  nutritionalInfo?: NutritionalInfo
  
  // Display
  featured?: boolean
  sortOrder?: number
  showInPOS?: boolean
  showInOnline?: boolean
  color?: string
  
  // Additional
  notes?: string
  tags?: string[]
  relatedProducts?: string[]
  createdAt?: Date
  updatedAt?: Date
}

export interface ProductVariation {
  id: string
  name: string
  sku?: string
  priceModifier: number // can be positive or negative
  available: boolean
}

export interface ModifierGroup {
  id: string
  name: string
  required: boolean
  minSelections: number
  maxSelections: number
  modifiers: Modifier[]
}

export interface Modifier {
  id: string
  name: string
  price: number
  available: boolean
}