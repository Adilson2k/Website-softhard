import React, { useState, useEffect } from "react";
import { 
  Save, 
  ArrowLeft, 
  Image as ImageIcon, 
  Type, 
  Link as LinkIcon, 
  Eye, 
  Settings as SettingsIcon,
  Sparkles,
  ChevronDown,
  X,
  Search,
  Plus,
  Upload,
  AlertCircle,
  CheckCircle,
  Loader
} from "lucide-react";
import { cn, slugify } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { 
  useBlogPostById, 
  useCreateBlogPost, 
  useUpdateBlogPost, 
  useFileUpload,
  useAuth 
} from "../lib/hooks";
import RichTextEditor from "./RichTextEditor";
import TagInput from "./TagInput";

interface EditorProps {
  postId?: string;
  onBack: () => void;
  onSave?: () => void;
}

export default function Editor({ postId, onBack, onSave }: EditorProps) {
  const { user, canAccessCms } = useAuth();
  const { post, loading: postLoading, error: postError } = useBlogPostById(postId || null);
  const { create, loading: creating, error: createError } = useCreateBlogPost(user, canAccessCms);
  const { update, loading: updating, error: updateError } = useUpdateBlogPost(user, canAccessCms);
  const { upload: uploadImage, loading: uploading, error: uploadError } = useFileUpload();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  
  const [activeTab, setActiveTab] = useState<"edit" | "preview" | "seo">("edit");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState("");
  const [loadedPostId, setLoadedPostId] = useState<string | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Load post data when postId changes
  useEffect(() => {
    if (postId && postLoading) {
      return;
    }

    if (post && !postLoading && post.id !== loadedPostId) {
      setTitle(post.title || "");
      setSlug(post.slug || "");
      setContent(post.content || "");
      setCoverImage(post.coverImage || "");
      setMediaUrl(post.mediaUrl || "");
      setCategory(post.category || "");
      setTags(Array.isArray(post.tags) ? post.tags : []);
      setStatus(post.status === "published" ? "published" : "draft");
      setMetaTitle(post.seo?.metaTitle || "");
      setMetaDescription(post.seo?.metaDescription || "");
      setLoadedPostId(post.id);
    } else if (!postId) {
      // Reset to defaults when creating new post
      setTitle("");
      setSlug("");
      setContent("");
      setCoverImage("");
      setMediaUrl("");
      setCategory("");
      setTags([]);
      setStatus("draft");
      setMetaTitle("");
      setMetaDescription("");
      setLoadedPostId(null);
    }
  }, [post, postLoading, postId, loadedPostId]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!postId && title) {
      setSlug(slugify(title));
    }
  }, [title, postId]);

  const handleAiSuggest = () => {
    setIsAiGenerating(true);
    setTimeout(() => {
      setTitle("10 Tendências de Design que vão dominar 2026");
      setIsAiGenerating(false);
    }, 1500);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadImage(file, "blog");
      setCoverImage(result.url);
      setSaveStatus("success");
      setSaveMessage("Imagem carregada com sucesso!");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err) {
      setSaveStatus("error");
      setSaveMessage("Erro ao carregar imagem: " + (err instanceof Error ? err.message : "Desconhecido"));
    }
  };

  const handleInlineImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadImage(file, "content");
      const entities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
      const alt = file.name.replace(/[&<>"']/g, (character) => entities[character] || "");
      setContent((current) => `${current.trim()}${current.trim() ? "\n\n" : ""}<figure><img src="${result.url}" alt="${alt}" /></figure>`);
      setSaveStatus("success");
      setSaveMessage("Imagem inserida no artigo.");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err) {
      setSaveStatus("error");
      setSaveMessage("Erro ao carregar imagem: " + (err instanceof Error ? err.message : "Desconhecido"));
    } finally {
      e.target.value = "";
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      setSaveStatus("error");
      setSaveMessage("Título e conteúdo são obrigatórios");
      return;
    }

    try {
      setSaveStatus("idle");
      const postData = {
        title,
        slug,
        content,
        coverImage,
        mediaUrl,
        category,
        tags,
        status,
        author: user?.displayName || user?.email || "Anonymous",
        authorId: user?.uid || "",
        seo: {
          metaTitle: metaTitle || title,
          metaDescription: metaDescription || content.substring(0, 160)
        },
        id: postId || "",
        publishedAt: null,
        createdAt: post?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (postId) {
        // Update existing post
        await update(postId, postData);
        setSaveStatus("success");
        setSaveMessage("Post atualizado com sucesso!");
      } else {
        // Create new post
        const newPostId = await create(postData);
        setSaveStatus("success");
        setSaveMessage("Post criado com sucesso!");
      }

      setTimeout(() => {
        setSaveStatus("idle");
        onSave?.();
        onBack();
      }, 1500);
    } catch (err) {
      setSaveStatus("error");
      setSaveMessage(err instanceof Error ? err.message : "Erro ao salvar post");
    }
  };

  // Show loading state while post is being loaded
  if (postId && postLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-zinc-200 border-t-zinc-900 animate-spin mx-auto" />
          <p className="text-zinc-500 font-medium">A carregar artigo...</p>
        </div>
      </div>
    );
  }

  if (postId && !postLoading && (!post || postError)) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-red-200 rounded-2xl p-6 text-center space-y-4">
          <AlertCircle size={28} className="mx-auto text-red-600" />
          <div>
            <h3 className="text-lg font-bold text-zinc-900">Falha ao carregar o artigo</h3>
            <p className="text-sm text-zinc-500 mt-2">
              {postError || "O artigo solicitado não foi encontrado no Firestore."}
            </p>
          </div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            <ArrowLeft size={16} />
            Voltar para artigos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col -m-6 md:-m-8">
      {/* Top Bar */}
      <div className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            title="Voltar à lista de artigos"
            className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-sm font-bold text-zinc-900">{postId && post ? `Editar: ${post.title}` : "Novo Artigo"}</h2>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
              {status === 'published' ? 'Publicado' : 'Rascunho'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Desktop Tabs */}
          <div className="hidden md:flex items-center bg-zinc-100 p-1 rounded-xl border border-zinc-200">
            <button 
              onClick={() => setActiveTab("edit")}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                activeTab === "edit" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
              )}
            >
              Editor
            </button>
            <button 
              onClick={() => setActiveTab("preview")}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                activeTab === "preview" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
              )}
            >
              Preview
            </button>
            <button 
              onClick={() => setActiveTab("seo")}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                activeTab === "seo" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
              )}
            >
              SEO
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 hover:bg-zinc-100 rounded-lg text-zinc-600 hover:text-zinc-900"
            title="Menu"
          >
            <ChevronDown size={20} className={cn("transition-transform", showMobileMenu && "rotate-180")} />
          </button>
          
          <button 
            onClick={handleSave}
            disabled={postLoading || creating || updating}
            className="cms-primary flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg shadow-red-100 disabled:opacity-50"
          >
            {creating || updating ? (
              <Loader size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            <span>{creating || updating ? "Salvando..." : "Guardar"}</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-white border-b border-zinc-200 p-4 space-y-4 max-h-[50vh] overflow-y-auto"
          >
            {/* Mobile Tabs */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 font-mono mb-3">Abas</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setActiveTab("edit"); setShowMobileMenu(false); }}
                  className={cn(
                    "flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all",
                    activeTab === "edit" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  )}
                >
                  Editor
                </button>
                <button 
                  onClick={() => { setActiveTab("preview"); setShowMobileMenu(false); }}
                  className={cn(
                    "flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all",
                    activeTab === "preview" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  )}
                >
                  Preview
                </button>
                <button 
                  onClick={() => { setActiveTab("seo"); setShowMobileMenu(false); }}
                  className={cn(
                    "flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all",
                    activeTab === "seo" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  )}
                >
                  SEO
                </button>
              </div>
            </div>
            <div className="border-t border-zinc-200" />
            
            {/* Categorias */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-widest">Categorias</h4>
              <div className="flex flex-wrap gap-2">
                {["Tecnologia", "Design", "Negócios", "IA"].map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors",
                      category === cat 
                        ? "border-red-700 cms-primary" 
                        : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-widest">Tags</h4>
              <TagInput 
                tags={tags}
                onTagsChange={setTags}
                placeholder="Adicionar tag..."
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Messages */}
      <AnimatePresence>
        {saveStatus !== "idle" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "px-6 py-3 flex items-center gap-2 text-sm font-medium",
              saveStatus === "success" ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-900"
            )}
          >
            {saveStatus === "success" ? (
              <CheckCircle size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            {saveMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden flex-col md:flex-row">
        {/* Editor Pane */}
        <div className="flex-1 overflow-y-auto p-3 md:p-6 lg:p-12 bg-zinc-50">
          <div className="max-w-3xl mx-auto space-y-8">
            <AnimatePresence mode="wait">
              {activeTab === "edit" && (
                <motion.div 
                  key="edit"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  {/* Title Input */}
                  <div className="space-y-2 group">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 font-mono">Título do Artigo</label>
                      <button 
                        onClick={handleAiSuggest}
                        disabled={isAiGenerating}
                        className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 hover:text-zinc-900 transition-colors disabled:opacity-50"
                      >
                        <Sparkles size={12} className={isAiGenerating ? "animate-pulse" : ""} />
                        {isAiGenerating ? "A gerar..." : "Sugerir com IA"}
                      </button>
                    </div>
                    <input 
                      type="text" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Escreve um título impactante..."
                      className="w-full text-4xl font-bold bg-transparent border-none focus:ring-0 placeholder:text-zinc-200 text-zinc-900 p-0"
                    />
                  </div>

                  {/* Slug & Meta */}
                  <div className="flex flex-wrap gap-4 items-center text-xs text-zinc-400 border-y border-zinc-200 py-4">
                    <div className="flex items-center gap-1.5">
                      <LinkIcon size={14} />
                      <span>URL:</span>
                      <span className="text-zinc-600 font-mono">/blog/{slug}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ImageIcon size={14} />
                      <label className="text-zinc-600 hover:underline cursor-pointer flex items-center gap-1">
                        {uploading ? "Carregando..." : "Adicionar Imagem Destaque"}
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleImageUpload}
                          disabled={uploading}
                          hidden 
                        />
                      </label>
                    </div>
                    <label className="flex min-w-[240px] flex-1 items-center gap-2 text-zinc-600">
                      <LinkIcon size={14} />
                      <span className="sr-only">URL do vídeo</span>
                      <input
                        type="url"
                        value={mediaUrl}
                        onChange={(event) => setMediaUrl(event.target.value)}
                        placeholder="URL HTTPS do vídeo (YouTube, Vimeo ou MP4)"
                        aria-label="URL HTTPS do vídeo"
                        className="w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-zinc-500"
                      />
                    </label>
                    <div className="flex items-center gap-1.5">
                      <SettingsIcon size={14} />
                      <select 
                        value={status}
                        onChange={(e) => setStatus(e.target.value as "draft" | "published")}
                        title="Muda o estado do artigo"
                        className="bg-transparent border-none p-0 focus:ring-0 text-zinc-600 cursor-pointer"
                      >
                        <option value="draft">Rascunho</option>
                        <option value="published">Publicado</option>
                      </select>
                    </div>
                  </div>

                  {/* Content Editor */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 font-mono block mb-3">Conteúdo do Artigo</label>
                    <label className="mb-3 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 hover:border-zinc-400">
                      <ImageIcon size={15} /> Inserir imagem no artigo
                      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleInlineImageUpload} disabled={uploading} hidden />
                    </label>
                    <RichTextEditor 
                      content={content}
                      onChange={setContent}
                      placeholder="Escreve aqui o conteúdo do artigo..."
                    />
                  </div>
                </motion.div>
              )}

              {activeTab === "preview" && (
                <motion.div 
                  key="preview"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-3xl border border-zinc-200 shadow-2xl overflow-hidden max-w-2xl mx-auto"
                >
                  <div className="aspect-video bg-zinc-100 flex items-center justify-center relative">
                    {coverImage?.trim() ? (
                      <img src={coverImage.trim()} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="Cover" />
                    ) : (
                      <ImageIcon size={48} className="text-zinc-300" />
                    )}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      Preview do Site
                    </div>
                  </div>
                  <div className="p-12 space-y-6">
                    <h1 className="text-4xl font-bold text-zinc-900 leading-tight">{title || "Sem Título"}</h1>
                    <div className="flex items-center gap-3 text-sm text-zinc-500">
                      <div className="w-8 h-8 rounded-full bg-zinc-100" />
                      <span>{user?.displayName || user?.email || "Autor"}</span>
                      <span>•</span>
                      <span>{new Date().toLocaleDateString("pt-PT", { year: "numeric", month: "long", day: "numeric" })}</span>
                    </div>
                    <div className="prose prose-zinc max-w-none">
                      <p className="text-zinc-600 leading-relaxed whitespace-pre-wrap">
                        {content || "O conteúdo aparecerá aqui..."}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "seo" && (
                <motion.div 
                  key="seo"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="max-w-xl mx-auto space-y-8"
                >
                  <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm space-y-6">
                    <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                      <Search size={18} />
                      Configurações SEO
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-500">Meta Title</label>
                        <input 
                          type="text" 
                          value={metaTitle}
                          onChange={(e) => setMetaTitle(e.target.value)}
                          className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-zinc-900/5 outline-none"
                          placeholder={title}
                        />
                        <p className="text-[10px] text-zinc-400">{metaTitle.length}/60 caracteres</p>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-500">Meta Description</label>
                        <textarea 
                          value={metaDescription}
                          onChange={(e) => setMetaDescription(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-zinc-900/5 outline-none resize-none"
                          placeholder="Breve resumo para os motores de busca..."
                        />
                        <p className="text-[10px] text-zinc-400">{metaDescription.length}/160 caracteres</p>
                      </div>
                    </div>

                    <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 space-y-2">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Google Preview</p>
                      <p className="text-blue-600 text-lg font-medium truncate">{metaTitle || title || "Título do Artigo"}</p>
                      <p className="text-emerald-700 text-xs truncate">https://cms.zolangola.com/blog/{slug}</p>
                      <p className="text-zinc-500 text-xs line-clamp-2">{metaDescription || "Escreve uma meta description para apareceres melhor nos resultados de pesquisa."}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar Settings (Contextual) */}
        <div className="hidden lg:block w-72 xl:w-80 border-l border-zinc-200 bg-white p-4 md:p-6 space-y-6 md:space-y-8 overflow-y-auto">
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-widest">Categorias</h4>
            <div className="flex flex-wrap gap-2">
              {["Tecnologia", "Design", "Negócios", "IA"].map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors",
                    category === cat 
                      ? "border-red-700 cms-primary" 
                      : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                  )}
                >
                  {cat}
                </button>
              ))}
              <button className="p-1.5 rounded-lg border border-zinc-200 text-zinc-400 hover:text-zinc-900" title="Adicionar nova categoria">
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-widest">Tags</h4>
            <TagInput 
              tags={tags}
              onTagsChange={setTags}
              placeholder="Adicionar tag..."
            />
          </div>

          <div className="p-4 bg-zinc-900 rounded-2xl text-white space-y-3">
            <div className="flex items-center gap-2 text-zinc-400">
              <Sparkles size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Dica de IA</span>
            </div>
            <p className="text-xs leading-relaxed opacity-80">
              O teu título está um pouco curto. Tenta adicionar palavras como "Guia", "Essencial" ou "2026" para aumentar o CTR.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
