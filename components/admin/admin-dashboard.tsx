"use client"

import { mockCategories, mockUsers } from "@/lib/mock-data"
import { ProductForm } from "./product-form"
import { statusColors, statusLabels, UserForm } from "./user-form"
import { CategoryManager } from "./category-manager"
import { PrinterManager } from "./printer-manager"
import { TableManager } from "./table-manager"
import { ZoneManager } from "./zone-manager"
import { AdminHeaderActions } from "./admin-header-actions"
import { ReportsModule } from "./reports-module"
import { DashboardModule } from "./dashboard-module"
import { ChangePasswordDialog } from "@/components/change-password"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  LayoutDashboard,
  UtensilsCrossed,
  Users,
  Settings,
  BarChart3,
  LogOut,
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  KeyRound,
} from "lucide-react"
import { useState } from "react";
import { toast } from "sonner";
import { useProductos } from "@/hooks/useProductos";
import { useUsuarios } from "@/hooks/useUsuarios";
import { formatCurrency } from "@/lib/formatters";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getImageUrl } from "@/lib/images"
import { MenuItem } from "@/models/producto.model"
import { User } from "@/models/usuario.model"
import { mapRole } from "@/mappers/user.mapper"

interface AdminDashboardProps {
  user: User
  onLogout: () => void
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "menu", label: "Menú", icon: UtensilsCrossed },
  { id: "users", label: "Usuarios", icon: Users },
  { id: "reports", label: "Reportes", icon: BarChart3 },
  { id: "settings", label: "Configuración", icon: Settings },
]


export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [menuSearch, setMenuSearch] = useState("")
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<MenuItem | undefined>(undefined)
  const [showUserForm, setShowUserForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined)

  const [categorias, setCategorias] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [productToDelete, setProductToDelete] = useState<MenuItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const {
    productos,
    loading,
    error,
    crearProducto,
    actualizarProducto,
    actualizarDisponibilidad,
    eliminarProducto,
    recargar
  } = useProductos();

  const {
    usuarios,
    crearUsuario,
    actualizarUsuario,
    actualizarEstadoUsuario,
    eliminarUsuario,
  } = useUsuarios();


  const filteredMenuItems = 
    selectedCategory === "all"
    ? productos.filter(
        (item) => item.name
        .toLowerCase()
        .includes(
          menuSearch.toLowerCase()
        )
      )
    : productos.filter(
        (item) => 
          item.category === selectedCategory 
          &&
          item.name
          .toLowerCase()
          .includes(
            menuSearch.toLowerCase()
          )
      );

  const UserFilteres = usuarios;

  const handleNewProduct = () => {
    setEditingProduct(undefined)
    setShowProductForm(true)
  }

  const handleEditProduct = (product: MenuItem) => {
    setEditingProduct(product)
    setShowProductForm(true)
  }

  const confirmarEliminarProducto = async () => {
    if (!productToDelete) {
      return;
    }
    try {
      setIsDeleting(true);
      await eliminarProducto(productToDelete.id);
      setProductToDelete(null);

    } catch (error) {
      error instanceof Error
        ? error.message
        : "Error guardando producto"
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveProduct = async (product: MenuItem) => {
    try {
      const response =
        product.id
          ? await actualizarProducto(product)
          : await crearProducto(product);

      toast.success(
        response.message,
        {
          style: {
            background: "#16a34a",
            color: "#ffffff",
            border: "1px solid #15803d",
          },
        }
      );

      setShowProductForm(false);
      setEditingProduct(undefined);

    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error guardando producto",
        {
          style: {
            background: "#dc2626",
            color: "#ffffff",
            border: "1px solid #b91c1c",
          },
        }
      );

      setShowProductForm(true);
      setEditingProduct(product);
    }
  }

  const handleCancelProductForm = () => {
    setShowProductForm(false)
    setEditingProduct(undefined)
  }

  const handleNewUser = () => {
    setEditingUser(undefined)
    setShowUserForm(true)
  }

  const handleEditUser = (usuario: User) => {
    setEditingUser(usuario)
    setShowUserForm(true)
  }

  const handleSaveUser = async (usuario: User) => {
    try {
      const response =
        usuario.id
          ? await actualizarUsuario(usuario)
          : await crearUsuario(usuario);

      toast.success(
        response.message,
        {
          style: {
            background: "#16a34a",
            color: "#ffffff",
            border: "1px solid #15803d",
          },
        }
      );

      setShowUserForm(false)
      setEditingUser(undefined)

    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error guardando usuario",
        {
          style: {
            background: "#dc2626",
            color: "#ffffff",
            border: "1px solid #b91c1c",
          },
        }
      );
      
      setShowUserForm(true)
      setEditingUser(usuario)
    }

  }

  const handleCancelUserForm = () => {
    setShowUserForm(false)
    setEditingUser(undefined)
  }

  if (showUserForm) {
    return (
      <UserForm
        user={editingUser}
        onSave={handleSaveUser}
        onCancel={handleCancelUserForm}
      />
    )
  }

  if (showProductForm) {
    return (
      <ProductForm
        product={editingProduct}
        onSave={handleSaveProduct}
        onCancel={handleCancelProductForm}
      />
    )
  }

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen shrink-0">
        <div className="p-4 border-b border-sidebar-border shrink-0">
          <h1 className="text-xl font-bold text-sidebar-foreground">RestoPOS</h1>
          <p className="text-sm text-muted-foreground">Panel de Administración</p>
        </div>

        <nav className="flex-1 min-h-0 overflow-y-auto p-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1 ${
                  activeTab === item.id
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-medium text-primary">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground">Administrador</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-transparent"
              onClick={() => setShowChangePassword(true)}
            >
              <KeyRound className="w-4 h-4 mr-2" />
              Cambiar Contraseña
            </Button>
            <Button variant="outline" size="sm" className="w-full bg-transparent" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto h-screen">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{navItems.find((i) => i.id === activeTab)?.label}</h2>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString("es-MX", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <AdminHeaderActions />
            </div>
          </div>
        </header>

        <div className="p-6">
          {activeTab === "dashboard" && <DashboardModule />}

          {activeTab === "menu" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar producto..."
                    className="pl-9"
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                  />
                </div>
                <Button onClick={handleNewProduct}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Producto
                </Button>
              </div>

              <Tabs value={selectedCategory} onValueChange={setSelectedCategory} >
                <TabsList>
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  {mockCategories.map((cat) => (
                    <TabsTrigger key={cat.id} value={cat.id}>
                      {cat.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value={selectedCategory} className="mt-4">
                  <div className="grid gap-3">
                    {filteredMenuItems.map((item) => (
                      <Card key={item.id} className="overflow-hidden">
                        <div className="flex items-center p-4">
                          <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center mr-4">
                            {item.image ? (
                              <img
                                src={getImageUrl(item.image) || "/placeholder.svg"}
                                alt={item.name}
                                className="w-full h-full object-cover rounded-lg"
                                />
                            ) : ( 
                                <UtensilsCrossed className="w-6 h-6 text-muted-foreground" /> 
                              )
                            }
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{item.name}</h3>
                              {!item.available && (
                                <Badge variant="destructive" className="text-xs">
                                  Agotado
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                            <p className="text-sm font-medium text-primary mt-1"> {formatCurrency(item.price)} </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Disponible</span>
                              <Switch
                                checked={item.available}
                                onCheckedChange={(checked) =>
                                  actualizarDisponibilidad(
                                    item.id,
                                    checked
                                  )
                                }
                              />
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleEditProduct(item)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setProductToDelete(item)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">Gestiona los usuarios del sistema</p>
                <Button onClick={handleNewUser}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Usuario
                </Button>
              </div>

              <div className="grid gap-4">
                { (
                  [
                    { label: "Administradores", role: "admin" as const },
                    { label: "Meseros", role: "waiter" as const },
                    { label: "Cajeros", role: "cashier" as const },
                  ] as const
                ).map((group) => {
                  const usersInRole = UserFilteres.filter((u) => u.role === mapRole(group.role))
                  return (
                    <Card key={group.role}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{group.label}</CardTitle>
                          <Badge variant="secondary">{usersInRole.length}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="divide-y divide-border">
                          {usersInRole.map((u) => (
                            <div key={u.id} className="flex items-center justify-between py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-sm font-medium text-primary">
                                    {u.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                    }
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium">{u.name}</p>
                                  {u.status && (
                                    <Badge className={statusColors[u.status]}>
                                      {statusLabels[u.status]}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => handleEditUser(u)}>
                                Editar
                                <ChevronRight className="w-4 h-4 ml-1" />
                              </Button>
                            </div>
                          ))}
                          {usersInRole.length === 0 && (
                            <p className="text-sm text-muted-foreground py-3">No hay usuarios en este rol</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {activeTab === "reports" && <ReportsModule />}

          {activeTab === "settings" && (
            <div className="space-y-6">
              {/* First row: General + Printers */}
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Configuracion General</CardTitle>
                    <CardDescription>Ajustes del sistema</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Impuesto (IVA)</p>
                        <p className="text-sm text-muted-foreground">Porcentaje aplicado a ventas</p>
                      </div>
                      <div className="w-24">
                        <Input type="number" defaultValue="16" className="text-right" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Propina Sugerida</p>
                        <p className="text-sm text-muted-foreground">Porcentaje sugerido</p>
                      </div>
                      <div className="w-24">
                        <Input type="number" defaultValue="15" className="text-right" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Impresion Automatica</p>
                        <p className="text-sm text-muted-foreground">Imprimir tickets al confirmar pedido</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>

                <PrinterManager />
              </div>

              {/* Second row: Categories + Tables */}
              <div className="grid lg:grid-cols-2 gap-6">
                <CategoryManager />
                <TableManager />
              </div>

              {/* Third row: Zones */}
              <div className="grid lg:grid-cols-2 gap-6">
                <ZoneManager />
              </div>
            </div>
          )}
        </div>
      </main>

      <ChangePasswordDialog
        open={showChangePassword}
        onOpenChange={setShowChangePassword}
        currentPasswordValue="admin123"
      />


      <AlertDialog 
        open={!!productToDelete} 
        onOpenChange={(open) => {
          if (!open) {
            setProductToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ⚠️ Confirmar Eliminar producto
            </AlertDialogTitle>

            <AlertDialogDescription>
              El producto será marcado como eliminado y dejará de estar disponible para ventas.
              <br />
              <br />
              Producto:
              <strong>
                {" "}
                {productToDelete?.name}
              </strong>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>
              Cancelar
            </AlertDialogCancel>

            <AlertDialogAction
              className="
                bg-destructive
                text-destructive-foreground
                hover:bg-destructive/90
              "
              onClick={confirmarEliminarProducto}
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>

        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}
