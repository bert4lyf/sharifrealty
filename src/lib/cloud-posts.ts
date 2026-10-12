import { createClient } from "@supabase/supabase-js";
import type { BlogPost } from "./types";

const CLOUD_URL_KEY = "sharif.cloud.supabase_url";
const CLOUD_KEY_KEY = "sharif.cloud.supabase_key";

export function getActiveSupabaseCredentials(): { url: string; key: string } | null {
  if (typeof window !== "undefined") {
    const customUrl = window.localStorage.getItem(CLOUD_URL_KEY)?.trim();
    const customKey = window.localStorage.getItem(CLOUD_KEY_KEY)?.trim();
    if (customUrl && customKey) {
      return { url: customUrl, key: customKey };
    }
  }

  const envUrl = (
    import.meta.env["VITE_SUPABASE_URL"] ||
    (typeof process !== "undefined" ? process.env?.["SUPABASE_URL"] : undefined)
  )?.trim();
  const envKey = (
    import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
    (typeof process !== "undefined" ? process.env?.["SUPABASE_PUBLISHABLE_KEY"] : undefined)
  )?.trim();

  if (envUrl && envKey && !envUrl.includes("sduhclsehkpssroivzvn")) {
    return { url: envUrl, key: envKey };
  }

  return null;
}

export function saveActiveSupabaseCredentials(url: string, key: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(CLOUD_URL_KEY, url.trim());
    window.localStorage.setItem(CLOUD_KEY_KEY, key.trim());
    window.dispatchEvent(new CustomEvent("sharif_cloud_config_updated"));
  }
}

let cachedClient: any = null;
let lastClientKey = "";

export function getCloudClient() {
  const creds = getActiveSupabaseCredentials();
  if (!creds) return null;

  const keyFingerprint = `${creds.url}_${creds.key}`;
  if (cachedClient && lastClientKey === keyFingerprint) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(creds.url, creds.key, {
      auth: { persistSession: false },
    });
    lastClientKey = keyFingerprint;
    return cachedClient;
  } catch (err) {
    console.warn("[CloudSync] Failed to initialize Supabase client:", err);
    return null;
  }
}

export async function checkCloudHealth(): Promise<{ ok: boolean; message: string }> {
  const client = getCloudClient();
  if (!client) {
    return {
      ok: false,
      message: "No active cloud database configured. Posts are currently stored locally on this device.",
    };
  }

  try {
    const { error } = await client.from("blog_posts").select("id").limit(1);
    if (error) {
      return {
        ok: false,
        message: `Database connected, but 'blog_posts' table error: ${error.message}`,
      };
    }
    return { ok: true, message: "Connected to live cloud database. Multi-device sync is ACTIVE." };
  } catch (err: any) {
    return { ok: false, message: `Connection failed: ${err?.message || "Network error"}` };
  }
}

export async function fetchLiveCloudBlogPosts(): Promise<BlogPost[] | null> {
  const client = getCloudClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) {
      console.warn("[CloudSync] Error fetching live posts:", error?.message);
      return null;
    }

    return data.map((row: any) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt,
      content: row.content,
      date: row.date,
      category: row.category,
      author: row.author,
      authorRole: row.author_role,
      readTime: row.read_time,
      coverImage: row.cover_image,
      galleryImages: row.gallery_images || [],
      propertySpecs: row.property_specs || undefined,
      tags: row.tags || [],
      status: row.status as "Published" | "Draft",
      comments: row.comments || 0,
      seoScore: row.seo_score || 90,
      views: row.views || 0,
      sourceUrl: row.source_url || undefined,
    }));
  } catch (err) {
    console.warn("[CloudSync] Network exception fetching live posts:", err);
    return null;
  }
}

export async function upsertLiveCloudBlogPost(post: BlogPost): Promise<{ success: boolean; error?: string }> {
  const client = getCloudClient();
  if (!client) {
    return { success: false, error: "Cloud database not configured" };
  }

  try {
    const row = {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content || "",
      date: post.date || new Date().toISOString().slice(0, 10),
      category: post.category || "General",
      author: post.author || "Majeed Sharif",
      author_role: post.authorRole || "Principal Broker",
      read_time: post.readTime || "4 min read",
      cover_image: post.coverImage,
      gallery_images: post.galleryImages || [],
      property_specs: post.propertySpecs || null,
      tags: post.tags || [],
      status: post.status || "Published",
      comments: post.comments || 0,
      seo_score: post.seoScore || 90,
      views: typeof post.views === "number" ? post.views : parseInt(String(post.views || "0"), 10) || 0,
      source_url: post.sourceUrl || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await client.from("blog_posts").upsert(row, { onConflict: "id" });
    if (error) {
      console.error("[CloudSync] Failed to upsert post:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("[CloudSync] Exception saving post to cloud:", err);
    return { success: false, error: err?.message || "Unknown error" };
  }
}

export async function deleteLiveCloudBlogPost(id: string): Promise<{ success: boolean; error?: string }> {
  const client = getCloudClient();
  if (!client) {
    return { success: false, error: "Cloud database not configured" };
  }

  try {
    const { error } = await client.from("blog_posts").delete().eq("id", id);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Unknown error" };
  }
}

export function subscribeToLiveCloudBlogPosts(onUpdate: () => void): () => void {
  const client = getCloudClient();
  if (!client) return () => {};

  try {
    const channel = client
      .channel("blog_posts_realtime_channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "blog_posts" },
        () => {
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  } catch (err) {
    console.warn("[CloudSync] Failed to subscribe to realtime changes:", err);
    return () => {};
  }
}
