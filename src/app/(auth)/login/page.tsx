"use client";
// page.tsx — src/app/(auth)/login/page.tsx — 2026-05-20
// Login split-screen 60/40: slider industrial izquierda + formulario derecha

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import {
  Activity,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ─── Schemas ─────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

const registerSchema = z
  .object({
    fullName: z.string().min(2, "El nombre es obligatorio"),
    email: z.string().email("Email inválido"),
    password: z.string().min(8, "Mínimo 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

// ─── Componente ──────────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Login form
  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Register form
  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
  });

  async function handleLogin(data: LoginForm) {
    setAuthError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error) {
      // Mostrar el error REAL de Supabase para debug
      setAuthError(`[${error.status}] ${error.message}`);
      return;
    }
    router.push("/");
    router.refresh();
  }

  async function handleRegister(data: RegisterForm) {
    setAuthError(null);
    setSuccessMsg(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { full_name: data.fullName } },
    });
    if (error) {
      setAuthError(error.message);
      return;
    }
    setSuccessMsg("¡Cuenta creada! Revisá tu email para confirmar el registro.");
    registerForm.reset();
  }

  return (
    <div className="flex min-h-screen w-full overflow-hidden">

      {/* ── Panel izquierdo — Arte estático ─────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[55%] relative flex-col p-12"
        style={{
          background: "radial-gradient(120% 120% at 18% 0%, #234784 0%, #102C53 42%, #0B2447 100%)",
          minHeight: "100vh",
        }}
      >
        {/* Dot pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
            maskImage: "linear-gradient(160deg, #000, transparent 70%)",
          }}
        />

        {/* Glow */}
        <div
          className="absolute -top-30 -right-30 w-115 h-115 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(165,215,232,0.45), transparent 62%)",
            filter: "blur(20px)",
          }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-[9px] bg-white/10 border border-white/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-[17px] tracking-tight">Zaire Trace</span>
        </div>

        {/* Tagline */}
        <div className="relative z-10 mt-12 flex-1 flex flex-col justify-center">
          <p className="text-[11px] font-semibold tracking-[0.09em] uppercase text-[#A5D7E8] mb-4">Gestión & Trazabilidad</p>
          <h2 className="text-[33px] font-bold leading-[1.12] tracking-tight text-white mb-4 max-w-115">
            Cada orden de trabajo, de punta a punta y bajo control.
          </h2>
          <p className="text-[15px] text-[#AFC0E0] leading-relaxed max-w-102.5">
            Seguimiento de órdenes, repuestos y tiempos de taller en un solo lugar. Pensado para equipos de servicio técnico industrial.
          </p>
        </div>

        {/* Mock dashboard */}
        <div className="relative z-10 mt-auto">
          <div
            className="rounded-[14px] p-4"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.14)",
              backdropFilter: "blur(4px)",
              boxShadow: "0 30px 70px -20px rgba(0,0,0,0.6)",
            }}
          >
            {/* Traffic lights */}
            <div className="flex gap-1.5 mb-3">
              {[0,1,2].map((i) => <span key={i} className="w-2.5 h-2.5 rounded-full bg-white/30 block" />)}
            </div>
            {/* KPI mini cards */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[["37","Abiertas"],["14","En taller"],["52","Entregadas"]].map(([val, label]) => (
                <div key={label} className="rounded-[9px] p-3" style={{ background: "rgba(255,255,255,0.09)" }}>
                  <b className="block text-[17px] font-bold text-white">{val}</b>
                  <span className="text-[9px] text-[#AFC0E0]">{label}</span>
                </div>
              ))}
            </div>
            {/* Mini bar chart */}
            <div className="flex items-end gap-2 h-16 rounded-[9px] px-3 py-3" style={{ background: "rgba(255,255,255,0.06)" }}>
              {[42,64,38,80,56,70,48,90].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-lg"
                  style={{
                    height: `${h}%`,
                    background: "linear-gradient(to bottom, #A5D7E8, #576CBC)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Panel derecho 45% — Formulario ────────────────────────────── */}
      <div className="flex-1 lg:w-[45%] flex flex-col min-h-screen bg-white">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 p-6 border-b border-gray-200 bg-sas-navy">
          <Activity className="w-5 h-5 text-white" />
          <span className="text-white font-bold">Zaire Trace</span>
        </div>

        {/* Form area */}
        <div className="flex-1 flex flex-col justify-center px-8 py-10 xl:px-14">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-[25px] font-bold text-gray-900 mb-1.5 tracking-[-0.02em]">
              {isRegister ? "Crear cuenta" : "Iniciá sesión"}
            </h1>
            <p className="text-sm text-gray-500">
              {isRegister
                ? "Completá tus datos para registrarte"
                : "Ingresá con tu cuenta para continuar."}
            </p>
          </div>

          {/* ── LOGIN FORM ── */}
          {!isRegister && (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="login-email" className="text-gray-700 font-medium text-sm">
                  Email
                </Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="usuario@empresa.com"
                  autoComplete="email"
                  className="h-11 bg-white border-gray-200 focus:border-sas-blue focus:ring-sas-blue/20 text-gray-900"
                  {...loginForm.register("email")}
                />
                {loginForm.formState.errors.email && (
                  <p className="text-xs text-red-500">{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="login-password" className="text-gray-700 font-medium text-sm">
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="h-11 bg-white border-gray-200 pr-10 focus:border-sas-blue focus:ring-sas-blue/20 text-gray-900"
                    {...loginForm.register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-xs text-red-500">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              {/* Recordarme + Olvidé */}
              <div className="flex items-center justify-between text-[12.5px]">
                <label className="flex items-center gap-2 text-gray-600 cursor-pointer select-none">
                  <input type="checkbox" className="w-3.5 h-3.5 accent-sas-blue" defaultChecked />
                  Recordarme
                </label>
                <span className="text-sas-blue font-medium cursor-pointer hover:underline">
                  ¿Olvidaste tu contraseña?
                </span>
              </div>

              {authError && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                  {authError}
                </div>
              )}

              <Button
                type="submit"
                disabled={loginForm.formState.isSubmitting}
                className="w-full h-11 bg-sas-navy hover:bg-sas-navy-mid text-white font-semibold transition-colors"
              >
                {loginForm.formState.isSubmitting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Ingresando...</>
                ) : (
                  "Ingresar"
                )}
              </Button>

              {/* Divider */}
              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-[11.5px] text-gray-400">o</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* SSO button (visual only) */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 border-gray-200 bg-white text-gray-700 hover:bg-gray-50 font-medium"
              >
                Acceso con SSO corporativo
              </Button>

              <div className="relative flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">¿No tenés cuenta?</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => { setIsRegister(true); setAuthError(null); loginForm.reset(); }}
                className="w-full h-11 border-gray-200 bg-white text-gray-700 hover:bg-gray-50 font-medium"
              >
                Registrarse
              </Button>
            </form>
          )}

          {/* ── REGISTER FORM ── */}
          {isRegister && (
            <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-gray-700 font-medium text-sm">Nombre completo</Label>
                <Input
                  type="text"
                  placeholder="Juan Pérez"
                  className="h-11 bg-white border-gray-200 text-gray-900"
                  {...registerForm.register("fullName")}
                />
                {registerForm.formState.errors.fullName && (
                  <p className="text-xs text-red-500">{registerForm.formState.errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-gray-700 font-medium text-sm">Email</Label>
                <Input
                  type="email"
                  placeholder="usuario@empresa.com"
                  className="h-11 bg-white border-gray-200 text-gray-900"
                  {...registerForm.register("email")}
                />
                {registerForm.formState.errors.email && (
                  <p className="text-xs text-red-500">{registerForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-gray-700 font-medium text-sm">Contraseña</Label>
                <div className="relative">
                  <Input
                    type={showPass ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    className="h-11 bg-white border-gray-200 pr-10 text-gray-900"
                    {...registerForm.register("password")}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {registerForm.formState.errors.password && (
                  <p className="text-xs text-red-500">{registerForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-gray-700 font-medium text-sm">Confirmar contraseña</Label>
                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repetí tu contraseña"
                    className="h-11 bg-white border-gray-200 pr-10 text-gray-900"
                    {...registerForm.register("confirmPassword")}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {registerForm.formState.errors.confirmPassword && (
                  <p className="text-xs text-red-500">{registerForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Aceptar términos */}
              <p className="text-xs text-gray-500 leading-relaxed">
                Al registrarte aceptás nuestros{" "}
                <Link href="/terminos" target="_blank" className="text-sas-blue underline hover:text-sas-navy">
                  Términos y Condiciones
                </Link>{" "}
                y la{" "}
                <Link href="/terminos#privacidad" target="_blank" className="text-sas-blue underline hover:text-sas-navy">
                  Política de Privacidad
                </Link>.
              </p>

              {authError && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{authError}</div>
              )}
              {successMsg && (
                <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">{successMsg}</div>
              )}

              <Button
                type="submit"
                disabled={registerForm.formState.isSubmitting}
                className="w-full h-11 bg-sas-navy hover:bg-sas-navy-mid text-white font-semibold"
              >
                {registerForm.formState.isSubmitting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creando cuenta...</>
                ) : (
                  "Crear cuenta"
                )}
              </Button>

              <Button type="button" variant="ghost"
                onClick={() => { setIsRegister(false); setAuthError(null); setSuccessMsg(null); registerForm.reset(); }}
                className="w-full text-gray-500 hover:text-gray-700"
              >
                ← Volver al inicio de sesión
              </Button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 xl:px-14 py-6 border-t border-gray-100">
          <p className="text-[12.5px] text-gray-400 text-center">
            ¿Problemas para ingresar?{" "}
            <Link href="/ayuda" className="text-sas-blue font-medium hover:underline">
              Contactar a soporte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
