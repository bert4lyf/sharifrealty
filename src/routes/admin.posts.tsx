import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useRef } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Bold,
  Italic,
  Underline,
  List,
  Heading,
  Image as ImageIcon,
  Sparkles,
  X,
  CheckCircle2,
  TrendingUp,
  FolderPlus,
  UploadCloud,
  Layers,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { useAdmin } from "@/lib/admin-store";
import type { BlogPost } from "@/lib/types";
import { AdminPageHeader } from "@/components/admin/wp-shell";

export const Route = createFileRoute("/admin/posts")({
  head: () => ({
    meta: [
      { title: "Manage Blog Posts | Sharif Realty Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminBlogPostsPage,
});

const DEFAULT_BLOG_IMAGE = "/wp-content/themes/wpresidence/img/defaults/default_property_listings.jpg";

export default function AdminBlogPostsPage() {
  const { blogPosts, createBlogPost, updateBlogPost, deleteBlogPost, mediaAssets, addMediaAsset } = useAdmin();

  const [selectedCategory, setSelectedCategory] = useState<string>("All Posts");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  // Media Library modal state
  const [showMediaModal, setShowMediaModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Form State for Drawer
  const [postTitle, setPostTitle] = useState("");
  const [postSlug, setPostSlug] = useState("");
  const [postSourceUrl, setPostSourceUrl] = useState("");
  const [postCategory, setPostCategory] = useState("Market Trends");
  const [postAuthor, setPostAuthor] = useState("Majeed Sharif");
  const [postExcerpt, setPostExcerpt] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postImage, setPostImage] = useState(DEFAULT_BLOG_IMAGE);
  const [postStatus, setPostStatus] = useState<"Published" | "Draft">("Published");
  const [postSeoScore, setPostSeoScore] = useState(90);

  // Default Categories
  const [categories, setCategories] = useState<string[]>([
    "Market Trends",
    "Company News",
    "Off-Market",
    "Tips & Guides",
    "Neighborhoods",
  ]);

  // Filtered posts
  const filteredPosts = useMemo(() => {
    return blogPosts.filter((post) => {
      const matchCategory =
        selectedCategory === "All Posts" ||
        post.category?.toLowerCase() === selectedCategory.toLowerCase();

      const matchSearch =
        searchQuery.trim() === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus =
        statusFilter === "all" || post.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchCategory && matchSearch && matchStatus;
    });
  }, [blogPosts, selectedCategory, searchQuery, statusFilter]);

  const handleOpenNew = () => {
    setEditingPost(null);
    setPostTitle("");
    setPostSlug("");
    setPostSourceUrl("");
    setPostCategory("Market Trends");
    setPostAuthor("Majeed Sharif");
    setPostExcerpt("");
    setPostContent("");
    setPostImage(DEFAULT_BLOG_IMAGE);
    setPostStatus("Published");
    setPostSeoScore(92);
    setSlideOverOpen(true);
  };

  const handleOpenEdit = (post: BlogPost) => {
    setEditingPost(post);
    setPostTitle(post.title);
    setPostSlug(post.slug);
    setPostSourceUrl(post.sourceUrl || "");
    setPostCategory(post.category || "Market Trends");
    setPostAuthor(post.author || "Majeed Sharif");
    setPostExcerpt(post.excerpt || "");
    setPostContent(post.content || "");
    setPostImage(post.coverImage || DEFAULT_BLOG_IMAGE);
    setPostStatus(post.status || "Published");
    setPostSeoScore(post.seoScore ?? 88);
    setSlideOverOpen(true);
  };

  // Device File Upload Handler
  const handleDeviceFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setPostImage(result);
        // Also save to global media assets for future reuse
        addMediaAsset({
          title: file.name,
          url: result,
          filename: file.name,
          fileSize: `${Math.round(file.size / 1024)} KB`,
          dimensions: "Auto",
          type: "image",
        });
        toast.success(`Image "${file.name}" uploaded from device and set as cover.`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSavePost = (statusOverride?: "Published" | "Draft") => {
    if (!postTitle.trim()) {
      toast.error("Please enter a title for the blog post.");
      return;
    }

    const currentStatus = statusOverride || postStatus;
    const trimmedSlug = postSlug.trim();
    let finalSourceUrl = postSourceUrl.trim();
    let generatedSlug = "";

    // If user pasted a full URL into the slug field, preserve it as sourceUrl and generate a clean slug
    if (trimmedSlug.startsWith("http://") || trimmedSlug.startsWith("https://")) {
      if (!finalSourceUrl) {
        finalSourceUrl = trimmedSlug;
      }
      generatedSlug = postTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    } else {
      generatedSlug =
        trimmedSlug ||
        postTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
    }

    const draftData: Partial<BlogPost> = {
      title: postTitle,
      slug: generatedSlug,
      sourceUrl: finalSourceUrl || undefined,
      category: postCategory,
      author: postAuthor,
      authorRole: "Principal Broker",
      excerpt: postExcerpt,
      content: postContent,
      coverImage: postImage || DEFAULT_BLOG_IMAGE,
      status: currentStatus,
      seoScore: postSeoScore,
      views: editingPost?.views ? String(editingPost.views) : "0",
    };

    if (editingPost) {
      updateBlogPost(editingPost.id, draftData);
      toast.success("Blog post updated successfully!");
    } else {
      createBlogPost(draftData);
      toast.success(`Blog post ${currentStatus === "Published" ? "published" : "saved as draft"}!`);
    }

    setSlideOverOpen(false);
  };

  const handleDelete = (post: BlogPost) => {
    if (confirm(`Are you sure you want to delete "${post.title}"?`)) {
      deleteBlogPost(post.id);
      toast.success(`Deleted "${post.title}".`);
    }
  };

  return (
    <div className="space-y-6 max-w-full">
      <AdminPageHeader
        title="Manage Blog Posts"
        description="Publish market reports, off-market property highlights, and luxury real estate advisories."
        action={
          <button
            type="button"
            onClick={handleOpenNew}
            className="bg-[#0F172A] hover:bg-[#1E293B] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="size-4" />
            <span>Write New Article</span>
          </button>
        }
      />

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {/* Filters Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto text-xs">
            <div className="relative min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles by title or keyword..."
                className="w-full pl-9 pr-3 py-1.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl text-xs focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white py-1.5 px-3 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#C5A880]"
            >
              <option value="All Posts">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white py-1.5 px-3 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#C5A880]"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div className="text-xs text-slate-500 font-medium self-end sm:self-center">
            Showing <strong>{filteredPosts.length}</strong> of <strong>{blogPosts.length}</strong> posts
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[800px]">
            <thead className="bg-slate-100/70 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              <tr>
                <th className="p-3.5">Article Details</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Author</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Traffic</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No blog posts found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => (
                  <tr
                    key={post.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Title & Cover */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.coverImage || DEFAULT_BLOG_IMAGE}
                          alt={post.title}
                          className="size-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = DEFAULT_BLOG_IMAGE;
                          }}
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 dark:text-white truncate max-w-[280px]">
                            {post.title}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            /{post.slug}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold uppercase">
                        {post.category || "General"}
                      </span>
                    </td>

                    {/* Author */}
                    <td className="p-3.5 text-slate-600 dark:text-slate-300 font-medium">
                      {post.author || "Majeed Sharif"}
                    </td>

                    {/* Date */}
                    <td className="p-3.5 text-slate-500 text-[11px] font-mono">
                      {post.date}
                    </td>

                    {/* Status */}
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          post.status === "Published"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {post.status || "Published"}
                      </span>
                    </td>

                    {/* Views */}
                    <td className="p-3.5 text-slate-700 dark:text-slate-300 font-mono text-[11px] font-semibold">
                      {parseInt(String(post.views || "0"), 10)} views
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {post.slug?.startsWith("http://") || post.slug?.startsWith("https://") ? (
                          <a
                            href={post.slug}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open External Article"
                            className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <ExternalLink className="size-4" />
                          </a>
                        ) : (
                          <Link
                            to="/blogs/$slug"
                            params={{ slug: post.slug }}
                            target="_blank"
                            title="View Live Public Article"
                            className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <Eye className="size-4" />
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(post)}
                          title="Edit Article"
                          className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Edit className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(post)}
                          title="Delete Article"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Drawer for Composing & Editing Articles */}
      {slideOverOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="absolute inset-y-0 right-0 max-w-2xl w-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                  {editingPost ? `Edit Article: ${editingPost.title}` : "Write New Blog Article"}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose an image from your device or media library and compose your article.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSlideOverOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              {/* Title */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="e.g. 7 Reasons Why You Should Work With a REALTOR"
                  className="w-full p-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              {/* Slug, Category, Author */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Custom URL Slug</label>
                  <input
                    type="text"
                    value={postSlug}
                    onChange={(e) => setPostSlug(e.target.value)}
                    placeholder="e.g. market-update-2026"
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-mono text-xs focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Category</label>
                  <select
                    value={postCategory}
                    onChange={(e) => setPostCategory(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs focus:outline-none focus:border-[#C5A880]"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Author</label>
                  <select
                    value={postAuthor}
                    onChange={(e) => setPostAuthor(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs focus:outline-none focus:border-[#C5A880]"
                  >
                    <option value="Majeed Sharif">Majeed Sharif</option>
                    <option value="Sharif Editorial Team">Sharif Editorial Team</option>
                  </select>
                </div>
              </div>

              {/* External Article / Source Link (e.g., The Hour, NAR) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    External Article / Source Link (Optional)
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Paste external URL (e.g. The Hour, NAR) to link directly
                  </span>
                </div>
                <input
                  type="url"
                  value={postSourceUrl}
                  onChange={(e) => setPostSourceUrl(e.target.value)}
                  placeholder="https://www.thehour.com/realestate/article/... or https://www.nar.realtor/..."
                  className="w-full p-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-mono text-xs focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              {/* COVER IMAGE PICKER (Device or Media Library - NO Raw URL requirement) */}
              <div className="space-y-2.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 dark:text-slate-200">
                    Featured Cover Image *
                  </label>
                  <span className="text-[10px] text-slate-500">
                    Upload from device or select from Media Library
                  </span>
                </div>

                {/* Hidden Device File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleDeviceFileUpload}
                  accept="image/*"
                  className="hidden"
                />

                {/* Chosen Image Display Card */}
                {postImage ? (
                  <div className="flex items-center gap-4 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <img
                      src={postImage}
                      alt="Selected Cover"
                      className="size-16 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        Cover Image Selected
                      </p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {postImage.startsWith("data:") ? "Uploaded from Device" : postImage}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-md text-[11px] font-semibold transition-colors"
                        >
                          Upload New Photo
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowMediaModal(true)}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-md text-[11px] font-semibold transition-colors"
                        >
                          Browse Library
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#C5A880] rounded-xl flex flex-col items-center justify-center gap-2 text-slate-600 dark:text-slate-400 hover:text-[#B38B59] transition-colors cursor-pointer"
                    >
                      <UploadCloud className="size-6 text-[#B38B59]" />
                      <span className="font-bold text-xs">Upload from Device</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowMediaModal(true)}
                      className="p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#0F172A] rounded-xl flex flex-col items-center justify-center gap-2 text-slate-600 dark:text-slate-400 hover:text-[#0F172A] transition-colors cursor-pointer"
                    >
                      <Layers className="size-6 text-[#0F172A] dark:text-blue-400" />
                      <span className="font-bold text-xs">Media Library</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Excerpt */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Summary / Excerpt
                </label>
                <textarea
                  rows={2}
                  value={postExcerpt}
                  onChange={(e) => setPostExcerpt(e.target.value)}
                  placeholder="Brief 1-2 sentence preview for search cards..."
                  className="w-full p-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              {/* Content Body */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                    Article Body Content *
                  </label>
                  <span className="text-[10px] text-[#B38B59] font-medium">
                    Arrangement &amp; line breaks match the live site identically
                  </span>
                </div>
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-t-xl border border-b-0 border-slate-300 dark:border-slate-700 text-xs">
                  <button
                    type="button"
                    onClick={() => setPostContent((prev) => (prev ? prev + "\n\n" : ""))}
                    className="px-2 py-0.5 hover:bg-white dark:hover:bg-slate-700 rounded text-[11px] font-semibold text-slate-700 dark:text-slate-200 border border-transparent hover:border-slate-200"
                    title="Insert New Paragraph Break"
                  >
                    + Paragraph Break
                  </button>
                  <button
                    type="button"
                    onClick={() => setPostContent((prev) => (prev ? prev + "\n• " : "• "))}
                    className="px-2 py-0.5 hover:bg-white dark:hover:bg-slate-700 rounded text-[11px] font-semibold text-slate-700 dark:text-slate-200 border border-transparent hover:border-slate-200"
                    title="Insert Bullet Point"
                  >
                    • Bullet
                  </button>
                </div>
                <textarea
                  rows={9}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Write your article content here. Type paragraphs, press Enter for new lines, or use HTML..."
                  className="w-full p-3 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-b-xl font-sans text-xs focus:outline-none focus:border-[#C5A880] leading-relaxed whitespace-pre-wrap"
                />
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSlideOverOpen(false)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 rounded-xl font-semibold"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSavePost("Draft")}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSavePost("Published")}
                  className="px-5 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl font-bold shadow-md transition-all"
                >
                  Publish Article
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Media Library Selector Modal */}
      {showMediaModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 max-w-3xl w-full p-6 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                  Select Image from Media Library
                </h3>
                <p className="text-xs text-slate-500">
                  Click any image to select it as the cover for this article.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowMediaModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Media Grid */}
            <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-1">
              {mediaAssets.map((asset) => (
                <button
                  type="button"
                  key={asset.id}
                  onClick={() => {
                    setPostImage(asset.url);
                    setShowMediaModal(false);
                    toast.success(`Selected "${asset.title}" as cover.`);
                  }}
                  className={`group relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all text-left ${
                    postImage === asset.url
                      ? "border-[#C5A880] ring-2 ring-[#C5A880]/40"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-400"
                  }`}
                >
                  <img
                    src={asset.url}
                    alt={asset.title}
                    className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-white">
                    <p className="text-[11px] font-bold truncate">{asset.title}</p>
                    <p className="text-[9px] text-slate-300">{asset.fileSize || (asset as any).size || "Image"}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setShowMediaModal(false);
                  fileInputRef.current?.click();
                }}
                className="text-xs font-bold text-[#B38B59] hover:underline flex items-center gap-1"
              >
                <UploadCloud className="size-3.5" />
                Upload New Image from Device
              </button>

              <button
                type="button"
                onClick={() => setShowMediaModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
