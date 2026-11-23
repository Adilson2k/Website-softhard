export type CmsRole = "admin" | "editor" | null;

export interface CmsUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  getIdToken: () => Promise<string>;
}

interface Session {
  idToken: string;
  refreshToken: string;
  expiresAt: number;
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

const storageKey = "softhard.cms.session";
const apiBase = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");
const firebaseApiKey = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined;
type FirebaseAuth = import("firebase/auth").Auth;
let firebaseAuthPromise: Promise<FirebaseAuth | null> | null = null;
let activeSession: Session | null = null;
const authListeners = new Set<() => void>();

function notifyAuthChanged() {
  authListeners.forEach((listener) => listener());
}

async function getFirebaseAuth(): Promise<FirebaseAuth | null> {
  if (!firebaseApiKey) return null;
  if (!firebaseAuthPromise) {
    firebaseAuthPromise = (async () => {
      const [{ getApps, initializeApp }, { getAuth }] = await Promise.all([import("firebase/app"), import("firebase/auth")]);
      const app = getApps().find((item) => item.name === "softhard-cms") || initializeApp({
        apiKey: firebaseApiKey,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "softhard-57d83.firebaseapp.com",
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "softhard-57d83",
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      }, "softhard-cms");
      return getAuth(app);
    })();
  }
  return firebaseAuthPromise;
}

function saveSession(session: Session | null) {
  activeSession = session;
  if (typeof localStorage !== "undefined") {
    if (session) localStorage.setItem(storageKey, JSON.stringify(session));
    else localStorage.removeItem(storageKey);
  }
}

function loadSession(): Session | null {
  if (activeSession) return activeSession;
  if (typeof localStorage === "undefined") return null;
  try {
    const value = localStorage.getItem(storageKey);
    if (!value) return null;
    const parsed = JSON.parse(value) as Partial<Session>;
    if (typeof parsed.idToken !== "string" || typeof parsed.refreshToken !== "string" || typeof parsed.uid !== "string") return null;
    activeSession = parsed as Session;
    return activeSession;
  } catch {
    localStorage.removeItem(storageKey);
    return null;
  }
}

function userFromSession(session: Session): CmsUser {
  return {
    uid: session.uid,
    email: session.email,
    displayName: session.displayName,
    photoURL: session.photoURL,
    emailVerified: session.emailVerified,
    getIdToken,
  };
}

function authErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    INVALID_LOGIN_CREDENTIALS: "Email ou palavra-passe inválidos.",
    EMAIL_NOT_FOUND: "Esta conta não foi encontrada.",
    INVALID_PASSWORD: "Email ou palavra-passe inválidos.",
    USER_DISABLED: "Esta conta foi desactivada.",
    TOO_MANY_ATTEMPTS_TRY_LATER: "Muitas tentativas. Tente novamente mais tarde.",
    API_KEY_INVALID: "A configuração pública do Firebase Web está inválida.",
  };
  return messages[code] || "Não foi possível iniciar sessão. Verifique os dados e tente novamente.";
}

async function refreshSession(session: Session): Promise<Session> {
  if (!firebaseApiKey) throw new Error("Configure VITE_FIREBASE_API_KEY em apps/cms/.env.local.");
  const response = await fetch(`https://securetoken.googleapis.com/v1/token?key=${encodeURIComponent(firebaseApiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: session.refreshToken }),
  });
  const data = await response.json().catch(() => ({})) as Record<string, any>;
  if (!response.ok) {
    saveSession(null);
    throw new Error("A sessão expirou. Inicie sessão novamente.");
  }
  const next: Session = {
    ...session,
    idToken: data.id_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + Number(data.expires_in || 3600) * 1000,
  };
  saveSession(next);
  return next;
}

export async function getIdToken(): Promise<string> {
  let session = loadSession();
  if (!session) throw new Error("Inicie sessão para continuar.");
  if (session.expiresAt <= Date.now() + 60_000) session = await refreshSession(session);
  return session.idToken;
}

export async function restoreUser(): Promise<CmsUser | null> {
  const session = loadSession();
  if (!session) return null;
  try {
    await getIdToken();
    const current = loadSession();
    return current ? userFromSession(current) : null;
  } catch {
    saveSession(null);
    return null;
  }
}

export function subscribeAuth(listener: () => void) {
  authListeners.add(listener);
  return () => { authListeners.delete(listener); };
}

export async function signInWithPassword(email: string, password: string): Promise<CmsUser> {
  if (!firebaseApiKey) throw new Error("Configure VITE_FIREBASE_API_KEY em apps/cms/.env.local.");
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(firebaseApiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim(), password, returnSecureToken: true }),
  });
  const data = await response.json().catch(() => ({})) as Record<string, any>;
  if (!response.ok) {
    throw new Error(authErrorMessage(String(data.error?.message || "")));
  }
  const session: Session = {
    idToken: data.idToken,
    refreshToken: data.refreshToken,
    expiresAt: Date.now() + Number(data.expiresIn || 3600) * 1000,
    uid: data.localId,
    email: data.email || null,
    displayName: data.displayName || null,
    photoURL: data.photoUrl || null,
    emailVerified: data.emailVerified === true,
  };
  saveSession(session);
  notifyAuthChanged();
  return userFromSession(session);
}

export async function signInWithGoogle(): Promise<CmsUser> {
  const firebaseAuth = await getFirebaseAuth();
  if (!firebaseAuth) throw new Error("Configure VITE_FIREBASE_API_KEY em apps/cms/.env.local.");
  const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  try {
    const credential = await signInWithPopup(firebaseAuth, provider);
    const user = credential.user;
    const [idToken, tokenInfo] = await Promise.all([user.getIdToken(), user.getIdTokenResult()]);
    const session: Session = {
      idToken,
      refreshToken: user.refreshToken,
      expiresAt: Date.parse(tokenInfo.expirationTime),
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
    };
    saveSession(session);
    notifyAuthChanged();
    return userFromSession(session);
  } catch (cause) {
    const code = cause && typeof cause === "object" && "code" in cause ? String(cause.code) : "";
    const messages: Record<string, string> = {
      "auth/popup-closed-by-user": "A janela de autenticação foi fechada antes de concluir.",
      "auth/cancelled-popup-request": "Já existe uma autenticação Google em curso.",
      "auth/popup-blocked": "O navegador bloqueou a janela de autenticação. Permita pop-ups e tente novamente.",
      "auth/unauthorized-domain": "Este domínio ainda não está autorizado no Firebase Authentication.",
      "auth/operation-not-allowed": "O acesso com Google não está activo no Firebase Authentication.",
      "auth/network-request-failed": "Falha de rede ao contactar o Firebase. Tente novamente.",
    };
    throw new Error(messages[code] || "Não foi possível entrar com Google. Verifique a configuração do Firebase e tente novamente.");
  }
}

export function signOut() {
  if (firebaseAuthPromise) {
    void firebaseAuthPromise.then(async (auth) => {
      if (auth) await (await import("firebase/auth")).signOut(auth);
    }).catch(() => undefined);
  }
  saveSession(null);
  notifyAuthChanged();
}

export async function apiRequest<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (loadSession()) headers.set("Authorization", `Bearer ${await getIdToken()}`);
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const response = await fetch(`${apiBase}${path.startsWith("/") ? path : `/${path}`}`, { ...init, headers });
  if (response.status === 204) return undefined as T;
  const payload = await response.json().catch(() => ({})) as Record<string, any>;
  if (!response.ok) throw new Error(typeof payload.message === "string" ? payload.message : "A API não conseguiu concluir a operação.");
  return payload as T;
}

export async function getCmsRole(): Promise<CmsRole> {
  const result = await apiRequest<{ role: CmsRole }>("/auth/me");
  return result.role;
}
