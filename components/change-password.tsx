"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group"
import { Lock, Eye, EyeOff, AlertCircle, Check, X, ShieldCheck, KeyRound } from "lucide-react"
import { toast } from "sonner"

interface PasswordRule {
  label: string
  test: (pw: string) => boolean
}

const passwordRules: PasswordRule[] = [
  { label: "Mínimo 8 caracteres", test: (pw) => pw.length >= 8 },
  { label: "Una letra mayúscula", test: (pw) => /[A-Z]/.test(pw) },
  { label: "Una letra minúscula", test: (pw) => /[a-z]/.test(pw) },
  { label: "Un número", test: (pw) => /[0-9]/.test(pw) },
  // { label: "Un carácter especial (!@#$%...)", test: (pw) => /[^A-Za-z0-9]/.test(pw) },
]

function getStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: "", color: "bg-muted" }
  const passed = passwordRules.filter((r) => r.test(pw)).length
  if (passed <= 2) return { score: passed, label: "Débil", color: "bg-destructive" }
  if (passed === 3) return { score: passed, label: "Regular", color: "bg-warning" }
  if (passed === 4) return { score: passed, label: "Buena", color: "bg-primary" }
  return { score: passed, label: "Fuerte", color: "bg-success" }
}

interface PasswordFieldProps {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoComplete?: string
}

function PasswordField({ id, label, value, onChange, placeholder, autoComplete }: PasswordFieldProps) {
  const [show, setShow] = useState(false)
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <InputGroup>
        <InputGroupAddon>
          <Lock className="w-4 h-4 text-muted-foreground" />
        </InputGroupAddon>
        <InputGroupInput
          id={id}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={placeholder || "••••••••"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <InputGroupAddon align="inline-end">
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}

interface PasswordFormProps {
  requireCurrent?: boolean
  currentPasswordValue?: string
  onSuccess?: (newPassword: string) => void | Promise<void>
  onCancel?: () => void
  submitLabel?: string
}

function PasswordForm({
  requireCurrent = true,
  currentPasswordValue,
  onSuccess,
  onCancel,
  submitLabel = "Cambiar Contraseña",
}: PasswordFormProps) {
  const [current, setCurrent] = useState("")
  const [next, setNext] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const strength = useMemo(() => getStrength(next), [next])
  const allRulesPass = passwordRules.every((r) => r.test(next))
  const matches = next.length > 0 && next === confirm

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (requireCurrent && !current) {
      setError("Ingresa tu contraseña actual.")
      return
    }
    if (requireCurrent && currentPasswordValue && current !== currentPasswordValue) {
      setError("La contraseña actual es incorrecta.")
      return
    }
    if (!allRulesPass) {
      setError("La nueva contraseña no cumple con los requisitos de seguridad.")
      return
    }
    if (requireCurrent && next === current) {
      setError("La nueva contraseña debe ser diferente a la actual.")
      return
    }
    if (!matches) {
      setError("Las contraseñas no coinciden.")
      return
    }

    // setIsLoading(true)
    // setTimeout(() => {
    //   setIsLoading(false)
    //   onSuccess()
    // }, 600)
    try {
      setIsLoading(true);
      if (onSuccess) {
        await onSuccess?.(next);
      }
    } catch(error){
      toast.error(
        error instanceof Error
          ? error.message
          : "Error actualizando contraseña"
      );
    } finally{
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {requireCurrent && (
        <PasswordField
          id="current-password"
          label="Contraseña actual"
          value={current}
          onChange={(v) => {
            setCurrent(v)
            setError("")
          }}
          autoComplete="current-password"
        />
      )}

      <PasswordField
        id="new-password"
        label="Nueva contraseña"
        value={next}
        onChange={(v) => {
          setNext(v)
          setError("")
        }}
        autoComplete="new-password"
      />

      {/* Strength meter */}
      {next.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 grid grid-cols-5 gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-colors ${
                    i <= strength.score ? strength.color : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-medium text-muted-foreground w-12 text-right">{strength.label}</span>
          </div>
        </div>
      )}

      <PasswordField
        id="confirm-password"
        label="Confirmar nueva contraseña"
        value={confirm}
        onChange={(v) => {
          setConfirm(v)
          setError("")
        }}
        autoComplete="new-password"
      />

      {confirm.length > 0 && (
        <div className={`flex items-center gap-2 text-xs ${matches ? "text-success" : "text-destructive"}`}>
          {matches ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
          <span>{matches ? "Las contraseñas coinciden" : "Las contraseñas no coinciden"}</span>
        </div>
      )}

      {/* Requirements checklist */}
      <div className="rounded-lg border border-border bg-secondary/40 p-3">
        <p className="text-xs font-medium text-muted-foreground mb-2">Requisitos de seguridad:</p>
        <div className="space-y-1">
          {passwordRules.map((rule) => {
            const passed = rule.test(next)
            return (
              <div
                key={rule.label}
                className={`flex items-center gap-2 text-xs ${passed ? "text-success" : "text-muted-foreground"}`}
              >
                {passed ? <Check className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0" />}
                <span>{rule.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        {onCancel && (
          <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? "Guardando..." : submitLabel}
        </Button>
      </div>
    </form>
  )
}

/* ----------------------------- Voluntary dialog ----------------------------- */

interface ChangePasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentPasswordValue?: string
  onSuccess?: () => void
}

export function ChangePasswordDialog({
  open,
  onOpenChange,
  currentPasswordValue,
  onSuccess,
}: ChangePasswordDialogProps) {
  const [done, setDone] = useState(false)

  const handleSuccess = async (
    _newPassword: string
  ) => {

    setDone(true);
    onSuccess?.();
    setTimeout(() => {
      setDone(false);
      onOpenChange(false);
    }, 1500);

  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" />
            Cambiar Contraseña
          </DialogTitle>
          <DialogDescription>Actualiza tu contraseña de acceso al sistema.</DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
            <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-success" />
            </div>
            <p className="font-medium">Contraseña actualizada</p>
            <p className="text-sm text-muted-foreground">Tu contraseña se cambió correctamente.</p>
          </div>
        ) : (
          <PasswordForm
            requireCurrent
            currentPasswordValue={currentPasswordValue}
            onSuccess={handleSuccess}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------- Admin-forced full screen ------------------------- */

interface ForcePasswordChangeScreenProps {
  userName: string
  temporaryPassword?: string
  onComplete:(password:string)=>Promise<void>
  onLogout: () => void
}

export function ForcePasswordChangeScreen({
  userName,
  temporaryPassword,
  onComplete,
  onLogout,
}: ForcePasswordChangeScreenProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-warning/10 mb-4">
            <KeyRound className="w-8 h-8 text-warning" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Cambio de contraseña requerido</h1>
          <p className="text-muted-foreground mt-2">
            Hola {userName.split(" ")[0]}, por seguridad debes establecer una nueva contraseña antes de continuar.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Nueva contraseña</CardTitle>
            <CardDescription>Crea una contraseña segura que recordarás fácilmente.</CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordForm
              requireCurrent
              currentPasswordValue={temporaryPassword}
              onSuccess={onComplete}
              onCancel={onLogout}
              submitLabel="Guardar y continuar"
            />
            <p className="mt-3 text-center text-xs text-muted-foreground">
              ¿No eres tú?{" "}
              <button onClick={onLogout} className="text-primary hover:underline">
                Cerrar sesión
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
