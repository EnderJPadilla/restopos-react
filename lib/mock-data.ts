import type { Category, MenuItem, Order, Table, User, DailyStats } from "./types"

export const mockUsers: User[] = [
  { id: "1", name: "Carlos Admin", role: "admin" },
  { id: "2", name: "María Mesera", role: "waiter" },
  { id: "3", name: "Juan Cajero", role: "cashier" },
]

export const mockCategories: Category[] = [
  { id: "1", name: "Entradas", icon: "🥗" },
  { id: "2", name: "Platos Fuertes", icon: "🍽️" },
  { id: "3", name: "Bebidas", icon: "🍹" },
  { id: "4", name: "Postres", icon: "🍰" },
  { id: "5", name: "Especialidades", icon: "⭐" },
]

export const mockMenuItems: MenuItem[] = [
  {
    id: "1",
    name: "Ensalada César",
    price: 85,
    category: "1",
    available: true,
    description: "Lechuga romana, crutones, parmesano",
  },
  { id: "2", name: "Sopa del Día", price: 65, category: "1", available: true, description: "Preparación del chef" },
  {
    id: "3",
    name: "Nachos con Guacamole",
    price: 120,
    category: "1",
    available: true,
    description: "Totopos, guacamole, crema",
  },
  { id: "4", name: "Filete de Res", price: 320, category: "2", available: true, description: "300g con guarnición" },
  {
    id: "5",
    name: "Pollo a la Parrilla",
    price: 195,
    category: "2",
    available: true,
    description: "Con verduras asadas",
  },
  { id: "6", name: "Salmón al Horno", price: 285, category: "2", available: false, description: "Con salsa de limón" },
  {
    id: "7",
    name: "Pasta Alfredo",
    price: 165,
    category: "2",
    available: true,
    description: "Fettuccine con salsa cremosa",
  },
  { id: "8", name: "Tacos de Carnitas", price: 145, category: "2", available: true, description: "3 piezas con salsa" },
  { id: "9", name: "Agua Fresca", price: 35, category: "3", available: true, description: "Horchata, Jamaica, Limón" },
  { id: "10", name: "Refresco", price: 40, category: "3", available: true, description: "Coca-Cola, Sprite, Fanta" },
  {
    id: "11",
    name: "Cerveza Nacional",
    price: 55,
    category: "3",
    available: true,
    description: "Corona, Modelo, Victoria",
  },
  { id: "12", name: "Margarita", price: 95, category: "3", available: true, description: "Clásica o de mango" },
  { id: "13", name: "Flan Napolitano", price: 75, category: "4", available: true, description: "Con caramelo" },
  { id: "14", name: "Pastel de Chocolate", price: 85, category: "4", available: true, description: "Triple chocolate" },
  { id: "15", name: "Helado", price: 55, category: "4", available: true, description: "2 bolas, varios sabores" },
  { id: "16", name: "Parrillada Especial", price: 550, category: "5", available: true, description: "Para 2 personas" },
]

export const mockTables: Table[] = Array.from({ length: 12 }, (_, i) => ({
  id: `table-${i + 1}`,
  number: i + 1,
  status: i === 2 || i === 5 || i === 8 ? "occupied" : i === 10 ? "reserved" : "available",
  capacity: i < 4 ? 2 : i < 8 ? 4 : 6,
}))

export const mockOrders: Order[] = [
  {
    id: "order-1",
    tableNumber: 3,
    items: [
      { id: "1", menuItem: mockMenuItems[0], quantity: 2, notes: "Sin crutones" },
      { id: "2", menuItem: mockMenuItems[3], quantity: 1, notes: "Término medio" },
      { id: "3", menuItem: mockMenuItems[10], quantity: 2 },
    ],
    status: "preparing",
    waiter: mockUsers[1],
    createdAt: new Date(Date.now() - 1800000),
    updatedAt: new Date(),
    subtotal: 600,
    tax: 96,
    total: 696,
  },
  {
    id: "order-2",
    tableNumber: 6,
    items: [
      { id: "4", menuItem: mockMenuItems[4], quantity: 2 },
      { id: "5", menuItem: mockMenuItems[8], quantity: 2 },
    ],
    status: "ready",
    waiter: mockUsers[1],
    createdAt: new Date(Date.now() - 3600000),
    updatedAt: new Date(),
    subtotal: 460,
    tax: 73.6,
    total: 533.6,
  },
  {
    id: "order-3",
    tableNumber: 9,
    items: [
      { id: "6", menuItem: mockMenuItems[15], quantity: 1 },
      { id: "7", menuItem: mockMenuItems[11], quantity: 2 },
    ],
    status: "registered",
    waiter: mockUsers[1],
    createdAt: new Date(Date.now() - 600000),
    updatedAt: new Date(),
    subtotal: 740,
    tax: 118.4,
    total: 858.4,
  },
]

export const mockDailyStats: DailyStats = {
  totalSales: 15420,
  ordersCount: 34,
  averageTicket: 453.53,
  topItems: [
    { name: "Filete de Res", quantity: 12 },
    { name: "Margarita", quantity: 18 },
    { name: "Ensalada César", quantity: 9 },
    { name: "Pasta Alfredo", quantity: 8 },
  ],
}
