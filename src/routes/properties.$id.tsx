import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bath,
  Bed,
  Building,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Compass,
  Heart,
  MapPin,
  Maximize2,
  Phone,
  Printer,
  Ruler,
  Share2,
  Sparkles,
  Video,
  Calculator,
  BarChart3,
  Calendar,
  Clock,
  Send,
  ExternalLink,
  Utensils,
  GraduationCap,
  Bus,
  ShoppingBag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { PropertyMap } from "@/components/property-map";
import { PropertyCard } from "@/components/property-card";
import { formatNumber, STATUS_LABELS } from "@/lib/format";
import { SITE, whatsappHref } from "@/lib/site";
import { useAdmin, withImageFallback } from "@/lib/admin-store";
import { toast } from "sonner";
import type { Property } from "@/lib/types";

export const Route = createFileRoute("/properties/$id")({
  head: () => ({
    meta: [
      { title: "Property Details | Sharif Realty" },
      {
        name: "description",
        content: "Authentic residential and commercial property details from Sharif Realty Group.",
      },
    ],
  }),
  component: PropertyDetail,
});

export function PropertyDetail() {
  const { id } = Route.useParams();
  const { posts: adminPosts, user, toggleFavorite, isFavorite, submitInquiry } = useAdmin();

  // Find active property or match by id/slug
  const currentIndex = adminPosts.findIndex((p) => p.slug === id || p.id === id);
  const safeIndex = currentIndex !== -1 ? currentIndex : 0;
  const currentAdminPost = adminPosts[safeIndex];

  if (!currentAdminPost) throw notFound();

  // Sequential Nav Prev / Next calculation
  const prevIndex = safeIndex === 0 ? adminPosts.length - 1 : safeIndex - 1;
  const nextIndex = safeIndex === adminPosts.length - 1 ? 0 : safeIndex + 1;
  const prevProperty = adminPosts[prevIndex];
  const nextProperty = adminPosts[nextIndex];

  const property: Property = {
    id: currentAdminPost.id,
    title: currentAdminPost.title,
    slug: currentAdminPost.slug,
    description: currentAdminPost.description,
    price: currentAdminPost.price,
    status: currentAdminPost.propertyStatus || "for_sale",
    listing_type: currentAdminPost.listingType || "buy",
    address: currentAdminPost.address,
    city: currentAdminPost.city,
    state: currentAdminPost.state,
    zip: currentAdminPost.zip,
    beds: currentAdminPost.beds,
    baths: currentAdminPost.baths,
    sqft: currentAdminPost.sqft,
    latitude: currentAdminPost.latitude || 41.554,
    longitude: currentAdminPost.longitude || -73.042,
    images: currentAdminPost.images,
    features: currentAdminPost.features,
    is_featured: currentAdminPost.isFeatured,
    is_archived: false,
    created_at: currentAdminPost.date,
    updated_at: currentAdminPost.date,
    year_built: currentAdminPost.yearBuilt || 2020,
    lot_size: currentAdminPost.lotSize,
    garage_spaces: currentAdminPost.garageSpaces,
  };

  const imageList =
    property.images && property.images.length > 0
      ? property.images
      : ["/wp-content/uploads/2025/05/image-16.png"];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const saved = isFavorite(property.id);

  // Mortgage Calculator State
  const [homePrice, setHomePrice] = useState<number>(450000);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [loanTermYears, setLoanTermYears] = useState<number>(30);
  const [interestRate, setInterestRate] = useState<number>(6.5);
  const [propertyTax, setPropertyTax] = useState<number>(350);
  const [hoaFee, setHoaFee] = useState<number>(0);

  // Schedule Tour State
  const tourDates = [
    { day: "Sun", date: "15", month: "Feb" },
    { day: "Mon", date: "16", month: "Feb" },
    { day: "Tue", date: "17", month: "Feb" },
    { day: "Wed", date: "18", month: "Feb" },
    { day: "Thu", date: "19", month: "Feb" },
    { day: "Fri", date: "20", month: "Feb" },
    { day: "Sat", date: "21", month: "Feb" },
  ];
  const [selectedTourDate, setSelectedTourDate] = useState<number>(1);
  const [selectedTourTime, setSelectedTourTime] = useState<string>("10:00 am");
  const [tourType, setTourType] = useState<"in_person" | "video_chat">("in_person");
  const [tourName, setTourName] = useState(user?.name || "");
  const [tourEmail, setTourEmail] = useState(user?.email || "");
  const [tourPhone, setTourPhone] = useState(user?.phone || "");
  const [tourNotes, setTourNotes] = useState(
    `I would like to schedule a tour for [ ${property.title} ].`,
  );
  const [tourSubmitting, setTourSubmitting] = useState(false);

  // Calculated Monthly Payment
  const calculatedMonthly = useMemo(() => {
    const principal = homePrice * (1 - downPaymentPercent / 100);
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTermYears * 12;
    let monthlyPI = 0;
    if (monthlyRate > 0) {
      monthlyPI =
        (principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    } else {
      monthlyPI = principal / numberOfPayments;
    }
    const total = Math.round(monthlyPI + propertyTax + hoaFee);
    return isNaN(total) || total < 0 ? 0 : total;
  }, [homePrice, downPaymentPercent, loanTermYears, interestRate, propertyTax, hoaFee]);

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? imageList.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev === imageList.length - 1 ? 0 : prev + 1));
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `Check out ${property.title} on Sharif Realty`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Property link copied to clipboard!");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleToggleFavorite = () => {
    const added = toggleFavorite(property.id);
    toast.success(added ? `Saved "${property.title}" to your favorites` : `Removed "${property.title}" from favorites`);
  };

  const handleTourSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTourSubmitting(true);
    const tourDay = tourDates[selectedTourDate] ?? { day: "Mon", date: "16", month: "Feb" };

    submitInquiry({
      propertyId: property.id,
      propertyTitle: property.title,
      name: tourName || (user?.name ?? "Prospective Buyer"),
      email: tourEmail || (user?.email ?? "buyer@example.com"),
      phone: tourPhone || user?.phone,
      message: `${tourNotes} (Preferred Date/Time: ${tourDay.day} ${tourDay.date} ${tourDay.month} at ${selectedTourTime} - ${tourType === 'in_person' ? 'In-Person Tour' : 'Video Chat'})`,
      type: "tour",
    });

    setTimeout(() => {
      setTourSubmitting(false);
      toast.success(`Tour request submitted for ${tourDay.day} ${tourDay.date} ${tourDay.month} at ${selectedTourTime}!`, {
        description: "Majeed Sharif will reach out to confirm your appointment within 15 minutes.",
      });
    }, 400);
  };

  // Similar properties from genuine seed
  const similarProperties: Property[] = adminPosts
    .filter((p) => p.id !== property.id)
    .map((p) => ({
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
      is_archived: false,
      created_at: p.date,
      updated_at: p.date,
      year_built: p.yearBuilt || 2020,
    })) as Property[];

  return (
    <div className="min-h-screen bg-[#F7F9FB] dark:bg-slate-950 pb-24 text-slate-800 dark:text-slate-200">
      <Breadcrumbs
        items={[
          { label: "Properties", to: "/properties" },
          { label: property.title },
        ]}
      />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 pt-6">
        {/* NAV PREV & NEXT TOOLBAR */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-5 py-3.5 shadow-sm">
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:text-[#B38B59] transition-colors"
          >
            <ChevronLeft className="size-4" /> Back to Properties
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            {prevProperty && (
              <Link
                to="/properties/$id"
                params={{ id: prevProperty.slug }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-[#C5A880] hover:text-[#B38B59] transition-colors shadow-sm"
              >
                <ChevronLeft className="size-3.5" /> Prev Property
              </Link>
            )}

            {nextProperty && (
              <Link
                to="/properties/$id"
                params={{ id: nextProperty.slug }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#EAE6DF] px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-[#C5A880] hover:text-[#B38B59] transition-colors shadow-sm bg-white"
              >
                Next Property <ChevronRight className="size-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* HEADER AREA - ALLYS LUXURY RESIDENCE FORMAT */}
        <div className="rounded-2xl border border-[#EAE6DF] bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#0F172A] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-sm">
                  {currentAdminPost.category || "Residential"}
                </span>
                <span
                  className={`rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-sm ${
                    property.status === "sold"
                      ? "bg-rose-600 ring-2 ring-rose-200"
                      : property.status === "pending" || property.status === "under_contract"
                      ? "bg-amber-600 ring-2 ring-amber-200"
                      : "bg-[#C5A880]"
                  }`}
                >
                  {property.status === "sold" ? "Sold" : (STATUS_LABELS[property.status] || "For Sale")}
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0F172A] leading-tight">
                {property.title}
              </h1>

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="size-4 text-[#C5A880] shrink-0" />
                <span>
                  {property.state === "Connecticut"
                    ? `${property.city} ${property.state}`
                    : `${property.address}, ${property.city}, ${property.state} ${property.zip}`}
                </span>
              </div>
            </div>

            {/* Price & Actions */}
            <div className="flex flex-col sm:items-end justify-between gap-4">
              <div className="sm:text-right">
                <span className="block text-xs uppercase font-semibold text-[#B38B59] tracking-widest">
                  {property.status === "sold"
                    ? "Listing Status"
                    : property.status === "pending" || property.status === "under_contract"
                    ? "Listing Status"
                    : "Valuation / Asking Price"}
                </span>
                <div
                  className={`font-serif text-3xl sm:text-4xl font-bold ${
                    property.status === "sold"
                      ? "text-rose-600"
                      : property.status === "pending" || property.status === "under_contract"
                      ? "text-amber-600"
                      : "text-[#0F172A]"
                  }`}
                >
                  {property.status === "sold" ? (
                    "SOLD"
                  ) : property.status === "pending" || property.status === "under_contract" ? (
                    <div className="flex flex-col sm:items-end">
                      <span>Under Contract</span>
                      <span className="text-sm font-sans font-medium text-slate-500">
                        {currentAdminPost.priceLabel || "Price on Call"}
                      </span>
                    </div>
                  ) : (
                    currentAdminPost.priceLabel || "Price upon request"
                  )}
                </div>
              </div>

              {/* Social Share & Favorite Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#EAE6DF] px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-[#F3F0EA] transition-colors shadow-sm bg-white"
                >
                  <Share2 className="size-3.5" /> Share
                </button>
                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors shadow-sm ${
                    saved ? "bg-[#C5A880] text-white border-[#C5A880]" : "border-[#EAE6DF] text-slate-700 hover:bg-[#F3F0EA] bg-white"
                  }`}
                >
                  <Heart className={`size-3.5 ${saved ? "fill-current" : ""}`} /> Favorite
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                >
                  <Printer className="size-3.5" /> Print
                </button>
              </div>
            </div>
          </div>

          {/* HERO IMAGE & CAROUSEL WITH FADE-IN ANIMATION */}
          <div className="mt-8 relative aspect-[16/9] max-h-[640px] w-full overflow-hidden rounded-2xl bg-slate-950 shadow-lg">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImageIndex}
                src={imageList[activeImageIndex]}
                onError={withImageFallback}
                alt={`${property.title} photo ${activeImageIndex + 1}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="size-full object-cover"
              />
            </AnimatePresence>

            {/* Carousel Arrows if multiple images */}
            {imageList.length > 1 && (
              <div className="absolute inset-x-4 top-1/2 flex -translate-y-1/2 justify-between">
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="flex size-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/90 transition-transform hover:scale-110"
                >
                  <ChevronLeft className="size-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="flex size-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/90 transition-transform hover:scale-110"
                >
                  <ChevronRight className="size-6" />
                </button>
              </div>
            )}

            {/* Image Counter Badge */}
            <div className="absolute bottom-4 right-4 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
              {activeImageIndex + 1} of {imageList.length} Photos
            </div>
          </div>
        </div>

        {/* MAIN 2-COLUMN CONTENT & SIDEBAR */}
        <div className="mt-10 grid gap-10 lg:grid-cols-12 items-start">
          {/* LEFT 8 COLUMNS: PROPERTY SECTIONS */}
          <div className="space-y-8 lg:col-span-8">
            {/* 1. OVERVIEW ACCORDION PANEL */}
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
              <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/10 pb-4">
                Overview
              </h2>
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-6 text-sm">
                <div>
                  <span className="block text-xs text-slate-400 font-semibold uppercase tracking-wider">Updated On:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 mt-1 block">{currentAdminPost.date}</span>
                </div>
                <div>
                  <span className="block text-xs text-slate-400 font-semibold uppercase tracking-wider">Property ID:</span>
                  <span className="font-bold text-[#B38B59] mt-1 block">{currentAdminPost.id.replace("prop-", "")}</span>
                </div>
                <div>
                  <span className="block text-xs text-slate-400 font-semibold uppercase tracking-wider">Category:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 mt-1 block">{currentAdminPost.category}</span>
                </div>
                <div>
                  <span className="block text-xs text-slate-400 font-semibold uppercase tracking-wider">Property Status:</span>
                  <span className={`font-bold mt-1 block ${property.status === "sold" ? "text-rose-600 font-bold" : "text-slate-800 dark:text-slate-200"}`}>
                    {STATUS_LABELS[property.status] || "For Sale"}
                  </span>
                </div>
                {property.lot_size && (
                  <div>
                    <span className="block text-xs text-slate-400 font-semibold uppercase tracking-wider">Lot Size:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 mt-1 block">{property.lot_size}</span>
                  </div>
                )}
                {property.year_built && (
                  <div>
                    <span className="block text-xs text-slate-400 font-semibold uppercase tracking-wider">Year Built:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 mt-1 block">{property.year_built}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 2. DESCRIPTION */}
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
              <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/10 pb-4">
                Description
              </h2>
              <div className="mt-6 text-base text-slate-700 dark:text-slate-300 leading-relaxed space-y-4">
                <p className="whitespace-pre-line">{property.description}</p>
              </div>
            </div>

            {/* 3. ADDRESS SECTION */}
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
              <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/10 pb-4">
                Address
              </h2>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
                <div>
                  <span className="block text-xs text-slate-400 font-semibold uppercase tracking-wider">Address:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 mt-1 block">{property.address}</span>
                </div>
                <div>
                  <span className="block text-xs text-slate-400 font-semibold uppercase tracking-wider">City:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 mt-1 block">{property.city}</span>
                </div>
                <div>
                  <span className="block text-xs text-slate-400 font-semibold uppercase tracking-wider">Country:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 mt-1 block">United States</span>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/10">
                <a
                  href={`http://maps.google.com/?q=${encodeURIComponent(`${property.address}, ${property.city}, ${property.state}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#B38B59] hover:underline uppercase tracking-wider"
                >
                  Open In Google Maps <ExternalLink className="size-3.5" />
                </a>
              </div>
            </div>

            {/* 4. DETAILS & FEATURES */}
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
              <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/10 pb-4">
                Details & Amenities
              </h2>
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm">
                <div>
                  <span className="block text-xs text-slate-400 font-semibold uppercase tracking-wider">Property ID:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 mt-1 block">{currentAdminPost.id.replace("prop-", "")}</span>
                </div>
                <div>
                  <span className="block text-xs text-slate-400 font-semibold uppercase tracking-wider">Bedrooms / Rooms:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 mt-1 block">{property.beds > 0 ? `${property.beds} Rooms` : "Commercial"}</span>
                </div>
                <div>
                  <span className="block text-xs text-slate-400 font-semibold uppercase tracking-wider">Bathrooms:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 mt-1 block">{Number(property.baths)}</span>
                </div>
                <div>
                  <span className="block text-xs text-slate-400 font-semibold uppercase tracking-wider">Garages:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 mt-1 block">{currentAdminPost.garageSpaces ? `${currentAdminPost.garageSpaces} Spaces` : "Attached"}</span>
                </div>
              </div>

              {property.features && property.features.length > 0 && (
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/10">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Features & Highlights</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {property.features.map((feat) => (
                      <div key={feat} className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                        <span className="size-2 rounded-full bg-[#0F172A]" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 5. INTERACTIVE MAP */}
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
              <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/10 pb-4">
                Location Map
              </h2>
              <div className="mt-6">
                <PropertyMap />
              </div>
            </div>

            {/* 6. WHAT'S NEARBY (YELP) */}
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-4">
                <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
                  What's Nearby
                </h2>
                <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Verified Yelp Data</span>
              </div>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10">
                  <Utensils className="size-5 text-[#B38B59] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-900 dark:text-white">Fine Dining & Cafes</strong>
                    <span className="text-slate-500 dark:text-slate-400">Within 1.2 miles (Southington & Waterbury Center)</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10">
                  <GraduationCap className="size-5 text-[#B38B59] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-900 dark:text-white">Regional Schools & Academies</strong>
                    <span className="text-slate-500 dark:text-slate-400">Top-rated public & private schools (0.8 - 2.5 mi)</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10">
                  <Bus className="size-5 text-[#B38B59] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-900 dark:text-white">Transit & Express Corridors</strong>
                    <span className="text-slate-500 dark:text-slate-400">I-84 & Route 8 highway access within 5 minutes</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10">
                  <ShoppingBag className="size-5 text-[#B38B59] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-900 dark:text-white">Shopping Centers & Grocers</strong>
                    <span className="text-slate-500 dark:text-slate-400">Supermarkets, boutique shops, and banking (1.5 mi)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 7. MORTGAGE & PAYMENT CALCULATOR */}
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-4">
                <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
                  Payment Calculator
                </h2>
                <div className="text-right">
                  <span className="text-xs text-slate-400 font-semibold uppercase block">Est. Payment</span>
                  <span className="font-serif text-2xl font-bold text-[#B38B59]">${formatNumber(calculatedMonthly)} / mo</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Home Price ($)
                  </label>
                  <input
                    type="number"
                    value={homePrice}
                    onChange={(e) => setHomePrice(Number(e.target.value) || 0)}
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Down Payment ({downPaymentPercent}%)
                  </label>
                  <input
                    type="number"
                    value={downPaymentPercent}
                    onChange={(e) => setDownPaymentPercent(Number(e.target.value) || 0)}
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value) || 0)}
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Loan Term (Years)
                  </label>
                  <select
                    value={loanTermYears}
                    onChange={(e) => setLoanTermYears(Number(e.target.value))}
                    className="w-full h-11 px-3 rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-800 text-sm font-semibold"
                  >
                    <option value={15}>15 Years Fixed</option>
                    <option value={20}>20 Years Fixed</option>
                    <option value={30}>30 Years Fixed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 8. SCHEDULE A TOUR SECTION */}
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
              <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/10 pb-4">
                Schedule a Tour
              </h2>

              <form onSubmit={handleTourSubmit} className="mt-6 space-y-6">
                {/* Horizontal Date Picker Tabs */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block mb-3">
                    Select Preferred Date
                  </label>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {tourDates.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedTourDate(idx)}
                        className={`flex flex-col items-center justify-center min-w-[72px] py-3 px-2 rounded-xl border transition-all cursor-pointer ${
                          selectedTourDate === idx
                            ? "bg-[#0F172A] text-white border-[#C5A880] shadow-md"
                            : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-[#C5A880]/50"
                        }`}
                      >
                        <span className="text-xs font-semibold uppercase">{item.day}</span>
                        <span className="text-lg font-bold">{item.date}</span>
                        <span className="text-[10px] uppercase font-medium">{item.month}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Slot & Type Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Time Slot
                    </label>
                    <select
                      value={selectedTourTime}
                      onChange={(e) => setSelectedTourTime(e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-800 text-sm font-semibold"
                    >
                      <option value="10:00 am">10:00 am</option>
                      <option value="10:30 am">10:30 am</option>
                      <option value="11:00 am">11:00 am</option>
                      <option value="11:30 am">11:30 am</option>
                      <option value="12:00 pm">12:00 pm</option>
                      <option value="01:00 pm">01:00 pm</option>
                      <option value="02:00 pm">02:00 pm</option>
                      <option value="03:30 pm">03:30 pm</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Tour Format
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setTourType("in_person")}
                        className={`h-11 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                          tourType === "in_person"
                            ? "bg-[#0F172A] text-white border-[#0F172A] shadow-sm"
                            : "bg-[#FAF8F5] border-[#EAE6DF] text-slate-700 hover:bg-[#F3F0EA]"
                        }`}
                      >
                        In Person Tour
                      </button>
                      <button
                        type="button"
                        onClick={() => setTourType("video_chat")}
                        className={`h-11 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                          tourType === "video_chat"
                            ? "bg-[#0F172A] text-white border-[#0F172A] shadow-sm"
                            : "bg-[#FAF8F5] border-[#EAE6DF] text-slate-700 hover:bg-[#F3F0EA]"
                        }`}
                      >
                        <Video className="size-3.5" /> Virtual Tour
                      </button>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input
                    required
                    type="text"
                    placeholder="Your Name"
                    value={tourName}
                    onChange={(e) => setTourName(e.target.value)}
                    className="h-11 px-3.5 rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] text-sm font-medium text-slate-900 placeholder:text-slate-400"
                  />
                  <input
                    required
                    type="email"
                    placeholder="Your Email"
                    value={tourEmail}
                    onChange={(e) => setTourEmail(e.target.value)}
                    className="h-11 px-3.5 rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] text-sm font-medium text-slate-900 placeholder:text-slate-400"
                  />
                  <input
                    required
                    type="tel"
                    placeholder="Your Phone"
                    value={tourPhone}
                    onChange={(e) => setTourPhone(e.target.value)}
                    className="h-11 px-3.5 rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] text-sm font-medium text-slate-900 placeholder:text-slate-400"
                  />
                </div>

                <textarea
                  rows={3}
                  value={tourNotes}
                  onChange={(e) => setTourNotes(e.target.value)}
                  placeholder="Additional notes or questions for the broker..."
                  className="w-full p-3.5 rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] text-sm font-medium text-slate-900 placeholder:text-slate-400"
                />

                <Button
                  type="submit"
                  disabled={tourSubmitting}
                  className="w-full h-12 bg-[#0F172A] hover:bg-[#1E293B] text-white text-sm font-semibold uppercase tracking-wider shadow-md rounded-xl transition-all"
                >
                  {tourSubmitting ? "Submitting Tour Request..." : "Confirm & Schedule Viewing"}
                </Button>
              </form>
            </div>
          </div>

          {/* RIGHT 4 COLUMNS: AGENT SIDEBAR & INQUIRY */}
          <div className="space-y-8 lg:col-span-4 sticky top-24">
            {/* AGENT CARD */}
            <div className="rounded-2xl border border-[#EAE6DF] bg-white p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-4 border-b border-[#EAE6DF] pb-5">
                <img
                  src="/wp-content/uploads/Sharif-Photo.jpg"
                  onError={withImageFallback}
                  alt="Majeed Sharif"
                  className="size-16 rounded-2xl object-cover border-2 border-[#C5A880] shadow-sm"
                />
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#0F172A]">
                    Majeed Sharif
                  </h3>
                  <p className="text-xs text-slate-500">Principal Broker &amp; Founder</p>
                  <p className="text-[11px] font-semibold text-[#B38B59] mt-0.5">
                    CT REB.0792811 / MA 952104
                  </p>
                </div>
              </div>

              {/* Direct Buttons */}
              <div className="space-y-2.5">
                <Button
                  asChild
                  className="w-full h-11 bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold text-xs uppercase tracking-wider shadow-sm rounded-xl"
                >
                  <a href={`tel:${SITE.phone.replace(/\D/g, "")}`}>
                    <Phone className="size-4 mr-2 text-[#C5A880]" /> Direct: {SITE.phone}
                  </a>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="w-full h-11 border border-[#EAE6DF] hover:bg-[#F3F0EA] text-[#0F172A] font-semibold text-xs uppercase tracking-wider rounded-xl transition-colors"
                >
                  <a href={whatsappHref()} target="_blank" rel="noopener noreferrer">
                    WhatsApp Advisory
                  </a>
                </Button>
              </div>

              {/* Quick Contact Form */}
              <div className="pt-4 border-t border-[#EAE6DF] space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-widest text-[#B38B59]">
                  Direct Inquiries
                </h4>
                <div className="text-xs text-slate-600">
                  Email: <a href="mailto:SharifRealty19@gmail.com" className="text-[#0F172A] font-semibold hover:text-[#B38B59]">SharifRealty19@gmail.com</a>
                </div>
                <div className="text-xs text-slate-600">
                  Office: <span className="text-slate-800 font-medium">3125 North Main St, Waterbury, CT</span>
                </div>
              </div>
            </div>

            {/* CURRENCY & UNIT WIDGET */}
            <div className="rounded-2xl border border-[#EAE6DF] bg-white p-5 shadow-sm space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span>Currency:</span>
                <span className="font-bold text-[#0F172A]">USD ($)</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Measurement Unit:</span>
                <span className="font-bold text-[#0F172A]">Square Feet (ft²)</span>
              </div>
            </div>
          </div>
        </div>

        {/* SIMILAR LISTINGS SECTION */}
        {similarProperties.length > 0 && (
          <div className="mt-20 pt-12 border-t border-slate-200 dark:border-white/10">
            <div className="mb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-[#B38B59]">
                Explore More
              </span>
              <h2 className="mt-1 font-serif text-3xl font-bold text-slate-900 dark:text-white">
                Similar Properties in Connecticut
              </h2>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2">
              {similarProperties.map((prop) => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
