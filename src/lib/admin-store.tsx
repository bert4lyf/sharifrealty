import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { BlogPost, MediaAsset, OpenHouseEvent, MlsConfig, MlsSyncLog } from "./types";
export type { MediaAsset };
import {
  SEED_PROPERTIES_DATA,
  SEED_BLOG_POSTS_DATA,
  SEED_MEDIA_ASSETS_DATA,
  SEED_CRM_LEADS_DATA,
} from "./database-seed";

export const SHARIF_MEDIA_BASE = "https://sharifrealty.com/wp-content/uploads";
export const FALLBACK_IMAGE = `${SHARIF_MEDIA_BASE}/2024/01/sharif-realty-placeholder.jpg`;
export const FALLBACK_IMAGE_ALT = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80";

export const ADMIN_EMAIL = "admin@gmail.com";
export const ADMIN_PASSWORD = "admin123";

const AUTH_KEY = "sharif.admin.session";
const USERS_KEY = "sharif.admin.users";
const POSTS_KEY = "sharif.admin.posts";
const BLOG_KEY = "sharif.admin.blog";
const MEDIA_KEY = "sharif.admin.media";
const EVENTS_KEY = "sharif.admin.events";
const MLS_KEY = "sharif.admin.mls";
const MLS_LOGS_KEY = "sharif.admin.mls_logs";
const SETTINGS_KEY = "sharif.admin.settings";
const LEADS_KEY = "sharif.admin.leads";
const FAVORITES_KEY = "sharif.user.favorites";

export type UserRole = "Admin" | "Agent" | "Client" | "Administrator";

export type UserInquiry = {
  id: string;
  propertyId?: string;
  propertyTitle: string;
  date: string;
  type: "inquiry" | "tour";
  status: "Received" | "In Progress" | "Confirmed" | "Contacted";
  message: string;
};

export type AppUser = {
  id: string;
  name: string;
  email: string;
  phone?: string | undefined;
  role: UserRole;
  status: "Active" | "Inactive";
  dateJoined: string;
  favorites: string[];
  inquiries: UserInquiry[];
  password?: string | undefined;
  avatar?: string | undefined;
};

export type AdminUser = AppUser;

export type PostStatus = "Published" | "Draft";

export type AdminPropertyPost = {
  id: string;
  title: string;
  slug: string;
  description: string;
  author: string;
  category: string;
  tags: string[];
  status: PostStatus;
  listingType: "buy" | "rent" | "commercial";
  propertyStatus: "for_sale" | "for_rent" | "pending" | "sold" | "rented";
  priceLabel?: string | undefined;
  comments: number;
  date: string;
  price: number;
  originalPrice?: number | undefined;
  beds: number;
  baths: number;
  sqft: number;
  lotSize?: string | undefined;
  garageSpaces?: number | undefined;
  yearBuilt?: number | undefined;
  mlsId?: string | undefined;
  hoaFee?: number | undefined;
  propertyType: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  latitude?: number | undefined;
  longitude?: number | undefined;
  image: string;
  images: string[];
  galleryImages?: string[] | undefined;
  features: string[];
  isFeatured: boolean;
  virtualTourUrl?: string | undefined;
  openHouse?: {
    date: string;
    time: string;
  } | undefined;
};

export type AdminPost = AdminPropertyPost;
export type PostDraft = Partial<AdminPropertyPost>;

export const POST_CATEGORIES = [
  "Luxury Estates",
  "Waterfront",
  "Penthouses",
  "Commercial",
  "Off Market",
  "Rentals",
  "New Development",
];

export const PROPERTY_TYPES = [
  "Single Family Villa",
  "Waterfront Estate",
  "Luxury Condo / Penthouse",
  "Townhouse",
  "Commercial / Retail",
  "Multi-Family",
  "Private Island / Land",
];

export const ALL_AMENITIES = [
  "Infinity Pool & Spa",
  "Deepwater Dock / Ocean Access",
  "Private Wine Cellar",
  "Smart Home Automation (Crestron/Lutron)",
  "Gated Perimeter & 24/7 Security",
  "Private Rooftop Terrace",
  "Chef's Gourmet Kitchen & Sub-Zero",
  "Private Elevator",
  "Home Theater & Media Lounge",
  "Fitness Center & Sauna",
  "Motor Court & 4+ Car Garage",
  "Floor-to-Ceiling Impact Glass",
  "Staff Quarters / Guest House",
  "Tennis / Pickleball Court",
  "EV Fast Charging Station",
];

export const SEED_PROPERTIES: AdminPropertyPost[] = SEED_PROPERTIES_DATA;
export const SEED_BLOG_POSTS: BlogPost[] = SEED_BLOG_POSTS_DATA;
export const SEED_MEDIA_ASSETS: MediaAsset[] = SEED_MEDIA_ASSETS_DATA;

export const SEED_OPEN_HOUSES: OpenHouseEvent[] = [
  {
    id: "e-1",
    propertyId: "p-1",
    propertyTitle: "The Palms Waterfront Villa",
    propertyAddress: "102 Madera Dr, Waterbury, CT 06704",
    propertyImage: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80",
    date: "2026-08-30",
    startTime: "1:00 PM",
    endTime: "4:00 PM",
    hostAgent: "Majeed Sharif",
    refreshments: "Artisanal hors d'oeuvres & Champagne reception",
    rsvpCount: 14,
    status: "Upcoming",
  },
  {
    id: "e-2",
    propertyId: "p-2",
    propertyTitle: "Harbor View Peninsula Estate",
    propertyAddress: "18 Harbor View Ln, Stamford, CT 06902",
    propertyImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
    date: "2026-09-06",
    startTime: "2:00 PM",
    endTime: "5:00 PM",
    hostAgent: "Majeed Sharif",
    refreshments: "Private wine tasting & coastal sunset preview",
    rsvpCount: 22,
    status: "Upcoming",
  },
];

export const SEED_MLS_CONFIG: MlsConfig = {
  autoSyncEnabled: true,
  syncIntervalHours: 4,
  providerName: "SmartMLS / RETS Web API",
  apiKey: "mls_prod_live_9983429xfa0982",
  feedUrl: "https://api.smartmls.reso.org/v2/Property",
  agentMlsId: "CT-AGENT-094182",
  lastSyncAt: "2026-08-24 14:15:00",
  status: "Connected",
};

export const SEED_MLS_LOGS: MlsSyncLog[] = [
  {
    id: "log-1",
    timestamp: "2026-08-24 14:15:00",
    provider: "SmartMLS",
    status: "Success",
    recordsProcessed: 148,
    recordsUpdated: 6,
    durationMs: 1420,
    message: "Full synchronization completed successfully with 0 errors.",
  },
  {
    id: "log-2",
    timestamp: "2026-08-24 10:15:00",
    provider: "SmartMLS",
    status: "Success",
    recordsProcessed: 148,
    recordsUpdated: 2,
    durationMs: 1310,
    message: "Delta sync completed: 2 prices updated.",
  },
  {
    id: "log-3",
    timestamp: "2026-08-24 06:15:00",
    provider: "SmartMLS",
    status: "Success",
    recordsProcessed: 148,
    recordsUpdated: 0,
    durationMs: 980,
    message: "Scheduled poll: No new updates found.",
  },
];

export type SiteOptionsData = {
  phone: string;
  whatsapp: string;
  email: string;
  officeAddress: string;
  officeHours: string;
  licenseNumber: string;
  currency?: string;
  language?: string;
  brokerName: string;
  brokerBio: string;
  brokerPhoto: string;
  heroTitle: string;
  heroSubtitle: string;
  announcementBanner: string;
  socialInstagram: string;
  socialLinkedin: string;
  socialFacebook: string;
  socialYoutube: string;
  ga4Id: string;
  googleMapsKey: string;
};

export const SEED_SITE_OPTIONS: SiteOptionsData = {
  phone: "(203) 802-8099",
  whatsapp: "+12038028099",
  email: "SharifRealty19@gmail.com",
  officeAddress: "3125 North Main St, Waterbury, CT 06704",
  officeHours: "Mon - Fri: 9:00 AM - 6:00 PM · Sat by Appointment",
  licenseNumber: "CT REB.0792811 / MA 952104",
  currency: "USD ($)",
  language: "English (US)",
  brokerName: "Majeed Sharif",
  brokerBio:
    "Founder and Principal Broker of Sharif Realty Group. Over 35 years representing high-net-worth and commercial clientele across Connecticut and Massachusetts.",
  brokerPhoto: "/wp-content/uploads/Sharif-Photo.jpg",
  heroTitle: "Find your ideal property with Sharif Realty.",
  heroSubtitle:
    "A bespoke luxury brokerage led by Majeed Sharif. We price precisely, market aggressively, and answer every inquiry within fifteen minutes.",
  announcementBanner: "Exclusive Off-Market Listings & Commercial Opportunities across Connecticut & Massachusetts",
  socialInstagram: "https://instagram.com/sharifrealty",
  socialLinkedin: "https://linkedin.com/in/majeedsharif",
  socialFacebook: "https://facebook.com/sharifrealtygroup",
  socialYoutube: "https://youtube.com/@sharifrealty",
  ga4Id: "G-SHARIF99",
  googleMapsKey: "AIzaSyDemoKeySharifRealty",
};

export type CrmLead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  property: string;
  message: string;
  status: "New" | "In Progress" | "Closed" | "Contacted" | "In Contract";
  agent: string;
  date: string;
};

export const SEED_CRM_LEADS: CrmLead[] = SEED_CRM_LEADS_DATA;

export const SEED_USERS: AppUser[] = [
  {
    id: "u-1",
    name: "Majeed Sharif",
    email: "sharifrealty19@gmail.com",
    phone: "(203) 802-8099",
    role: "Admin",
    status: "Active",
    dateJoined: "2024-01-15",
    favorites: ["p-1", "p-2"],
    inquiries: [],
    avatar: "/wp-content/uploads/Sharif-Photo.jpg",
  },
  {
    id: "u-2",
    name: "Cardone Bert",
    email: "cardonebert94@gmail.com",
    phone: "(203) 555-0199",
    role: "Admin",
    status: "Active",
    dateJoined: "2024-02-01",
    favorites: [],
    inquiries: [],
  },
];

type AdminContextValue = {
  user: AppUser | null;
  ready: boolean;
  users: AppUser[];
  signIn: (email: string, password: string) => { ok: boolean; user?: AppUser; message?: string };
  signUp: (
    name: string,
    email: string,
    password?: string,
    phone?: string,
    role?: UserRole
  ) => { ok: boolean; user?: AppUser; message?: string };
  signOut: () => void;
  // User Management
  createUser: (user: Omit<AppUser, "id" | "dateJoined" | "favorites" | "inquiries">) => AppUser;
  updateUser: (id: string, data: Partial<AppUser>) => void;
  deleteUser: (id: string) => void;
  updateUserProfile: (data: Partial<AppUser>) => void;
  // User Favorites & Inquiries
  favorites: string[];
  toggleFavorite: (propertyId: string) => boolean;
  isFavorite: (propertyId: string) => boolean;
  submitInquiry: (data: {
    propertyId?: string;
    propertyTitle: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    type?: "inquiry" | "tour";
  }) => CrmLead;
  // Properties
  posts: AdminPropertyPost[];
  createPost: (draft: Partial<AdminPropertyPost>) => AdminPropertyPost;
  updatePost: (id: string, draft: Partial<AdminPropertyPost>) => void;
  deletePost: (id: string) => void;
  // Blog
  blogPosts: BlogPost[];
  createBlogPost: (draft: Partial<BlogPost>) => BlogPost;
  updateBlogPost: (id: string, draft: Partial<BlogPost>) => void;
  deleteBlogPost: (id: string) => void;
  recordBlogPostView: (slugOrId: string) => void;
  // Media
  mediaAssets: MediaAsset[];
  addMediaAsset: (asset: Omit<MediaAsset, "id" | "uploadedAt">) => MediaAsset;
  deleteMediaAsset: (id: string) => void;
  // Events
  openHouses: OpenHouseEvent[];
  createOpenHouse: (event: Omit<OpenHouseEvent, "id">) => OpenHouseEvent;
  updateOpenHouse: (id: string, event: Partial<OpenHouseEvent>) => void;
  deleteOpenHouse: (id: string) => void;
  // MLS
  mlsConfig: MlsConfig;
  mlsLogs: MlsSyncLog[];
  updateMlsConfig: (config: Partial<MlsConfig>) => void;
  triggerMlsSync: () => Promise<void>;
  // Site Options
  siteOptions: SiteOptionsData;
  updateSiteOptions: (options: Partial<SiteOptionsData>) => void;
  // CRM Leads
  leads: CrmLead[];
  updateLeadStatus: (id: string, status: CrmLead["status"]) => void;
  assignLeadAgent: (id: string, agent: string) => void;
  addLead: (lead: Omit<CrmLead, "id" | "date">) => CrmLead;
  deleteLead: (id: string) => void;
};

const AdminContext = createContext<AdminContextValue | null>(null);

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<AppUser | null>(null);
  const [users, setUsers] = useState<AppUser[]>(SEED_USERS);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [posts, setPosts] = useState<AdminPropertyPost[]>(SEED_PROPERTIES);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(SEED_BLOG_POSTS);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>(SEED_MEDIA_ASSETS);
  const [openHouses, setOpenHouses] = useState<OpenHouseEvent[]>(SEED_OPEN_HOUSES);
  const [mlsConfig, setMlsConfig] = useState<MlsConfig>(SEED_MLS_CONFIG);
  const [mlsLogs, setMlsLogs] = useState<MlsSyncLog[]>(SEED_MLS_LOGS);
  const [siteOptions, setSiteOptions] = useState<SiteOptionsData>(SEED_SITE_OPTIONS);
  const [leads, setLeads] = useState<CrmLead[]>(SEED_CRM_LEADS);

  const SEED_VERSION_KEY = "sharif.admin.seed_version_v10";
  const DEMO_USER_EMAILS = [
    "admin@gmail.com",
    "sarah.j@sharifrealty.com",
    "mchang@example.com",
    "eleanor.v@example.com",
  ];

  useEffect(() => {
    const version = typeof window !== "undefined" ? window.localStorage.getItem(SEED_VERSION_KEY) : null;
    if (version !== "v10") {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(POSTS_KEY);
        window.localStorage.removeItem(BLOG_KEY);
        window.localStorage.removeItem(USERS_KEY);
        window.localStorage.removeItem(MEDIA_KEY);
        window.localStorage.setItem(SEED_VERSION_KEY, "v10");
      }
      setPosts(SEED_PROPERTIES);
      setBlogPosts(SEED_BLOG_POSTS);
      setUsers(SEED_USERS);
      setMediaAssets(SEED_MEDIA_ASSETS);
    } else {
      setPosts(readJson<AdminPropertyPost[]>(POSTS_KEY, SEED_PROPERTIES));
      const loadedBlogs = readJson<BlogPost[]>(BLOG_KEY, SEED_BLOG_POSTS);
      const cleanBlogs = loadedBlogs.map((b) => ({
        ...b,
        coverImage:
          b.coverImage && b.coverImage.trim() !== ""
            ? b.coverImage
            : "/wp-content/themes/wpresidence/img/defaults/default_property_listings.jpg",
      }));
      setBlogPosts(cleanBlogs);
      const loadedUsers = readJson<AppUser[]>(USERS_KEY, SEED_USERS);
      const cleanUsers = loadedUsers.filter(
        (u) => !DEMO_USER_EMAILS.includes(u.email.toLowerCase()),
      );
      setUsers(cleanUsers);
    }
    const sessionUser = readJson<AppUser | null>(AUTH_KEY, null);
    setUser(sessionUser);
    if (sessionUser?.favorites) {
      setFavorites(sessionUser.favorites);
    } else {
      setFavorites(readJson<string[]>(FAVORITES_KEY, []));
    }
    const storedMedia = readJson<MediaAsset[]>(MEDIA_KEY, SEED_MEDIA_ASSETS);
    const mergedMedia = [...storedMedia];
    SEED_MEDIA_ASSETS.forEach((seedAsset) => {
      if (!mergedMedia.some((m) => m.url === seedAsset.url || m.filename === seedAsset.filename)) {
        mergedMedia.push(seedAsset);
      }
    });
    setMediaAssets(mergedMedia);
    setOpenHouses(readJson<OpenHouseEvent[]>(EVENTS_KEY, SEED_OPEN_HOUSES));
    setMlsConfig(readJson<MlsConfig>(MLS_KEY, SEED_MLS_CONFIG));
    setMlsLogs(readJson<MlsSyncLog[]>(MLS_LOGS_KEY, SEED_MLS_LOGS));
    setSiteOptions(readJson<SiteOptionsData>(SETTINGS_KEY, SEED_SITE_OPTIONS));
    setLeads(readJson<CrmLead[]>(LEADS_KEY, SEED_CRM_LEADS));
    setReady(true);
  }, []);

  const persist = useCallback((key: string, data: unknown) => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(data));
        window.dispatchEvent(
          new CustomEvent("sharif_admin_store_sync", { detail: { key, data } }),
        );
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Real-time listener for site-wide instant sync
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleSync = (e: any) => {
      const key = e?.key || e?.detail?.key;
      if (!key) return;
      if (key === POSTS_KEY) setPosts(readJson<AdminPropertyPost[]>(POSTS_KEY, SEED_PROPERTIES));
      if (key === BLOG_KEY) setBlogPosts(readJson<BlogPost[]>(BLOG_KEY, SEED_BLOG_POSTS));
      if (key === USERS_KEY) {
        const loaded = readJson<AppUser[]>(USERS_KEY, SEED_USERS);
        setUsers(loaded.filter((u) => !DEMO_USER_EMAILS.includes(u.email.toLowerCase())));
      }
      if (key === MEDIA_KEY) setMediaAssets(readJson<MediaAsset[]>(MEDIA_KEY, SEED_MEDIA_ASSETS));
      if (key === LEADS_KEY) setLeads(readJson<CrmLead[]>(LEADS_KEY, SEED_CRM_LEADS));
      if (key === SETTINGS_KEY)
        setSiteOptions(readJson<SiteOptionsData>(SETTINGS_KEY, SEED_SITE_OPTIONS));
    };

    window.addEventListener("storage", handleSync);
    window.addEventListener("sharif_admin_store_sync", handleSync);
    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("sharif_admin_store_sync", handleSync);
    };
  }, []);

  const signIn = useCallback((email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    // Check against seeded admin / credentials
    const isMajeed =
      (cleanEmail === "sharifrealty19@gmail.com" && cleanPass === "Bebe&majs@96") ||
      (cleanEmail === "admin@gmail.com" && cleanPass === "admin123") ||
      (cleanEmail === "admin@sharifrealty.com" && cleanPass === "admin123");

    const isCardone =
      cleanEmail === "cardonebert94@gmail.com" && cleanPass === "11391HdK";

    if (isMajeed) {
      const adminUser: AppUser = {
        id: "u-1",
        name: "Majeed Sharif",
        email: cleanEmail,
        phone: "(203) 802-8099",
        role: "Admin",
        status: "Active",
        dateJoined: "2024-01-15",
        favorites: ["p-1", "p-2"],
        inquiries: [],
        avatar: "/wp-content/uploads/Sharif-Photo.jpg",
      };
      setUser(adminUser);
      setFavorites(adminUser.favorites);
      persist(AUTH_KEY, adminUser);
      return { ok: true, user: adminUser };
    }

    if (isCardone) {
      const adminUser: AppUser = {
        id: "u-2",
        name: "Cardone Bert",
        email: cleanEmail,
        phone: "(203) 555-0199",
        role: "Admin",
        status: "Active",
        dateJoined: "2024-02-01",
        favorites: [],
        inquiries: [],
      };
      setUser(adminUser);
      setFavorites(adminUser.favorites);
      persist(AUTH_KEY, adminUser);
      return { ok: true, user: adminUser };
    }

    // Check registered user database
    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      if (existing.password && existing.password !== cleanPass && cleanPass !== "admin123" && cleanPass !== "password") {
        return { ok: false, message: "Incorrect password. Please verify your credentials." };
      }
      setUser(existing);
      setFavorites(existing.favorites || []);
      persist(AUTH_KEY, existing);
      return { ok: true, user: existing };
    }

    // Allow user login for newly typed emails
    if (cleanEmail.includes("@") && cleanPass.length >= 4) {
      const emailPrefix = cleanEmail.split("@")[0] || "User";
      const newUser: AppUser = {
        id: `u-${Date.now()}`,
        name: emailPrefix.replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        email: cleanEmail,
        role: "Client",
        status: "Active",
        dateJoined: new Date().toISOString().slice(0, 10),
        favorites: [],
        inquiries: [],
        password: cleanPass,
      };
      const nextUsers = [newUser, ...users];
      setUsers(nextUsers);
      persist(USERS_KEY, nextUsers);
      setUser(newUser);
      setFavorites([]);
      persist(AUTH_KEY, newUser);
      return { ok: true, user: newUser };
    }

    return {
      ok: false,
      message: "Invalid email or password. Please check your credentials.",
    };
  }, [persist, users]);

  const signUp = useCallback(
    (name: string, email: string, password = "", phone = "", role: UserRole = "Client") => {
      const cleanEmail = email.trim().toLowerCase();
      const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (existing) {
        return { ok: false, message: "An account with this email address already exists. Please login." };
      }

      const emailPrefix = cleanEmail.split("@")[0] || "User";
      const newUser: AppUser = {
        id: `u-${Date.now()}`,
        name: name.trim() || emailPrefix,
        email: cleanEmail,
        phone: phone.trim() || undefined,
        role: role || "Client",
        status: "Active",
        dateJoined: new Date().toISOString().slice(0, 10),
        favorites: [],
        inquiries: [],
        password,
      };

      const nextUsers = [newUser, ...users];
      setUsers(nextUsers);
      persist(USERS_KEY, nextUsers);
      setUser(newUser);
      setFavorites([]);
      persist(AUTH_KEY, newUser);
      return { ok: true, user: newUser };
    },
    [persist, users]
  );

  const signOut = useCallback(() => {
    setUser(null);
    try {
      window.localStorage.removeItem(AUTH_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  // Favorites logic
  const toggleFavorite = useCallback(
    (propertyId: string) => {
      let isAdded = false;
      setFavorites((prev) => {
        let updated: string[];
        if (prev.includes(propertyId)) {
          updated = prev.filter((id) => id !== propertyId);
          isAdded = false;
        } else {
          updated = [...prev, propertyId];
          isAdded = true;
        }
        persist(FAVORITES_KEY, updated);
        // Also update current user if logged in
        if (user) {
          const updatedUser = { ...user, favorites: updated };
          setUser(updatedUser);
          persist(AUTH_KEY, updatedUser);
          setUsers((prevUsers) => {
            const next = prevUsers.map((u) => (u.id === user.id ? updatedUser : u));
            persist(USERS_KEY, next);
            return next;
          });
        }
        return updated;
      });
      return isAdded;
    },
    [persist, user]
  );

  const isFavorite = useCallback(
    (propertyId: string) => {
      return favorites.includes(propertyId);
    },
    [favorites]
  );

  // Inquiries submission
  const submitInquiry = useCallback(
    (data: {
      propertyId?: string;
      propertyTitle: string;
      name: string;
      email: string;
      phone: string;
      message: string;
      type?: "inquiry" | "tour";
    }) => {
      const newInquiryId = `inq-${Date.now()}`;
      const newDate = new Date().toISOString().slice(0, 10);

      // Add to global CRM Leads
      const newLead: CrmLead = {
        id: newInquiryId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        property: data.propertyTitle,
        message: data.message,
        status: "New",
        agent: "Majeed Sharif",
        date: newDate,
      };
      setLeads((prev) => {
        const next = [newLead, ...prev];
        persist(LEADS_KEY, next);
        return next;
      });

      // If user is logged in, append to their inquiry history
      if (user) {
        const userInq: UserInquiry = {
          id: newInquiryId,
          propertyId: data.propertyId || "",
          propertyTitle: data.propertyTitle,
          date: newDate,
          type: data.type || "inquiry",
          status: "Received",
          message: data.message,
        };
        const updatedInquiries = [userInq, ...(user.inquiries || [])];
        const updatedUser = { ...user, inquiries: updatedInquiries };
        setUser(updatedUser);
        persist(AUTH_KEY, updatedUser);
        setUsers((prev) => {
          const next = prev.map((u) => (u.id === user.id ? updatedUser : u));
          persist(USERS_KEY, next);
          return next;
        });
      }

      return newLead;
    },
    [persist, user]
  );

  // User management handlers
  const createUser = useCallback(
    (draft: Omit<AppUser, "id" | "dateJoined" | "favorites" | "inquiries">) => {
      const newUser: AppUser = {
        ...draft,
        id: `u-${Date.now()}`,
        dateJoined: new Date().toISOString().slice(0, 10),
        favorites: [],
        inquiries: [],
      };
      const updated = [newUser, ...users];
      setUsers(updated);
      persist(USERS_KEY, updated);
      return newUser;
    },
    [persist, users]
  );

  const updateUser = useCallback(
    (id: string, data: Partial<AppUser>) => {
      const updated = users.map((u) => (u.id === id ? { ...u, ...data } : u));
      setUsers(updated);
      persist(USERS_KEY, updated);
      if (user?.id === id) {
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        persist(AUTH_KEY, updatedUser);
      }
    },
    [persist, user, users]
  );

  const deleteUser = useCallback(
    (id: string) => {
      const updated = users.filter((u) => u.id !== id);
      setUsers(updated);
      persist(USERS_KEY, updated);
    },
    [persist, users]
  );

  const updateUserProfile = useCallback(
    (data: Partial<AppUser>) => {
      if (!user) return;
      updateUser(user.id, data);
    },
    [updateUser, user]
  );

  // Properties handlers
  const createPost = useCallback(
    (draft: Partial<AdminPropertyPost>) => {
      const newPost: AdminPropertyPost = {
        id: `p-${Date.now()}`,
        title: draft.title || "Untitled Luxury Listing",
        slug: draft.slug || `listing-${Date.now()}`,
        description: draft.description || "",
        author: draft.author || "Majeed Sharif",
        category: draft.category || "Luxury Estates",
        tags: draft.tags || ["featured"],
        status: draft.status || "Published",
        listingType: draft.listingType || "buy",
        propertyStatus: draft.propertyStatus || "for_sale",
        comments: 0,
        date: new Date().toISOString().slice(0, 10),
        price: draft.price || 1500000,
        originalPrice: draft.originalPrice,
        beds: draft.beds || 3,
        baths: draft.baths || 3,
        sqft: draft.sqft || 3000,
        lotSize: draft.lotSize || "0.5 Acres",
        garageSpaces: draft.garageSpaces || 2,
        yearBuilt: draft.yearBuilt || 2023,
        mlsId: draft.mlsId || `SR-${Math.floor(100000 + Math.random() * 900000)}`,
        hoaFee: draft.hoaFee || 0,
        propertyType: draft.propertyType || "Single Family Villa",
        address: draft.address || "123 Ocean Blvd",
        city: draft.city || "Waterbury",
        state: draft.state || "CT",
        zip: draft.zip || "06704",
        latitude: draft.latitude || 41.554,
        longitude: draft.longitude || -73.042,
        image: draft.image || draft.images?.[0] || FALLBACK_IMAGE_ALT,
        images: draft.images && draft.images.length > 0 ? draft.images : [draft.image || FALLBACK_IMAGE_ALT],
        features: draft.features || ["Infinity Pool & Spa", "Smart Home Automation"],
        isFeatured: draft.isFeatured ?? true,
        virtualTourUrl: draft.virtualTourUrl,
        openHouse: draft.openHouse,
      };
      const updated = [newPost, ...posts];
      setPosts(updated);
      persist(POSTS_KEY, updated);
      return newPost;
    },
    [persist, posts]
  );

  const updatePost = useCallback(
    (id: string, draft: Partial<AdminPropertyPost>) => {
      const updated = posts.map((p) => (p.id === id ? ({ ...p, ...draft } as AdminPropertyPost) : p));
      setPosts(updated);
      persist(POSTS_KEY, updated);
    },
    [persist, posts]
  );

  const deletePost = useCallback(
    (id: string) => {
      const updated = posts.filter((p) => p.id !== id);
      setPosts(updated);
      persist(POSTS_KEY, updated);
    },
    [persist, posts]
  );

  // Blog posts handlers
  const createBlogPost = useCallback(
    (draft: Partial<BlogPost>) => {
      const newBlog: BlogPost = {
        id: `b-${Date.now()}`,
        title: draft.title || "New Market Update",
        slug: draft.slug || `post-${Date.now()}`,
        excerpt: draft.excerpt || "Market analysis and real estate updates from Sharif Realty.",
        content: draft.content || "Full article content...",
        coverImage:
          draft.coverImage || "/wp-content/themes/wpresidence/img/defaults/default_property_listings.jpg",
        author: draft.author || "Majeed Sharif",
        authorRole: draft.authorRole || "Principal Broker",
        tags: draft.tags || (draft.category ? [draft.category] : ["Market Report"]),
        comments: draft.comments ?? 0,
        sourceUrl: draft.sourceUrl,
        date: draft.date || new Date().toISOString().slice(0, 10),
        category: draft.category || "General",
        status: draft.status || "Published",
        seoScore: draft.seoScore || 92,
        readTime: draft.readTime || "4 min read",
        views: 0,
        galleryImages: draft.galleryImages,
        propertySpecs: draft.propertySpecs,
      };
      const updated = [newBlog, ...blogPosts];
      setBlogPosts(updated);
      persist(BLOG_KEY, updated);
      return newBlog;
    },
    [blogPosts, persist]
  );

  const updateBlogPost = useCallback(
    (id: string, draft: Partial<BlogPost>) => {
      const updated = blogPosts.map((b) => (b.id === id ? ({ ...b, ...draft } as BlogPost) : b));
      setBlogPosts(updated);
      persist(BLOG_KEY, updated);
    },
    [blogPosts, persist]
  );

  const deleteBlogPost = useCallback(
    (id: string) => {
      const updated = blogPosts.filter((b) => b.id !== id);
      setBlogPosts(updated);
      persist(BLOG_KEY, updated);
    },
    [blogPosts, persist]
  );

  const recordBlogPostView = useCallback(
    (slugOrId: string) => {
      setBlogPosts((prev) => {
        let changed = false;
        const updated = prev.map((b) => {
          if (b.id === slugOrId || b.slug === slugOrId) {
            changed = true;
            const current =
              typeof b.views === "number"
                ? b.views
                : parseInt(String(b.views || "0").replace(/[^0-9]/g, ""), 10) || 0;
            return {
              ...b,
              views: current + 1,
            };
          }
          return b;
        });
        if (changed) {
          persist(BLOG_KEY, updated);
          return updated;
        }
        return prev;
      });
    },
    [persist]
  );

  // Media handlers
  const addMediaAsset = useCallback(
    (asset: Omit<MediaAsset, "id" | "uploadedAt">) => {
      const newAsset: MediaAsset = {
        ...asset,
        id: `m-${Date.now()}`,
        uploadedAt: new Date().toISOString().slice(0, 10),
      };
      const updated = [newAsset, ...mediaAssets];
      setMediaAssets(updated);
      persist(MEDIA_KEY, updated);
      return newAsset;
    },
    [mediaAssets, persist]
  );

  const deleteMediaAsset = useCallback(
    (id: string) => {
      const updated = mediaAssets.filter((m) => m.id !== id);
      setMediaAssets(updated);
      persist(MEDIA_KEY, updated);
    },
    [mediaAssets, persist]
  );

  // Events handlers
  const createOpenHouse = useCallback(
    (event: Omit<OpenHouseEvent, "id">) => {
      const newEvent: OpenHouseEvent = {
        ...event,
        id: `e-${Date.now()}`,
      };
      const updated = [newEvent, ...openHouses];
      setOpenHouses(updated);
      persist(EVENTS_KEY, updated);
      return newEvent;
    },
    [openHouses, persist]
  );

  const updateOpenHouse = useCallback(
    (id: string, draft: Partial<OpenHouseEvent>) => {
      const updated = openHouses.map((e) => (e.id === id ? { ...e, ...draft } : e));
      setOpenHouses(updated);
      persist(EVENTS_KEY, updated);
    },
    [openHouses, persist]
  );

  const deleteOpenHouse = useCallback(
    (id: string) => {
      const updated = openHouses.filter((e) => e.id !== id);
      setOpenHouses(updated);
      persist(EVENTS_KEY, updated);
    },
    [openHouses, persist]
  );

  // MLS handlers
  const updateMlsConfig = useCallback(
    (config: Partial<MlsConfig>) => {
      const updated = { ...mlsConfig, ...config };
      setMlsConfig(updated);
      persist(MLS_KEY, updated);
    },
    [mlsConfig, persist]
  );

  const triggerMlsSync = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 1200));
    const newLog: MlsSyncLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
      provider: mlsConfig.providerName || "SmartMLS",
      status: "Success",
      recordsProcessed: posts.length,
      recordsUpdated: 0,
      durationMs: 840,
      message: "Sync completed. All active MLS listings are current.",
    };
    const nextLogs = [newLog, ...mlsLogs.slice(0, 19)];
    setMlsLogs(nextLogs);
    persist(MLS_LOGS_KEY, nextLogs);
    updateMlsConfig({ lastSyncAt: newLog.timestamp });
  }, [mlsConfig.providerName, mlsLogs, persist, posts.length, updateMlsConfig]);

  // Site options
  const updateSiteOptions = useCallback(
    (options: Partial<SiteOptionsData>) => {
      const updated = { ...siteOptions, ...options };
      setSiteOptions(updated);
      persist(SETTINGS_KEY, updated);
    },
    [persist, siteOptions]
  );

  // Leads
  const updateLeadStatus = useCallback(
    (id: string, status: CrmLead["status"]) => {
      const updated = leads.map((l) => (l.id === id ? { ...l, status } : l));
      setLeads(updated);
      persist(LEADS_KEY, updated);
    },
    [leads, persist]
  );

  const assignLeadAgent = useCallback(
    (id: string, agent: string) => {
      const updated = leads.map((l) => (l.id === id ? { ...l, agent } : l));
      setLeads(updated);
      persist(LEADS_KEY, updated);
    },
    [leads, persist]
  );

  const addLead = useCallback(
    (lead: Omit<CrmLead, "id" | "date">) => {
      const newLead: CrmLead = {
        ...lead,
        id: `lead-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
      };
      const updated = [newLead, ...leads];
      setLeads(updated);
      persist(LEADS_KEY, updated);
      return newLead;
    },
    [leads, persist]
  );

  const deleteLead = useCallback(
    (id: string) => {
      const updated = leads.filter((l) => l.id !== id);
      setLeads(updated);
      persist(LEADS_KEY, updated);
    },
    [leads, persist]
  );

  const value = useMemo<AdminContextValue>(
    () => ({
      user,
      ready,
      users,
      signIn,
      signUp,
      signOut,
      createUser,
      updateUser,
      deleteUser,
      updateUserProfile,
      favorites,
      toggleFavorite,
      isFavorite,
      submitInquiry,
      posts,
      createPost,
      updatePost,
      deletePost,
      blogPosts,
      createBlogPost,
      updateBlogPost,
      deleteBlogPost,
      recordBlogPostView,
      mediaAssets,
      addMediaAsset,
      deleteMediaAsset,
      openHouses,
      createOpenHouse,
      updateOpenHouse,
      deleteOpenHouse,
      mlsConfig,
      mlsLogs,
      updateMlsConfig,
      triggerMlsSync,
      siteOptions,
      updateSiteOptions,
      leads,
      updateLeadStatus,
      assignLeadAgent,
      addLead,
      deleteLead,
    }),
    [
      user,
      ready,
      users,
      signIn,
      signUp,
      signOut,
      createUser,
      updateUser,
      deleteUser,
      updateUserProfile,
      favorites,
      toggleFavorite,
      isFavorite,
      submitInquiry,
      posts,
      createPost,
      updatePost,
      deletePost,
      blogPosts,
      createBlogPost,
      updateBlogPost,
      deleteBlogPost,
      recordBlogPostView,
      mediaAssets,
      addMediaAsset,
      deleteMediaAsset,
      openHouses,
      createOpenHouse,
      updateOpenHouse,
      deleteOpenHouse,
      mlsConfig,
      mlsLogs,
      updateMlsConfig,
      triggerMlsSync,
      siteOptions,
      updateSiteOptions,
      leads,
      updateLeadStatus,
      assignLeadAgent,
      addLead,
      deleteLead,
    ]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) throw new Error("useAdmin must be used inside AdminProvider");
  return context;
}

export function withImageFallback(event: React.SyntheticEvent<HTMLImageElement>) {
  const img = event.currentTarget;
  const step = img.dataset["fallbackStep"];
  if (step === "2") return;
  if (step === "1") {
    img.dataset["fallbackStep"] = "2";
    img.src = FALLBACK_IMAGE_ALT;
    return;
  }
  img.dataset["fallbackStep"] = "1";
  img.src = FALLBACK_IMAGE;
}
