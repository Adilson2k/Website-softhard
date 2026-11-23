import { useCallback, useEffect, useState } from "react";
import { apiRequest, getCmsRole, restoreUser, signInWithGoogle, signInWithPassword, signOut, subscribeAuth, type CmsRole, type CmsUser } from "./api";
import { uploadImage as uploadToBlob, type UploadResult } from "./blob-storage";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  coverImage: string;
  mediaUrl?: string;
  author: string;
  authorId: string;
  category?: string;
  tags: string[];
  status: "draft" | "published";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  seo?: { metaTitle: string; metaDescription: string };
}

interface UploadState {
  loading: boolean;
  progress: number;
  error: string | null;
  result: UploadResult | null;
}

export function useAuth() {
  const [user, setUser] = useState<CmsUser | null>(null);
  const [role, setRole] = useState<CmsRole>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sync = useCallback(async () => {
    setLoading(true);
    const current = await restoreUser();
    if (!current) {
      setUser(null);
      setRole(null);
      setLoading(false);
      return;
    }
    setUser(current);
    try {
      setRole(await getCmsRole());
    } catch {
      setRole(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeAuth(() => { void sync(); });
    void sync();
    return unsubscribe;
  }, [sync]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const current = await signInWithPassword(email, password);
      setUser(current);
      setRole(await getCmsRole());
      return current;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Não foi possível iniciar sessão.";
      setError(message);
      throw cause;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      const current = await signInWithGoogle();
      setUser(current);
      setRole(await getCmsRole());
      return current;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Não foi possível iniciar sessão com Google.";
      setError(message);
      throw cause;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    signOut();
    setUser(null);
    setRole(null);
  };

  const isAdmin = role === "admin";
  const canAccessCms = isAdmin || role === "editor";
  return { user, role, isAdmin, canAccessCms, loading, error, login, loginWithGoogle, logout };
}

export function useFileUpload() {
  const [state, setState] = useState<UploadState>({ loading: false, progress: 0, error: null, result: null });
  const upload = async (file: File, category: "blog" | "content" | "temp" = "blog") => {
    setState({ loading: true, progress: 25, error: null, result: null });
    try {
      const result = await uploadToBlob(file, category);
      setState({ loading: false, progress: 100, error: null, result });
      return result;
    } catch (cause) {
      const error = cause instanceof Error ? cause.message : "Falha no envio do ficheiro.";
      setState({ loading: false, progress: 0, error, result: null });
      throw cause;
    }
  };
  const reset = () => setState({ loading: false, progress: 0, error: null, result: null });
  return { ...state, upload, reset };
}

export function useBlogPosts(status?: "draft" | "published" | "all", user?: CmsUser | null, canAccessCms?: boolean) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!user || !canAccessCms) {
      setPosts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const query = status && status !== "all" ? `?status=${encodeURIComponent(status)}` : "";
    apiRequest<{ items: BlogPost[] }>(`/admin/posts${query}`)
      .then(({ items }) => { if (active) { setPosts(items); setError(null); } })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Falha ao carregar artigos."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [status, user, canAccessCms]);

  return { posts, loading, error };
}

export function useBlogPostById(postId: string | null) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(Boolean(postId));
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    if (!postId) { setPost(null); setLoading(false); setError(null); return; }
    setLoading(true);
    apiRequest<{ items: BlogPost[] }>("/admin/posts")
      .then(({ items }) => {
        if (!active) return;
        const found = items.find((item) => item.id === postId) ?? null;
        setPost(found);
        setError(found ? null : "Artigo não encontrado.");
      })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Falha ao carregar artigo."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [postId]);
  return { post, loading, error };
}

type PostInput = Omit<BlogPost, "id" | "author" | "authorId" | "createdAt" | "updatedAt" | "publishedAt"> & Partial<Pick<BlogPost, "publishedAt">>;

export function useCreateBlogPost(_user?: CmsUser | null, canAccessCms?: boolean) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const create = async (postData: PostInput) => {
    if (canAccessCms === false) throw new Error("Não tem permissão para criar artigos.");
    setLoading(true); setError(null);
    try {
      const post = await apiRequest<BlogPost>("/admin/posts", { method: "POST", body: JSON.stringify(postData) });
      return post.id;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Falha ao criar artigo.";
      setError(message); throw cause;
    } finally { setLoading(false); }
  };
  return { create, loading, error };
}

export function useUpdateBlogPost(_user?: CmsUser | null, canAccessCms?: boolean) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const update = async (postId: string, updates: Partial<PostInput>) => {
    if (canAccessCms === false) throw new Error("Não tem permissão para editar artigos.");
    setLoading(true); setError(null);
    try {
      await apiRequest<BlogPost>(`/admin/posts/${encodeURIComponent(postId)}`, { method: "PATCH", body: JSON.stringify(updates) });
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Falha ao actualizar artigo.";
      setError(message); throw cause;
    } finally { setLoading(false); }
  };
  return { update, loading, error };
}

export function useDeleteBlogPost() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const deletePost = async (postId: string) => {
    setLoading(true); setError(null);
    try {
      await apiRequest<void>(`/admin/posts/${encodeURIComponent(postId)}`, { method: "DELETE" });
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Falha ao eliminar artigo.";
      setError(message); throw cause;
    } finally { setLoading(false); }
  };
  return { deletePost, loading, error };
}

export function useRequireAuth() {
  const { user, loading } = useAuth();
  useEffect(() => {
    if (!loading && !user) window.location.href = "/login";
  }, [user, loading]);
  return { user, loading };
}
