import { useState, type FormEvent } from "react";
import { AlertCircle, Eye, EyeOff, Loader, Lock, Mail } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../lib/hooks";

export default function Login() {
  const { login, loginWithGoogle, error: authError, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLocalError(null);
    try {
      await login(email, password);
      setPassword("");
    } catch (cause) {
      setLocalError(cause instanceof Error ? cause.message : "Não foi possível iniciar sessão.");
    }
  };

  const googleLogin = async () => {
    setLocalError(null);
    try {
      await loginWithGoogle();
    } catch (cause) {
      setLocalError(cause instanceof Error ? cause.message : "Não foi possível iniciar sessão com Google.");
    }
  };

  const error = localError || authError;
  return (
    <main className="flex min-h-screen items-center justify-center bg-[oklch(0.995_0_0)] p-4">
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-lg">
        <header className="mb-8 text-center">
          <img src="/logo-softhard.png" alt="Softhard" className="cms-logo-login mx-auto mb-4" />
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Softhard CMS</h1>
          <p className="mt-2 text-sm text-zinc-500">Acesso reservado à equipa autorizada</p>
        </header>

        {error && <div role="alert" className="mb-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle size={18} className="mt-0.5 shrink-0" />{error}</div>}

        <button type="button" onClick={googleLogin} disabled={loading} className="flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-200 bg-white py-2.5 font-medium text-zinc-800 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60">
          {loading ? <Loader size={18} className="animate-spin" /> : <svg aria-hidden="true" viewBox="0 0 48 48" className="size-[18px]"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.73 7.18l7.22 5.6c4.22-3.9 7.55-9.65 7.55-17.25Z"/><path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.2A23.9 23.9 0 0 0 0 24c0 3.89.93 7.57 2.56 10.78l7.97-6.19Z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.8l-7.22-5.6c-2 1.34-4.56 2.13-8.68 2.13-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 43.62 14.62 48 24 48Z"/></svg>}
          Continuar com Google
        </button>

        <div className="my-6 flex items-center gap-3 text-xs text-zinc-400"><span className="h-px flex-1 bg-zinc-200" /><span>ou use email e palavra-passe</span><span className="h-px flex-1 bg-zinc-200" /></div>
        <p className="mb-4 -mt-2 text-center text-xs leading-relaxed text-zinc-500">Se a sua conta é Google, use o botão acima. A palavra-passe Google não é usada neste formulário.</p>

        <form onSubmit={submit} className="space-y-4">
          <label className="block space-y-2 text-sm font-medium text-zinc-900">
            <span>Email</span>
            <span className="relative block"><Mail size={18} className="absolute left-3 top-3.5 text-zinc-400" /><input required type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} disabled={loading} className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10" /></span>
          </label>

          <label className="block space-y-2 text-sm font-medium text-zinc-900">
            <span>Palavra-passe</span>
            <span className="relative block"><Lock size={18} className="absolute left-3 top-3.5 text-zinc-400" /><input required type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} disabled={loading} className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-11 text-sm outline-none transition-colors focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10" /><button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-3.5 text-zinc-400" aria-label={showPassword ? "Ocultar palavra-passe" : "Mostrar palavra-passe"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span>
          </label>

          <button type="submit" disabled={loading} className="cms-primary flex w-full items-center justify-center gap-2 rounded-lg py-2.5 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? <><Loader size={18} className="animate-spin" />A verificar...</> : "Entrar"}
          </button>
        </form>
        <p className="mt-5 text-center text-xs text-zinc-500">A criação de contas é gerida pelo administrador.</p>
      </motion.section>
    </main>
  );
}
