"use client"

import type React from "react"

import { useState } from "react"
import type { User } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group"
import { ChefHat, User as UserIcon, Lock, Eye, EyeOff, AlertCircle } from "lucide-react"

import { AuthService } from "@/services/auth.service"
import { mapUsuarioToUser } from "@/mappers/user.mapper"

interface LoginScreenProps {
  onLogin: (user: User, options?: { requirePasswordChange?: boolean; password?: string }) => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    setError("");

    if (!username || !password) {

      setError(
        "Por favor ingresa usuario y contraseña."
      );

      return;
    }

    try {

      setIsLoading(true);

      const response =
        await AuthService.login({
          usuario: username,
          password,
        });

      if (!response.authenticated) {

        setError(
          "Usuario o contraseña incorrectos."
        );

        return;
      }

      localStorage.setItem(
        "accessToken",
        response.accessToken
      );

      localStorage.setItem(
        "refreshToken",
        response.refreshToken
      );

      localStorage.setItem(
        "usuario",
        JSON.stringify(
          response.usuario
        )
      );

      const user =
        mapUsuarioToUser(
          response.usuario
        );

      onLogin(user);

    } catch (error: any) {

      setError(
        error.message ||
        "Error al iniciar sesión."
      );

    } finally {

      setIsLoading(false);

    }

  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 mb-4">
            <ChefHat className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">RestoPOS</h1>
          <p className="text-muted-foreground mt-2">Sistema de Gestión de Restaurante</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Iniciar Sesión</CardTitle>
            <CardDescription>Ingresa tus credenciales para continuar</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Usuario</Label>
                <InputGroup>
                  <InputGroupAddon>
                    <UserIcon className="w-4 h-4 text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="username"
                    type="text"
                    autoComplete="username"
                    placeholder="Ej. admin"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value)
                      setError("")
                    }}
                    autoCapitalize="none"
                    spellCheck={false}
                  />
                </InputGroup>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <InputGroup>
                  <InputGroupAddon>
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setError("")
                    }}
                  />
                  <InputGroupAddon align="inline-end">
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </InputGroupAddon>
                </InputGroup>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? "Verificando..." : "Ingresar"}
              </Button>
            </form>

            <div className="mt-6 rounded-lg border border-border bg-secondary/20 p-4 text-center">
              <div className="mt-3 text-xs text-muted-foreground">
                <p> © {new Date().getFullYear()} InnaroTech SAS </p>
                <p>Todos los derechos reservados.</p>
                <p className="mt-1">
                  Versión 1.0.0
                </p>
              </div>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}
