import type { Database } from "@/integrations/supabase/types";

export type Property = Database["public"]["Tables"]["properties"]["Row"] & {
  mls_id?: string | undefined;
  hoa_fee?: number | undefined;
  lot_size?: string | undefined;
  garage_spaces?: number | undefined;
  virtual_tour_url?: string | undefined;
  featured_tag?: string | undefined;
  open_house_date?: string | undefined;
  open_house_time?: string | undefined;
  category?: string | undefined;
  priceLabel?: string | undefined;
  propertyType?: string | undefined;
};

export type Lead = Database["public"]["Tables"]["leads"]["Row"];
export type Review = Database["public"]["Tables"]["reviews"]["Row"];
export type Faq = Database["public"]["Tables"]["faqs"]["Row"];
export type CaseStudy = Database["public"]["Tables"]["case_studies"]["Row"];
export type SiteSettings = Database["public"]["Tables"]["site_settings"]["Row"];
export type AppRole = Database["public"]["Enums"]["app_role"];
export type PropertyStatus = Database["public"]["Enums"]["property_status"];
export type ListingType = Database["public"]["Enums"]["listing_type"];
export type LeadStatus = Database["public"]["Enums"]["lead_status"];

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorRole: string;
  authorAvatar?: string | undefined;
  category: string;
  tags: string[];
  coverImage: string;
  galleryImages?: string[] | undefined;
  propertySpecs?: {
    address?: string | undefined;
    beds?: number | string | undefined;
    baths?: number | string | undefined;
    sqft?: number | string | undefined;
    lotSize?: string | undefined;
    propertyType?: string | undefined;
    yearBuilt?: number | string | undefined;
    lastSold?: string | undefined;
    pricePerSqft?: string | undefined;
    garage?: string | undefined;
  } | undefined;
  sourceUrl?: string | undefined;
  date: string;
  readTime: string;
  status: "Published" | "Draft";
  seoScore?: number | undefined;
  views?: number | string | undefined;
  comments: number;
};

export type MediaAsset = {
  id: string;
  url: string;
  title: string;
  filename: string;
  fileSize: string;
  dimensions: string;
  type: "image" | "document" | "floorplan" | "video";
  folder?: "all" | "properties" | "blog" | "marketing" | "agents";
  uploadedAt: string;
};

export type OpenHouseEvent = {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  propertyImage: string;
  date: string;
  startTime: string;
  endTime: string;
  hostAgent: string;
  refreshments: string;
  rsvpCount: number;
  status: "Upcoming" | "In Progress" | "Completed";
};

export type MlsSyncLog = {
  id: string;
  timestamp: string;
  provider: string;
  status: "Success" | "Partial" | "Failed";
  recordsProcessed: number;
  recordsUpdated: number;
  durationMs: number;
  message: string;
};

export type MlsConfig = {
  autoSyncEnabled: boolean;
  syncIntervalHours: number;
  providerName: string;
  apiKey: string;
  feedUrl: string;
  agentMlsId: string;
  lastSyncAt: string | null;
  status: "Connected" | "Syncing" | "Idle" | "Error";
};

export type PublicSettings = {
  ga4_measurement_id: string | null;
  phone: string;
  whatsapp: string;
  email: string;
  office_address: string;
  office_hours: string;
  latitude: number;
  longitude: number;
  broker_name?: string;
  broker_license?: string;
  broker_bio?: string;
  hero_title?: string;
  hero_subtitle?: string;
  announcement_banner?: string;
};

export type PropertyFilters = {
  listingType?: ListingType | "all";
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  baths?: number;
  status?: PropertyStatus | "all";
  sort?: "newest" | "price_asc" | "price_desc" | "sqft_desc";
  limit?: number;
  featuredOnly?: boolean;
  propertyType?: string;
  amenities?: string[];
};
