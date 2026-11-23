import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { apiRequest } from "../lib/api";

type Stage = "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
type Lead = { id: string; name: string; email: string; company: string | null; phone: string | null; interest: string; message: string; status: Stage; assignedTo: string | null; nextStep: string | null; followUpAt: string | null; createdAt: string | null; activity: Array<{ at?: string | null; note?: string; status?: string }> };
const stages: Record<Stage, string> = { new: "Novo", contacted: "Contactado", qualified: "Qualificado", proposal: "Proposta", won: "Ganho", lost: "Perdido" };
const next: Record<Stage, Stage[]> = { new: ["contacted", "lost"], contacted: ["qualified", "lost"], qualified: ["contacted", "proposal", "lost"], proposal: ["qualified", "won", "lost"], won: [], lost: ["new"] };

export default function LeadsManager() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState("");
  const refresh = useCallback(async () => {
    try { const result = await apiRequest<{ items: Lead[] }>("/admin/leads?limit=100"); setLeads(result.items); setError(""); setSelected((old) => old ? result.items.find((lead) => lead.id === old.id) || null : null); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível carregar os pedidos."); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  const update = async (id: string, changes: Record<string, unknown>) => {
    setSaving(true);
    try { await apiRequest(`/admin/leads/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(changes) }); await refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível actualizar o pedido."); }
    finally { setSaving(false); }
  };
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!selected) return; const form = new FormData(event.currentTarget); const date = String(form.get("followUpAt") || "");
    await update(selected.id, { assignedTo: String(form.get("assignedTo") || ""), nextStep: String(form.get("nextStep") || ""), followUpAt: date ? new Date(date).toISOString() : "", ...(note.trim() ? { note: note.trim() } : {}) }); setNote("");
  };
  const fresh = leads.filter((lead) => lead.status === "new").length;
  const active = leads.filter((lead) => ["contacted", "qualified", "proposal"].includes(lead.status)).length;
  return <section className="space-y-6">
    <header className="flex items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-widest text-zinc-400">Comercial</p><h1 className="text-2xl font-bold">Funil de pedidos</h1><p className="mt-1 text-sm text-zinc-500">Contactos recebidos através do site.</p></div><button onClick={() => void refresh()} className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"><RefreshCw size={15} />Actualizar</button></header>
    <div className="grid grid-cols-2 gap-3">
      <div className="col-span-2 rounded-xl border border-zinc-200 bg-white p-4"><p className="text-xs text-zinc-500">Pedidos</p><p className="mt-1 text-2xl font-bold">{leads.length}</p></div>
      <div className="rounded-xl border border-zinc-200 bg-white p-4"><p className="text-xs text-zinc-500">Novos</p><p className="mt-1 text-2xl font-bold">{fresh}</p></div>
      <div className="rounded-xl border border-zinc-200 bg-white p-4"><p className="text-xs text-zinc-500">Em acompanhamento</p><p className="mt-1 text-2xl font-bold">{active}</p></div>
    </div>
    {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {selected ? <div className="space-y-4"><button onClick={() => setSelected(null)} className="inline-flex items-center gap-2 text-sm text-zinc-600"><ArrowLeft size={16} />Todos os pedidos</button><div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]"><article className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold">{selected.name}</h2><a href={`mailto:${selected.email}`} className="text-sm text-zinc-500">{selected.email}</a></div><select disabled={saving} value={selected.status} onChange={(event) => void update(selected.id, { status: event.target.value })} className="rounded-lg border border-zinc-200 px-3 py-2 text-sm">{[selected.status, ...next[selected.status]].map((stage) => <option key={stage} value={stage}>{stages[stage]}</option>)}</select></div><div><p className="text-xs font-bold uppercase text-zinc-400">{selected.interest}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6">{selected.message}</p></div><form onSubmit={save} className="space-y-3 border-t border-zinc-100 pt-5"><h3 className="font-semibold">Próxima acção</h3><label className="block text-xs text-zinc-500">Responsável<input name="assignedTo" defaultValue={selected.assignedTo || ""} className="mt-1 w-full rounded-lg border border-zinc-200 p-2 text-sm" /></label><label className="block text-xs text-zinc-500">Próximo passo<input name="nextStep" defaultValue={selected.nextStep || ""} className="mt-1 w-full rounded-lg border border-zinc-200 p-2 text-sm" /></label><label className="block text-xs text-zinc-500">Data de seguimento<input name="followUpAt" type="datetime-local" defaultValue={selected.followUpAt ? new Date(selected.followUpAt).toISOString().slice(0, 16) : ""} className="mt-1 w-full rounded-lg border border-zinc-200 p-2 text-sm" /></label><label className="block text-xs text-zinc-500">Nota<textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} maxLength={2000} className="mt-1 w-full rounded-lg border border-zinc-200 p-2 text-sm" /></label><button disabled={saving} className="cms-primary rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60">{saving ? "A guardar…" : "Guardar acompanhamento"}</button></form></article><aside className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-6"><h3 className="font-semibold">Actividade</h3>{selected.activity.length ? selected.activity.slice().reverse().map((item, index) => <p key={index} className="text-xs text-zinc-500">{item.at ? new Date(item.at).toLocaleString("pt-AO") : ""} {item.note || item.status || "Pedido recebido"}</p>) : <p className="text-xs text-zinc-400">Sem actividade registada.</p>}</aside></div></div> : <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">{!leads.length ? <p className="p-12 text-center text-sm text-zinc-500">Ainda não há pedidos registados.</p> : leads.map((lead) => <button key={lead.id} onClick={() => setSelected(lead)} className="flex w-full flex-wrap items-center justify-between gap-3 border-b border-zinc-100 p-4 text-left hover:bg-zinc-50 sm:px-6"><span><span className="block text-sm font-semibold">{lead.name}{lead.company && <span className="ml-2 font-normal text-zinc-400">{lead.company}</span>}</span><span className="mt-1 block text-xs text-zinc-500">{lead.interest} · {lead.email}</span></span><span className="text-xs font-medium text-zinc-600">{stages[lead.status]}{lead.createdAt ? ` · ${new Date(lead.createdAt).toLocaleDateString("pt-AO")}` : ""}</span></button>)}</div>}
  </section>;
}
