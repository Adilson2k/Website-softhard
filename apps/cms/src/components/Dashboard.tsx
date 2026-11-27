import React from "react";
import { 
  FileText, 
  TrendingUp, 
  Plus,
  Loader,
  AlertCircle
} from "lucide-react";
import { motion } from "motion/react";
import { useBlogPosts, useAuth } from "../lib/hooks";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { cn } from "../lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  delay?: number;
}

function StatCard({ label, value, icon: Icon, trend, delay = 0 }: StatCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white p-3 md:p-6 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] md:text-sm font-medium text-zinc-500 truncate">{label}</p>
          <h3 className="text-xl md:text-3xl font-bold text-zinc-900 mt-1 truncate">{value}</h3>
          {trend && (
            <div className="flex items-center gap-1 mt-1 md:mt-2 text-emerald-600 text-[9px] md:text-xs font-medium">
              <TrendingUp size={10} className="md:w-3 md:h-3" />
              <span className="truncate">{trend}</span>
            </div>
          )}
        </div>
        <div className="p-2 md:p-3 bg-zinc-50 rounded-lg md:rounded-xl text-zinc-900 border border-zinc-100 flex-shrink-0">
          <Icon size={16} className="md:w-5 md:h-5" />
        </div>
      </div>
    </motion.div>
  );
}

export default function Dashboard({ onNewPost, onViewToBlog }: { onNewPost: () => void; onViewToBlog?: () => void }) {
  const { user, canAccessCms } = useAuth();
  const { posts: allPosts, loading: postsLoading, error: postsError } = useBlogPosts('all', user, canAccessCms);
  
  // Filter for published posts only
  const publishedPosts = allPosts.filter(post => post.status === 'published');
  const recentPosts = publishedPosts.slice(0, 5); // Show 5 most recent
  
  // Get user display name
  const displayName = user?.displayName || user?.email || "Utilizador";
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight italic serif font-serif">Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-1">Bem-vindo de volta, {displayName}. Aqui está o que aconteceu hoje.</p>
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
          <button
            onClick={onViewToBlog}
            className="rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            Ver todos os artigos
          </button>
          <button
            onClick={onNewPost}
            className="cms-primary flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium shadow-lg shadow-red-100 transition-all active:scale-95"
          >
            <Plus size={18} />
            <span>Novo artigo</span>
          </button>
        </div>
      </header>

      {/* Error State */}
      {postsError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-900">Erro ao carregar posts</p>
            <p className="text-xs text-red-700 mt-1">{postsError}</p>
          </div>
        </div>
      )}

      {/* Stats Grid - Only Real Data */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
        <StatCard label="Posts Publicados" value={postsLoading ? "-" : publishedPosts.length} icon={FileText} delay={0.2} />
      </div>

      {/* TODO: Mock Stats - Commented out until proper data source is available
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Visitas Totais" value="12,482" icon={Users} trend="+12%" delay={0.1} />
        <StatCard label="Posts Publicados" value={postsLoading ? "-" : publishedPosts.length} icon={FileText} delay={0.2} />
        <StatCard label="Novas Mensagens" value={MOCK_LEADS.filter(l => l.status === 'new').length} icon={MessageSquare} delay={0.3} />
        <StatCard label="Tempo Médio" value="4m 32s" icon={Clock} trend="+5%" delay={0.4} />
      </div>
      */}

      {/* Recent Posts - Full Width (Previously: lg:col-span-2 due to side Leads panel) */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-zinc-100">
            <h2 className="font-bold text-zinc-900">Artigos Recentes</h2>
          </div>
          <div className="divide-y divide-zinc-100">
            {postsLoading ? (
              <div className="p-6 flex items-center justify-center">
                <div className="flex items-center gap-2 text-zinc-500">
                  <Loader size={16} className="animate-spin" />
                  <span className="text-sm">A carregar artigos...</span>
                </div>
              </div>
            ) : recentPosts.length > 0 ? (
              recentPosts.map((post) => (
                <div key={post.id} className="p-4 hover:bg-zinc-50 transition-colors flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-zinc-100 overflow-hidden border border-zinc-200 flex-shrink-0">
                      {post.coverImage?.trim() ? (
                        <img src={post.coverImage.trim()} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full bg-zinc-200" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-zinc-900 truncate">{post.title}</h4>
                      <p className="text-xs text-zinc-500 mt-0.5 truncate">Por {post.author} • {format(new Date(post.createdAt), "d 'de' MMMM", { locale: pt })}</p>
                    </div>
                  </div>
                  <div className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    post.status === 'published' ? "bg-zinc-100 text-zinc-900" : "bg-zinc-50 text-zinc-400"
                  )}>
                    {post.status === 'published' ? 'Publicado' : 'Rascunho'}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center">
                <p className="text-sm text-zinc-500">Nenhum artigo publicado ainda</p>
              </div>
            )}
          </div>
        </div>

        {/* TODO: Recent Leads - Not yet implemented - Commented out until LeadsManager is functional */}
        {/* <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
            <h2 className="font-bold text-zinc-900">Mensagens</h2>
            <button className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 uppercase tracking-wider">Ver Todas</button>
          </div>
          <div className="p-4 space-y-4">
            {MOCK_LEADS.map((lead) => (
              <div key={lead.id} className="flex gap-3 items-start p-3 rounded-xl hover:bg-zinc-50 transition-colors cursor-pointer group">
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex-shrink-0 flex items-center justify-center text-xs font-bold text-zinc-600">
                  {lead.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-zinc-900 truncate">{lead.name}</p>
                    <span className="text-[10px] text-zinc-400">{format(new Date(lead.createdAt), "HH:mm")}</span>
                  </div>
                  <p className="text-xs text-zinc-500 truncate mt-0.5">{lead.message}</p>
                </div>
                <ArrowUpRight size={14} className="text-zinc-300 group-hover:text-zinc-900 transition-colors" />
              </div>
            ))}
          </div>
        </div> */}
      </div>

    </div>
  );
}
