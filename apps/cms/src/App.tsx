import React, { useState } from "react";
import { LogOut, Settings, ShieldAlert } from "lucide-react";
import { Toaster } from "react-hot-toast";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import BlogManager from "./components/BlogManager";
import LeadsManager from "./components/LeadsManager";
import Editor from "./components/Editor";
import Login from "./components/Login";
import AdminSettings from "./components/AdminSettings";
import { View } from "./types";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "./lib/hooks";

const ENABLED_VIEWS: View[] = ["dashboard", "blog", "leads", "editor", "settings"];

function isEnabledView(view: View) {
  return ENABLED_VIEWS.includes(view);
}

export default function App() {
  const { user, role, canAccessCms, loading: authLoading, logout } = useAuth();
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | undefined>(undefined);

  const handleEditPost = (postId?: string) => {
    setEditingPostId(postId);
    setCurrentView("editor");
  };

  const handleViewChange = (nextView: View) => {
    if (!isEnabledView(nextView)) {
      setCurrentView("blog");
      return;
    }
    if (nextView === "leads" && role !== "admin") return;
    if (nextView === "settings" && role !== "admin") return;
    setCurrentView(nextView);
  };

  const renderView = () => {
    // CRITICAL: Don't render components that need auth data while still loading
    if (authLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <div className="w-8 h-8 rounded-full border-2 border-zinc-200 border-t-zinc-900 animate-spin mx-auto" />
            <p className="text-xs text-zinc-500">A carregar...</p>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case "dashboard":
        return <Dashboard onNewPost={() => handleEditPost()} onViewToBlog={() => setCurrentView("blog")} />;
      case "blog":
        return <BlogManager onEdit={handleEditPost} />;
      case "leads":
        return role === "admin" ? <LeadsManager /> : <Dashboard onNewPost={() => handleEditPost()} onViewToBlog={() => setCurrentView("blog")} />;
      case "editor":
        return (
          <Editor
            postId={editingPostId}
            onBack={() => setCurrentView("dashboard")}
            onSave={() => setCurrentView("dashboard")}
          />
        );
      case "settings":
        return role === "admin" ? <AdminSettings /> : <Dashboard onNewPost={() => handleEditPost()} onViewToBlog={() => setCurrentView("blog")} />;
      default:
        return <Dashboard onNewPost={() => handleEditPost()} onViewToBlog={() => setCurrentView("blog")} />;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-zinc-200 border-t-zinc-900 animate-spin mx-auto" />
          <p className="text-zinc-500 font-medium">A carregar autenticacao...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Login />
      </>
    );
  }

  if (!canAccessCms) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-zinc-200 rounded-2xl p-7 shadow-sm">
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-red-50 text-red-600 mb-4">
            <ShieldAlert size={20} />
          </div>
          <h1 className="text-xl font-semibold text-zinc-900 mb-2">Acesso restrito</h1>
          <p className="text-sm text-zinc-600 mb-6">
            Esta conta autenticou com sucesso, mas nao possui permissao para acessar o CMS.
          </p>
          <button
            onClick={logout}
            className="cms-primary w-full rounded-lg py-2.5 text-sm font-medium transition-colors"
          >
            Sair
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      <Toaster position="top-right" />
      <Sidebar
        currentView={currentView}
        onViewChange={handleViewChange}
        isOpen={false}
        setIsOpen={setIsSidebarOpen}
        onProfileClick={() => setIsProfileMenuOpen(true)}
        onLogout={logout}
        user={user}
        isAdmin={role === 'admin'}
        role={role}
      />

      <main className="min-h-screen lg:ml-64 flex flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-4 md:px-6">
          <div className="flex items-center gap-3">
            <img src={`${import.meta.env.BASE_URL}logo-softhard.png`} alt="Softhard" className="h-9 w-[118px] object-cover object-center lg:hidden" />
            <div className="hidden items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 md:flex">
              <span>CMS</span>
              <span className="text-zinc-200">/</span>
              <span className="text-zinc-900">{currentView}{role ? ` (${role})` : ""}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setIsProfileMenuOpen((open) => !open)} aria-label="Abrir perfil e configurações" aria-haspopup="dialog" aria-expanded={isProfileMenuOpen} className="rounded-full outline-none ring-offset-2 transition hover:ring-2 hover:ring-red-200 focus-visible:ring-2 focus-visible:ring-[var(--cms-red)] lg:hidden">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || user.email || "Perfil"} className="h-9 w-9 rounded-full border border-zinc-200 object-cover" />
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-sm font-semibold text-[var(--cms-red)]">
                  {(user?.displayName || user?.email || "U").split(/[ @]/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}
                </span>
              )}
            </button>
            <button onClick={logout} aria-label="Terminar sessão" title="Terminar sessão" className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-red-50 hover:text-[var(--cms-red)] lg:hidden">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <AnimatePresence>
          {isProfileMenuOpen && (
            <>
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} type="button" aria-label="Fechar menu do perfil" onClick={() => setIsProfileMenuOpen(false)} className="fixed inset-0 z-40 cursor-default bg-black/5" />
              <motion.section role="dialog" aria-modal="true" aria-label="Menu do perfil" initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.98 }} className="fixed bottom-[5.5rem] left-3 z-50 w-[min(20rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-zinc-900/10 sm:bottom-auto sm:left-auto sm:right-4 sm:top-[4.5rem] lg:bottom-24 lg:left-4 lg:right-auto lg:top-auto">
                <div className="flex items-center gap-3 border-b border-zinc-100 p-4">
                  {user.photoURL ? <img src={user.photoURL} alt="" className="h-11 w-11 rounded-full border border-zinc-200 object-cover" /> : <span className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 font-semibold text-[var(--cms-red)]">{(user.displayName || user.email || "U").slice(0, 1).toUpperCase()}</span>}
                  <div className="min-w-0"><p className="truncate text-sm font-semibold text-zinc-900">{user.displayName || user.email}</p><p className="truncate text-xs text-zinc-500">{user.email}</p></div>
                </div>
                {role === "admin" && <button type="button" onClick={() => { setIsProfileMenuOpen(false); setCurrentView("settings"); }} className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 hover:text-[var(--cms-red)]"><Settings size={17} /><span>Configurações</span></button>}
                <div className="border-t border-zinc-100 px-4 py-2 text-[11px] text-zinc-400">{role === "admin" ? "Administrador" : "Editor"} · Softhard CMS</div>
              </motion.section>
            </>
          )}
        </AnimatePresence>

        <div className="flex-1 overflow-x-hidden px-4 py-5 pb-24 md:p-8 lg:pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>

        <footer className="hidden border-t border-zinc-100 px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400 lg:flex lg:items-center lg:justify-between">
          <span>Softhard CMS</span>
          <div className="flex items-center gap-4">
            <span>Modo funcional</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
