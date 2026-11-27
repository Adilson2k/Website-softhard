import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ShieldCheck, UserPlus, Users } from "lucide-react";
import { apiRequest } from "../lib/api";

type ManagedUser = {
  uid: string;
  email: string | null;
  displayName: string;
  photoURL: string | null;
  disabled: boolean;
  role: "admin" | "editor" | null;
  createdAt: string;
};

export default function AdminSettings() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiRequest<{ items: ManagedUser[] }>("/admin/users");
      setUsers(result.items);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível carregar os utilizadores.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadUsers(); }, [loadUsers]);

  const createUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const result = await apiRequest<{ user: ManagedUser }>("/admin/users", {
        method: "POST",
        body: JSON.stringify({
          displayName: data.get("displayName"),
          email: data.get("email"),
          password: data.get("password"),
          role: data.get("role"),
        }),
      });
      setSuccess(`A conta de ${result.user.displayName} foi criada.`);
      form.reset();
      await loadUsers();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível criar a conta.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Administração</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900">Configurações</h1>
        <p className="mt-1 text-sm text-zinc-500">Gerencie o acesso da equipa ao CMS.</p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <form onSubmit={createUser} className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3 border-b border-zinc-100 pb-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[var(--cms-red)]"><UserPlus size={19} /></span>
            <div><h2 className="font-semibold text-zinc-900">Criar utilizador</h2><p className="mt-1 text-xs leading-5 text-zinc-500">A conta será criada no Firebase Authentication.</p></div>
          </div>

          {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</p>}
          {success && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">{success}</p>}

          <label className="block text-sm font-medium text-zinc-700">Nome completo<input name="displayName" required minLength={2} maxLength={100} autoComplete="name" className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100" /></label>
          <label className="block text-sm font-medium text-zinc-700">Email<input name="email" type="email" required maxLength={254} autoComplete="email" className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100" /></label>
          <label className="block text-sm font-medium text-zinc-700">Palavra-passe inicial<input name="password" type="password" required minLength={12} maxLength={128} autoComplete="new-password" className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100" /><span className="mt-1 block text-xs font-normal text-zinc-400">Mínimo de 12 caracteres. Partilhe-a directamente com a pessoa.</span></label>
          <label className="block text-sm font-medium text-zinc-700">Permissão<select name="role" defaultValue="editor" className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"><option value="editor">Editor — gerir artigos</option><option value="admin">Administrador — acesso total</option></select></label>
          <button disabled={saving} className="cms-primary inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"><UserPlus size={16} />{saving ? "A criar conta…" : "Criar conta"}</button>
        </form>

        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600"><Users size={19} /></span><div><h2 className="font-semibold text-zinc-900">Utilizadores</h2><p className="mt-0.5 text-xs text-zinc-500">Contas registadas no Firebase</p></div></div>
            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600">{users.length}</span>
          </div>
          <div className="divide-y divide-zinc-100">
            {loading ? <p className="p-6 text-sm text-zinc-500">A carregar utilizadores…</p> : users.length ? users.map((managedUser) => (
              <article key={managedUser.uid} className="flex items-center gap-3 px-5 py-4 sm:px-6">
                {managedUser.photoURL ? <img src={managedUser.photoURL} alt="" className="h-10 w-10 rounded-full border border-zinc-200 object-cover" /> : <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-sm font-semibold text-[var(--cms-red)]">{(managedUser.displayName || managedUser.email || "?").slice(0, 1).toUpperCase()}</span>}
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-zinc-800">{managedUser.displayName || "Sem nome"}</p><p className="truncate text-xs text-zinc-500">{managedUser.email}</p></div>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-600"><ShieldCheck size={12} />{managedUser.role === "admin" ? "Admin" : managedUser.role === "editor" ? "Editor" : "Sem acesso"}</span>
              </article>
            )) : <p className="p-6 text-sm text-zinc-500">Nenhum utilizador encontrado.</p>}
          </div>
        </section>
      </div>
    </section>
  );
}
