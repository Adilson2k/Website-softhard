import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader,
  AlertCircle
} from "lucide-react";
import { cn } from "../lib/utils";
import { useBlogPosts, useDeleteBlogPost, useAuth } from "../lib/hooks";
import { useToast } from "../lib/use-toast";
import { log } from "../lib/logger";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  coverImage: string;
  author: string;
  category?: string;
  tags?: string[];
  status: 'draft' | 'published';
  publishedAt: string | null;
  createdAt: string;
}

export default function BlogManager({ onEdit }: { onEdit: (postId?: string) => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  const { user, canAccessCms } = useAuth();
  const { posts, loading, error } = useBlogPosts(statusFilter === 'all' ? undefined : statusFilter, user, canAccessCms);
  const { deletePost, loading: deleting } = useDeleteBlogPost();
  const toast = useToast();

  // Filter posts by search only (status filtering already done by hook)
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.slug.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleDelete = async (postId: string, postTitle: string) => {
    if (confirm(`Tem a certeza que deseja deletar "${postTitle}"?`)) {
      try {
        toast.show('Eliminando artigo...', 'loading');
        await deletePost(postId);
        setDeleteConfirm(null);
        toast.show(`Artigo "${postTitle}" eliminado com sucesso!`, 'success');
        log.audit('delete-blog-post', { postId, postTitle }, { action: 'delete-blog-post' });
      } catch (err) {
        toast.show('Erro ao eliminar artigo. Tente novamente.', 'error');
        log.error('Failed to delete blog post', err, { postId, postTitle });
      }
    }
  };

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-zinc-900 tracking-tight italic serif font-serif">Blog & Notícias</h1>
          <p className="text-zinc-500 text-xs md:text-sm mt-1">Gere os seus artigos, categorias e tags do blog.</p>
        </div>
        <button 
          onClick={() => onEdit()}
          className="cms-primary flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all active:scale-95 shadow-lg shadow-red-100 w-full md:w-auto"
        >
          <Plus size={18} />
          <span>Novo Artigo</span>
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-900">Erro ao carregar posts</p>
            <p className="text-xs text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white p-3 md:p-4 rounded-2xl border border-zinc-200 flex flex-col md:flex-row gap-3 md:gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
          <input 
            type="text" 
            placeholder="Pesquisar artigos..." 
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="flex-1 md:flex-none px-3 py-2 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-600 bg-white focus:outline-none"
        >
          <option value="all">Todos os Estados</option>
          <option value="published">Publicados</option>
          <option value="draft">Rascunhos</option>
        </select>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-2xl border border-zinc-200 p-12 flex flex-col items-center justify-center gap-4">
          <Loader size={32} className="text-zinc-400 animate-spin" />
          <p className="text-sm text-zinc-500">A carregar posts...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredPosts.length === 0 && (
        <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center">
          <h3 className="font-bold text-zinc-900 mb-2">Nenhum artigo encontrado</h3>
          <p className="text-sm text-zinc-500 mb-6">{searchTerm || statusFilter !== 'all' ? 'Tente ajustar os filtros.' : 'Crie o seu primeiro artigo para começar.'}</p>
          <button 
            onClick={() => onEdit()}
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            <Plus size={16} />
            Novo Artigo
          </button>
        </div>
      )}

      {/* Table / Mobile List */}
      {!loading && filteredPosts.length > 0 && (
        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-100">
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-zinc-400 font-mono">Artigo</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-zinc-400 font-mono">Estado</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-zinc-400 font-mono">Categoria</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-zinc-400 font-mono">Data</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-zinc-400 font-mono text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-zinc-100 overflow-hidden border border-zinc-200 flex-shrink-0">
                          {post.coverImage?.trim() ? (
                            <img src={post.coverImage.trim()} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full bg-zinc-200" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-zinc-900 truncate">{post.title}</p>
                          <p className="text-xs text-zinc-500 truncate mt-0.5">/{post.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        post.status === 'published' ? "bg-zinc-100 text-zinc-900" : "bg-zinc-50 text-zinc-400"
                      )}>
                        {post.status === 'published' ? 'Publicado' : 'Rascunho'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-zinc-600 bg-zinc-100 px-2 py-1 rounded border border-zinc-200">
                        {post.category || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-zinc-500">{format(new Date(post.createdAt), "dd/MM/yyyy", { locale: pt })}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => onEdit(post.id)}
                          className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                          className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-all"
                          title="Ver no site"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(post.id, post.title)}
                          disabled={deleting}
                          className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                          title="Deletar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile List View */}
          <div className="md:hidden divide-y divide-zinc-100">
            {filteredPosts.map((post) => (
              <div 
                key={post.id} 
                className="p-4 flex items-center gap-4 active:bg-zinc-50 transition-colors"
              >
                <div className="w-16 h-16 rounded-xl bg-zinc-100 overflow-hidden border border-zinc-200 flex-shrink-0">
                  {post.coverImage?.trim() ? (
                    <img src={post.coverImage.trim()} alt="" className="w-full h-full object-cover grayscale" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full bg-zinc-200" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn(
                      "text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded",
                      post.status === 'published' ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-400"
                    )}>
                      {post.status === 'published' ? 'Publicado' : 'Rascunho'}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">{format(new Date(post.createdAt), "dd/MM/yy", { locale: pt })}</span>
                  </div>
                  <h4 className="text-sm font-bold text-zinc-900 truncate">{post.title}</h4>
                  <p className="text-xs text-zinc-500 mt-0.5 truncate">/{post.slug}</p>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => onEdit(post.id)}
                    className="p-2 text-zinc-400 hover:text-zinc-900"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(post.id, post.title)}
                    className="p-2 text-zinc-400 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Info */}
          <div className="p-4 border-t border-zinc-100 text-xs text-zinc-500">
            A mostrar {filteredPosts.length} de {posts.length} artigos
          </div>
        </div>
      )}
    </div>
  );
}
