"use client"

import { useState, useRef } from "react"
import type { User, UserRole, UserStatus, UserPermissions, WeeklySchedule, DaySchedule } from "@/lib/types"
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
  ArrowLeft,
  Save,
  User as UserIcon,
  Shield,
  Clock,
  CreditCard,
  FileText,
  Eye,
  EyeOff,
  KeyRound,
  AlertTriangle,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  CalendarDays,
  Building2,
  Hash,
  Landmark,
  HeartPulse,
} from "lucide-react"

interface UserFormProps {
  user?: User
  onSave: (user: User) => void
  onCancel: () => void
}

const roleLabels: Record<UserRole, string> = {
  admin: "Administrador",
  waiter: "Mesero",
  cashier: "Cajero",
}

const statusLabels: Record<UserStatus, string> = {
  active: "Activo",
  inactive: "Inactivo",
  suspended: "Suspendido",
  on_leave: "Con Permiso",
}

const statusColors: Record<UserStatus, string> = {
  active: "bg-success text-success-foreground",
  inactive: "bg-secondary text-secondary-foreground",
  suspended: "bg-destructive text-destructive-foreground",
  on_leave: "bg-warning text-warning-foreground",
}

const dayLabels: Record<string, string> = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miercoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sabado",
  sunday: "Domingo",
}

const defaultPermissionsByRole: Record<UserRole, UserPermissions> = {
  admin: {
    viewDashboard: true,
    viewReports: true,
    exportReports: true,
    createOrders: true,
    editOrders: true,
    cancelOrders: true,
    applyDiscounts: true,
    maxDiscountPercent: 100,
    viewMenu: true,
    editMenu: true,
    createProducts: true,
    deleteProducts: true,
    processPayments: true,
    processCashPayments: true,
    processCardPayments: true,
    processRefunds: true,
    openCashRegister: true,
    closeCashRegister: true,
    viewCashRegisterHistory: true,
    viewUsers: true,
    createUsers: true,
    editUsers: true,
    deleteUsers: true,
    manageTables: true,
    transferTables: true,
    viewInventory: true,
    editInventory: true,
    viewSettings: true,
    editSettings: true,
    managePrinters: true,
    reprintTickets: true,
  },
  waiter: {
    viewDashboard: false,
    viewReports: false,
    exportReports: false,
    createOrders: true,
    editOrders: true,
    cancelOrders: false,
    applyDiscounts: false,
    maxDiscountPercent: 0,
    viewMenu: true,
    editMenu: false,
    createProducts: false,
    deleteProducts: false,
    processPayments: false,
    processCashPayments: false,
    processCardPayments: false,
    processRefunds: false,
    openCashRegister: false,
    closeCashRegister: false,
    viewCashRegisterHistory: false,
    viewUsers: false,
    createUsers: false,
    editUsers: false,
    deleteUsers: false,
    manageTables: true,
    transferTables: true,
    viewInventory: false,
    editInventory: false,
    viewSettings: false,
    editSettings: false,
    managePrinters: false,
    reprintTickets: true,
  },
  cashier: {
    viewDashboard: false,
    viewReports: false,
    exportReports: false,
    createOrders: false,
    editOrders: false,
    cancelOrders: false,
    applyDiscounts: true,
    maxDiscountPercent: 10,
    viewMenu: true,
    editMenu: false,
    createProducts: false,
    deleteProducts: false,
    processPayments: true,
    processCashPayments: true,
    processCardPayments: true,
    processRefunds: false,
    openCashRegister: true,
    closeCashRegister: true,
    viewCashRegisterHistory: true,
    viewUsers: false,
    createUsers: false,
    editUsers: false,
    deleteUsers: false,
    manageTables: false,
    transferTables: false,
    viewInventory: false,
    editInventory: false,
    viewSettings: false,
    editSettings: false,
    managePrinters: false,
    reprintTickets: true,
  },
}

const defaultSchedule: WeeklySchedule = {
  monday: { enabled: true, startTime: "09:00", endTime: "17:00" },
  tuesday: { enabled: true, startTime: "09:00", endTime: "17:00" },
  wednesday: { enabled: true, startTime: "09:00", endTime: "17:00" },
  thursday: { enabled: true, startTime: "09:00", endTime: "17:00" },
  friday: { enabled: true, startTime: "09:00", endTime: "17:00" },
  saturday: { enabled: false },
  sunday: { enabled: false },
}

const defaultUser: Partial<User> = {
  firstName: "",
  lastName: "",
  name: "",
  email: "",
  phone: "",
  role: "waiter",
  status: "active",
  gender: "prefer_not_to_say",
  contractType: "full_time",
  salaryType: "biweekly",
  pin: "",
  requirePasswordChange: true,
  permissions: defaultPermissionsByRole.waiter,
  schedule: defaultSchedule,
  maxHoursPerWeek: 48,
}

export function UserForm({ user, onSave, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState<Partial<User>>({
    ...defaultUser,
    ...user,
    permissions: user?.permissions || defaultPermissionsByRole[user?.role || "waiter"],
    schedule: user?.schedule || defaultSchedule,
  })
  const [showPin, setShowPin] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen valido")
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("La imagen no debe superar los 2MB")
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      updateField("avatar", reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const updateField = <K extends keyof User>(field: K, value: User[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const updatePermission = <K extends keyof UserPermissions>(field: K, value: UserPermissions[K]) => {
    setFormData((prev) => ({
      ...prev,
      permissions: { ...prev.permissions, [field]: value },
    }))
  }

  const updateDaySchedule = (day: keyof WeeklySchedule, updates: Partial<DaySchedule>) => {
    setFormData((prev) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: { ...prev.schedule?.[day], ...updates },
      },
    }))
  }

  const applyRoleDefaults = (role: UserRole) => {
    updateField("role", role)
    setFormData((prev) => ({
      ...prev,
      role,
      permissions: { ...defaultPermissionsByRole[role] },
    }))
  }

  const validate = (): boolean => {
    const errors: Record<string, string> = {}
    if (!formData.firstName?.trim()) errors.firstName = "El nombre es obligatorio"
    if (!formData.lastName?.trim()) errors.lastName = "El apellido es obligatorio"
    if (!formData.role) errors.role = "El rol es obligatorio"
    if (!formData.pin || formData.pin.length < 4) errors.pin = "El PIN debe tener al menos 4 digitos"
    if (formData.pin && !/^\d+$/.test(formData.pin)) errors.pin = "El PIN solo debe contener numeros"
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Formato de email invalido"
    }
    if (formData.phone && !/^\+?[\d\s()-]{7,15}$/.test(formData.phone)) {
      errors.phone = "Formato de telefono invalido"
    }
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    const fullName = `${formData.firstName || ""} ${formData.lastName || ""}`.trim()
    const userData: User = {
      id: formData.id || `user-${Date.now()}`,
      name: fullName || formData.name || "",
      role: formData.role || "waiter",
      ...formData,
      name: fullName,
      createdAt: formData.createdAt || new Date(),
      updatedAt: new Date(),
    }
    onSave(userData)
  }

  const permissionGroups = [
    {
      title: "Dashboard y Reportes",
      icon: <FileText className="w-4 h-4" />,
      permissions: [
        { key: "viewDashboard" as const, label: "Ver Dashboard" },
        { key: "viewReports" as const, label: "Ver Reportes" },
        { key: "exportReports" as const, label: "Exportar Reportes" },
      ],
    },
    {
      title: "Pedidos",
      icon: <FileText className="w-4 h-4" />,
      permissions: [
        { key: "createOrders" as const, label: "Crear Pedidos" },
        { key: "editOrders" as const, label: "Editar Pedidos" },
        { key: "cancelOrders" as const, label: "Cancelar Pedidos" },
        { key: "applyDiscounts" as const, label: "Aplicar Descuentos" },
      ],
    },
    {
      title: "Menu y Productos",
      icon: <FileText className="w-4 h-4" />,
      permissions: [
        { key: "viewMenu" as const, label: "Ver Menu" },
        { key: "editMenu" as const, label: "Editar Menu" },
        { key: "createProducts" as const, label: "Crear Productos" },
        { key: "deleteProducts" as const, label: "Eliminar Productos" },
      ],
    },
    {
      title: "Pagos y Caja",
      icon: <CreditCard className="w-4 h-4" />,
      permissions: [
        { key: "processPayments" as const, label: "Procesar Pagos" },
        { key: "processCashPayments" as const, label: "Pagos en Efectivo" },
        { key: "processCardPayments" as const, label: "Pagos con Tarjeta" },
        { key: "processRefunds" as const, label: "Procesar Reembolsos" },
        { key: "openCashRegister" as const, label: "Abrir Caja" },
        { key: "closeCashRegister" as const, label: "Cerrar Caja" },
        { key: "viewCashRegisterHistory" as const, label: "Ver Historial de Caja" },
      ],
    },
    {
      title: "Usuarios",
      icon: <UserIcon className="w-4 h-4" />,
      permissions: [
        { key: "viewUsers" as const, label: "Ver Usuarios" },
        { key: "createUsers" as const, label: "Crear Usuarios" },
        { key: "editUsers" as const, label: "Editar Usuarios" },
        { key: "deleteUsers" as const, label: "Eliminar Usuarios" },
      ],
    },
    {
      title: "Mesas e Inventario",
      icon: <FileText className="w-4 h-4" />,
      permissions: [
        { key: "manageTables" as const, label: "Gestionar Mesas" },
        { key: "transferTables" as const, label: "Transferir Mesas" },
        { key: "viewInventory" as const, label: "Ver Inventario" },
        { key: "editInventory" as const, label: "Editar Inventario" },
      ],
    },
    {
      title: "Sistema",
      icon: <Shield className="w-4 h-4" />,
      permissions: [
        { key: "viewSettings" as const, label: "Ver Configuracion" },
        { key: "editSettings" as const, label: "Editar Configuracion" },
        { key: "managePrinters" as const, label: "Gestionar Impresoras" },
        { key: "reprintTickets" as const, label: "Reimprimir Tickets" },
      ],
    },
  ]

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
              {user ? "Editar Usuario" : "Nuevo Usuario"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {user ? `Editando: ${user.name}` : "Complete la informacion del usuario"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {formData.status && (
            <Badge className={statusColors[formData.status]}>
              {statusLabels[formData.status]}
            </Badge>
          )}
          <Button variant="outline" onClick={onCancel} className="bg-transparent">
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            <Save className="w-4 h-4 mr-2" />
            {user ? "Guardar Cambios" : "Crear Usuario"}
          </Button>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-auto p-6">
        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid grid-cols-6 w-full max-w-4xl">
            <TabsTrigger value="personal" className="gap-1.5">
              <UserIcon className="w-3.5 h-3.5 hidden sm:block" />
              Personal
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-1.5">
              <FileText className="w-3.5 h-3.5 hidden sm:block" />
              Documentos
            </TabsTrigger>
            <TabsTrigger value="employment" className="gap-1.5">
              <Briefcase className="w-3.5 h-3.5 hidden sm:block" />
              Empleo
            </TabsTrigger>
            <TabsTrigger value="access" className="gap-1.5">
              <KeyRound className="w-3.5 h-3.5 hidden sm:block" />
              Acceso
            </TabsTrigger>
            <TabsTrigger value="permissions" className="gap-1.5">
              <Shield className="w-3.5 h-3.5 hidden sm:block" />
              Permisos
            </TabsTrigger>
            <TabsTrigger value="schedule" className="gap-1.5">
              <Clock className="w-3.5 h-3.5 hidden sm:block" />
              Horario
            </TabsTrigger>
          </TabsList>

          {/* ========== PERSONAL TAB ========== */}
          <TabsContent value="personal" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Avatar & basic */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UserIcon className="w-5 h-5" />
                    Foto de Perfil
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarSelect}
                  />
                  <div
                    onClick={() => avatarInputRef.current?.click()}
                    className="w-32 h-32 rounded-full bg-secondary flex items-center justify-center border-2 border-dashed border-border overflow-hidden cursor-pointer hover:bg-secondary/70 transition-colors relative group"
                  >
                    {formData.avatar ? (
                      <>
                        <img
                          src={formData.avatar || "/placeholder.svg"}
                          alt="Avatar"
                          className="w-full h-full object-cover rounded-full"
                        />
                        <div className="absolute inset-0 rounded-full bg-background/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-xs font-medium">Cambiar</span>
                        </div>
                      </>
                    ) : (
                      <span className="text-4xl font-bold text-muted-foreground">
                        {(formData.firstName?.[0] || "").toUpperCase()}
                        {(formData.lastName?.[0] || "").toUpperCase()}
                      </span>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-transparent"
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    {formData.avatar ? "Cambiar Foto" : "Subir Foto"}
                  </Button>
                  {formData.avatar && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive h-auto py-1"
                      onClick={() => updateField("avatar", "")}
                    >
                      Quitar foto
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground text-center">
                    JPG o PNG. Max 2MB
                  </p>

                  <div className="w-full pt-4 border-t border-border space-y-3">
                    <div className="space-y-2">
                      <Label>Estado</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: UserStatus) => updateField("status", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.entries(statusLabels) as [UserStatus, string][]).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Personal Information */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UserIcon className="w-5 h-5" />
                    Informacion Personal
                  </CardTitle>
                  <CardDescription>
                    Datos basicos del empleado
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Nombre(s) *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName || ""}
                        onChange={(e) => updateField("firstName", e.target.value)}
                        placeholder="Ej: Carlos Alberto"
                        className={validationErrors.firstName ? "border-destructive" : ""}
                      />
                      {validationErrors.firstName && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {validationErrors.firstName}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Apellidos *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName || ""}
                        onChange={(e) => updateField("lastName", e.target.value)}
                        placeholder="Ej: Garcia Lopez"
                        className={validationErrors.lastName ? "border-destructive" : ""}
                      />
                      {validationErrors.lastName && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {validationErrors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5" />
                          Correo Electronico
                        </span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email || ""}
                        onChange={(e) => updateField("email", e.target.value)}
                        placeholder="carlos@restaurante.com"
                        className={validationErrors.email ? "border-destructive" : ""}
                      />
                      {validationErrors.email && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {validationErrors.email}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5" />
                          Telefono Principal
                        </span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone || ""}
                        onChange={(e) => updateField("phone", e.target.value)}
                        placeholder="+52 55 1234 5678"
                        className={validationErrors.phone ? "border-destructive" : ""}
                      />
                      {validationErrors.phone && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {validationErrors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="secondaryPhone">Telefono Secundario</Label>
                      <Input
                        id="secondaryPhone"
                        type="tel"
                        value={formData.secondaryPhone || ""}
                        onChange={(e) => updateField("secondaryPhone", e.target.value)}
                        placeholder="+52 55 8765 4321"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="w-3.5 h-3.5" />
                          Fecha de Nacimiento
                        </span>
                      </Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth || ""}
                        onChange={(e) => updateField("dateOfBirth", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Genero</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value: "male" | "female" | "other" | "prefer_not_to_say") =>
                        updateField("gender", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Masculino</SelectItem>
                        <SelectItem value="female">Femenino</SelectItem>
                        <SelectItem value="other">Otro</SelectItem>
                        <SelectItem value="prefer_not_to_say">Prefiero no decir</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Address */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Direccion
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Calle y Numero</Label>
                  <Input
                    id="address"
                    value={formData.address || ""}
                    onChange={(e) => updateField("address", e.target.value)}
                    placeholder="Ej: Av. Insurgentes Sur 1234, Col. Del Valle"
                  />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Ciudad / Municipio</Label>
                    <Input
                      id="city"
                      value={formData.city || ""}
                      onChange={(e) => updateField("city", e.target.value)}
                      placeholder="Ej: Ciudad de Mexico"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado</Label>
                    <Input
                      id="state"
                      value={formData.state || ""}
                      onChange={(e) => updateField("state", e.target.value)}
                      placeholder="Ej: CDMX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Codigo Postal</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode || ""}
                      onChange={(e) => updateField("zipCode", e.target.value)}
                      placeholder="Ej: 03100"
                      maxLength={5}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <HeartPulse className="w-5 h-5" />
                  Contacto de Emergencia
                </CardTitle>
                <CardDescription>
                  Persona a contactar en caso de emergencia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactName">Nombre Completo</Label>
                    <Input
                      id="emergencyContactName"
                      value={formData.emergencyContactName || ""}
                      onChange={(e) => updateField("emergencyContactName", e.target.value)}
                      placeholder="Ej: Maria Lopez"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactPhone">Telefono</Label>
                    <Input
                      id="emergencyContactPhone"
                      type="tel"
                      value={formData.emergencyContactPhone || ""}
                      onChange={(e) => updateField("emergencyContactPhone", e.target.value)}
                      placeholder="+52 55 1234 5678"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactRelation">Parentesco</Label>
                    <Select
                      value={formData.emergencyContactRelation || ""}
                      onValueChange={(value) => updateField("emergencyContactRelation", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="spouse">Conyuge</SelectItem>
                        <SelectItem value="parent">Padre / Madre</SelectItem>
                        <SelectItem value="sibling">Hermano(a)</SelectItem>
                        <SelectItem value="child">Hijo(a)</SelectItem>
                        <SelectItem value="friend">Amigo(a)</SelectItem>
                        <SelectItem value="other">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ========== DOCUMENTS TAB ========== */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Identificacion Oficial
                </CardTitle>
                <CardDescription>
                  Documentos de identidad del empleado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="documentType">Tipo de Documento</Label>
                    <Select
                      value={formData.documentType || ""}
                      onValueChange={(value: "ine" | "passport" | "curp" | "rfc" | "other") =>
                        updateField("documentType", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ine">INE / IFE</SelectItem>
                        <SelectItem value="passport">Pasaporte</SelectItem>
                        <SelectItem value="curp">CURP</SelectItem>
                        <SelectItem value="rfc">RFC</SelectItem>
                        <SelectItem value="other">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="documentNumber">Numero de Documento</Label>
                    <Input
                      id="documentNumber"
                      value={formData.documentNumber || ""}
                      onChange={(e) => updateField("documentNumber", e.target.value)}
                      placeholder="Numero de identificacion"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Hash className="w-5 h-5" />
                  Datos Fiscales y Seguridad Social
                </CardTitle>
                <CardDescription>
                  Informacion requerida para nomina y obligaciones fiscales
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rfc">RFC</Label>
                    <Input
                      id="rfc"
                      value={formData.rfc || ""}
                      onChange={(e) => updateField("rfc", e.target.value.toUpperCase())}
                      placeholder="AAAA000000AA0"
                      maxLength={13}
                    />
                    <p className="text-xs text-muted-foreground">13 caracteres con homoclave</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="curp">CURP</Label>
                    <Input
                      id="curp"
                      value={formData.curp || ""}
                      onChange={(e) => updateField("curp", e.target.value.toUpperCase())}
                      placeholder="AAAA000000AAAAAA00"
                      maxLength={18}
                    />
                    <p className="text-xs text-muted-foreground">18 caracteres</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nss">NSS (Num. Seguro Social)</Label>
                    <Input
                      id="nss"
                      value={formData.nss || ""}
                      onChange={(e) => updateField("nss", e.target.value)}
                      placeholder="00000000000"
                      maxLength={11}
                    />
                    <p className="text-xs text-muted-foreground">11 digitos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ========== EMPLOYMENT TAB ========== */}
          <TabsContent value="employment" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Datos Laborales
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="employeeNumber">Numero de Empleado</Label>
                      <Input
                        id="employeeNumber"
                        value={formData.employeeNumber || ""}
                        onChange={(e) => updateField("employeeNumber", e.target.value)}
                        placeholder="Ej: EMP-001"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Rol en el Sistema *</Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value: UserRole) => applyRoleDefaults(value)}
                      >
                        <SelectTrigger className={validationErrors.role ? "border-destructive" : ""}>
                          <SelectValue placeholder="Seleccionar rol" />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.entries(roleLabels) as [UserRole, string][]).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {validationErrors.role && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {validationErrors.role}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="department">Departamento</Label>
                      <Select
                        value={formData.department || ""}
                        onValueChange={(value) => updateField("department", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cocina">Cocina</SelectItem>
                          <SelectItem value="salon">Salon</SelectItem>
                          <SelectItem value="barra">Barra</SelectItem>
                          <SelectItem value="caja">Caja</SelectItem>
                          <SelectItem value="administracion">Administracion</SelectItem>
                          <SelectItem value="limpieza">Limpieza</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Puesto</Label>
                      <Input
                        id="position"
                        value={formData.position || ""}
                        onChange={(e) => updateField("position", e.target.value)}
                        placeholder="Ej: Mesero Senior"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contractType">Tipo de Contrato</Label>
                      <Select
                        value={formData.contractType}
                        onValueChange={(value: "full_time" | "part_time" | "temporary" | "freelance") =>
                          updateField("contractType", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full_time">Tiempo Completo</SelectItem>
                          <SelectItem value="part_time">Medio Tiempo</SelectItem>
                          <SelectItem value="temporary">Temporal</SelectItem>
                          <SelectItem value="freelance">Freelance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hireDate">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="w-3.5 h-3.5" />
                          Fecha de Ingreso
                        </span>
                      </Label>
                      <Input
                        id="hireDate"
                        type="date"
                        value={formData.hireDate || ""}
                        onChange={(e) => updateField("hireDate", e.target.value)}
                      />
                    </div>
                  </div>

                  {user && (
                    <div className="space-y-2">
                      <Label htmlFor="terminationDate">
                        <span className="flex items-center gap-1.5 text-destructive">
                          <CalendarDays className="w-3.5 h-3.5" />
                          Fecha de Baja
                        </span>
                      </Label>
                      <Input
                        id="terminationDate"
                        type="date"
                        value={formData.terminationDate || ""}
                        onChange={(e) => updateField("terminationDate", e.target.value)}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Landmark className="w-5 h-5" />
                    Salario y Datos Bancarios
                  </CardTitle>
                  <CardDescription>
                    Informacion para pago de nomina
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="salary">Salario</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          id="salary"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.salary || ""}
                          onChange={(e) => updateField("salary", Number.parseFloat(e.target.value) || 0)}
                          className="pl-7"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salaryType">Periodo de Pago</Label>
                      <Select
                        value={formData.salaryType}
                        onValueChange={(value: "hourly" | "daily" | "weekly" | "biweekly" | "monthly") =>
                          updateField("salaryType", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Por Hora</SelectItem>
                          <SelectItem value="daily">Diario</SelectItem>
                          <SelectItem value="weekly">Semanal</SelectItem>
                          <SelectItem value="biweekly">Quincenal</SelectItem>
                          <SelectItem value="monthly">Mensual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bankName">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5" />
                        Banco
                      </span>
                    </Label>
                    <Select
                      value={formData.bankName || ""}
                      onValueChange={(value) => updateField("bankName", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar banco" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bbva">BBVA</SelectItem>
                        <SelectItem value="banamex">Banamex / Citibanamex</SelectItem>
                        <SelectItem value="santander">Santander</SelectItem>
                        <SelectItem value="banorte">Banorte</SelectItem>
                        <SelectItem value="hsbc">HSBC</SelectItem>
                        <SelectItem value="scotiabank">Scotiabank</SelectItem>
                        <SelectItem value="azteca">Banco Azteca</SelectItem>
                        <SelectItem value="nu">Nu</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bankAccountNumber">Numero de Cuenta</Label>
                    <Input
                      id="bankAccountNumber"
                      value={formData.bankAccountNumber || ""}
                      onChange={(e) => updateField("bankAccountNumber", e.target.value)}
                      placeholder="Numero de cuenta bancaria"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clabeNumber">CLABE Interbancaria</Label>
                    <Input
                      id="clabeNumber"
                      value={formData.clabeNumber || ""}
                      onChange={(e) => updateField("clabeNumber", e.target.value)}
                      placeholder="18 digitos"
                      maxLength={18}
                    />
                    <p className="text-xs text-muted-foreground">
                      18 digitos. Necesaria para transferencias interbancarias.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ========== ACCESS TAB ========== */}
          <TabsContent value="access" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <KeyRound className="w-5 h-5" />
                    Credenciales de Acceso
                  </CardTitle>
                  <CardDescription>
                    Datos de autenticacion para ingresar al sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Nombre de Usuario</Label>
                    <Input
                      id="username"
                      value={formData.username || ""}
                      onChange={(e) => updateField("username", e.target.value)}
                      placeholder="Ej: carlos.garcia"
                    />
                    <p className="text-xs text-muted-foreground">
                      Opcional. Se puede usar el PIN para acceso rapido.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pin">PIN de Acceso Rapido *</Label>
                    <div className="relative">
                      <Input
                        id="pin"
                        type={showPin ? "text" : "password"}
                        value={formData.pin || ""}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "")
                          updateField("pin", val)
                        }}
                        placeholder="Minimo 4 digitos"
                        maxLength={8}
                        className={`pr-10 font-mono tracking-widest ${validationErrors.pin ? "border-destructive" : ""}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPin(!showPin)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {validationErrors.pin && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {validationErrors.pin}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      El PIN se usa para acceder rapidamente al POS y confirmar acciones sensibles.
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div>
                      <p className="font-medium text-sm">Requerir cambio de PIN</p>
                      <p className="text-xs text-muted-foreground">
                        El usuario debera cambiar su PIN en el proximo inicio de sesion
                      </p>
                    </div>
                    <Switch
                      checked={formData.requirePasswordChange}
                      onCheckedChange={(checked) => updateField("requirePasswordChange", checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Seguridad de la Cuenta
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user ? (
                    <>
                      <div className="p-3 rounded-lg bg-secondary/50 space-y-1">
                        <p className="text-sm font-medium">Ultimo acceso</p>
                        <p className="text-sm text-muted-foreground">
                          {formData.lastLogin
                            ? new Date(formData.lastLogin).toLocaleString("es-MX")
                            : "Nunca"}
                        </p>
                      </div>

                      <div className="p-3 rounded-lg bg-secondary/50 space-y-1">
                        <p className="text-sm font-medium">Intentos fallidos</p>
                        <p className="text-sm text-muted-foreground">
                          {formData.loginAttempts || 0} intentos
                        </p>
                      </div>

                      {formData.lockedUntil && new Date(formData.lockedUntil) > new Date() && (
                        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                          <p className="text-sm font-medium text-destructive flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Cuenta bloqueada
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Hasta: {new Date(formData.lockedUntil).toLocaleString("es-MX")}
                          </p>
                        </div>
                      )}

                      <Button variant="outline" className="w-full bg-transparent">
                        Resetear PIN
                      </Button>
                      <Button variant="outline" className="w-full bg-transparent">
                        Desbloquear Cuenta
                      </Button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-3 py-8 text-center">
                      <Shield className="w-12 h-12 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        La informacion de seguridad estara disponible una vez que el usuario sea creado e inicie sesion por primera vez.
                      </p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-border space-y-3">
                    <p className="text-sm font-medium">Notas Internas</p>
                    <Textarea
                      value={formData.notes || ""}
                      onChange={(e) => updateField("notes", e.target.value)}
                      placeholder="Notas sobre el empleado, observaciones, etc."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ========== PERMISSIONS TAB ========== */}
          <TabsContent value="permissions" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Permisos del Sistema
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Configura que acciones puede realizar este usuario
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Plantilla:</span>
                    {(Object.entries(roleLabels) as [UserRole, string][]).map(([role, label]) => (
                      <Button
                        key={role}
                        variant={formData.role === role ? "default" : "outline"}
                        size="sm"
                        onClick={() => applyRoleDefaults(role)}
                        className={formData.role !== role ? "bg-transparent" : ""}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {permissionGroups.map((group) => (
                    <div key={group.title} className="space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-border">
                        {group.icon}
                        <h4 className="font-medium text-sm">{group.title}</h4>
                      </div>
                      {group.permissions.map((perm) => (
                        <div key={perm.key} className="flex items-center justify-between">
                          <Label className="text-sm font-normal cursor-pointer" htmlFor={`perm-${perm.key}`}>
                            {perm.label}
                          </Label>
                          <Switch
                            id={`perm-${perm.key}`}
                            checked={formData.permissions?.[perm.key] as boolean ?? false}
                            onCheckedChange={(checked) => updatePermission(perm.key, checked)}
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Discount limit */}
                {formData.permissions?.applyDiscounts && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="flex items-center gap-4 max-w-sm">
                      <Label htmlFor="maxDiscount" className="whitespace-nowrap text-sm">
                        Descuento maximo permitido
                      </Label>
                      <div className="relative flex-1">
                        <Input
                          id="maxDiscount"
                          type="number"
                          min={0}
                          max={100}
                          value={formData.permissions?.maxDiscountPercent ?? 0}
                          onChange={(e) =>
                            updatePermission("maxDiscountPercent", Math.min(100, Math.max(0, Number.parseInt(e.target.value) || 0)))
                          }
                          className="pr-8"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ========== SCHEDULE TAB ========== */}
          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Horario Semanal
                    </CardTitle>
                    <CardDescription>
                      Define los dias y horas de trabajo del empleado
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <Label htmlFor="maxHours" className="text-sm whitespace-nowrap">
                      Max horas/semana:
                    </Label>
                    <Input
                      id="maxHours"
                      type="number"
                      min={0}
                      max={168}
                      value={formData.maxHoursPerWeek || 48}
                      onChange={(e) => updateField("maxHoursPerWeek", Number.parseInt(e.target.value) || 48)}
                      className="w-20"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(Object.entries(dayLabels) as [keyof WeeklySchedule, string][]).map(([day, label]) => {
                    const dayData = formData.schedule?.[day] || { enabled: false }
                    return (
                      <div
                        key={day}
                        className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                          dayData.enabled ? "bg-secondary/50" : "bg-secondary/20 opacity-60"
                        }`}
                      >
                        <div className="w-28 flex items-center gap-3">
                          <Switch
                            checked={dayData.enabled}
                            onCheckedChange={(checked) =>
                              updateDaySchedule(day, {
                                enabled: checked,
                                startTime: checked ? dayData.startTime || "09:00" : undefined,
                                endTime: checked ? dayData.endTime || "17:00" : undefined,
                              })
                            }
                          />
                          <span className={`text-sm font-medium ${dayData.enabled ? "" : "text-muted-foreground"}`}>
                            {label}
                          </span>
                        </div>

                        {dayData.enabled && (
                          <>
                            <div className="flex items-center gap-2">
                              <Label className="text-xs text-muted-foreground whitespace-nowrap">Entrada</Label>
                              <Input
                                type="time"
                                value={dayData.startTime || "09:00"}
                                onChange={(e) => updateDaySchedule(day, { startTime: e.target.value })}
                                className="w-32 h-8 text-sm"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <Label className="text-xs text-muted-foreground whitespace-nowrap">Salida</Label>
                              <Input
                                type="time"
                                value={dayData.endTime || "17:00"}
                                onChange={(e) => updateDaySchedule(day, { endTime: e.target.value })}
                                className="w-32 h-8 text-sm"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <Label className="text-xs text-muted-foreground whitespace-nowrap">Descanso</Label>
                              <Input
                                type="time"
                                value={dayData.breakStart || ""}
                                onChange={(e) => updateDaySchedule(day, { breakStart: e.target.value })}
                                className="w-32 h-8 text-sm"
                                placeholder="Inicio"
                              />
                              <span className="text-muted-foreground text-xs">-</span>
                              <Input
                                type="time"
                                value={dayData.breakEnd || ""}
                                onChange={(e) => updateDaySchedule(day, { breakEnd: e.target.value })}
                                className="w-32 h-8 text-sm"
                                placeholder="Fin"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Weekly hours summary */}
                <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Horas programadas por semana</p>
                      <p className="text-xs text-muted-foreground">
                        Calculado en base al horario configurado
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {(() => {
                          let totalMinutes = 0
                          if (formData.schedule) {
                            for (const day of Object.values(formData.schedule)) {
                              if (day?.enabled && day.startTime && day.endTime) {
                                const [sh, sm] = day.startTime.split(":").map(Number)
                                const [eh, em] = day.endTime.split(":").map(Number)
                                let minutes = (eh * 60 + em) - (sh * 60 + sm)
                                if (day.breakStart && day.breakEnd) {
                                  const [bsh, bsm] = day.breakStart.split(":").map(Number)
                                  const [beh, bem] = day.breakEnd.split(":").map(Number)
                                  minutes -= (beh * 60 + bem) - (bsh * 60 + bsm)
                                }
                                if (minutes > 0) totalMinutes += minutes
                              }
                            }
                          }
                          const hours = Math.floor(totalMinutes / 60)
                          const mins = totalMinutes % 60
                          return `${hours}h ${mins > 0 ? `${mins}m` : ""}`
                        })()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        de {formData.maxHoursPerWeek || 48}h maximo
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
