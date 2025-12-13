/**
 * components/connections/connections.ts
 *
 * Un archivo central para describir los posibles conectores externos
 * que la aplicación puede usar (Facebook, WhatsApp, Instagram, Google,
 * n8n, Make, Publer, etc.).
 *
 * Contiene:
 * - Tipos TS para las conexiones
 * - Definiciones de servicios (metadatos)
 * - Helpers mínimos para generar URLs de autenticación y persistir
 *   credenciales/config en `localStorage` como placeholder.
 *
 * Nota: esto es un punto de partida. Para integraciones reales hay que
 * implementar el flujo OAuth en servidor, gestionar secrets y seguridad.
 */

export type ConnectorId =
  | "facebook"
  | "whatsapp"
  | "instagram"
  | "google_maps"
  | "google_calendar"
  | "gmail"
  | "publer"
  | "n8n"
  | "make"
  | "other";

export type ConnectionStatus = "connected" | "disconnected" | "error";

export type ConnectionConfig = {
  id: string; // local id
  connector: ConnectorId;
  label?: string;
  // provider-specific data (tokens, client ids, etc.)
  data?: Record<string, any>;
  status?: ConnectionStatus;
  updatedAt?: string; // ISO
};

export type ConnectorDefinition = {
  id: ConnectorId;
  name: string;
  description?: string;
  oauth?: boolean; // si usa OAuth
  authUrl?: (opts?: { redirectUri?: string; scope?: string }) => string | null;
  docsUrl?: string | null;
};

const makeId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;

// Key para almacenamiento local (placeholder)
const STORAGE_KEY = "plicometria_connections_v1";

export const CONNECTORS: ConnectorDefinition[] = [
  {
    id: "facebook",
    name: "Facebook",
    description: "Conectar con Facebook / Pages (API Graph)",
    oauth: true,
    authUrl: (opts: { redirectUri?: string; scope?: string } = {}) => {
      const { redirectUri } = opts;
      // Nota: reemplazar CLIENT_ID y scopes reales cuando se implemente
      const clientId = process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID ?? "YOUR_FACEBOOK_CLIENT_ID";
      const scope = encodeURIComponent("pages_show_list,pages_manage_posts");
      const redirect = encodeURIComponent(redirectUri ?? "http://localhost:3000/api/auth/facebook/callback");
      return `https://www.facebook.com/v15.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirect}&scope=${scope}&response_type=code`;
    },
    docsUrl: "https://developers.facebook.com/docs/",
  },

  {
    id: "whatsapp",
    name: "WhatsApp (Business API)",
    description: "WhatsApp Business — requiere Business account y token",
    oauth: false,
    authUrl: undefined,
    docsUrl: "https://developers.facebook.com/docs/whatsapp",
  },

  {
    id: "instagram",
    name: "Instagram",
    description: "Instagram Basic / Graph API",
    oauth: true,
    authUrl: (opts: { redirectUri?: string; scope?: string } = {}) => {
      const { redirectUri } = opts;
      const clientId = process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID ?? "YOUR_INSTAGRAM_CLIENT_ID";
      const redirect = encodeURIComponent(redirectUri ?? "http://localhost:3000/api/auth/instagram/callback");
      const scope = encodeURIComponent("user_profile,user_media");
      return `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirect}&scope=${scope}&response_type=code`;
    },
    docsUrl: "https://developers.facebook.com/docs/instagram",
  },

  {
    id: "google_maps",
    name: "Google Maps",
    description: "API de Google Maps (clave API)",
    oauth: false,
    authUrl: undefined,
    docsUrl: "https://developers.google.com/maps",
  },

  {
    id: "google_calendar",
    name: "Google Calendar",
    description: "Google Calendar (OAuth2)",
    oauth: true,
    authUrl: (opts: { redirectUri?: string; scope?: string } = {}) => {
      const { redirectUri, scope } = opts;
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "YOUR_GOOGLE_CLIENT_ID";
      const redirect = encodeURIComponent(redirectUri ?? "http://localhost:3000/api/auth/google/callback");
      const s = encodeURIComponent(scope ?? "https://www.googleapis.com/auth/calendar.events");
      return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirect}&response_type=code&scope=${s}&access_type=offline&prompt=consent`;
    },
    docsUrl: "https://developers.google.com/calendar",
  },

  {
    id: "gmail",
    name: "Gmail / Google Mail",
    description: "Gmail API (leer/enviar correos) — OAuth2",
    oauth: true,
    authUrl: (opts: { redirectUri?: string; scope?: string } = {}) => {
      const { redirectUri } = opts;
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "YOUR_GOOGLE_CLIENT_ID";
      const redirect = encodeURIComponent(redirectUri ?? "http://localhost:3000/api/auth/google/callback");
      const scope = encodeURIComponent("https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send");
      return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirect}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
    },
    docsUrl: "https://developers.google.com/gmail/api",
  },

  {
    id: "publer",
    name: "Publer",
    description: "Herramienta de programación de publicaciones (API)",
    oauth: false,
    authUrl: undefined,
    docsUrl: "https://publer.io/",
  },

  {
    id: "n8n",
    name: "n8n",
    description: "n8n — plataforma de automatización (webhook / API)",
    oauth: false,
    authUrl: undefined,
    docsUrl: "https://docs.n8n.io/",
  },

  {
    id: "make",
    name: "Make (Integromat)",
    description: "Make (antes Integromat) — webhooks / OAuth",
    oauth: true,
    authUrl: (opts: { redirectUri?: string; scope?: string } = {}) => {
      const { redirectUri } = opts;
      // Placeholder — Make supports OAuth for some apps; actual flow depends on use
      return null;
    },
    docsUrl: "https://www.make.com/en/help",
  },
];

// Helpers para persistencia y manejo local (solo placeholders)
export function listSavedConnections(): ConnectionConfig[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return [];
    return JSON.parse(raw) as ConnectionConfig[];
  } catch (e) {
    console.warn('listSavedConnections failed', e);
    return [];
  }
}

export function saveConnection(cfg: ConnectionConfig) {
  try {
    const existing = listSavedConnections();
    const next = [cfg, ...existing.filter((c) => c.id !== cfg.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return true;
  } catch (e) {
    console.warn('saveConnection failed', e);
    return false;
  }
}

export function createEmptyConnection(connector: ConnectorId, label?: string): ConnectionConfig {
  return {
    id: makeId(),
    connector,
    label: label ?? connector,
    data: {},
    status: 'disconnected',
    updatedAt: new Date().toISOString(),
  };
}

export function getConnectorDefinition(id: ConnectorId): ConnectorDefinition | undefined {
  return CONNECTORS.find((c) => c.id === id);
}

export default {
  CONNECTORS,
  listSavedConnections,
  saveConnection,
  createEmptyConnection,
  getConnectorDefinition,
};
