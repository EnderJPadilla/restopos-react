export type UserRole = "admin" | "waiter" | "cashier"
export type UserStatus = "active" | "inactive" | "suspended" | "on_leave"
export type ContractType = "full_time" | "part_time" | "temporary" | "freelance"
export type DocumentType =
  | "CC"   // Cédula de Ciudadanía
  | "TI"   // Tarjeta de Identidad
  | "CE"   // Cédula de Extranjería
  | "PAS"  // Pasaporte
  | "PEP"  // Permiso Especial de Permanencia
  | "PPT"  // Permiso por Protección Temporal
  | "RC"   // Registro Civil
  | "NIT"  // Número de Identificación Tributaria
  | "OTRO";

export interface User {
  id: string
  empresa_id: string
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