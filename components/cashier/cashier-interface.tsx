"use client"

import { useState } from "react"
import type { User, Order } from "@/lib/types"
import { mockOrders } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  LogOut,
  CreditCard,
  Banknote,
  Building2,
  Printer,
  Check,
  Clock,
  X,
  ChefHat,
  Calculator,
  Receipt,
  DollarSign,
} from "lucide-react"

interface CashierInterfaceProps {
  user: User
  onLogout: () => void
}

type PaymentMethod = "cash" | "card" | "transfer"

export function CashierInterface({ user, onLogout }: CashierInterfaceProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [paymentReference, setPaymentReference] = useState("")
  const [tipPercentage, setTipPercentage] = useState<number>(0)
  const [cashReceived, setCashReceived] = useState("")
  const [showCashRegister, setShowCashRegister] = useState(false)

  const pendingOrders = mockOrders.filter((o) => o.status === "ready" || o.status === "preparing")

  const calculateTotals = (order: Order) => {
    const tip = order.subtotal * (tipPercentage / 100)
    const total = order.subtotal + order.tax + tip
    return { tip, total }
  }

  const handleProcessPayment = () => {
    if (!selectedOrder || !paymentMethod) return

    // In a real app, this would process the payment and update the order
    alert(`¡Pago procesado! Imprimiendo factura...`)
    setSelectedOrder(null)
    setPaymentMethod(null)
    setPaymentReference("")
    setTipPercentage(0)
    setCashReceived("")
  }

  const cashChange =
    selectedOrder && cashReceived ? Number.parseFloat(cashReceived) - calculateTotals(selectedOrder).total : 0

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChefHat className="w-6 h-6 text-primary" />
            <div>
              <h1 className="font-bold text-lg">RestoPOS</h1>
              <p className="text-xs text-muted-foreground">Caja - {user.name.split(" ")[0]}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowCashRegister(true)}>
              <Calculator className="w-4 h-4 mr-1" />
              Cierre de Caja
            </Button>
            <Button variant="outline" size="sm" onClick={onLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col lg:flex-row">
        {/* Pending orders list */}
        <div className="flex-1 p-4 border-r border-border overflow-auto">
          <h2 className="text-xl font-bold mb-4">Pedidos Pendientes de Pago</h2>

          {pendingOrders.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-muted-foreground">
              <Receipt className="w-12 h-12 mb-3 opacity-50" />
              <p>No hay pedidos pendientes</p>
              <p className="text-sm">Los pedidos listos aparecerán aquí</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {pendingOrders.map((order) => (
                <Card
                  key={order.id}
                  className={`cursor-pointer transition-all hover:border-primary ${
                    selectedOrder?.id === order.id ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => {
                    setSelectedOrder(order)
                    setPaymentMethod(null)
                    setTipPercentage(0)
                    setCashReceived("")
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                          <span className="text-xl font-bold text-primary">{order.tableNumber}</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold">Mesa {order.tableNumber}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {order.createdAt.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                            <span className="mx-1">·</span>
                            {order.waiter.name}
                          </p>
                        </div>
                      </div>
                      <Badge
                        className={
                          order.status === "ready"
                            ? "bg-success text-success-foreground"
                            : "bg-warning text-warning-foreground"
                        }
                      >
                        {order.status === "ready" ? "Listo" : "Preparando"}
                      </Badge>
                    </div>

                    <div className="space-y-1 mb-3 text-sm">
                      {order.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex justify-between">
                          <span className="text-muted-foreground">
                            {item.quantity}x {item.menuItem.name}
                          </span>
                          <span>${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-muted-foreground text-xs">+{order.items.length - 3} más...</p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-border">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total</span>
                        <span className="text-xl font-bold text-primary">${order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Payment panel */}
        <div className="w-full lg:w-[420px] bg-card flex flex-col">
          {!selectedOrder ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground p-6">
              <CreditCard className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg">Selecciona un pedido</p>
              <p className="text-sm">para procesar el pago</p>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">Mesa {selectedOrder.tableNumber}</h2>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(null)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Order details */}
              <div className="flex-1 overflow-auto p-4">
                <div className="space-y-2 mb-6">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span>
                        <span className="text-muted-foreground mr-2">{item.quantity}x</span>
                        {item.menuItem.name}
                      </span>
                      <span className="font-medium">${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Tip selection */}
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-2">Propina</p>
                  <div className="flex gap-2">
                    {[0, 10, 15, 20].map((tip) => (
                      <Button
                        key={tip}
                        variant={tipPercentage === tip ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                        onClick={() => setTipPercentage(tip)}
                      >
                        {tip}%
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Payment method */}
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-2">Método de Pago</p>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={paymentMethod === "cash" ? "default" : "outline"}
                      className="h-16 flex-col"
                      onClick={() => setPaymentMethod("cash")}
                    >
                      <Banknote className="w-5 h-5 mb-1" />
                      <span className="text-xs">Efectivo</span>
                    </Button>
                    <Button
                      variant={paymentMethod === "card" ? "default" : "outline"}
                      className="h-16 flex-col"
                      onClick={() => setPaymentMethod("card")}
                    >
                      <CreditCard className="w-5 h-5 mb-1" />
                      <span className="text-xs">Tarjeta</span>
                    </Button>
                    <Button
                      variant={paymentMethod === "transfer" ? "default" : "outline"}
                      className="h-16 flex-col"
                      onClick={() => setPaymentMethod("transfer")}
                    >
                      <Building2 className="w-5 h-5 mb-1" />
                      <span className="text-xs">Transferencia</span>
                    </Button>
                  </div>
                </div>

                {/* Cash received input */}
                {paymentMethod === "cash" && (
                  <div className="mb-6">
                    <p className="text-sm text-muted-foreground mb-2">Efectivo Recibido</p>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="0.00"
                        className="pl-9 text-lg h-12"
                        value={cashReceived}
                        onChange={(e) => setCashReceived(e.target.value)}
                      />
                    </div>
                    {cashChange > 0 && (
                      <div className="mt-2 p-3 rounded-lg bg-success/10 border border-success">
                        <p className="text-sm text-muted-foreground">Cambio</p>
                        <p className="text-xl font-bold text-success">${cashChange.toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Reference input for card/transfer */}
                {(paymentMethod === "card" || paymentMethod === "transfer") && (
                  <div className="mb-6">
                    <p className="text-sm text-muted-foreground mb-2">
                      {paymentMethod === "card" ? "Últimos 4 dígitos" : "Referencia"}
                    </p>
                    <Input
                      placeholder={paymentMethod === "card" ? "0000" : "REF-000"}
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Totals and action */}
              <div className="p-4 border-t border-border bg-secondary/30">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">IVA (16%)</span>
                    <span>${selectedOrder.tax.toFixed(2)}</span>
                  </div>
                  {tipPercentage > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Propina ({tipPercentage}%)</span>
                      <span>${calculateTotals(selectedOrder).tip.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="text-primary">${calculateTotals(selectedOrder).total.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  className="w-full h-12 text-lg"
                  disabled={!paymentMethod || (paymentMethod === "cash" && (!cashReceived || cashChange < 0))}
                  onClick={handleProcessPayment}
                >
                  <Check className="w-5 h-5 mr-2" />
                  Procesar Pago
                </Button>
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" className="flex-1 bg-transparent" size="sm">
                    <Printer className="w-4 h-4 mr-1" />
                    Pre-cuenta
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent" size="sm">
                    <Receipt className="w-4 h-4 mr-1" />
                    Factura
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Cash register close modal */}
      {showCashRegister && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Cierre de Caja</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowCashRegister(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-secondary/50">
                <p className="text-sm text-muted-foreground mb-3">Resumen del Día</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Efectivo</span>
                    <span className="font-medium">$8,420.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tarjeta</span>
                    <span className="font-medium">$5,200.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transferencia</span>
                    <span className="font-medium">$1,800.00</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">$15,420.00</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Efectivo en Caja</p>
                <Input type="number" placeholder="Contar efectivo..." />
              </div>

              <Button className="w-full">
                <Check className="w-4 h-4 mr-2" />
                Confirmar Cierre
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
