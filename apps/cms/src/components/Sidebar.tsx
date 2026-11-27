import React from "react";
import {
  LayoutDashboard,
  Newspaper,
  Mail,
  ChevronRight,
  LogOut,
  X,
} from "lucide-react";
import type { CmsUser } from "../lib/api";
import { cn } from "../lib/utils";
import { View } from "../types";

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onLogout?: () => Promise<void>;
  user: CmsUser | null;
  isAdmin?: boolean;
  role?: 'admin' | 'editor' | null;
}

const navItems = [
  { id: "dashboard" as View, label: "Dashboard", icon: LayoutDashboard },
  { id: "blog" as View, label: "Blog", icon: Newspaper },
  { id: "leads" as View, label: "Pedidos", icon: Mail },
];

export default function Sidebar({ currentView, onViewChange, isOpen, setIsOpen, onLogout, user, isAdmin = false, role = null }: SidebarProps) {
  const getInitials = (name?: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const displayName = user?.displayName || user?.email || "Usuario";
  const initials = getInitials(user?.displayName || user?.email);

  const filteredNavItems = navItems.filter((item) => item.id !== "leads" || isAdmin);

  const navigation = filteredNavItems.map((item) => {
    const Icon = item.icon;
    const isActive = currentView === item.id;

    return (
      <button
        key={item.id}
        onClick={() => {
          onViewChange(item.id);
          setIsOpen(false);
        }}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "group flex items-center justify-between rounded-lg transition-all duration-200",
          isActive ? "cms-nav-active" : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
        )}
      >
        <div className="flex items-center gap-3">
          <Icon size={18} className={cn(isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-900")} />
          <span className="text-sm font-medium">{item.label}</span>
        </div>
        {isActive && <ChevronRight size={14} />}
      </button>
    );
  });

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-full bg-white border-r border-zinc-200 z-50 transition-all duration-300 ease-in-out",
          "hidden w-64 lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:block lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={`${import.meta.env.BASE_URL}logo-softhard.png`} alt="Softhard" className="cms-logo" />
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-2 text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 space-y-1 px-4">
            {navigation}
          </nav>

          <div className="hidden border-t border-zinc-100 p-4 lg:block">
            <div className="flex items-center gap-3 px-3 py-2">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={displayName}
                  className="w-8 h-8 rounded-full object-cover border border-zinc-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-600">
                  {initials}
                </div>
              )}
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-semibold text-zinc-900 truncate">{displayName}</p>
                <p className="text-xs text-zinc-500 truncate">{role === 'admin' ? 'Administrador' : role === 'editor' ? 'Editor' : 'Utilizador'}</p>
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
                title="Sair"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <nav aria-label="Navegação principal" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-[repeat(auto-fit,minmax(0,1fr))] border-t border-zinc-200 bg-white/95 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 shadow-[0_-8px_24px_rgba(24,24,27,0.06)] backdrop-blur lg:hidden">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-medium transition-colors",
                isActive ? "text-[var(--cms-red)]" : "text-zinc-500 hover:text-zinc-800"
              )}
            >
              <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
