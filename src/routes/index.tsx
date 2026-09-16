import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Mail,
  MapPin,
  Phone,
  SlidersHorizontal,
  Sparkles,
  Calendar,
  User,
  Shield,
  Star,
  Building,
  Home as HomeIcon,
  Briefcase,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PropertyMap } from "@/components/property-map";
import { useAdmin } from "@/lib/admin-store";
import { listProperties, listReviews, listCaseStudies } from "@/lib/public.functions";
import { FULL_ADDRESS, SITE, whatsappHref, directionsHref, googleMapsUrl } from "@/lib/site";
import { OFFICIAL_MEDIA } from "@/lib/media";
import { toast } from "sonner";

const homeQuery = queryOptions({
  queryKey: ["home"],
  queryFn: async () => {
    try {
      const [featured, reviews, caseStudies] = await Promise.all([
        listProperties({ data: { featuredOnly: true, limit: 9 } }),
        listReviews(),
        listCaseStudies(),
      ]);
      return {
        featured: featured.properties,
        reviews: reviews.reviews,
        caseStudies: caseStudies.caseStudies,
      };
    } catch {
      return {
        featured: [],
        reviews: [],
        caseStudies: [],
      };
    }
  },
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Sharif Realty | Real Estate & Business Sales in Connecticut & Massachusetts",
      },
      {
        name: "description",
        content:
          "With over 35 years of experience in residential, commercial, and business real estate, Sharif Realty Group makes buying and selling seamless across CT & MA.",
      },
      { property: "og:title", content: "Sharif Realty Group · 35+ Years of Excellence" },
      {
        property: "og:description",
        content:
          "Find your perfect residential, commercial, or business property in Connecticut and Massachusetts. Led by Principal Broker Majeed Sharif.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const HERO_SLIDES = [
  {
    image: OFFICIAL_MEDIA.slider1,
    title: "The Epitome of Private Luxury &",
    subtitle: "Commercial Real Estate",
    tagline: "Over 35 Years of Trusted Real Estate & Business Sales Mastery across Connecticut & Massachusetts",
  },
  {
    image: OFFICIAL_MEDIA.slider2,
    title: "Exclusive Bespoke Estates Tailored",
    subtitle: "To Your Lifestyle",
    tagline: "Curated Luxury Estates, Waterfront Havens & Prime Commercial Assets",
  },
  {
    image: OFFICIAL_MEDIA.slider3,
    title: "Fiduciary Guidance You Can Trust.",
    subtitle: "Properties You’ll Cherish",
    tagline: "Dedicated Brokerage Advisory With Guaranteed 15-Minute Priority Response",
  },
];

const HELP_FIND_CARDS = [
  {
    icon: OFFICIAL_MEDIA.rent,
    title: "Rent a Luxury Residence",
    description:
      "Explore curated luxury apartments, penthouses, and executive rental estates across CT & MA.",
    link: "/properties?type=rent",
  },
  {
    icon: OFFICIAL_MEDIA.forSale,
    title: "Sell or List Your Property",
    description:
      "Maximize your asset's valuation with bespoke international marketing and seasoned negotiation.",
    link: "/add-listing",
  },
  {
    icon: OFFICIAL_MEDIA.newHouse,
    title: "Acquire a New Estate",
    description:
      "Discover off-market residential, commercial acreage, and investment portfolios tailored to you.",
    link: "/properties?type=buy",
  },
];

const TESTIMONIALS_DATA = [
  {
    id: 1,
    name: "Robert Thompson",
    role: "CEO, Thompson Enterprises",
    avatar: OFFICIAL_MEDIA.client1,
    quote:
      "\"Working with Sharif Realty was an absolute pleasure. Their team's expertise and dedication helped us acquire the perfect commercial asset for our expanding business portfolio. Seamless from start to finish.\"",
  },
  {
    id: 2,
    name: "Jennifer Williams",
    role: "Luxury Interior Designer",
    avatar: OFFICIAL_MEDIA.client2,
    quote:
      "\"I've worked with several real estate brokerages, but none compare to the level of discretion and attention to detail that Sharif Realty delivers. They found us a residence that exceeded every expectation.\"",
  },
  {
    id: 3,
    name: "David & Sarah Johnson",
    role: "Estate Homeowners",
    avatar: OFFICIAL_MEDIA.client1,
    quote:
      "\"When we decided to sell our estate home of 20 years, we needed trusted guidance. Majeed Sharif and his team secured a buyer above asking price in two weeks. Truly remarkable execution.\"",
  },
];

const DEFAULT_BLOG_IMAGE = "/wp-content/themes/wpresidence/img/defaults/default_property_listings.jpg";

const BLOGS_DATA = [
  {
    id: "b1",
    title: "Off Market 4 bed 3 bath 1,724sqft 1,724 square feet 12 Rockledge Dr, Berlin, CT 06037",
    date: "January 25, 2026",
    image: DEFAULT_BLOG_IMAGE,
    link: "/blogs/off-market-4-bed-3-bath-1724sqft-1724-square-fe",
  },
  {
    id: "b2",
    title: "Off Market 2 bed 2.5 bath 1,400sqft 1,400 square feet 270 New Britain Rd Unit 20, Berlin, CT 06037",
    date: "January 25, 2026",
    image: DEFAULT_BLOG_IMAGE,
    link: "/blogs/off-market-2-bed-2-5-bath-1400sqft-1400-square-",
  },
  {
    id: "b3",
    title: "Off Market 4 bed 2.5 bath 3,239sqft 3,239 square feet 5 Shire Way, Burlington, CT 06013",
    date: "January 25, 2026",
    image: DEFAULT_BLOG_IMAGE,
    link: "/blogs/off-market-4-bed-2-5-bath-3239sqft-3239-square-",
  },
  {
    id: "b4",
    title: "Off Market 3 bed 3 bath 1,184sqft 1,184 square feet 1205 Farmington Ave, Berlin, CT 06037",
    date: "January 25, 2026",
    image: DEFAULT_BLOG_IMAGE,
    link: "/blogs/off-market-3-bed-3-bath-1184sqft-1184-square-fe",
  },
  {
    id: "b5",
    title: "Update on Prime Market Trends & Off-Market Listings",
    date: "January 21, 2026",
    image: DEFAULT_BLOG_IMAGE,
    link: "/blogs/update",
  },
  {
    id: "b6",
    title: "Latest News & Economic Insights From NAR",
    date: "December 26, 2025",
    image: DEFAULT_BLOG_IMAGE,
    link: "/blogs/latest-news-from-nar-2",
  },
];

const FEATURED_PROPERTIES_DATA = [
  {
    id: "31948",
    title: "Waterbury Connecticut Luxury Estate",
    slug: "waterbury-connecticut",
    address: "Southington Ct",
    city: "Southington Ct",
    state: "CT",
    category: "Residential",
    tag: "Exclusive",
    rooms: 3,
    idLabel: "31948",
    price: "Price upon Request",
    image: OFFICIAL_MEDIA.waterbury,
    agentName: "Majeed Sharif",
  },
  {
    id: "31207",
    title: "Commercial Investment Facility At North Main St",
    slug: "commercial-property-at-north-main-st-waterbury",
    address: "North Main St Waterbury",
    city: "North Main St Waterbury",
    state: "CT",
    category: "Commercial",
    tag: "Prime Commercial",
    rooms: 0,
    idLabel: "31207",
    price: "Price upon Call",
    image: OFFICIAL_MEDIA.commercial,
    agentName: "Majeed Sharif",
  },
  {
    id: "31073",
    title: "Single Family Executive Estate (4 Bed / 3 Bath)",
    slug: "single-family-4-bedrooms-3-baths",
    address: "East Hartford",
    city: "East Hartford",
    state: "CT",
    category: "Residential",
    tag: "For Sale",
    rooms: 4,
    idLabel: "31073",
    price: "Price upon Call",
    image: OFFICIAL_MEDIA.thendara,
    agentName: "Majeed Sharif",
  },
  {
    id: "32120",
    title: "Another Property Sold - 3 Bedrooms 1.5 Bath",
    slug: "another-property-sold-3-bedrooms-1-5-bath-waterbury-ct",
    address: "Waterbury",
    city: "Waterbury",
    state: "CT",
    category: "Residential",
    tag: "SOLD",
    rooms: 3,
    idLabel: "32120",
    price: "SOLD",
    image: "/wp-content/uploads/waterbury-3bed-1halfbath-sold.jpg",
    agentName: "Majeed Sharif",
  },
  {
    id: "32121",
    title: "Commercial Property 350 S Main St Cheshire CT",
    slug: "commercial-property-350-s-main-st-cheshire-ct-sold",
    address: "350 S Main St",
    city: "Cheshire",
    state: "CT",
    category: "Commercial",
    tag: "SOLD · BUYER REP",
    rooms: 0,
    idLabel: "32121",
    price: "SOLD",
    image: "/wp-content/uploads/350-south-main-cheshire-sold.jpg",
    agentName: "Sharif Realty Group",
  },
  {
    id: "32122",
    title: "Commercial Plaza 550 North Main St Southington CT",
    slug: "commercial-property-550-north-main-st-southington-ct-sold",
    address: "550 North Main St",
    city: "Southington",
    state: "CT",
    category: "Commercial",
    tag: "SOLD · BUYER REP",
    rooms: 0,
    idLabel: "32122",
    price: "SOLD",
    image: "/wp-content/uploads/550-north-main-southington-sold.jpg",
    agentName: "Sharif Realty Group",
  },
];

export function HomePage() {
  const { posts: adminPosts, blogPosts, addLead } = useAdmin();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Dynamic Real-time Featured Properties from Admin Store
  const featuredProperties = (adminPosts && adminPosts.length > 0 ? adminPosts : FEATURED_PROPERTIES_DATA)
    .slice(0, 6)
    .map((p: any) => {
      const isSold =
        p.propertyStatus === "sold" ||
        p.status === "sold" ||
        p.priceLabel === "Sold" ||
        p.priceLabel?.toLowerCase().includes("sold");
      const isPending =
        p.propertyStatus === "pending" || p.propertyStatus === "under_contract";
      const tag = isSold
        ? p.priceLabel?.includes("Buyer")
          ? "SOLD · BUYER REP"
          : "SOLD"
        : isPending
        ? "UNDER CONTRACT"
        : p.category || "EXCLUSIVE";
      const displayPrice = isSold
        ? "SOLD"
        : isPending
        ? "Under Contract"
        : p.priceLabel ||
          (p.price && Number(p.price) > 0
            ? `$${Number(p.price).toLocaleString()}`
            : "Price on Call");

      return {
        id: p.id,
        title: p.title,
        slug: p.slug,
        address: p.address || p.city || "Connecticut",
        city: p.city || "Connecticut",
        state: p.state || "CT",
        category: p.category || "Residential",
        tag,
        rooms: p.beds ?? 3,
        idLabel: String(p.id).replace("prop-", ""),
        price: displayPrice,
        image: p.image || (p.images && p.images[0]) || OFFICIAL_MEDIA.waterbury,
        agentName: p.author || "Majeed Sharif",
      };
    });

  // Dynamic Real-time Blog Articles from Admin Store
  const latestArticles = (blogPosts && blogPosts.length > 0 ? blogPosts : BLOGS_DATA)
    .slice(0, 3)
    .map((post: any) => {
      const isExternal =
        post.slug?.startsWith("http://") ||
        post.slug?.startsWith("https://") ||
        (Boolean(post.sourceUrl) && !post.content);
      const externalUrl = post.slug?.startsWith("http") ? post.slug : post.sourceUrl;
      return {
        id: post.id,
        title: post.title,
        date: post.date,
        image:
          (post.coverImage && post.coverImage.trim()) ||
          (post.galleryImages && post.galleryImages[0]) ||
          post.image ||
          DEFAULT_BLOG_IMAGE,
        link: post.slug ? `/blogs/${post.slug}` : post.link || `/blogs/${post.id}`,
        isExternal,
        externalUrl,
        author: post.author || "Majeed Sharif",
        category: post.category || "Market Report",
        readTime: post.readTime || "3 min read",
      };
    });

  // Search form state
  const [searchLocation, setSearchLocation] = useState("");
  const [searchType, setSearchType] = useState("all");
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  // Contact Form state
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    interest: "Buying a Property",
    message: "",
    newsletter: true,
  });
  const [sendingMessage, setSendingMessage] = useState(false);

  // Scroll position for subtle parallax
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Automatic hero slider cycle
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSendingMessage(true);

    // Register lead in CRM store in real-time
    addLead({
      name: contactForm.name.trim(),
      email: contactForm.email.trim(),
      phone: contactForm.phone.trim() || "(203) 802-8099",
      property: contactForm.interest || "Homepage Consultation Inquiry",
      message: contactForm.message.trim() || "Consultation request from homepage form.",
      status: "New",
      agent: "Majeed Sharif",
    });

    setTimeout(() => {
      setSendingMessage(false);
      toast.success("Thank you! Your inquiry has been submitted to Majeed Sharif.", {
        description: "We provide bespoke advisory with a guaranteed 15-minute response.",
      });
      setContactForm({
        name: "",
        email: "",
        phone: "",
        interest: "Buying a Property",
        message: "",
        newsletter: true,
      });
    }, 400);
  };

  const activeSlide = (HERO_SLIDES[currentSlide % HERO_SLIDES.length] || HERO_SLIDES[0]) as (typeof HERO_SLIDES)[number];

  return (
    <div className="overflow-x-hidden bg-[#FAF8F5] text-[#1E293B]">
      {/* 1. ALLYS-INSPIRED LUXURY HERO SLIDER BANNER */}
      <section className="relative h-[82vh] min-h-[600px] max-h-[880px] w-full overflow-hidden bg-[#0F172A] flex items-center justify-center">
        {/* Background Image Carousel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0, ease: "easeOut" }}
            className="absolute inset-0 size-full"
            style={{
              transform: `translateY(${scrollY * 0.15}px)`,
            }}
          >
            <img
              src={activeSlide.image}
              alt={activeSlide.title}
              className="size-full object-cover object-center"
              fetchPriority="high"
            />
            {/* Ultra-clear gradient scrim for maximum image clarity and sharpness */}
            <div className="absolute inset-0 bg-black/15 bg-gradient-to-t from-black/50 via-transparent to-black/25" />
          </motion.div>
        </AnimatePresence>

        {/* Hero Text Overlay (Transparent container so pictures are completely clear) */}
        <div className="relative z-20 mx-auto w-full max-w-5xl px-4 text-center text-white sm:px-6">
          <motion.div
            key={`text-${currentSlide}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-4 py-4"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/40 px-4 py-1.5 backdrop-blur-md shadow-sm">
              <Sparkles className="size-3.5 text-[#E5CCA8]" />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-[#E5CCA8] drop-shadow-sm">
                Sharif Realty Group · Connecticut &amp; Massachusetts
              </span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.14] drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
              {activeSlide.title}
              <span className="block text-[#E5CCA8] mt-1 font-serif italic font-normal drop-shadow-[0_4px_14px_rgba(0,0,0,0.9)]">
                {activeSlide.subtitle}
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-sm sm:text-base text-slate-100 font-medium leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
              {activeSlide.tagline}
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Button
                asChild
                className="h-12 bg-[#C5A880] hover:bg-[#B39369] text-[#0F172A] px-8 text-sm font-bold uppercase tracking-wider shadow-2xl transition-transform hover:scale-105 rounded-xl cursor-pointer"
              >
                <Link to="/properties">
                  View All Listings <ArrowRight className="size-4 ml-2" />
                </Link>
              </Button>

              <Button
                asChild
                className="h-12 border border-white/60 bg-black/40 hover:bg-white text-white hover:text-[#0F172A] px-7 text-sm font-semibold backdrop-blur-md rounded-xl cursor-pointer transition-all shadow-xl"
              >
                <Link to="/contact">
                  <Phone className="size-4 mr-2 text-[#E5CCA8]" />
                  Direct Consultation
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Carousel Prev/Next Arrows */}
        <button
          type="button"
          onClick={() =>
            setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
          }
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 size-11 rounded-full bg-black/40 hover:bg-[#C5A880] hover:text-[#0F172A] text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer"
          aria-label="Previous slide"
        >
          <ChevronLeft className="size-6" />
        </button>

        <button
          type="button"
          onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 size-11 rounded-full bg-black/40 hover:bg-[#C5A880] hover:text-[#0F172A] text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer"
          aria-label="Next slide"
        >
          <ChevronRight className="size-6" />
        </button>

        {/* Slide indicator dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                currentSlide === idx ? "w-8 bg-[#C5A880]" : "w-2 bg-white/40"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* 2. FLOATING ALLYS LUXURY SEARCH & FILTER BAR */}
      <section className="relative z-30 -mt-10 mx-auto w-full max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-[#EAE6DF] bg-white p-6 sm:p-8 shadow-xl shadow-black/5"
        >
          <div className="text-center space-y-1 pb-6 border-b border-[#EAE6DF]">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#B38B59]">
              Curated Real Estate Search
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F172A]">
              Discover Your Next Property
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Exclusive properties tailored to your sophisticated lifestyle &amp; investment goals
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = `/properties?q=${encodeURIComponent(searchLocation)}&type=${searchType}`;
            }}
            className="mt-6 space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-end">
              {/* Location */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#C5A880]" />
                  <Input
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    placeholder="(City, Address, ZIP)"
                    className="pl-9 h-11 border-[#EAE6DF] bg-[#FAF8F5] text-sm rounded-xl"
                  />
                </div>
              </div>

              {/* Property Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Property Type
                </label>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
                >
                  <option value="all">All Property Types</option>
                  <option value="residential">Residential Estates</option>
                  <option value="commercial">Commercial Investments</option>
                  <option value="business">Business Opportunities</option>
                </select>
              </div>

              {/* Price Range */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Price Range
                </label>
                <select
                  className="w-full h-11 px-3 rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
                >
                  <option value="any">Price Range (Any)</option>
                  <option value="0-300000">$0 – $300,000</option>
                  <option value="300000-600000">$300,000 – $600,000</option>
                  <option value="600000-1000000">$600,000 – $1,000,000</option>
                  <option value="1000000+">$1,000,000+</option>
                </select>
              </div>

              {/* Submit Button */}
              <div>
                <Button
                  type="submit"
                  className="w-full h-11 bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold text-sm shadow-sm rounded-xl cursor-pointer"
                >
                  Search Portfolio
                </Button>
              </div>
            </div>

            {/* Toggle More Search Options */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowMoreOptions(!showMoreOptions)}
                className="text-xs font-semibold text-[#B38B59] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <SlidersHorizontal className="size-3.5" />
                {showMoreOptions ? "Fewer Search Options" : "Advanced Amenities & Filters"}
              </button>

              {showMoreOptions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 pt-4 border-t border-[#EAE6DF] grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3"
                >
                  {[
                    "Waterfront View",
                    "Central Air",
                    "Private Pool",
                    "Acreage / Land",
                    "Attached Garage",
                    "High Ceilings",
                  ].map((amenity) => (
                    <label
                      key={amenity}
                      className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        className="rounded border-[#EAE6DF] text-[#C5A880] focus:ring-[#C5A880]"
                      />
                      <span>{amenity}</span>
                    </label>
                  ))}
                </motion.div>
              )}
            </div>
          </form>
        </motion.div>
      </section>

      {/* 3. PURPOSE-DRIVEN SERVICES - 3-COLUMN DISCOVERY CARDS */}
      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto space-y-2"
        >
          <span className="rule-label">Bespoke Real Estate Services</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0F172A]">
            What Can We Help You Accomplish?
          </h2>
          <p className="text-sm text-slate-600">
            Select your ambition and let our 35+ years of seasoned brokerage expertise guide your transaction.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {HELP_FIND_CARDS.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="card-lift group rounded-2xl border border-[#EAE6DF] bg-white p-8 text-center shadow-sm hover:border-[#C5A880] flex flex-col items-center justify-between"
            >
              <div className="flex flex-col items-center">
                <div className="size-20 rounded-2xl bg-[#F3F0EA] p-4 flex items-center justify-center transition-transform group-hover:scale-110">
                  <img
                    src={card.icon}
                    alt={card.title}
                    className="size-12 object-contain"
                    loading="lazy"
                  />
                </div>

                <h3 className="mt-6 font-serif text-xl font-bold text-[#0F172A]">
                  {card.title}
                </h3>

                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  {card.description}
                </p>
              </div>

              <div className="mt-6 pt-4 w-full">
                <Button
                  asChild
                  className="w-full bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold text-xs rounded-xl"
                >
                  <Link to={card.link}>
                    Get Started <ArrowRight className="size-3.5 ml-1.5" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. BROKERAGE EXCELLENCE - MAJEED SHARIF PROFILE */}
      <section className="bg-[#F3F0EA]/60 py-20 sm:py-28 border-y border-[#EAE6DF] relative overflow-hidden">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <span className="rule-label">Welcome To Sharif Realty</span>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0F172A] leading-tight">
                  Over 35 Years of Fiduciary Trust &amp; Market Leadership
                </h2>
              </div>

              <p className="text-base text-slate-700 leading-relaxed">
                Whether you’re seeking a luxury waterfront estate, a high-performing commercial building, or off-market land developments across Connecticut and Massachusetts, Sharif Realty Group offers white-glove advisory from consultation to closing.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-white border border-[#EAE6DF]">
                  <div className="font-serif text-2xl font-bold text-[#B38B59]">35+ Years</div>
                  <p className="text-xs text-slate-600 mt-0.5">Proven transactional track record in CT &amp; MA</p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-[#EAE6DF]">
                  <div className="font-serif text-2xl font-bold text-[#B38B59]">100% Client Focus</div>
                  <p className="text-xs text-slate-600 mt-0.5">Fiduciary excellence and private discretion</p>
                </div>
              </div>

              {/* Direct Phone & Email Bar with Champagne Gold Badges */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <a
                  href={SITE.phoneHref}
                  className="flex items-center gap-2.5 text-base font-bold text-[#0F172A] hover:text-[#B38B59] transition-colors"
                >
                  <div className="size-10 rounded-full bg-[#C5A880]/15 flex items-center justify-center text-[#B38B59]">
                    <Phone className="size-4" />
                  </div>
                  <span>{SITE.phoneDisplay}</span>
                </a>

                <a
                  href={`mailto:${SITE.email}`}
                  className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 hover:text-[#B38B59] transition-colors"
                >
                  <div className="size-10 rounded-full bg-[#C5A880]/15 flex items-center justify-center text-[#B38B59]">
                    <Mail className="size-4" />
                  </div>
                  <span>{SITE.email}</span>
                </a>
              </div>

              <div className="pt-4">
                <Button
                  asChild
                  className="h-12 bg-[#0F172A] hover:bg-[#1E293B] text-white px-8 text-sm font-semibold uppercase tracking-wider rounded-xl shadow-md cursor-pointer"
                >
                  <Link to="/about">
                    Read More About Me <ArrowRight className="size-4 ml-2 text-[#C5A880]" />
                  </Link>
                </Button>
              </div>
            </motion.div>

            {/* Right Photo */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative mx-auto w-full max-w-md lg:max-w-none flex justify-center"
            >
              <div className="relative group rounded-3xl overflow-hidden shadow-2xl border-4 border-white max-w-[380px] aspect-[4/5] bg-slate-950">
                <img
                  src={OFFICIAL_MEDIA.agent}
                  alt="Majeed Sharif - Principal Broker"
                  className="size-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/90 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                  <span className="inline-block px-3 py-1 rounded-full bg-[#C5A880] text-[#0F172A] text-[10px] font-bold uppercase tracking-wider">
                    35+ Years Master Broker
                  </span>
                  <h4 className="font-serif text-2xl font-bold">Majeed Sharif</h4>
                  <p className="text-xs text-slate-300">Principal Broker &amp; Founder</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. FEATURED PROPERTIES GRID SECTION */}
      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto space-y-2"
        >
          <span className="rule-label">Curated Selection</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0F172A]">
            Featured Property Collection
          </h2>
          <p className="text-sm text-slate-600">
            Discover our handpicked portfolio of exclusive residences and commercial developments.
          </p>
        </motion.div>

        {/* Property Cards Grid */}
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProperties.map((prop, idx) => (
            <motion.div
              key={prop.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.12 }}
              className="card-lift group rounded-2xl border border-[#EAE6DF] bg-white overflow-hidden shadow-sm hover:border-[#C5A880] flex flex-col justify-between"
            >
              <div>
                {/* Image Container */}
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
                  <img
                    src={prop.image}
                    alt={prop.title}
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span
                      className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full backdrop-blur-md border ${
                        prop.tag.includes("SOLD")
                          ? "bg-rose-600/95 text-white border-rose-400/40 shadow-sm"
                          : "bg-[#0F172A]/85 text-white border-white/15"
                      }`}
                    >
                      {prop.tag}
                    </span>
                  </div>
                </div>

                {/* Info Container */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#B38B59] uppercase tracking-widest">
                      {prop.category}
                    </span>
                    <span
                      className={`font-serif text-lg font-bold ${
                        prop.price === "SOLD" ? "text-rose-600" : "text-[#0F172A]"
                      }`}
                    >
                      {prop.price}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-[#0F172A] line-clamp-1 group-hover:text-[#B38B59] transition-colors">
                    <Link to="/properties/$id" params={{ id: prop.slug }}>
                      {prop.title}
                    </Link>
                  </h3>

                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="size-3.5 text-[#C5A880] shrink-0" />
                    <span>{prop.address}, {prop.city}</span>
                  </p>
                </div>
              </div>

              {/* Card Footer with Agent Profile */}
              <div className="px-6 pb-6 pt-3 border-t border-[#EAE6DF] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-full overflow-hidden border border-[#C5A880]/50">
                    <img src={OFFICIAL_MEDIA.agent} alt={prop.agentName} className="size-full object-cover" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700">
                    {prop.agentName}
                  </span>
                </div>

                <Link
                  to="/properties/$id"
                  params={{ id: prop.slug }}
                  className="text-xs font-semibold text-[#0F172A] group-hover:text-[#B38B59] flex items-center gap-1 transition-colors"
                >
                  View Details <ArrowRight className="size-3" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button
            asChild
            className="h-12 bg-[#0F172A] hover:bg-[#1E293B] text-white px-8 text-sm font-semibold uppercase tracking-wider rounded-xl shadow-sm"
          >
            <Link to="/properties">
              View All Listings <ArrowRight className="size-4 ml-2 text-[#C5A880]" />
            </Link>
          </Button>
        </div>
      </section>

      {/* 6. WHAT OUR CLIENTS SAY - VERIFIED REVIEWS SECTION */}
      <section className="bg-[#0B1120] text-white py-20 sm:py-28 relative overflow-hidden">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto space-y-2"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-[#C5A880]">Client Endorsements</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              Reputation Built on Proven Results
            </h2>
            <p className="text-sm text-slate-400">
              Read direct testimonials from residential estate owners, investors, and commercial clients.
            </p>
          </motion.div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {TESTIMONIALS_DATA.map((t, idx) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-xl space-y-5 flex flex-col justify-between backdrop-blur-md"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="size-14 rounded-full border-2 border-[#C5A880] object-cover"
                      loading="lazy"
                    />
                    <div>
                      <h3 className="font-serif text-base font-bold text-white">{t.name}</h3>
                      <p className="text-xs text-slate-400">{t.role}</p>
                    </div>
                  </div>

                  {/* 5-Star Rating */}
                  <div className="flex items-center gap-1 text-[#C5A880]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="size-4 fill-current" />
                    ))}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                    {t.quote}
                  </p>
                </div>

                <div className="pt-2 text-right">
                  <span className="text-[11px] font-semibold text-[#C5A880] uppercase tracking-wider">
                    Verified Advisory Client
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button
              asChild
              className="h-11 border border-[#C5A880]/50 bg-white/5 hover:bg-[#C5A880] text-white hover:text-[#0F172A] font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
            >
              <Link to="/about">Explore Brokerage Heritage</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 7. REAL-TIME INTERACTIVE GOOGLE MAP */}
      <section className="bg-[#FAF8F5] py-20 border-y border-[#EAE6DF]">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8 flex flex-wrap items-end justify-between gap-4"
          >
            <div>
              <span className="rule-label">Regional Presence</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0F172A] mt-1">
                Connecticut &amp; Massachusetts Coverage
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Explore active luxury and commercial listings across key regional markets.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#B38B59]">
              <span className="size-2 rounded-full bg-[#C5A880] animate-ping" />
              <span>Sharif Realty Exclusive Listings</span>
            </div>
          </motion.div>

          <PropertyMap />
        </div>
      </section>

      {/* 8. EDITORIAL BLOGS & MARKET NEWS */}
      <section className="bg-white py-20 border-b border-[#EAE6DF]">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 flex flex-wrap items-end justify-between gap-4"
          >
            <div>
              <span className="rule-label">Market Intelligence</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0F172A] mt-1">
                Latest Articles &amp; Market Insights
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Off-market opportunities, sold property analyses, and luxury market updates.
              </p>
            </div>

            <Button
              asChild
              variant="outline"
              className="border-[#EAE6DF] hover:bg-[#F3F0EA] text-[#0F172A] font-semibold text-xs uppercase tracking-wider rounded-xl"
            >
              <Link to="/blogs">
                View All Articles <ArrowRight className="size-3.5 ml-1.5 text-[#B38B59]" />
              </Link>
            </Button>
          </motion.div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {latestArticles.map((post, idx) => {
              const cardContent = (
                <>
                  <div>
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = DEFAULT_BLOG_IMAGE;
                        }}
                      />
                      <span className="absolute top-3 left-3 rounded-full bg-[#0F172A]/85 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm border border-white/15">
                        {post.category || "Market Report"}
                      </span>
                      {post.isExternal && (
                        <span className="absolute top-3 right-3 rounded-full bg-[#B38B59]/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm shadow">
                          External Link
                        </span>
                      )}
                    </div>

                    <div className="p-6 space-y-3">
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3.5 text-[#B38B59]" />
                          {post.date}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <User className="size-3.5 text-[#B38B59]" />
                          {post.author}
                        </span>
                      </div>

                      <h3 className="font-serif text-base font-bold text-[#0F172A] group-hover:text-[#B38B59] transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </h3>
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-3 border-t border-[#EAE6DF] flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#0F172A] group-hover:text-[#B38B59] flex items-center gap-1 transition-colors">
                      {post.isExternal ? (
                        <>
                          Open Article <ExternalLink className="size-3.5" />
                        </>
                      ) : (
                        <>
                          Read Article <ArrowRight className="size-3.5" />
                        </>
                      )}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {post.readTime || "3 min read"}
                    </span>
                  </div>
                </>
              );

              return (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="card-lift group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#EAE6DF] bg-white shadow-sm hover:border-[#C5A880]"
                >
                  {post.isExternal && post.externalUrl ? (
                    <a
                      href={post.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col h-full justify-between focus:outline-none"
                    >
                      {cardContent}
                    </a>
                  ) : (
                    <Link
                      to={post.link}
                      className="flex flex-col h-full justify-between focus:outline-none"
                    >
                      {cardContent}
                    </Link>
                  )}
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. GET IN TOUCH & OFFICE LOCATION MAP */}
      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          {/* Left Form */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <span className="rule-label">Inquiries &amp; Consultations</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0F172A]">
                Begin Your Consultation
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Connect directly with Principal Broker Majeed Sharif for private property viewings, valuations, or commercial portfolio strategies.
              </p>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Full Name
                  </label>
                  <Input
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="Your full name"
                    className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="Your email address"
                    className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  placeholder="Your phone number"
                  className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  I'm Interested In
                </label>
                <select
                  value={contactForm.interest}
                  onChange={(e) => setContactForm({ ...contactForm, interest: e.target.value })}
                  className="w-full h-11 px-3 rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
                >
                  <option value="Buying a Property">Acquiring a Luxury Property</option>
                  <option value="Selling a Property">Listing / Selling an Asset</option>
                  <option value="Renting a Property">Executive Rental Search</option>
                  <option value="Commercial Advisory">Commercial Portfolio Advisory</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Message Details
                </label>
                <textarea
                  rows={4}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  placeholder="Tell us about your property requirements or investment criteria..."
                  className="w-full p-3 rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
                />
              </div>

              <Button
                type="submit"
                disabled={sendingMessage}
                className="w-full h-12 bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold uppercase tracking-wider shadow-md rounded-xl transition-all cursor-pointer"
              >
                {sendingMessage ? "Submitting Inquiry..." : "Submit Consultation Request"}
              </Button>
            </form>
          </motion.div>

          {/* Right Live Google Map Office Embed */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border border-[#EAE6DF] bg-white p-4 shadow-xl overflow-hidden"
          >
            <div className="h-[460px] w-full rounded-xl overflow-hidden">
              <iframe
                title="Sharif Realty Office Map"
                src={googleMapsUrl(FULL_ADDRESS)}
                className="size-full border-0"
                loading="lazy"
              />
            </div>
            <div className="p-3 mt-2 flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1.5 font-semibold text-[#0F172A]">
                <MapPin className="size-4 text-[#B38B59]" />
                {FULL_ADDRESS}
              </span>
              <a
                href={directionsHref(FULL_ADDRESS)}
                target="_blank"
                rel="noreferrer noopener"
                className="text-[#B38B59] font-bold hover:underline"
              >
                Get Directions →
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
