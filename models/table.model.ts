import { Order } from "./order.model"

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
