import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Calendar,
  User,
  Tag,
  ArrowLeft,
  ArrowRight,
  Share2,
  Check,
  Phone,
  Mail,
  MessageSquare,
  Bed,
  Bath,
  Maximize2,
  CalendarDays,
  DollarSign,
  Car,
  Home,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Send,
  Building,
  Sparkles,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { useAdmin } from "@/lib/admin-store";
import { SEED_BLOG_POSTS_DATA } from "@/lib/database-seed";
import { PropertyCard } from "@/components/property-card";
import { SITE, whatsappHref } from "@/lib/site";
import { Button } from "@/components/ui/button";
import type { Property, BlogPost } from "@/lib/types";

export const Route = createFileRoute("/blogs/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Article | Sharif Realty Group` },
      {
        name: "description",
        content:
          "Exclusive property reports, market intelligence, and real estate insights by Sharif Realty Group.",
      },
    ],
  }),
  component: SingleBlogPage,
});

export function SingleBlogPage() {
  const { slug } = Route.useParams();
  const admin = useAdmin();
  const blogPosts = admin?.blogPosts && admin.blogPosts.length > 0 ? admin.blogPosts : SEED_BLOG_POSTS_DATA;
  const posts = admin?.posts && admin.posts.length > 0 ? admin.posts : [];

  // Active image index in gallery carousel
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  // Comment form state
  const [commentName, setCommentName] = useState("");
  const [commentEmail, setCommentEmail] = useState("");
  const [commentWebsite, setCommentWebsite] = useState("");
  const [commentMessage, setCommentMessage] = useState("");
  const [saveInfo, setSaveInfo] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [submittedComments, setSubmittedComments] = useState<
    Array<{ name: string; date: string; message: string }>
  >([]);

  // Sidebar contact form state
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [sendingInquiry, setSendingInquiry] = useState(false);

  // Find post in admin store or seed
  const cleanSlug = typeof slug === "string" ? slug.replace(/\/index\.html$/, "") : "";
  const currentIndex = blogPosts.findIndex((p) => p.slug === cleanSlug || p.id === cleanSlug || p.slug === slug || p.id === slug);
  const post: BlogPost = (currentIndex !== -1 ? blogPosts[currentIndex] : blogPosts[0]) || SEED_BLOG_POSTS_DATA[0];

  // Navigation Prev / Next
  const prevPost =
    currentIndex > 0 ? blogPosts[currentIndex - 1] : blogPosts[blogPosts.length - 1];
  const nextPost =
    currentIndex < blogPosts.length - 1 ? blogPosts[currentIndex + 1] : blogPosts[0];

  // Real-time blog traffic tracking: Increment view count on visit
  useEffect(() => {
    const postKey = post.slug || post.id;
    if (!postKey) return;
    const sessionKey = `sharif_blog_view_${postKey}`;
    if (typeof window !== "undefined" && !sessionStorage.getItem(sessionKey)) {
      sessionStorage.setItem(sessionKey, "1");
      if (admin && typeof admin.recordBlogPostView === "function") {
        admin.recordBlogPostView(postKey);
      }
    }
  }, [post.slug, post.id, admin]);

  // Gallery images array: Featured Cover Image takes primary precedence
  const images = useMemo(() => {
    const list: string[] = [];
    if (post.coverImage && typeof post.coverImage === "string" && post.coverImage.trim()) {
      list.push(post.coverImage);
    }
    if (post.galleryImages && post.galleryImages.length > 0) {
      for (const img of post.galleryImages) {
        if (img && typeof img === "string" && !list.includes(img)) {
          list.push(img);
        }
      }
    }
    if (list.length === 0) {
      list.push("/wp-content/themes/wpresidence/img/defaults/default_property_listings.jpg");
    }
    return list;
  }, [post.coverImage, post.galleryImages]);

  const activeImage = images[activeImageIndex] || images[0];

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator
        .share({
          title: post.title,
          text: post.excerpt,
          url,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Article link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName || !commentEmail || !commentMessage) {
      toast.error("Please fill in your Name, Email, and Comment message.");
      return;
    }
    setSubmittingComment(true);
    setTimeout(() => {
      setSubmittedComments((prev) => [
        ...prev,
        {
          name: commentName,
          date: new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          }),
          message: commentMessage,
        },
      ]);
      setCommentMessage("");
      setSubmittingComment(false);
      toast.success("Thank you! Your comment has been submitted successfully.");
    }, 600);
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName || !inquiryEmail) {
      toast.error("Please enter your Name and Email address.");
      return;
    }
    setSendingInquiry(true);
    setTimeout(() => {
      setSendingInquiry(false);
      setInquiryName("");
      setInquiryPhone("");
      setInquiryEmail("");
      setInquiryMessage("");
      toast.success("Inquiry sent successfully!", {
        description: "Majeed Sharif will get back to you shortly.",
      });
    }, 600);
  };

  // 3 Authentic properties from database seed
  const featuredProperties: Property[] = posts.slice(0, 3).map((p) => ({
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
    year_built: p.yearBuilt || 2023,
    priceLabel: p.priceLabel,
  })) as Property[];

  // Recent other articles
  const otherArticles = blogPosts.filter((p) => p.id !== post.id).slice(0, 3);

  const currentUrl = typeof window !== "undefined" ? window.location.href : `https://sharifrealty.com/blogs/${post.slug}`;
  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedTitle = encodeURIComponent(post.title);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E293B]">
      {/* Top Nav Toolbar */}
      <div className="bg-[#0F172A] border-b border-white/10 text-white sticky top-0 z-30 shadow-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="size-3.5 text-[#C5A880]" /> Back to Articles
          </Link>

          <div className="flex items-center gap-3">
            {prevPost && (
              <Link
                to="/blogs/$slug"
                params={{ slug: prevPost.slug }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200 border border-white/10 transition-colors"
                title={prevPost.title}
              >
                <ChevronLeft className="size-3.5" /> Prev Article
              </Link>
            )}

            {nextPost && (
              <Link
                to="/blogs/$slug"
                params={{ slug: nextPost.slug }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200 border border-white/10 transition-colors"
                title={nextPost.title}
              >
                Next Article <ChevronRight className="size-3.5" />
              </Link>
            )}

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#C5A880] hover:bg-[#B39369] text-xs font-semibold text-[#0F172A] transition-colors shadow-sm cursor-pointer"
            >
              {copied ? <Check className="size-3.5" /> : <Share2 className="size-3.5" />}
              <span>{copied ? "Link Copied" : "Share"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Blog", to: "/blogs" },
          { label: post.title },
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Main Article Column (8 Cols) */}
          <main className="lg:col-span-8 space-y-8">
            <article className="bg-white rounded-2xl border border-[#EAE6DF] overflow-hidden shadow-sm p-6 sm:p-10 space-y-8">
              {/* Category & Date Metadata Header */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1 px-3.5 py-1 bg-[#0F172A] text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">
                    {post.category || "Market Report"}
                  </span>
                  {post.tags &&
                    post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-0.5 bg-[#F3F0EA] text-[#0F172A] text-xs font-semibold rounded-full border border-[#EAE6DF]"
                      >
                        #{tag}
                      </span>
                    ))}
                </div>

                <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#0F172A] leading-snug sm:leading-tight">
                  {post.title}
                </h1>

                {/* Meta Details Row */}
                <div className="flex flex-wrap items-center gap-y-2 gap-x-5 py-3 border-y border-[#EAE6DF] text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 font-medium">
                    <User className="size-3.5 text-[#B38B59]" />
                    <span>Posted by <strong className="text-[#0F172A]">{post.author || "Majeed Sharif"}</strong></span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Calendar className="size-3.5 text-[#B38B59]" />
                    <span>{post.date}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="size-3.5 text-[#B38B59]" />
                    <span>{post.comments + submittedComments.length} Comments</span>
                  </div>

                  <div className="flex items-center gap-1.5 ml-auto text-slate-400">
                    <span>{post.readTime || "3 min read"}</span>
                  </div>
                </div>
              </div>

              {/* Gallery Carousel */}
              {images.length > 0 && (
                <div className="space-y-4">
                  <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden rounded-2xl bg-slate-950 border border-[#EAE6DF] shadow-md group">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={activeImage}
                        src={activeImage}
                        alt={post.title}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.35 }}
                        className="size-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/wp-content/themes/wpresidence/img/defaults/default_property_listings.jpg";
                        }}
                      />
                    </AnimatePresence>

                    {/* Image Counter Badge */}
                    <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded bg-black/70 text-white text-xs font-semibold backdrop-blur-sm border border-white/10">
                      Photo {activeImageIndex + 1} of {images.length}
                    </div>

                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={handlePrevImage}
                          aria-label="Previous photo"
                          className="absolute left-3 top-1/2 -translate-y-1/2 z-10 size-10 rounded-full bg-black/60 hover:bg-[#0F172A] text-white flex items-center justify-center backdrop-blur-sm transition-colors opacity-90 group-hover:opacity-100 shadow-md"
                        >
                          <ChevronLeft className="size-6" />
                        </button>

                        <button
                          type="button"
                          onClick={handleNextImage}
                          aria-label="Next photo"
                          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 size-10 rounded-full bg-black/60 hover:bg-[#0F172A] text-white flex items-center justify-center backdrop-blur-sm transition-colors opacity-90 group-hover:opacity-100 shadow-md"
                        >
                          <ChevronRight className="size-6" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Thumbnail Strip */}
                  {images.length > 1 && (
                    <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                      {images.map((img, idx) => (
                        <button
                          type="button"
                          key={img + idx}
                          onClick={() => setActiveImageIndex(idx)}
                          className={`relative size-16 sm:size-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                            idx === activeImageIndex
                              ? "border-[#C5A880] ring-2 ring-[#C5A880]/30 scale-105"
                              : "border-transparent opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={img}
                            alt={`Thumbnail ${idx + 1}`}
                            className="size-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Property Specs Grid Ribbon (For Off-Market Property Articles) */}
              {post.propertySpecs && (
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-white/10 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <Building className="size-4 text-[#B38B59]" />
                      <h3 className="font-display text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                        Property Overview & Specifications
                      </h3>
                    </div>
                    <span className="px-2.5 py-0.5 bg-[#0F172A]/10 text-[#B38B59] dark:text-red-400 text-[11px] font-bold uppercase tracking-wider rounded">
                      Off-Market Listing
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {post.propertySpecs.address && (
                      <div className="col-span-2 sm:col-span-4 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200/80 dark:border-white/5 flex items-center gap-2.5">
                        <MapPin className="size-4 text-[#B38B59] shrink-0" />
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Location
                          </div>
                          <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                            {post.propertySpecs.address}
                          </div>
                        </div>
                      </div>
                    )}

                    {post.propertySpecs.beds !== undefined && (
                      <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200/80 dark:border-white/5">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                          <Bed className="size-3.5 text-[#B38B59]" /> Bedrooms
                        </div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                          {post.propertySpecs.beds} Beds
                        </div>
                      </div>
                    )}

                    {post.propertySpecs.baths !== undefined && (
                      <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200/80 dark:border-white/5">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                          <Bath className="size-3.5 text-[#B38B59]" /> Bathrooms
                        </div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                          {post.propertySpecs.baths} Baths
                        </div>
                      </div>
                    )}

                    {post.propertySpecs.sqft && (
                      <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200/80 dark:border-white/5">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                          <Maximize2 className="size-3.5 text-[#B38B59]" /> Living Area
                        </div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                          {post.propertySpecs.sqft} sq ft
                        </div>
                      </div>
                    )}

                    {post.propertySpecs.lotSize && (
                      <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200/80 dark:border-white/5">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                          <Layers className="size-3.5 text-[#B38B59]" /> Lot Size
                        </div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                          {post.propertySpecs.lotSize}
                        </div>
                      </div>
                    )}

                    {post.propertySpecs.propertyType && (
                      <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200/80 dark:border-white/5">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                          <Home className="size-3.5 text-[#B38B59]" /> Type
                        </div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                          {post.propertySpecs.propertyType}
                        </div>
                      </div>
                    )}

                    {post.propertySpecs.yearBuilt && (
                      <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200/80 dark:border-white/5">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                          <CalendarDays className="size-3.5 text-[#B38B59]" /> Year Built
                        </div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                          {post.propertySpecs.yearBuilt}
                        </div>
                      </div>
                    )}

                    {post.propertySpecs.lastSold && (
                      <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200/80 dark:border-white/5">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                          <DollarSign className="size-3.5 text-[#B38B59]" /> Last Sold
                        </div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                          {post.propertySpecs.lastSold}
                        </div>
                      </div>
                    )}

                    {post.propertySpecs.garage && (
                      <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200/80 dark:border-white/5">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                          <Car className="size-3.5 text-[#B38B59]" /> Garage
                        </div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                          {post.propertySpecs.garage}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Excerpt Blockquote */}
              {post.excerpt && (
                <blockquote className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-800/40 border-l-4 border-[#C5A880] rounded-r-lg text-sm sm:text-base font-medium text-slate-700 dark:text-slate-200 leading-relaxed italic">
                  "{post.excerpt}"
                </blockquote>
              )}

              {/* Main Article Body */}
              <div className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 leading-relaxed text-sm sm:text-base space-y-4">
                {post.content ? (
                  (() => {
                    const hasHtmlTags =
                      /<\/?(p|div|h[1-6]|ul|ol|li|blockquote|br|hr|table|strong|em|span)\b/i.test(
                        post.content,
                      );
                    if (hasHtmlTags) {
                      return (
                        <div
                          className="whitespace-pre-line leading-relaxed space-y-4 font-sans"
                          dangerouslySetInnerHTML={{ __html: post.content }}
                        />
                      );
                    }
                    // Plain text arrangement entered in admin: Preserve exact paragraph spacing & newlines
                    const paragraphs = post.content.split(/\n\n+/);
                    return (
                      <div className="space-y-4 font-sans text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                        {paragraphs.map((p, idx) => (
                          <p key={idx} className="leading-relaxed">
                            {p}
                          </p>
                        ))}
                      </div>
                    );
                  })()
                ) : (
                  <p>
                    Sharif Realty Group provides private client advisory and off-market representation
                    across Connecticut and Massachusetts.
                  </p>
                )}

                {/* External Official Source Link if Present */}
                {post.sourceUrl && (
                  <div className="mt-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                        <ShieldCheck className="size-4" /> Official Industry Report
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300">
                        View verified source document on NAR newsroom.
                      </div>
                    </div>

                    <a
                      href={post.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      Open Official Report <ExternalLink className="size-3.5" />
                    </a>
                  </div>
                )}
              </div>

              {/* Photo Gallery Grid (If multiple photos) */}
              {images.length > 1 && (
                <div className="pt-6 border-t border-slate-100 dark:border-white/10 space-y-4">
                  <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="size-4 text-[#B38B59]" /> Photo Gallery ({images.length} Photos)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {images.map((img, idx) => (
                      <div
                        key={img + idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className="group relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer border border-slate-200 dark:border-white/10 bg-slate-900"
                      >
                        <img
                          src={img}
                          alt={`Gallery photo ${idx + 1}`}
                          className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                          View Photo
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Perfectly Aligned Social Share Ribbon */}
              <div className="pt-6 border-t border-slate-100 dark:border-white/10 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Share this Article
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <a
                    href={`https://www.facebook.com/sharer.php?u=${encodedUrl}&t=${encodedTitle}`}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold transition-colors shadow-sm"
                  >
                    <span>Facebook</span>
                  </a>

                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodedTitle}+${encodedUrl}`}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-black hover:bg-slate-900 text-white text-xs font-bold transition-colors shadow-sm border border-white/10"
                  >
                    <span>X (Twitter)</span>
                  </a>

                  <a
                    href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold transition-colors shadow-sm"
                  >
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href={`mailto:?subject=${encodedTitle}&body=${encodedUrl}`}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-sm"
                  >
                    <Mail className="size-3.5" />
                    <span>Email</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-white/10 transition-colors shadow-sm"
                  >
                    {copied ? <Check className="size-3.5 text-emerald-500" /> : <Share2 className="size-3.5" />}
                    <span>{copied ? "Copied!" : "Copy Link"}</span>
                  </button>
                </div>
              </div>
            </article>

            {/* Leave a Reply / Comments Section (Mirroring database #respond form) */}
            <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 p-6 sm:p-10 space-y-6 shadow-sm">
              <div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  Leave a Reply
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Your email address will not be published. Required fields are marked *
                </p>
              </div>

              {submittedComments.length > 0 && (
                <div className="space-y-4 pb-6 border-b border-slate-100 dark:border-white/10">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Comments ({submittedComments.length})
                  </h4>
                  {submittedComments.map((c, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-white/5 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 dark:text-white">{c.name}</span>
                        <span className="text-slate-400">{c.date}</span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300">{c.message}</p>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleCommentSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                    Comment *
                  </label>
                  <textarea
                    rows={5}
                    value={commentMessage}
                    onChange={(e) => setCommentMessage(e.target.value)}
                    required
                    placeholder="Write your thoughts or questions here..."
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-[#C5A880] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={commentName}
                      onChange={(e) => setCommentName(e.target.value)}
                      required
                      placeholder="Your full name"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-[#C5A880] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={commentEmail}
                      onChange={(e) => setCommentEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-[#C5A880] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                    Website (Optional)
                  </label>
                  <input
                    type="url"
                    value={commentWebsite}
                    onChange={(e) => setCommentWebsite(e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-[#C5A880] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="save-info"
                    checked={saveInfo}
                    onChange={(e) => setSaveInfo(e.target.checked)}
                    className="rounded border-slate-300 text-[#B38B59] focus:ring-[#C5A880]"
                  />
                  <label htmlFor="save-info" className="text-xs text-slate-600 dark:text-slate-400">
                    Save my name, email, and website in this browser for the next time I comment.
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={submittingComment}
                  className="bg-[#0F172A] hover:bg-[#A81D24] text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-colors shadow-md"
                >
                  {submittingComment ? "Submitting..." : "Post Comment"}
                </Button>
              </form>
            </section>
          </main>

          {/* Sidebar Column (4 Cols) */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
            {/* Majeed Sharif Broker Profile Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-4">
                <img
                  src="/wp-content/uploads/Sharif-Photo.jpg"
                  alt="Majeed Sharif"
                  className="size-16 rounded-full object-cover border-2 border-[#C5A880] shadow-md shrink-0"
                />
                <div>
                  <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                    Majeed Sharif
                  </h3>
                  <p className="text-xs font-semibold text-[#B38B59]">Principal Broker & Founder</p>
                  <p className="text-[11px] text-slate-400">CT #RES.0817029 · MA #9581896</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Specializing in exclusive residential acquisitions, luxury estates, off-market opportunities,
                and prime commercial investments across CT & MA.
              </p>

              <div className="grid grid-cols-1 gap-2.5 pt-2">
                <Button
                  asChild
                  className="w-full h-10 bg-[#0F172A] hover:bg-[#A81D24] text-white font-bold text-xs uppercase tracking-wider"
                >
                  <a href={`tel:${SITE.phone.replace(/\D/g, "")}`}>
                    <Phone className="size-3.5 mr-2" /> Call (203) 802-8099
                  </a>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="w-full h-10 border-slate-300 dark:border-white/15 hover:bg-[#0F172A] hover:text-white font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  <a href={whatsappHref()} target="_blank" rel="noopener noreferrer">
                    WhatsApp Chat
                  </a>
                </Button>
              </div>

              {/* Fast Direct Inquiry Form */}
              <div className="pt-4 border-t border-slate-100 dark:border-white/10 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Quick Inquiry
                </h4>
                <form onSubmit={handleInquirySubmit} className="space-y-2.5">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-[#C5A880] focus:outline-none"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={inquiryEmail}
                    onChange={(e) => setInquiryEmail(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-[#C5A880] focus:outline-none"
                  />
                  <input
                    type="tel"
                    placeholder="Phone (Optional)"
                    value={inquiryPhone}
                    onChange={(e) => setInquiryPhone(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-[#C5A880] focus:outline-none"
                  />
                  <textarea
                    rows={3}
                    placeholder="I am interested in this listing/opportunity..."
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-[#C5A880] focus:outline-none"
                  />
                  <Button
                    type="submit"
                    disabled={sendingInquiry}
                    className="w-full h-9 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-[#0F172A] dark:hover:bg-[#0F172A] dark:hover:text-white font-bold text-xs uppercase tracking-wider transition-colors"
                  >
                    {sendingInquiry ? "Sending..." : "Submit Inquiry"}
                  </Button>
                </form>
              </div>
            </div>

            {/* Other Recent Articles Widget */}
            {otherArticles.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
                  <h3 className="font-display text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Recent Articles
                  </h3>
                  <Link
                    to="/blogs"
                    className="text-xs font-bold text-[#B38B59] hover:underline"
                  >
                    View All
                  </Link>
                </div>

                <div className="space-y-4">
                  {otherArticles.map((art) => (
                    <Link
                      key={art.id}
                      to="/blogs/$slug"
                      params={{ slug: art.slug }}
                      className="group flex items-center gap-3"
                    >
                      <div className="size-14 rounded-lg overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/5">
                        <img
                          src="/wp-content/themes/wpresidence/img/defaults/default_property_listings.jpg"
                          alt={art.title}
                          className="size-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Calendar className="size-3 text-[#B38B59]" /> {art.date}
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#B38B59] transition-colors line-clamp-2 leading-tight">
                          {art.title}
                        </h4>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Featured Authentic Properties Widget */}
            {featuredProperties.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
                  <h3 className="font-display text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Featured Properties
                  </h3>
                  <Link
                    to="/properties"
                    className="text-xs font-bold text-[#B38B59] hover:underline"
                  >
                    All Properties
                  </Link>
                </div>

                <div className="space-y-3">
                  {featuredProperties.map((prop) => (
                    <Link
                      key={prop.id}
                      to="/properties/$id"
                      params={{ id: prop.slug || prop.id }}
                      className="group flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <div className="size-16 rounded-lg overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800">
                        <img
                          src={prop.images?.[0] || "/wp-content/uploads/2025/05/IMG_4535.jpg"}
                          alt={prop.title}
                          className="size-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#B38B59]">
                          {prop.priceLabel || (prop.price > 0 ? `$${prop.price.toLocaleString()}` : "Price on Call")}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#B38B59] transition-colors line-clamp-1">
                          {prop.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 line-clamp-1">
                          {prop.city}, {prop.state}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* Bottom Prev / Next Article Bar */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {prevPost && (
            <Link
              to="/blogs/$slug"
              params={{ slug: prevPost.slug }}
              className="group p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 hover:border-[#C5A880] transition-all flex items-center gap-4 shadow-sm"
            >
              <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-[#0F172A] group-hover:text-white text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 transition-colors">
                <ChevronLeft className="size-5" />
              </div>
              <div className="min-w-0 space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Previous Article
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#B38B59] transition-colors line-clamp-1">
                  {prevPost.title}
                </div>
              </div>
            </Link>
          )}

          {nextPost && (
            <Link
              to="/blogs/$slug"
              params={{ slug: nextPost.slug }}
              className="group p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 hover:border-[#C5A880] transition-all flex items-center justify-between gap-4 shadow-sm text-right sm:ml-auto w-full"
            >
              <div className="min-w-0 space-y-1 text-left sm:text-right flex-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Next Article
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#B38B59] transition-colors line-clamp-1">
                  {nextPost.title}
                </div>
              </div>
              <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-[#0F172A] group-hover:text-white text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 transition-colors">
                <ChevronRight className="size-5" />
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
