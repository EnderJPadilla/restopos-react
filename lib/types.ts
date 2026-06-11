// Restaurant app types
export type UserRole = "admin" | "waiter" | "cashier"
export type UserStatus = "active" | "inactive" | "suspended" | "on_leave"
export type DocumentType = "ine" | "passport" | "curp" | "rfc" | "other"
export type ContractType = "full_time" | "part_time" | "temporary" | "freelance"

export interface User {
  id: string
  name: string
  role: UserRole
  avatar?: string

  // Personal Information
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  secondaryPhone?: string
  dateOfBirth?: string
  gender?: "male" | "female" | "other" | "prefer_not_to_say"
  address?: string
  city?: string
  state?: string
  zipCode?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  emergencyContactRelation?: string

  // Identification / Documents
  documentType?: DocumentType
  documentNumber?: string
  rfc?: string
  curp?: string
  nss?: string // social security number

  // Employment
  employeeNumber?: string
  contractType?: ContractType
  hireDate?: string
  terminationDate?: string
  department?: string
  position?: string
  salary?: number
  salaryType?: "hourly" | "daily" | "weekly" | "biweekly" | "monthly"
  bankName?: string
  bankAccountNumber?: string
  clabeNumber?: string

  // Authentication & Access
  username?: string
  pin?: string
  status?: UserStatus
  requirePasswordChange?: boolean
  lastLogin?: Date
  loginAttempts?: number
  lockedUntil?: Date

  // Permissions
  permissions?: UserPermissions

  // Schedule
  schedule?: WeeklySchedule
  maxHoursPerWeek?: number

  // Notes
  notes?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface UserPermissions {
  // Dashboard
  viewDashboard?: boolean
  viewReports?: boolean
  exportReports?: boolean

  // Orders
  createOrders?: boolean
  editOrders?: boolean
  cancelOrders?: boolean
  applyDiscounts?: boolean
  maxDiscountPercent?: number

  // Menu
  viewMenu?: boolean
  editMenu?: boolean
  createProducts?: boolean
  deleteProducts?: boolean

  // Payments
  processPayments?: boolean
  processCashPayments?: boolean
  processCardPayments?: boolean
  processRefunds?: boolean
  openCashRegister?: boolean
  closeCashRegister?: boolean
  viewCashRegisterHistory?: boolean

  // Users
  viewUsers?: boolean
  createUsers?: boolean
  editUsers?: boolean
  deleteUsers?: boolean

  // Tables
  manageTables?: boolean
  transferTables?: boolean

  // Inventory
  viewInventory?: boolean
  editInventory?: boolean

  // Settings
  viewSettings?: boolean
  editSettings?: boolean

  // Printers
  managePrinters?: boolean
  reprintTickets?: boolean
}

export interface WeeklySchedule {
  monday?: DaySchedule
  tuesday?: DaySchedule
  wednesday?: DaySchedule
  thursday?: DaySchedule
  friday?: DaySchedule
  saturday?: DaySchedule
  sunday?: DaySchedule
}

export interface DaySchedule {
  enabled: boolean
  startTime?: string // "HH:mm"
  endTime?: string   // "HH:mm"
  breakStart?: string
  breakEnd?: string
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

export type PrinterConnectionType = "network" | "usb" | "bluetooth" | "serial"
export type PrinterModel = "epson_tm20" | "epson_tm80" | "star_tsp100" | "star_sp700" | "bixolon_srp350" | "custom" | "generic_esc_pos"
export type PaperWidth = "58mm" | "80mm"
export type PrinterStatus = "connected" | "disconnected" | "error" | "paper_out" | "cover_open"

export interface Printer {
  id: string
  name: string
  alias?: string
  model?: PrinterModel
  connectionType?: PrinterConnectionType
  ipAddress?: string
  port?: number
  macAddress?: string
  serialPort?: string
  baudRate?: number
  usbVendorId?: string
  usbProductId?: string
  paperWidth?: PaperWidth
  dpi?: number
  status?: PrinterStatus
  isDefault?: boolean

  // Assigned areas
  assignedAreas?: ("cocina" | "barra" | "parrilla" | "postres" | "bebidas" | "caja")[]
  printCategories?: string[] // category IDs

  // Print settings
  autoCut?: boolean
  openCashDrawer?: boolean
  printLogo?: boolean
  logoUrl?: string
  copies?: number
  fontSize?: "small" | "medium" | "large"
  printHeader?: boolean
  headerText?: string
  printFooter?: boolean
  footerText?: string
  printQR?: boolean
  qrContent?: string

  // Sound
  buzzerOnPrint?: boolean
  buzzerDuration?: number // ms

  // Advanced
  characterEncoding?: string
  commandSet?: "esc_pos" | "star_line" | "star_graphic"
  testPagePrinted?: boolean
  lastPrintAt?: Date
  errorLog?: string

  notes?: string
  enabled?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface OrderItem {
  id: string
  menuItem: MenuItem
  quantity: number
  notes?: string
}

export interface Order {
  id: string
  tableNumber: number
  items: OrderItem[]
  status: "registered" | "preparing" | "ready" | "paid" | "closed"
  waiter: User
  createdAt: Date
  updatedAt: Date
  subtotal: number
  tax: number
  tip?: number
  total: number
  paymentMethod?: "cash" | "card" | "transfer"
  paymentReference?: string
}

export type ZoneStatus = "active" | "inactive" | "maintenance"
export type ZoneType = "interior" | "exterior" | "privado" | "barra" | "mixto"

export interface Zone {
  id: string
  name: string
  slug?: string
  description?: string
  type?: ZoneType
  status?: ZoneStatus
  color?: string
  icon?: string
  floor?: number
  
  // Capacity
  tableCount?: number
  totalCapacity?: number
  
  // Physical properties
  area?: number // square meters
  hasRoof?: boolean
  isClimatized?: boolean // AC/heating
  
  // Features
  isSmokingAllowed?: boolean
  hasWifi?: boolean
  hasOutlets?: boolean
  hasTV?: boolean
  hasSoundSystem?: boolean
  isWheelchairAccessible?: boolean
  isPetFriendly?: boolean
  hasChildArea?: boolean
  
  // Outdoor specific
  hasUmbrellas?: boolean
  hasHeaters?: boolean
  hasFans?: boolean
  
  // Reservations
  isReservable?: boolean
  reservationPriority?: number // 1-10, higher = preferred
  minReservationSize?: number
  depositRequired?: boolean
  depositAmount?: number
  
  // Operations
  defaultWaiterId?: string
  assignedPrinterId?: string
  openingTime?: string // "HH:mm"
  closingTime?: string // "HH:mm"
  availableDays?: string[]
  
  // Display
  sortOrder?: number
  showInFloorPlan?: boolean
  showInReservations?: boolean
  
  // Stats
  avgTurnoverTime?: number
  avgRevenuePerTable?: number
  
  notes?: string
  enabled?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export type TableStatus = "available" | "occupied" | "reserved" | "maintenance" | "cleaning"
export type TableShape = "square" | "round" | "rectangular" | "oval" | "bar"
export type TableZone = "interior" | "terraza" | "privado" | "barra" | "jardin" | "segundo_piso"

export interface Table {
  id: string
  number: number
  name?: string // optional custom name like "Mesa Romantica"
  status: TableStatus
  capacity: number
  minCapacity?: number
  currentOrder?: Order

  // Physical properties
  shape?: TableShape
  zone?: TableZone
  floor?: number
  positionX?: number // for floor plan positioning
  positionY?: number
  width?: number
  height?: number
  rotation?: number // degrees

  // Features & amenities
  isSmokingAllowed?: boolean
  hasOutlet?: boolean // power outlet
  hasWifi?: boolean
  isWheelchairAccessible?: boolean
  isHighchair?: boolean // can accommodate highchair
  hasUmbrella?: boolean // for outdoor
  hasHeater?: boolean // for outdoor
  isPremium?: boolean // VIP/premium table
  isJoinable?: boolean // can be combined with adjacent tables
  joinedWith?: string[] // IDs of tables currently joined

  // Reservations
  isReservable?: boolean
  minReservationTime?: number // minutes
  maxReservationTime?: number // minutes
  reservationDeposit?: number
  autoReleaseMinutes?: number // release reservation after X minutes of no-show

  // Operations
  defaultWaiterId?: string
  assignedPrinterId?: string
  avgTurnoverTime?: number // average minutes per seating
  dailyTurnovers?: number // average turnovers per day

  // Display
  color?: string
  icon?: string
  sortOrder?: number
  showInFloorPlan?: boolean
  showInList?: boolean

  // Status
  enabled?: boolean
  maintenanceNotes?: string
  lastCleanedAt?: Date
  lastOccupiedAt?: Date

  notes?: string
  createdAt?: Date
  updatedAt?: Date
}

export type ReservationStatus = "confirmed" | "pending" | "seated" | "cancelled" | "no_show"

export interface Reservation {
  id: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  partySize: number
  tableId?: string
  tableNumber?: number
  date: string // "YYYY-MM-DD"
  time: string // "HH:mm"
  endTime?: string // estimated end "HH:mm"
  duration?: number // minutes
  status: ReservationStatus
  occasion?: "birthday" | "anniversary" | "business" | "date" | "family" | "other"
  specialRequests?: string
  internalNotes?: string
  highchair?: boolean
  wheelchairAccessible?: boolean
  preferredZone?: "interior" | "terraza" | "privado" | "barra" | "any"
  depositAmount?: number
  depositPaid?: boolean
  source?: "phone" | "walk_in" | "website" | "app" | "third_party"
  remindByWhatsApp?: boolean
  remindBySMS?: boolean
  reminderSent?: boolean
  createdBy?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface DailyStats {
  totalSales: number
  ordersCount: number
  averageTicket: number
  topItems: { name: string; quantity: number }[]
}
