"use client"

import { useState } from "react"
import { useEffect } from "react";
import { LoginScreen } from "@/components/login-screen"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { WaiterInterface } from "@/components/waiter/waiter-interface"
import { CashierInterface } from "@/components/cashier/cashier-interface"
import { ForcePasswordChangeScreen } from "@/components/change-password"
import { getCurrentUser, SessionService } from "@/lib/session";
import { AuthService } from "@/services/auth.service";
import { User, UserRole } from "@/models/usuario.model";
import { toast } from "sonner";

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [mustChangePassword, setMustChangePassword] = useState(false)
  const [temporaryPassword, setTemporaryPassword] = useState<string | undefined>(undefined)

  const handleLogin = (user: User, options?: { requirePasswordChange?: boolean; password?: string }) => {
    setCurrentUser(user)
    setMustChangePassword(Boolean(options?.requirePasswordChange))
    setTemporaryPassword(options?.password)
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setMustChangePassword(false)
    setTemporaryPassword(undefined)
    SessionService.clear();
    localStorage.removeItem("usuario");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }

  const handleCambiarPassword = async (
    newPassword: string
  ) => {

    try {
      const response = await AuthService.cambiarPassword(
        newPassword
      );

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
      toast.success(
        '¡Bienvenido!',
        {
          style: {
            background: "#16a34a",
            color: "#ffffff",
            border: "1px solid #15803d",
          },
        }
      );
      
      setMustChangePassword(false)

    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al cambiar la contraseña.",
        {
          style: {
            background: "#dc2626",
            color: "#ffffff",
            border: "1px solid #b91c1c",
          },
        }
      );
      
      setMustChangePassword(true)

    }

  };

  useEffect(() => {
    const validarSesion = async () => {

      try {
        const token = SessionService.getToken();
        if (!token) {
          setCurrentUser(null);
          return;
        }

        const dataUserLocal = getCurrentUser();
        const usuario = await AuthService.validarToken();

        if (usuario && dataUserLocal) {
          setCurrentUser(dataUserLocal);
        }

      } catch (error) {
        console.error(
          "Error validando sesión:",
          error
        );
        setCurrentUser(null);
      } finally {
        setLoadingAuth(false);
      }

    };

    validarSesion();

  }, []);

  if (loadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Cargando sesión...
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />
  }

  if (mustChangePassword) {
    return (
      <ForcePasswordChangeScreen
        userName={currentUser.name}
        temporaryPassword={temporaryPassword}
        onComplete={handleCambiarPassword}
        onLogout={handleLogout}
      />
    )
  }

  // switch (mapRole(currentUser.role)) {
  switch (currentUser.role) {
    case "admin":
      return <AdminDashboard user={currentUser} onLogout={handleLogout} />
    case "waiter":
      return <WaiterInterface user={currentUser} onLogout={handleLogout} />
    case "cashier":
      return <CashierInterface user={currentUser} onLogout={handleLogout} />
    default:
      return <LoginScreen onLogin={handleLogin} />
  }
}

