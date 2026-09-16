import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Building,
  CheckSquare,
  Square,
  Sparkles,
  Bed,
  Bath,
  Maximize2,
  MapPin,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { useAdmin, type AdminPropertyPost } from "@/lib/admin-store";
import { formatPrice } from "@/lib/format";
import { AdminPageHeader } from "@/components/admin/wp-shell";
import { PropertyEditor } from "@/components/admin/property-editor";

export const Route = createFileRoute("/admin/listings")({
  head: () => ({
    meta: [
      { title: "Manage Property Listings | Sharif Realty Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminListingsPage,
});

export default function AdminListingsPage() {
  const { posts, deletePost, updatePost, createPost } = useAdmin();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingProperty, setEditingProperty] = useState<AdminPropertyPost | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Filter properties
  const filteredProperties = useMemo(() => {
    return posts.filter((p) => {
      const matchSearch =
        searchQuery.trim() === "" ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.city.toLowerCase().includes(searchQuery.toLowerCase());

      const isSold = p.propertyStatus === "sold";
      const isPending = p.propertyStatus === "pending";
      const isActive = p.propertyStatus === "for_sale" || (!isSold && !isPending && p.status === "Published");

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && isActive) ||
        (statusFilter === "pending" && isPending) ||
        (statusFilter === "sold" && isSold);

      const matchType =
        typeFilter === "all" ||
        p.category?.toLowerCase() === typeFilter.toLowerCase() ||
        p.propertyType?.toLowerCase().includes(typeFilter.toLowerCase());

      return matchSearch && matchStatus && matchType;
    });
  }, [posts, searchQuery, statusFilter, typeFilter]);

  // Bulk selection
  const handleSelectAll = () => {
    if (selectedIds.length === filteredProperties.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProperties.map((p) => p.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  // Bulk actions
  const handleBulkStatusChange = (status: "for_sale" | "pending" | "sold") => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one property.");
      return;
    }
    selectedIds.forEach((id) => {
      updatePost(id, { propertyStatus: status, status: "Published" });
    });
    toast.success(`Updated ${selectedIds.length} properties to ${status.replace("_", " ")}.`);
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one property.");
      return;
    }
    if (confirm(`Are you sure you want to delete ${selectedIds.length} properties?`)) {
      selectedIds.forEach((id) => deletePost(id));
      toast.success(`Deleted ${selectedIds.length} properties.`);
      setSelectedIds([]);
    }
  };

  const handleDelete = (property: AdminPropertyPost) => {
    if (confirm(`Are you sure you want to delete "${property.title}"?`)) {
      deletePost(property.id);
      toast.success(`Deleted "${property.title}".`);
    }
  };

  return (
    <div className="space-y-6 max-w-full">
      <AdminPageHeader
        title="Manage Property Listings"
        description="Active real estate portfolio, commercial developments, and private off-market listings."
        action={
          <button
            type="button"
            onClick={() => setIsAddingNew(true)}
            className="bg-[#0F172A] hover:bg-[#1E293B] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="size-4" />
            <span>Add New Listing</span>
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
                placeholder="Search title, address, city..."
                className="w-full pl-9 pr-3 py-1.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl text-xs focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white py-1.5 px-3 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#C5A880]"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active (For Sale)</option>
              <option value="pending">Under Contract</option>
              <option value="sold">Sold</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white py-1.5 px-3 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#C5A880]"
            >
              <option value="all">All Categories</option>
              <option value="Luxury Estates">Luxury Estates</option>
              <option value="Single Family Villa">Single Family</option>
              <option value="Commercial">Commercial</option>
              <option value="Off Market">Off Market</option>
              <option value="Condos">Condos</option>
            </select>
          </div>

          {/* Bulk Action Controls */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-[#B38B59]">{selectedIds.length} selected</span>
              <button
                type="button"
                onClick={() => handleBulkStatusChange("for_sale")}
                className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold"
              >
                Mark Active
              </button>
              <button
                type="button"
                onClick={() => handleBulkStatusChange("pending")}
                className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-semibold"
              >
                Mark Under Contract
              </button>
              <button
                type="button"
                onClick={() => handleBulkStatusChange("sold")}
                className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold"
              >
                Mark Sold
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-[#B38B59] rounded-lg text-xs font-bold"
              >
                Delete
              </button>
            </div>
          )}

          <div className="text-xs text-slate-500 font-medium self-end sm:self-center">
            Showing <strong>{filteredProperties.length}</strong> of <strong>{posts.length}</strong> listings
          </div>
        </div>

        {/* Listings Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[850px]">
            <thead className="bg-slate-100/70 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              <tr>
                <th className="p-3.5 w-10 text-center">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-slate-500 hover:text-slate-900"
                  >
                    {selectedIds.length === filteredProperties.length && filteredProperties.length > 0 ? (
                      <CheckSquare className="size-4 text-[#B38B59]" />
                    ) : (
                      <Square className="size-4" />
                    )}
                  </button>
                </th>
                <th className="p-3.5">Property Listing</th>
                <th className="p-3.5">Price</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5">Specs</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProperties.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No properties found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredProperties.map((p) => {
                  const isSelected = selectedIds.includes(p.id);
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors ${
                        isSelected ? "bg-red-50/40 dark:bg-red-950/20" : ""
                      }`}
                    >
                      {/* Select Checkbox */}
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSelect(p.id)}
                          className="text-slate-400 hover:text-slate-900"
                        >
                          {isSelected ? (
                            <CheckSquare className="size-4 text-[#B38B59]" />
                          ) : (
                            <Square className="size-4" />
                          )}
                        </button>
                      </td>

                      {/* Title & Photo */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image || "/wp-content/uploads/image-16.png"}
                            alt={p.title}
                            className="size-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 dark:text-white truncate max-w-[240px]">
                              {p.title}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              ID: {p.id.replace("prop-", "")}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="p-3.5 font-bold font-serif text-[#B38B59] text-sm">
                        ${p.price ? p.price.toLocaleString() : "Contact"}
                      </td>

                      {/* Location */}
                      <td className="p-3.5 text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1">
                          <MapPin className="size-3 text-[#B38B59] shrink-0" />
                          <span className="truncate max-w-[160px]">
                            {p.state === "Connecticut" ? `${p.city} ${p.state}` : `${p.address}, ${p.city}`}
                          </span>
                        </div>
                      </td>

                      {/* Specs */}
                      <td className="p-3.5 text-slate-500 text-[11px] font-medium whitespace-nowrap">
                        {p.beds > 0 ? `${p.beds}b / ${p.baths}ba` : "Commercial"} · {p.sqft ? `${p.sqft.toLocaleString()} sqft` : ""}
                      </td>

                      {/* Category */}
                      <td className="p-3.5">
                        <span className="px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold uppercase">
                          {p.category || p.propertyType}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            p.propertyStatus === "sold"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : p.propertyStatus === "pending" || p.propertyStatus === "under_contract"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : p.propertyStatus === "for_sale" || p.status === "Published"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-600 border border-slate-300"
                          }`}
                        >
                          {p.propertyStatus === "sold"
                            ? "Sold"
                            : p.propertyStatus === "pending" || p.propertyStatus === "under_contract"
                            ? "Under Contract"
                            : p.propertyStatus === "for_sale"
                            ? "Active"
                            : p.propertyStatus || p.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`/properties/${p.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            title="View Public Listing"
                            className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <Eye className="size-4" />
                          </a>
                          <button
                            type="button"
                            onClick={() => setEditingProperty(p)}
                            title="Edit Listing"
                            className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <Edit className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(p)}
                            title="Delete Listing"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Property Editor Modal (Add New) */}
      {isAddingNew && (
        <PropertyEditor
          open={isAddingNew}
          onClose={() => setIsAddingNew(false)}
          onCancel={() => setIsAddingNew(false)}
          onSave={async (values) => {
            createPost(values);
            setIsAddingNew(false);
          }}
        />
      )}

      {/* Property Editor Modal (Edit Existing) */}
      {editingProperty && (
        <PropertyEditor
          property={editingProperty}
          open={Boolean(editingProperty)}
          onClose={() => setEditingProperty(null)}
          onCancel={() => setEditingProperty(null)}
          onSave={async (values) => {
            updatePost(editingProperty.id, values);
            setEditingProperty(null);
          }}
        />
      )}
    </div>
  );
}
