"use client"

import { useState } from "react"
import type { User } from "@/lib/types"
import { useEffect } from "react";
import { LoginScreen } from "@/components/login-screen"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { WaiterInterface } from "@/components/waiter/waiter-interface"
import { CashierInterface } from "@/components/cashier/cashier-interface"
import { ForcePasswordChangeScreen } from "@/components/change-password"
import { getCurrentUser, SessionService } from "@/lib/session";
import { AuthService } from "@/services/auth.service";
import { UserRole } from "@/models/usuario.model";

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
  }

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
        onComplete={() => setMustChangePassword(false)}
        onLogout={handleLogout}
      />
    )
  }

  
  function mapRole(
    role: string
  ): UserRole {
  
    switch (role.toUpperCase()) {
      case "ADMINISTRADOR":
        return "admin";
  
      case "MESERO":
        return "waiter";
  
      case "CAJERO":
        return "cashier";
  
      default:
        return "waiter";
    }
  }

  switch (mapRole(currentUser.role)) {
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
