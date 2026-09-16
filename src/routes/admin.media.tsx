import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useRef } from "react";
import {
  Search,
  UploadCloud,
  Folder,
  Image as ImageIcon,
  FileText,
  Video,
  Grid,
  List,
  Check,
  Copy,
  Trash2,
  X,
  ExternalLink,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { useAdmin } from "@/lib/admin-store";
import type { MediaAsset } from "@/lib/types";

export const Route = createFileRoute("/admin/media")({
  component: AdminMediaPage,
  errorComponent: ({ reset }) => (
    <div className="bg-white p-8 border border-slate-200 text-center space-y-3 m-4">
      <h2 className="text-base font-bold text-slate-900">Media Library</h2>
      <p className="text-xs text-slate-500">
        Media catalog updated. Click below to refresh your asset pool.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="px-4 py-2 bg-[#DC2626] text-white text-xs font-bold hover:bg-[#B91C1C] transition-colors"
      >
        Refresh Media Library
      </button>
    </div>
  ),
});

export default function AdminMediaPage() {
  const { mediaAssets, addMediaAsset, deleteMediaAsset, posts } = useAdmin();

  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name" | "size">("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Combine media assets from store + property photo galleries
  const allMediaPool: MediaAsset[] = useMemo(() => {
    const propertyImages = (posts || []).flatMap((p) =>
      (p?.images || [])
        .filter((img): img is string => typeof img === "string" && img.trim().length > 0)
        .map((img, idx) => {
          const filename = img.split("/").pop() || `property-photo-${idx + 1}.jpg`;
          return {
            id: `prop-img-${p?.id || idx}-${idx}`,
            url: img,
            title: `${p?.title || "Property"} (${idx + 1})`,
            filename,
            fileSize: "480 KB",
            dimensions: "1920 x 1080",
            type: "image" as const,
            folder: "properties" as const,
            uploadedAt: p?.date || "2026-01-25",
          };
        }),
    );

    // Dedup by URL and ensure all fields are valid strings
    const seen = new Set<string>();
    const combined: MediaAsset[] = [];

    for (const item of [...(mediaAssets || []), ...propertyImages]) {
      if (!item || !item.url) continue;
      if (!seen.has(item.url)) {
        seen.add(item.url);
        const filename = item.filename || item.title || item.url.split("/").pop() || "media.jpg";
        combined.push({
          id: item.id || `m-${combined.length}`,
          url: item.url,
          title: item.title || filename,
          filename,
          fileSize: item.fileSize || "480 KB",
          dimensions: item.dimensions || "1920 x 1080",
          type: item.type || "image",
          folder: item.folder || "properties",
          uploadedAt: item.uploadedAt || "2026-01-25",
        });
      }
    }

    return combined;
  }, [mediaAssets, posts]);

  // Folder Counts
  const folderCounts = useMemo(() => {
    return {
      all: allMediaPool.length,
      properties: allMediaPool.filter((m) => {
        const fn = (m?.filename || "").toLowerCase();
        return (
          m?.folder === "properties" ||
          fn.includes("png") ||
          fn.includes("jpg") ||
          fn.includes("thendara") ||
          fn.includes("waterbury") ||
          fn.includes("cheshire") ||
          fn.includes("southington")
        );
      }).length,
      blog: allMediaPool.filter((m) => {
        const fn = (m?.filename || "").toLowerCase();
        return (
          m?.folder === "blog" ||
          fn.includes("image-2") ||
          fn.includes("florida") ||
          fn.includes("scaled")
        );
      }).length,
      marketing: allMediaPool.filter((m) => {
        const fn = (m?.filename || "").toLowerCase();
        return (
          m?.folder === "marketing" ||
          fn.includes("logo") ||
          fn.includes("hero") ||
          fn.includes("waves")
        );
      }).length,
      agents: allMediaPool.filter((m) => {
        const fn = (m?.filename || "").toLowerCase();
        return (
          m?.folder === "agents" ||
          fn.includes("sharif") ||
          fn.includes("client") ||
          fn.includes("woman")
        );
      }).length,
    };
  }, [allMediaPool]);

  // Filter and sort media
  const filteredMedia = useMemo(() => {
    return allMediaPool
      .filter((item) => {
        if (!item) return false;
        const fname = (item.filename || "").toLowerCase();
        const title = (item.title || "").toLowerCase();

        // Folder filter
        if (selectedFolder !== "all") {
          if (selectedFolder === "properties" && item.folder !== "properties") {
            const isLikelyProp =
              fname.includes("1-") ||
              fname.includes("2-") ||
              fname.includes("16-") ||
              fname.includes("img_") ||
              fname.includes("thendara") ||
              fname.includes("waterbury") ||
              fname.includes("cheshire") ||
              fname.includes("southington");
            if (!isLikelyProp) return false;
          } else if (selectedFolder === "blog" && item.folder !== "blog") {
            const isLikelyBlog = fname.includes("image-2") || fname.includes("florida");
            if (!isLikelyBlog) return false;
          } else if (selectedFolder === "marketing" && item.folder !== "marketing") {
            const isLikelyMktg = fname.includes("logo") || fname.includes("hero");
            if (!isLikelyMktg) return false;
          } else if (selectedFolder === "agents" && item.folder !== "agents") {
            const isLikelyAgent = fname.includes("sharif") || fname.includes("client");
            if (!isLikelyAgent) return false;
          }
        }

        // Type filter
        if (typeFilter !== "all" && item.type !== typeFilter) return false;

        // Search query
        if (searchQuery.trim()) {
          const term = searchQuery.toLowerCase();
          return title.includes(term) || fname.includes(term);
        }

        return true;
      })
      .sort((a, b) => {
        const aName = a?.filename || a?.title || "";
        const bName = b?.filename || b?.title || "";
        const aDate = a?.uploadedAt || "";
        const bDate = b?.uploadedAt || "";
        if (sortBy === "name") return aName.localeCompare(bName);
        if (sortBy === "oldest") return aDate.localeCompare(bDate);
        return bDate.localeCompare(aDate);
      });
  }, [allMediaPool, selectedFolder, typeFilter, searchQuery, sortBy]);

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const resultUrl = event.target?.result as string;
        const newAsset = addMediaAsset({
          url: resultUrl,
          title: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
          filename: file.name,
          fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          dimensions: "1920 x 1080",
          type: file.type.includes("pdf") ? "document" : "image",
          folder: selectedFolder === "all" ? "properties" : (selectedFolder as any),
        });
        toast.success(`Uploaded "${file.name}" to Media Library.`);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Media URL copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteSelected = () => {
    if (confirm(`Delete ${selectedIds.length} selected media assets?`)) {
      selectedIds.forEach((id) => deleteMediaAsset(id));
      setSelectedIds([]);
      toast.success("Selected media deleted.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 border border-[#E2E8F0] shadow-sm">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#091523] tracking-tight">
            Media Library
          </h1>
          <p className="text-xs text-slate-500">
            Upload, manage, and categorize property galleries, headshots, and marketing assets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            accept="image/*,.pdf"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold transition-colors shadow-sm"
          >
            <UploadCloud className="size-3.5" />
            <span>Upload Media</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Left Folder Sidebar + Right Media Canvas */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* Left Folders & Upload Dropzone */}
        <div className="w-full lg:w-60 shrink-0 space-y-4">
          {/* Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-[#DC2626] p-6 bg-white text-center cursor-pointer transition-colors group"
          >
            <UploadCloud className="size-8 text-slate-400 group-hover:text-[#DC2626] mx-auto transition-colors" />
            <div className="text-xs font-bold text-slate-800 mt-2">Upload Files</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Drag & drop or browse</div>
          </div>

          {/* Folder Navigation */}
          <div className="bg-white border border-[#E2E8F0] p-3 shadow-sm space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
              Folders
            </div>

            <button
              type="button"
              onClick={() => setSelectedFolder("all")}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium transition-colors text-left ${
                selectedFolder === "all"
                  ? "bg-[#091523] text-white font-bold border-l-2 border-[#DC2626]"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <Folder className="size-3.5" />
                <span>All Media</span>
              </div>
              <span className="font-mono text-[11px] opacity-80">{folderCounts.all}</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedFolder("properties")}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium transition-colors text-left ${
                selectedFolder === "properties"
                  ? "bg-[#091523] text-white font-bold border-l-2 border-[#DC2626]"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <ImageIcon className="size-3.5" />
                <span>Properties</span>
              </div>
              <span className="font-mono text-[11px] opacity-80">{folderCounts.properties}</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedFolder("blog")}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium transition-colors text-left ${
                selectedFolder === "blog"
                  ? "bg-[#091523] text-white font-bold border-l-2 border-[#DC2626]"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="size-3.5" />
                <span>Blog Articles</span>
              </div>
              <span className="font-mono text-[11px] opacity-80">{folderCounts.blog}</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedFolder("marketing")}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium transition-colors text-left ${
                selectedFolder === "marketing"
                  ? "bg-[#091523] text-white font-bold border-l-2 border-[#DC2626]"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <Folder className="size-3.5" />
                <span>Marketing Assets</span>
              </div>
              <span className="font-mono text-[11px] opacity-80">{folderCounts.marketing}</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedFolder("agents")}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium transition-colors text-left ${
                selectedFolder === "agents"
                  ? "bg-[#091523] text-white font-bold border-l-2 border-[#DC2626]"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <Folder className="size-3.5" />
                <span>Agent Headshots</span>
              </div>
              <span className="font-mono text-[11px] opacity-80">{folderCounts.agents}</span>
            </button>
          </div>
        </div>

        {/* Right Media Grid Area */}
        <div className="flex-1 w-full space-y-3">
          {/* Filter Toolbar */}
          <div className="bg-white border border-[#E2E8F0] p-3 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-56">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search media..."
                  className="w-full pl-8 pr-2 py-1.5 border border-[#E2E8F0] bg-[#F8FAFC] text-xs focus:bg-white focus:outline-none focus:border-[#091523]"
                />
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border border-[#E2E8F0] bg-white py-1.5 px-2 text-xs focus:outline-none focus:border-[#091523]"
              >
                <option value="all">All Types</option>
                <option value="image">Images</option>
                <option value="document">Documents / PDF</option>
              </select>

              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="border border-[#E2E8F0] bg-white py-1.5 px-2 text-xs focus:outline-none focus:border-[#091523]"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="oldest">Sort: Oldest First</option>
                <option value="name">Sort: Name (A-Z)</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 border border-slate-200 p-0.5 bg-slate-50">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1 ${viewMode === "grid" ? "bg-white shadow-xs text-[#091523]" : "text-slate-400"}`}
                title="Grid View"
              >
                <Grid className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-1 ${viewMode === "list" ? "bg-white shadow-xs text-[#091523]" : "text-slate-400"}`}
                title="List View"
              >
                <List className="size-3.5" />
              </button>
            </div>
          </div>

          {/* Media Items */}
          {filteredMedia.length === 0 ? (
            <div className="bg-white border border-[#E2E8F0] p-12 text-center text-slate-500 shadow-sm">
              <ImageIcon className="size-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs">No media assets found in this folder or search.</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredMedia.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                const filename = item?.filename || item?.title || "media.jpg";
                const ext = filename.split(".").pop()?.toUpperCase() || "JPG";

                return (
                  <div
                    key={item.id}
                    onClick={() => handleToggleSelect(item.id)}
                    className={`group relative bg-white border cursor-pointer transition-all ${
                      isSelected
                        ? "border-[#DC2626] ring-2 ring-[#DC2626]/20 shadow-md"
                        : "border-[#E2E8F0] hover:border-slate-400 shadow-xs"
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="aspect-square bg-slate-100 relative overflow-hidden flex items-center justify-center">
                      {item.type === "document" ? (
                        <FileText className="size-12 text-slate-400" />
                      ) : (
                        <img
                          src={item.url}
                          alt={item.title || filename}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/wp-content/uploads/image-16.png";
                          }}
                        />
                      )}

                      {/* File format badge */}
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 text-[9px] font-bold uppercase bg-black/70 text-white backdrop-blur-xs">
                        {ext}
                      </span>

                      {/* Checkbox indicator */}
                      <div
                        className={`absolute top-1.5 right-1.5 size-5 flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-[#DC2626] text-white"
                            : "bg-black/40 text-transparent opacity-0 group-hover:opacity-100"
                        }`}
                      >
                        <Check className="size-3.5 stroke-[3]" />
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="p-2 text-left">
                      <div className="font-bold text-[11px] text-slate-900 truncate" title={filename}>
                        {filename}
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-0.5">
                        <span>{item.dimensions || "1920x1080"}</span>
                        <span>{item.fileSize || "420 KB"}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-[#E2E8F0] shadow-sm divide-y divide-[#E2E8F0] text-xs">
              {filteredMedia.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                const filename = item?.filename || item?.title || "media.jpg";
                return (
                  <div
                    key={item.id}
                    onClick={() => handleToggleSelect(item.id)}
                    className={`p-2.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 transition-colors ${
                      isSelected ? "bg-red-50/40" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(item.id)}
                        className="size-3.5 text-[#DC2626] rounded border-slate-300"
                      />
                      <img
                        src={item.url}
                        alt=""
                        className="size-9 object-cover border border-slate-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/wp-content/uploads/image-16.png";
                        }}
                      />
                      <div>
                        <div className="font-bold text-slate-900">{filename}</div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {item.dimensions || "1920x1080"} · {item.fileSize || "420 KB"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyUrl(item.url, item.id);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-800"
                        title="Copy URL"
                      >
                        <Copy className="size-3.5" />
                      </button>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 text-slate-400 hover:text-blue-600"
                        title="Open file"
                      >
                        <ExternalLink className="size-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Are you sure you want to delete media asset "${filename}"?`)) {
                            deleteMediaAsset(item.id);
                            toast.success(`Deleted "${filename}".`);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="Delete file"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Bar when Items Selected */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#091523] text-white px-5 py-3 shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-2 border border-slate-700">
          <span className="text-xs font-bold">
            {selectedIds.length} item{selectedIds.length > 1 ? "s" : ""} selected
          </span>
          <div className="h-4 w-px bg-slate-700" />
          <button
            type="button"
            onClick={() => setSelectedIds([])}
            className="text-xs text-slate-400 hover:text-white"
          >
            Clear Selection
          </button>
          <button
            type="button"
            onClick={handleDeleteSelected}
            className="px-3 py-1 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold shadow-sm"
          >
            Delete Selected
          </button>
        </div>
      )}
    </div>
  );
}
