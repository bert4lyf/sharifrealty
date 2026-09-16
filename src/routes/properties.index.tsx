import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect, useRef } from "react";
import { z } from "zod";
import {
  ChevronDown,
  LayoutGrid,
  List as ListIcon,
  MapPin,
  RotateCcw,
  SearchX,
} from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { PropertyCard } from "@/components/property-card";
import { PropertyMap } from "@/components/property-map";
import { Button } from "@/components/ui/button";
import { formatNumber, STATUS_LABELS } from "@/lib/format";
import { useAdmin, withImageFallback } from "@/lib/admin-store";
import type { Property } from "@/lib/types";

const searchSchema = z.object({
  category: z.string().optional(),
  type: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  area: z.string().optional(),
  order: z.string().optional(),
  q: z.string().max(120).optional(),
  beds: z.number().optional(),
  baths: z.number().optional(),
  status: z.string().optional(),
});

type PropertySearch = z.infer<typeof searchSchema>;

export const Route = createFileRoute("/properties/")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Properties List with Ajax Filters | Sharif Realty" },
      {
        name: "description",
        content:
          "Explore all commercial, residential, houses, condos, and off-market listings with interactive AJAX category filters across Connecticut and Massachusetts.",
      },
      { property: "og:title", content: "Sharif Realty · Properties Portfolio" },
      {
        property: "og:description",
        content: "Commercial & residential listings in Connecticut and Massachusetts.",
      },
    ],
  }),
  component: PropertiesPage,
});

const TYPES_OPTIONS = [
  { value: "all", label: "Types" },
  { value: "business", label: "Business" },
  { value: "commercial", label: "Commercial" },
  { value: "residential", label: "Residential" },
];

const CATEGORIES_OPTIONS = [
  { value: "all", label: "Categories" },
  { value: "apartments", label: "Apartments" },
  { value: "commercial", label: "Commercial" },
  { value: "condos", label: "Condos" },
  { value: "duplexes", label: "Duplexes" },
  { value: "houses", label: "Houses" },
  { value: "industrial", label: "Industrial" },
  { value: "land", label: "Land" },
  { value: "offices", label: "Offices" },
  { value: "retail", label: "Retail" },
  { value: "villas", label: "Villas" },
];

const STATES_OPTIONS = [
  { value: "all", label: "States" },
  { value: "connecticut", label: "Connecticut" },
  { value: "massachusetts", label: "Massachusetts" },
  { value: "new-jersey-state", label: "New Jersey State" },
  { value: "new-york-state", label: "New York State" },
];

const CITIES_OPTIONS = [
  { value: "all", label: "Cities" },
  { value: "church-st", label: "Church St" },
  { value: "church-st-decatur-ga-30030", label: "Church St Decatur GA 30030" },
  { value: "decatur", label: "Decatur" },
  { value: "east-hartford", label: "East Hartford" },
  { value: "ga", label: "GA" },
  { value: "ga-30030", label: "GA 30030" },
  { value: "jersey-city", label: "Jersey City" },
  { value: "london", label: "London" },
  { value: "main-st-east-hartford", label: "Main St East Hartford" },
  { value: "new-york", label: "New York" },
  { value: "north-main-st-waterbury", label: "North Main St Waterbury" },
  { value: "not-specified", label: "Not Specified" },
  { value: "southington-ct", label: "Southington Ct" },
  { value: "waterbury", label: "Waterbury" },
  { value: "berlin", label: "Berlin" },
  { value: "burlington", label: "Burlington" },
];

const AREAS_OPTIONS = [
  { value: "all", label: "Areas" },
  { value: "bayonne", label: "Bayonne" },
  { value: "greenville", label: "Greenville" },
  { value: "manhattan", label: "Manhattan" },
  { value: "queens", label: "Queens" },
  { value: "southwark", label: "Southwark" },
  { value: "the-heights", label: "The Heights" },
  { value: "upper-east-side", label: "Upper East Side" },
  { value: "west-side", label: "West Side" },
];

const ORDER_OPTIONS = [
  { value: "0", label: "Default" },
  { value: "1", label: "Price High to Low" },
  { value: "2", label: "Price Low to High" },
  { value: "3", label: "Newest first" },
  { value: "4", label: "Oldest first" },
  { value: "11", label: "Newest Edited" },
  { value: "12", label: "Oldest Edited" },
  { value: "5", label: "Bedrooms High to Low" },
  { value: "6", label: "Bedrooms Low to high" },
  { value: "7", label: "Bathrooms High to Low" },
  { value: "8", label: "Bathrooms Low to high" },
];

function PropertiesPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { posts: adminPosts } = useAdmin();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const filterHeadRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterHeadRef.current && !filterHeadRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeType = search.type || "all";
  const activeCategory = search.category || "all";
  const activeState = search.state || "all";
  const activeCity = search.city || "all";
  const activeArea = search.area || "all";
  const activeOrder = search.order || "0";

  // Merge seed and admin store properties with strict 1:1 schema
  const allProperties: Property[] = useMemo(() => {
    return adminPosts.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      description: p.description,
      price: p.price,
      status: p.propertyStatus,
      listing_type: p.listingType,
      address: p.address,
      city: p.city,
      state: p.state,
      zip: p.zip,
      beds: p.beds,
      baths: p.baths,
      sqft: p.sqft,
      latitude: p.latitude || 41.554,
      longitude: p.longitude || -73.042,
      images: p.images,
      features: p.features,
      is_featured: p.isFeatured,
      is_archived: p.status === "Draft",
      created_at: p.date,
      updated_at: p.date,
      year_built: p.yearBuilt || 2023,
      mls_id: p.mlsId,
      hoa_fee: p.hoaFee,
      lot_size: p.lotSize,
      garage_spaces: p.garageSpaces,
      virtual_tour_url: p.virtualTourUrl,
      category: p.category,
      propertyType: p.propertyType,
      priceLabel: p.priceLabel || "",
    })) as Property[];
  }, [adminPosts]);

  // Strict Category & AJAX filtering matching legacy taxonomies
  const filtered = useMemo(() => {
    let result = allProperties.filter((p) => {
      // 1. Type Filter (Types: Business, Commercial, Residential)
      if (activeType !== "all") {
        const t = activeType.toLowerCase();
        const cat = (p.category || "").toLowerCase();
        const pType = (p.propertyType || "").toLowerCase();
        const listType = (p.listing_type || "").toLowerCase();

        if (t === "commercial" || t === "business") {
          if (cat !== "commercial" && !pType.includes("commercial") && listType !== "commercial") {
            return false;
          }
        } else if (t === "residential") {
          if (cat === "commercial" || listType === "commercial" || pType.includes("commercial")) {
            return false;
          }
        }
      }

      // 2. Category Filter
      if (activeCategory !== "all") {
        const cat = (p.category || "").toLowerCase();
        const pType = (p.propertyType || "").toLowerCase();
        const target = activeCategory.toLowerCase();

        if (target === "commercial") {
          if (cat !== "commercial" && !pType.includes("commercial") && p.listing_type !== "commercial") return false;
        } else if (target === "houses") {
          if (cat !== "houses" && !cat.includes("single family") && !pType.includes("single family")) return false;
        } else if (target === "condos") {
          if (cat !== "condos" && !cat.includes("condo") && !pType.includes("townhouse") && !pType.includes("condo")) return false;
        } else if (target === "apartments") {
          if (cat !== "apartments" && !pType.includes("apartment")) return false;
        } else if (target === "duplexes") {
          if (cat !== "duplexes" && !pType.includes("duplex")) return false;
        } else if (target === "villas") {
          if (cat !== "villas" && !pType.includes("villa")) return false;
        } else if (target === "industrial") {
          if (cat !== "industrial" && !pType.includes("industrial")) return false;
        } else if (target === "offices") {
          if (cat !== "offices" && !pType.includes("office")) return false;
        } else if (target === "retail") {
          if (cat !== "retail" && !pType.includes("retail")) return false;
        } else if (target === "land") {
          if (cat !== "land" && !pType.includes("land")) return false;
        }
      }

      // 3. States Filter
      if (activeState !== "all") {
        const st = (p.state || "").toLowerCase();
        const addr = (p.address || "").toLowerCase();
        const targetState = activeState.toLowerCase();

        if (targetState === "connecticut") {
          if (st !== "ct" && st !== "connecticut" && !addr.includes("ct")) return false;
        } else if (targetState === "massachusetts") {
          if (st !== "ma" && st !== "massachusetts" && !addr.includes("ma")) return false;
        } else if (targetState === "new-jersey-state") {
          if (st !== "nj" && st !== "new jersey" && !addr.includes("nj")) return false;
        } else if (targetState === "new-york-state") {
          if (st !== "ny" && st !== "new york" && !addr.includes("ny")) return false;
        }
      }

      // 4. Cities Filter
      if (activeCity !== "all") {
        const c = (p.city || "").toLowerCase();
        const addr = (p.address || "").toLowerCase();
        const targetCity = activeCity.toLowerCase().replace(/-/g, " ");

        if (!c.includes(targetCity) && !addr.includes(targetCity)) {
          // Special handles for compound city slugs
          if (activeCity === "southington-ct" && (c.includes("southington") || addr.includes("southington"))) {
            return true;
          }
          if (activeCity === "north-main-st-waterbury" && (addr.includes("north main") || c.includes("waterbury"))) {
            return true;
          }
          if (activeCity === "main-st-east-hartford" && (addr.includes("main st") || c.includes("east hartford"))) {
            return true;
          }
          return false;
        }
      }

      // 5. Areas Filter
      if (activeArea !== "all") {
        const areaTarget = activeArea.toLowerCase().replace(/-/g, " ");
        const fullAddr = `${p.address} ${p.city} ${p.zip}`.toLowerCase();
        if (!fullAddr.includes(areaTarget)) return false;
      }

      // 6. Search query string
      if (search.q) {
        const q = search.q.toLowerCase();
        const match =
          p.title.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.zip.toLowerCase().includes(q) ||
          (p.category && p.category.toLowerCase().includes(q)) ||
          p.description.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });

    // 7. Sorting / Order
    if (activeOrder === "3") {
      // Newest first
      result = [...result].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    } else if (activeOrder === "4") {
      // Oldest first
      result = [...result].sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
    } else if (activeOrder === "5") {
      // Bedrooms High to Low
      result = [...result].sort((a, b) => (b.beds || 0) - (a.beds || 0));
    } else if (activeOrder === "6") {
      // Bedrooms Low to High
      result = [...result].sort((a, b) => (a.beds || 0) - (b.beds || 0));
    } else if (activeOrder === "7") {
      // Bathrooms High to Low
      result = [...result].sort((a, b) => (Number(b.baths) || 0) - (Number(a.baths) || 0));
    } else if (activeOrder === "8") {
      // Bathrooms Low to High
      result = [...result].sort((a, b) => (Number(a.baths) || 0) - (Number(b.baths) || 0));
    }

    return result;
  }, [allProperties, activeType, activeCategory, activeState, activeCity, activeArea, activeOrder, search.q]);

  function updateSearch(updates: Partial<PropertySearch>) {
    setOpenDropdown(null);
    void navigate({
      search: {
        ...search,
        ...updates,
      },
    });
  }

  function resetFilters() {
    setOpenDropdown(null);
    void navigate({ search: {} });
  }

  const hasActiveFilters = Boolean(
    activeType !== "all" ||
    activeCategory !== "all" ||
    activeState !== "all" ||
    activeCity !== "all" ||
    activeArea !== "all" ||
    activeOrder !== "0" ||
    search.q
  );

  const selectedTypeLabel = TYPES_OPTIONS.find((o) => o.value === activeType)?.label || "Types";
  const selectedCategoryLabel = CATEGORIES_OPTIONS.find((o) => o.value === activeCategory)?.label || "Categories";
  const selectedStateLabel = STATES_OPTIONS.find((o) => o.value === activeState)?.label || "States";
  const selectedCityLabel = CITIES_OPTIONS.find((o) => o.value === activeCity)?.label || "Cities";
  const selectedAreaLabel = AREAS_OPTIONS.find((o) => o.value === activeArea)?.label || "Areas";
  const selectedOrderLabel = ORDER_OPTIONS.find((o) => o.value === activeOrder)?.label || "Default";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Breadcrumbs items={[{ label: "Properties" }]} />

      {/* Header Banner with Luxury Photography Background */}
      <section className="relative overflow-hidden min-h-[360px] lg:min-h-[420px] flex items-center justify-center py-16 lg:py-24 text-white bg-slate-950">
        <div className="absolute inset-0 size-full">
          <img
            src="/uploads/2025/05/hero.png"
            alt="Sharif Realty Portfolio"
            className="size-full object-cover object-center"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/70 to-slate-950/90" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <span className="inline-block rounded-full bg-[#0F172A]/20 border border-[#C5A880]/40 px-4 py-1 text-xs font-bold uppercase tracking-widest text-red-400 mb-3">
            Real Estate Portfolio
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
            Properties List with Ajax Filters
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-slate-300">
            Search commercial properties, single family residences, townhomes, and private off-market listings across Connecticut & Massachusetts.
          </p>
        </div>
      </section>

      {/* AJAX Filters Toolbar */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-b border-[#EAE6DF] dark:border-white/10 shadow-sm py-3.5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6" ref={filterHeadRef}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              {/* 1. Types Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  aria-expanded={openDropdown === "types"}
                  onClick={() => setOpenDropdown(openDropdown === "types" ? null : "types")}
                  className={`inline-flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    openDropdown === "types" || activeType !== "all"
                      ? "border-[#C5A880] bg-[#FAF8F5] text-[#0F172A] shadow-xs"
                      : "border-[#EAE6DF] bg-white text-[#1E293B] hover:border-[#C5A880]"
                  }`}
                >
                  <span>{selectedTypeLabel}</span>
                  <ChevronDown className={`size-3.5 text-slate-400 transition-transform ${openDropdown === "types" ? "rotate-180 text-[#B38B59]" : ""}`} />
                </button>
                {openDropdown === "types" && (
                  <ul className="absolute left-0 top-full mt-1.5 min-w-[170px] rounded-xl bg-white border border-[#EAE6DF] shadow-xl py-1 z-50 animate-in fade-in">
                    {TYPES_OPTIONS.map((item) => (
                      <li
                        key={item.value}
                        className={`px-3.5 py-2 text-xs cursor-pointer transition-colors ${
                          activeType === item.value
                            ? "bg-[#FAF8F5] text-[#B38B59] font-bold"
                            : "text-[#1E293B] hover:bg-[#FAF8F5] hover:text-[#0F172A]"
                        }`}
                        onClick={() => {
                          updateSearch({ type: item.value === "all" ? undefined : item.value });
                          setOpenDropdown(null);
                        }}
                      >
                        {item.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* 2. Categories Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  aria-expanded={openDropdown === "categories"}
                  onClick={() => setOpenDropdown(openDropdown === "categories" ? null : "categories")}
                  className={`inline-flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    openDropdown === "categories" || activeCategory !== "all"
                      ? "border-[#C5A880] bg-[#FAF8F5] text-[#0F172A] shadow-xs"
                      : "border-[#EAE6DF] bg-white text-[#1E293B] hover:border-[#C5A880]"
                  }`}
                >
                  <span>{selectedCategoryLabel}</span>
                  <ChevronDown className={`size-3.5 text-slate-400 transition-transform ${openDropdown === "categories" ? "rotate-180 text-[#B38B59]" : ""}`} />
                </button>
                {openDropdown === "categories" && (
                  <ul className="absolute left-0 top-full mt-1.5 min-w-[180px] rounded-xl bg-white border border-[#EAE6DF] shadow-xl py-1 z-50 animate-in fade-in">
                    {CATEGORIES_OPTIONS.map((item) => (
                      <li
                        key={item.value}
                        className={`px-3.5 py-2 text-xs cursor-pointer transition-colors ${
                          activeCategory === item.value
                            ? "bg-[#FAF8F5] text-[#B38B59] font-bold"
                            : "text-[#1E293B] hover:bg-[#FAF8F5] hover:text-[#0F172A]"
                        }`}
                        onClick={() => {
                          updateSearch({ category: item.value === "all" ? undefined : item.value });
                          setOpenDropdown(null);
                        }}
                      >
                        {item.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* 3. States Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  aria-expanded={openDropdown === "states"}
                  onClick={() => setOpenDropdown(openDropdown === "states" ? null : "states")}
                  className={`inline-flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    openDropdown === "states" || activeState !== "all"
                      ? "border-[#C5A880] bg-[#FAF8F5] text-[#0F172A] shadow-xs"
                      : "border-[#EAE6DF] bg-white text-[#1E293B] hover:border-[#C5A880]"
                  }`}
                >
                  <span>{selectedStateLabel}</span>
                  <ChevronDown className={`size-3.5 text-slate-400 transition-transform ${openDropdown === "states" ? "rotate-180 text-[#B38B59]" : ""}`} />
                </button>
                {openDropdown === "states" && (
                  <ul className="absolute left-0 top-full mt-1.5 min-w-[160px] rounded-xl bg-white border border-[#EAE6DF] shadow-xl py-1 z-50 animate-in fade-in">
                    {STATES_OPTIONS.map((item) => (
                      <li
                        key={item.value}
                        className={`px-3.5 py-2 text-xs cursor-pointer transition-colors ${
                          activeState === item.value
                            ? "bg-[#FAF8F5] text-[#B38B59] font-bold"
                            : "text-[#1E293B] hover:bg-[#FAF8F5] hover:text-[#0F172A]"
                        }`}
                        onClick={() => {
                          updateSearch({ state: item.value === "all" ? undefined : item.value });
                          setOpenDropdown(null);
                        }}
                      >
                        {item.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* 4. Cities Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  aria-expanded={openDropdown === "cities"}
                  onClick={() => setOpenDropdown(openDropdown === "cities" ? null : "cities")}
                  className={`inline-flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    openDropdown === "cities" || activeCity !== "all"
                      ? "border-[#C5A880] bg-[#FAF8F5] text-[#0F172A] shadow-xs"
                      : "border-[#EAE6DF] bg-white text-[#1E293B] hover:border-[#C5A880]"
                  }`}
                >
                  <span>{selectedCityLabel}</span>
                  <ChevronDown className={`size-3.5 text-slate-400 transition-transform ${openDropdown === "cities" ? "rotate-180 text-[#B38B59]" : ""}`} />
                </button>
                {openDropdown === "cities" && (
                  <ul className="absolute left-0 top-full mt-1.5 min-w-[170px] rounded-xl bg-white border border-[#EAE6DF] shadow-xl py-1 z-50 animate-in fade-in">
                    {CITIES_OPTIONS.map((item) => (
                      <li
                        key={item.value}
                        className={`px-3.5 py-2 text-xs cursor-pointer transition-colors ${
                          activeCity === item.value
                            ? "bg-[#FAF8F5] text-[#B38B59] font-bold"
                            : "text-[#1E293B] hover:bg-[#FAF8F5] hover:text-[#0F172A]"
                        }`}
                        onClick={() => {
                          updateSearch({ city: item.value === "all" ? undefined : item.value });
                          setOpenDropdown(null);
                        }}
                      >
                        {item.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* 5. Areas Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  aria-expanded={openDropdown === "areas"}
                  onClick={() => setOpenDropdown(openDropdown === "areas" ? null : "areas")}
                  className={`inline-flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    openDropdown === "areas" || activeArea !== "all"
                      ? "border-[#C5A880] bg-[#FAF8F5] text-[#0F172A] shadow-xs"
                      : "border-[#EAE6DF] bg-white text-[#1E293B] hover:border-[#C5A880]"
                  }`}
                >
                  <span>{selectedAreaLabel}</span>
                  <ChevronDown className={`size-3.5 text-slate-400 transition-transform ${openDropdown === "areas" ? "rotate-180 text-[#B38B59]" : ""}`} />
                </button>
                {openDropdown === "areas" && (
                  <ul className="absolute left-0 top-full mt-1.5 min-w-[170px] rounded-xl bg-white border border-[#EAE6DF] shadow-xl py-1 z-50 animate-in fade-in">
                    {AREAS_OPTIONS.map((item) => (
                      <li
                        key={item.value}
                        className={`px-3.5 py-2 text-xs cursor-pointer transition-colors ${
                          activeArea === item.value
                            ? "bg-[#FAF8F5] text-[#B38B59] font-bold"
                            : "text-[#1E293B] hover:bg-[#FAF8F5] hover:text-[#0F172A]"
                        }`}
                        onClick={() => {
                          updateSearch({ area: item.value === "all" ? undefined : item.value });
                          setOpenDropdown(null);
                        }}
                      >
                        {item.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* 6. Order Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  aria-expanded={openDropdown === "order"}
                  onClick={() => setOpenDropdown(openDropdown === "order" ? null : "order")}
                  className={`inline-flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    openDropdown === "order" || activeOrder !== "0"
                      ? "border-[#C5A880] bg-[#FAF8F5] text-[#0F172A] shadow-xs"
                      : "border-[#EAE6DF] bg-white text-[#1E293B] hover:border-[#C5A880]"
                  }`}
                >
                  <span>{selectedOrderLabel}</span>
                  <ChevronDown className={`size-3.5 text-slate-400 transition-transform ${openDropdown === "order" ? "rotate-180 text-[#B38B59]" : ""}`} />
                </button>
                {openDropdown === "order" && (
                  <ul className="absolute right-0 top-full mt-1.5 min-w-[180px] rounded-xl bg-white border border-[#EAE6DF] shadow-xl py-1 z-50 animate-in fade-in">
                    {ORDER_OPTIONS.map((item) => (
                      <li
                        key={item.value}
                        className={`px-3.5 py-2 text-xs cursor-pointer transition-colors ${
                          activeOrder === item.value
                            ? "bg-[#FAF8F5] text-[#B38B59] font-bold"
                            : "text-[#1E293B] hover:bg-[#FAF8F5] hover:text-[#0F172A]"
                        }`}
                        onClick={() => {
                          updateSearch({ order: item.value === "0" ? undefined : item.value });
                          setOpenDropdown(null);
                        }}
                      >
                        {item.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* View Mode Toggle Switcher */}
            <div className="flex items-center gap-1 p-1 bg-[#FAF8F5] border border-[#EAE6DF] rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                title="Grid View"
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-[#0F172A] text-white shadow-xs"
                    : "text-slate-500 hover:text-[#0F172A] hover:bg-white"
                }`}
              >
                <LayoutGrid className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                title="List View"
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-[#0F172A] text-white shadow-xs"
                    : "text-slate-500 hover:text-[#0F172A] hover:bg-white"
                }`}
              >
                <ListIcon className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Results Section */}
      <section className="py-10 bg-[#FAF8F5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Results Summary Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-white p-4 sm:p-5 rounded-2xl border border-[#EAE6DF] shadow-sm">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-serif text-lg font-bold text-[#0F172A]">
                {filtered.length} Properties Found
              </span>
              {activeType !== "all" && (
                <span className="rounded-full bg-[#0F172A] text-white px-3 py-1 text-xs font-semibold">
                  Type: {selectedTypeLabel}
                </span>
              )}
              {activeCategory !== "all" && (
                <span className="rounded-full bg-[#C5A880] text-white px-3 py-1 text-xs font-semibold">
                  Category: {selectedCategoryLabel}
                </span>
              )}
              {activeState !== "all" && (
                <span className="rounded-full bg-[#F3F0EA] text-[#0F172A] px-3 py-1 text-xs font-semibold border border-[#EAE6DF]">
                  State: {selectedStateLabel}
                </span>
              )}
              {activeCity !== "all" && (
                <span className="rounded-full bg-[#F3F0EA] text-[#0F172A] px-3 py-1 text-xs font-semibold border border-[#EAE6DF]">
                  City: {selectedCityLabel}
                </span>
              )}
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-xs text-[#B38B59] hover:text-[#0F172A] font-semibold"
              >
                <RotateCcw className="size-3.5 mr-1 text-[#C5A880]" />
                Reset All Filters
              </Button>
            )}
          </div>

          {/* Listings Display: Grid or List */}
          {filtered.length > 0 ? (
            viewMode === "list" ? (
              /* Expanded Horizontal List Layout */
              <div className="space-y-6">
                {filtered.map((property) => (
                  <article
                    key={property.id}
                    className="flex flex-col md:flex-row overflow-hidden rounded-2xl border border-[#EAE6DF] bg-white shadow-sm hover:shadow-xl hover:border-[#C5A880] transition-all group"
                  >
                    <Link
                      to="/properties/$id"
                      params={{ id: property.slug }}
                      className="md:w-2/5 aspect-[16/11] md:aspect-auto overflow-hidden relative block"
                    >
                      <img
                        src={property.images?.[0] || "/uploads/2025/05/16-thendara.jpg"}
                        onError={withImageFallback}
                        alt={property.title}
                        className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        {property.category && (
                          <span className="rounded-full bg-[#0F172A]/85 text-white backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-wider border border-white/15">
                            {property.category}
                          </span>
                        )}
                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                            property.status === "sold"
                              ? "bg-rose-600 text-white shadow-sm ring-1 ring-white/30"
                              : property.status === "pending" || property.status === "under_contract"
                              ? "bg-amber-600 text-white shadow-sm ring-1 ring-white/30"
                              : "bg-[#C5A880] text-white"
                          }`}
                        >
                          {property.status === "pending" || property.status === "under_contract"
                            ? "Under Contract"
                            : property.status === "sold"
                            ? "Sold"
                            : (STATUS_LABELS[property.status] || "For Sale")}
                        </span>
                      </div>
                    </Link>

                    <div className="p-6 md:p-8 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-xs font-semibold uppercase tracking-widest text-[#B38B59]">
                            {property.category || "Exclusive Estate"}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">ID {property.id.replace('prop-', '')}</span>
                        </div>

                        <h3 className="font-serif text-2xl font-bold text-[#0F172A] group-hover:text-[#B38B59] transition-colors">
                          <Link to="/properties/$id" params={{ id: property.slug }}>
                            {property.title}
                          </Link>
                        </h3>

                        <p className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                          <MapPin className="size-3.5 text-[#C5A880]" />
                          {property.id === "prop-31965" || property.slug?.includes("split-level")
                            ? "Waterbury Connecticut"
                            : property.id === "prop-32097" || property.slug?.includes("new-britain")
                            ? "Berlin Connecticut"
                            : property.state === "Connecticut"
                            ? `${property.city} ${property.state}`
                            : `${property.address}, ${property.city}, ${property.state} ${property.zip}`}
                        </p>

                        <p className="text-sm text-slate-600 mt-3 line-clamp-2 leading-relaxed font-sans">
                          {property.description}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-[#EAE6DF] flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-6 text-xs text-slate-700 font-medium">
                          {property.beds > 0 ? (
                            <span><strong>{property.beds}</strong> Beds</span>
                          ) : (
                            <span><strong>Commercial</strong></span>
                          )}
                          <span><strong>{Number(property.baths)}</strong> Baths</span>
                          <span><strong>{formatNumber(property.sqft)}</strong> sqft</span>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                            <MapPin className="size-3.5 text-[#C5A880]" />
                            {property.id === "prop-31965" || property.slug?.includes("split-level")
                              ? "Waterbury Connecticut"
                              : property.id === "prop-32097" || property.slug?.includes("new-britain")
                              ? "Berlin Connecticut"
                              : property.city?.toLowerCase() === "waterbury"
                              ? "Waterbury Connecticut"
                              : property.city?.toLowerCase() === "berlin"
                              ? "Berlin Connecticut"
                              : `${property.city} ${property.state}`}
                          </span>
                          <Button asChild size="sm" className="bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl">
                            <Link to="/properties/$id" params={{ id: property.slug }}>
                              Explore Property &rarr;
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              /* 3-Column Grid Layout matching Wpresidence_Filter_List_Properties_v8 */
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )
          ) : (
            /* No Results Found State */
            <div className="rounded-2xl border border-dashed border-[#EAE6DF] bg-white p-16 text-center space-y-4">
              <SearchX className="size-12 text-slate-400 mx-auto" />
              <h3 className="font-serif text-2xl font-bold text-[#0F172A]">
                No Properties Found
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                No listings matched your active filter criteria. Try selecting "All" or resetting your filter parameters.
              </p>
              <Button onClick={resetFilters} className="bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl mt-2">
                Reset All Filters
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
