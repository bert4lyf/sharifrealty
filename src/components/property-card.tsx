import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bath, Bed, ChevronLeft, ChevronRight, Heart, MapPin, Ruler, Sparkles, Video, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatNumber, formatPrice, isRentalType, STATUS_LABELS } from "@/lib/format";
import type { Property } from "@/lib/types";
import { useAdmin, withImageFallback } from "@/lib/admin-store";
import { toast } from "sonner";

export function PropertyCard({ property }: { property: Property }) {
  const { toggleFavorite, isFavorite } = useAdmin();
  const imageList =
    property.images && property.images.length > 0
      ? property.images
      : ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const isSaved = isFavorite(property.id);

  const alt = `${property.title} — ${property.address}, ${property.city}, ${property.state}`;

  function handlePrevImage(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? imageList.length - 1 : prev - 1));
  }

  function handleNextImage(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === imageList.length - 1 ? 0 : prev + 1));
  }

  function handleToggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleFavorite(property.id);
    toast.success(added ? `Saved "${property.title}" to favorites` : `Removed "${property.title}" from favorites`);
  }

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-[#EAE6DF] bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 flex flex-col justify-between">
      <Link
        to="/properties/$id"
        params={{ id: property.slug }}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880]"
      >
        {/* Image & Carousel Container */}
        <div className="relative aspect-[16/11] overflow-hidden bg-slate-950">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIndex}
              src={imageList[currentImageIndex]}
              onError={withImageFallback}
              alt={alt}
              loading="lazy"
              decoding="async"
              width={800}
              height={550}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </AnimatePresence>

          {/* Scrim overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

          {/* Carousel Arrows (Appear on Hover if >1 image) */}
          {imageList.length > 1 && (
            <div className="absolute inset-x-2 top-1/2 flex -translate-y-1/2 justify-between opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <button
                type="button"
                onClick={handlePrevImage}
                aria-label="Previous property photo"
                className="flex size-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-transform hover:scale-110 hover:bg-black/90"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={handleNextImage}
                aria-label="Next property photo"
                className="flex size-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-transform hover:scale-110 hover:bg-black/90"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          )}

          {/* Pagination Dots */}
          {imageList.length > 1 && (
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 backdrop-blur-sm">
              {imageList.slice(0, 5).map((_, idx) => (
                <span
                  key={idx}
                  className={`size-1.5 rounded-full transition-all ${
                    idx === currentImageIndex ? "w-4 bg-[#C5A880]" : "bg-white/60"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Badges Left */}
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5 max-w-[80%]">
            {property.category && (
              <span className="rounded-full bg-[#0F172A]/85 text-white backdrop-blur-md border border-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                {property.category}
              </span>
            )}

            <span
              className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md text-white ${
                property.status === "sold"
                  ? "bg-rose-600/95 ring-1 ring-white/25"
                  : property.status === "pending" || (property.status as string) === "under_contract"
                  ? "bg-amber-600/95 ring-1 ring-white/25"
                  : "bg-[#C5A880]/90"
              }`}
            >
              {property.status === "pending" || (property.status as string) === "under_contract"
                ? "Under Contract"
                : STATUS_LABELS[property.status] || "For Sale"}
            </span>

            {property.is_featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#B38B59] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                <Sparkles className="size-3" />
                Featured
              </span>
            )}
          </div>

          {/* Favorite & Virtual Tour Top Right */}
          <div className="absolute right-3 top-3 flex items-center gap-1.5">
            {property.virtual_tour_url && (
              <span
                title="3D Virtual Walkthrough Available"
                className="flex size-8 items-center justify-center rounded-full bg-black/60 text-[#C5A880] backdrop-blur-md border border-white/10"
              >
                <Video className="size-3.5" />
              </span>
            )}
            <button
              type="button"
              onClick={handleToggleFavorite}
              aria-label={isSaved ? "Remove from saved" : "Save property"}
              className={`flex size-8 items-center justify-center rounded-full backdrop-blur-md transition-transform hover:scale-110 ${
                isSaved
                  ? "bg-[#C5A880] text-white"
                  : "bg-black/60 text-white/90 hover:bg-black/90 hover:text-[#C5A880]"
              }`}
            >
              <Heart className={`size-4 ${isSaved ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-3.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#B38B59]">
              {property.category || "Exclusive Estate"}
            </span>
            <div className="font-serif text-lg sm:text-xl font-bold text-[#0F172A] tracking-tight">
              {property.status === "sold" ? (
                <span className="text-rose-600 font-bold tracking-normal">SOLD</span>
              ) : property.status === "pending" || (property.status as string) === "under_contract" ? (
                <span className="text-amber-700 font-bold text-sm tracking-normal uppercase">Under Contract</span>
              ) : property.price ? (
                `$${property.price.toLocaleString()}`
              ) : (
                "Price on Call"
              )}
            </div>
          </div>

          <h3 className="text-base font-bold font-serif leading-snug text-[#1E293B] group-hover:text-[#B38B59] transition-colors line-clamp-1">
            {property.title}
          </h3>

          <p className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="size-3.5 shrink-0 text-[#C5A880]" aria-hidden="true" />
            <span className="truncate">
              {property.id === "prop-31965" || property.slug?.includes("split-level")
                ? "Waterbury Connecticut"
                : property.id === "prop-32097" || property.slug?.includes("new-britain")
                ? "Berlin Connecticut"
                : property.state === "Connecticut"
                ? `${property.city} ${property.state}`
                : `${property.address}, ${property.city}, ${property.state}`}
            </span>
          </p>

          {/* Specs Ribbon with Clean Allys Dividers */}
          <dl className="grid grid-cols-3 gap-2 border-t border-[#EAE6DF] pt-3.5 text-xs text-slate-600">
            {property.beds > 0 ? (
              <div className="flex items-center gap-1.5">
                <Bed className="size-3.5 text-[#B38B59] shrink-0" aria-hidden="true" />
                <dt className="sr-only">Bedrooms</dt>
                <dd className="font-medium text-slate-800">{property.beds} Beds</dd>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="size-3.5 text-[#B38B59] shrink-0 font-bold text-center">🏢</span>
                <dd className="font-medium text-slate-800">Commercial</dd>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Bath className="size-3.5 text-[#B38B59] shrink-0" aria-hidden="true" />
              <dt className="sr-only">Bathrooms</dt>
              <dd className="font-medium text-slate-800">{Number(property.baths)} Baths</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <Ruler className="size-3.5 text-[#B38B59] shrink-0" aria-hidden="true" />
              <dt className="sr-only">Interior size</dt>
              <dd className="font-medium text-slate-800">{formatNumber(property.sqft)} sqft</dd>
            </div>
          </dl>

          {/* Card Footer: Location in bottom & View Link */}
          <div className="flex items-center justify-between pt-3 border-t border-dashed border-[#EAE6DF] text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <MapPin className="size-3.5 text-[#B38B59] shrink-0" />
              <span className="truncate max-w-[170px]">
                {property.id === "prop-31965" || property.slug?.includes("split-level")
                  ? "Waterbury Connecticut"
                  : property.id === "prop-32097" || property.slug?.includes("new-britain")
                  ? "Berlin Connecticut"
                  : property.city?.toLowerCase() === "waterbury"
                  ? "Waterbury Connecticut"
                  : property.city?.toLowerCase() === "berlin"
                  ? "Berlin Connecticut"
                  : property.state === "Connecticut"
                  ? `${property.city} ${property.state}`
                  : `${property.city}, ${property.state}`}
              </span>
            </div>
            <span className="text-xs font-semibold text-[#0F172A] group-hover:text-[#B38B59] flex items-center gap-1 transition-colors">
              Explore Property <ArrowRight className="size-3" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
