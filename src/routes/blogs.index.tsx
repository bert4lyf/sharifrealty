import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { ArrowRight, Calendar, User, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/lib/admin-store";
import { SEED_BLOG_POSTS_DATA } from "@/lib/database-seed";

export const Route = createFileRoute("/blogs/")({
  head: () => ({
    meta: [
      { title: "Blogs & Market Intelligence | Sharif Realty Group" },
      {
        name: "description",
        content:
          "Latest real estate intelligence, off-market opportunities, National Association of Realtors reports, and market analyses from Sharif Realty Group.",
      },
      { property: "og:title", content: "Sharif Realty · Market Intelligence & Blogs" },
      {
        property: "og:description",
        content: "Discover authentic off-market opportunities and NAR reports from Sharif Realty.",
      },
    ],
  }),
  component: BlogPage,
});

const DEFAULT_BLOG_IMAGE = "/wp-content/themes/wpresidence/img/defaults/default_property_listings.jpg";

export function BlogPage() {
  const admin = useAdmin();
  const blogPosts = admin?.blogPosts && admin.blogPosts.length > 0 ? admin.blogPosts : SEED_BLOG_POSTS_DATA;
  const [activeCategory, setActiveCategory] = useState<string>("All");

  // Dynamic categories extracted from live blogPosts
  const categories = useMemo(() => {
    const set = new Set<string>(["All"]);
    blogPosts.forEach((b) => {
      if (b?.category) set.add(b.category);
    });
    return Array.from(set);
  }, [blogPosts]);

  const filtered = useMemo(() => {
    if (activeCategory === "All") return blogPosts;
    return blogPosts.filter(
      (p) => p?.category?.toLowerCase() === activeCategory.toLowerCase(),
    );
  }, [blogPosts, activeCategory]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E293B] pb-20">
      <Breadcrumbs items={[{ label: "Blog" }]} />

      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        {/* Header Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl space-y-3"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-[#B38B59]">
            Official Market Intelligence &amp; News
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#0F172A]">
            Articles &amp; Off-Market Listings
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Explore exclusive off-market properties, market trends, and National Association of Realtors reports directly from our verified advisory.
          </p>
        </motion.div>

        {/* Categories Filter Tabs */}
        <div className="mt-8 flex flex-wrap items-center gap-2 border-b border-[#EAE6DF] pb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === cat
                  ? "bg-[#0F172A] text-white shadow-sm"
                  : "bg-white text-slate-700 hover:bg-[#F3F0EA] border border-[#EAE6DF]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post, idx) => {
            return (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="card-lift group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#EAE6DF] bg-white shadow-sm hover:border-[#C5A880]"
              >
                <Link
                  to="/blogs/$slug"
                  params={{ slug: post.slug }}
                  className="flex flex-col h-full justify-between focus:outline-none"
                >
                  <div>
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                      <img
                        src={post.coverImage || DEFAULT_BLOG_IMAGE}
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
                          Majeed Sharif
                        </span>
                      </div>

                      <h3 className="font-serif text-lg font-bold text-[#0F172A] group-hover:text-[#B38B59] transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-3 border-t border-[#EAE6DF] flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#0F172A] group-hover:text-[#B38B59] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Read Article <ArrowRight className="size-3.5" />
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {post.readTime || "3 min read"}
                    </span>
                  </div>
                </Link>
              </motion.article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
