import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Search,
  Download,
  Phone,
  Mail,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Archive,
  X,
  ExternalLink,
  MessageSquare,
  UserPlus,
  Eye,
  Building2,
  Calendar,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { useAdmin, type CrmLead } from "@/lib/admin-store";

export const Route = createFileRoute("/admin/crm")({
  component: AdminCrmPage,
});

export default function AdminCrmPage() {
  const { leads, updateLeadStatus, addLead, deleteLead } = useAdmin();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [addLeadOpen, setAddLeadOpen] = useState(false);

  // New Lead Form
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newProperty, setNewProperty] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [newStatus, setNewStatus] = useState<CrmLead["status"]>("New");

  // Selected Inquiry for Mini Window Modal
  const [activeInquiry, setActiveInquiry] = useState<CrmLead | null>(null);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchSearch =
        searchQuery.trim() === "" ||
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.property.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus =
        statusFilter === "all" ||
        lead.status?.toLowerCase().replace(/\s+/g, "") ===
          statusFilter.toLowerCase().replace(/\s+/g, "");

      return matchSearch && matchStatus;
    });
  }, [leads, searchQuery, statusFilter]);

  // Export CSV
  const handleExportCsv = () => {
    const headers = ["ID", "Name", "Email", "Phone", "Property/Interest", "Status", "Date", "Message"];
    const rows = filteredLeads.map((l) => [
      l.id,
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.email.replace(/"/g, '""')}"`,
      `"${l.phone.replace(/"/g, '""')}"`,
      `"${l.property.replace(/"/g, '""')}"`,
      l.status,
      l.date,
      `"${(l.message || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sharif_realty_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${filteredLeads.length} leads to CSV.`);
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) {
      toast.error("Please provide client name and email.");
      return;
    }

    addLead({
      name: newName.trim(),
      email: newEmail.trim(),
      phone: newPhone.trim() || "(203) 802-8099",
      property: newProperty.trim() || "General Consultation Request",
      message: newMessage.trim(),
      status: newStatus,
      agent: "Majeed Sharif",
    });

    toast.success("Lead registered successfully!");
    setNewName("");
    setNewEmail("");
    setNewPhone("");
    setNewProperty("");
    setNewMessage("");
    setAddLeadOpen(false);
  };

  const handleCycleStatus = (id: string, current: CrmLead["status"]) => {
    const next: CrmLead["status"] =
      current === "New" ? "In Progress" : current === "In Progress" ? "Closed" : "New";
    updateLeadStatus(id, next);
    toast.success(`Status updated to ${next}.`);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 border border-[#E2E8F0] shadow-sm">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#091523] tracking-tight">
            Inquiries & Leads
          </h1>
          <p className="text-xs text-slate-500">
            Manage incoming requests, track lead status, and initiate client contact.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#091523] text-[#091523] hover:bg-slate-50 text-xs font-bold transition-colors"
          >
            <Download className="size-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setAddLeadOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold transition-colors shadow-sm"
          >
            <UserPlus className="size-3.5" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-[#E2E8F0] p-3 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto text-xs">
          {/* Search */}
          <div className="relative min-w-[220px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, email, phone, property..."
              className="w-full pl-8 pr-2 py-1.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs focus:outline-none focus:border-[#C5A880] rounded-lg"
            />
          </div>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white py-1.5 px-2 text-xs font-medium focus:outline-none focus:border-[#C5A880] rounded-lg"
          >
            <option value="all">All Statuses</option>
            <option value="new">New ({leads.filter((l) => l.status === "New").length})</option>
            <option value="inprogress">In Progress</option>
            <option value="closed">Closed</option>
          </select>

          {/* Date Range */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white py-1.5 px-2 text-xs font-medium focus:outline-none focus:border-[#C5A880] rounded-lg"
          >
            <option value="all">Date: All Time</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>

          {/* Active Filter Pills */}
          {(statusFilter !== "all" || searchQuery !== "") && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter("all");
                setSearchQuery("");
              }}
              className="flex items-center gap-1 text-[11px] font-semibold text-[#DC2626] hover:underline"
            >
              <X className="size-3" /> Clear Filters
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <strong>{filteredLeads.length}</strong> of <strong>{leads.length}</strong> inquiries
        </div>
      </div>

      {/* Leads Data Table */}
      <div className="bg-white border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="bg-[#F2F4F6] border-b border-[#E2E8F0] text-[11px] font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredLeads.length > 0 && selectedIds.length === filteredLeads.length
                    }
                    onChange={() => {
                      if (selectedIds.length === filteredLeads.length) setSelectedIds([]);
                      else setSelectedIds(filteredLeads.map((l) => l.id));
                    }}
                    className="size-3.5 text-[#DC2626] rounded border-slate-300"
                  />
                </th>
                <th className="p-3">Client Name</th>
                <th className="p-3">Contact Information</th>
                <th className="p-3">Interest / Property</th>
                <th className="p-3">Source</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-xs">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No inquiries found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const isSelected = selectedIds.includes(lead.id);
                  const isNew = lead.status === "New";
                  const isInProgress = lead.status === "In Progress" || lead.status === "In Contract";

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => setActiveInquiry(lead)}
                      title="Click to view full inquiry details"
                      className={`hover:bg-[#F8FAFC] transition-colors cursor-pointer group ${
                        isSelected ? "bg-red-50/40" : ""
                      }`}
                    >
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            setSelectedIds((prev) =>
                              prev.includes(lead.id)
                                ? prev.filter((i) => i !== lead.id)
                                : [...prev, lead.id],
                            );
                          }}
                          className="size-3.5 text-[#DC2626] rounded border-slate-300 cursor-pointer"
                        />
                      </td>

                      {/* Client Name + ID */}
                      <td className="p-3">
                        <div className="font-bold text-slate-900 group-hover:text-[#DC2626] transition-colors flex items-center gap-1.5">
                          <span>{lead.name}</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {lead.id.startsWith("LD-") ? lead.id : `LD-${lead.id}`}
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-1">
                          {lead.phone && (
                            <div className="flex items-center gap-1.5 text-slate-700">
                              <Phone className="size-3 text-slate-400" />
                              <a
                                href={`tel:${lead.phone}`}
                                className="font-mono hover:text-[#DC2626] hover:underline"
                              >
                                {lead.phone}
                              </a>
                            </div>
                          )}
                          {lead.email && (
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <Mail className="size-3 text-slate-400" />
                              <a
                                href={`mailto:${lead.email}`}
                                className="hover:text-[#DC2626] hover:underline"
                              >
                                {lead.email}
                              </a>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Interest / Property */}
                      <td className="p-3">
                        <div className="font-semibold text-slate-800 line-clamp-1 max-w-[260px]">
                          {lead.property || "General Showing Request"}
                        </div>
                        {lead.message && (
                          <div className="text-[11px] text-slate-500 italic line-clamp-1 max-w-[260px]">
                            "{lead.message}"
                          </div>
                        )}
                      </td>

                      {/* Source */}
                      <td className="p-3">
                        <span className="inline-block px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          {lead.property?.includes("Zillow")
                            ? "Zillow Lead"
                            : lead.property?.includes("SmartMLS")
                            ? "SmartMLS"
                            : "Direct Website"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleCycleStatus(lead.id, lead.status)}
                          title="Click to toggle status"
                          className={`px-2.5 py-0.5 text-[10px] font-bold uppercase transition-all ${
                            isNew
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200"
                              : isInProgress
                              ? "bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200"
                              : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                          }`}
                        >
                          {lead.status}
                        </button>
                      </td>

                      {/* Date */}
                      <td className="p-3 font-mono text-[11px] text-slate-500">
                        {lead.date || "2026-08-24"}
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setActiveInquiry(lead)}
                            title="Open full inquiry window"
                            className="p-1.5 bg-slate-100 text-slate-700 hover:bg-slate-900 hover:text-white border border-slate-200 transition-colors"
                          >
                            <Eye className="size-3.5" />
                          </button>
                          {lead.phone && (
                            <a
                              href={`tel:${lead.phone}`}
                              title={`Call ${lead.name}`}
                              className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 transition-colors"
                            >
                              <Phone className="size-3.5" />
                            </a>
                          )}
                          {lead.email && (
                            <a
                              href={`mailto:${lead.email}`}
                              title={`Email ${lead.name}`}
                              className="p-1.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 transition-colors"
                            >
                              <Mail className="size-3.5" />
                            </a>
                          )}
                          <button
                            type="button"
                            title={`Delete inquiry from ${lead.name}`}
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete the inquiry from "${lead.name}"?`)) {
                                deleteLead(lead.id);
                                toast.success(`Deleted inquiry from "${lead.name}".`);
                              }
                            }}
                            className="p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200 transition-colors cursor-pointer"
                          >
                            <Trash2 className="size-3.5" />
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

        {/* Footer */}
        <div className="flex items-center justify-between p-3 border-t border-[#E2E8F0] bg-[#F8FAFC] text-xs text-slate-500">
          <div>
            Showing <strong>{filteredLeads.length}</strong> of <strong>{leads.length}</strong> inquiries
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled
              className="px-2.5 py-1 border border-[#E2E8F0] bg-white text-slate-400 cursor-not-allowed"
            >
              Previous
            </button>
            <span className="font-semibold text-slate-700">1</span>
            <button
              disabled
              className="px-2.5 py-1 border border-[#E2E8F0] bg-white text-slate-400 cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add Lead Modal */}
      {addLeadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-[#091523]">Register New Client Lead</h2>
              <button
                type="button"
                onClick={() => setAddLeadOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-800 dark:text-slate-200">Client Full Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  className="w-full p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#C5A880] rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-800 dark:text-slate-200">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="e.vance@example.com"
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#C5A880] rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-800 dark:text-slate-200">Phone Number</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="(203) 802-8099"
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#C5A880] rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-800 dark:text-slate-200">Property of Interest</label>
                <input
                  type="text"
                  value={newProperty}
                  onChange={(e) => setNewProperty(e.target.value)}
                  placeholder="e.g. 5 Shire Way Burlington or General Commercial"
                  className="w-full p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#C5A880] rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-800 dark:text-slate-200">Initial Message / Notes</label>
                <textarea
                  rows={3}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Notes from initial inquiry, budget parameters, showing times..."
                  className="w-full p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#C5A880] rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setAddLeadOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inquiry Mini Window Modal */}
      {activeInquiry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setActiveInquiry(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 max-w-lg w-full rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {activeInquiry.name}
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    {activeInquiry.id.startsWith("LD-") ? activeInquiry.id : `LD-${activeInquiry.id}`}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                  <Calendar className="size-3.5 text-slate-400" />
                  <span>Received {activeInquiry.date || "Recently"}</span>
                  <span>•</span>
                  <span>Assigned: {activeInquiry.agent || "Majeed Sharif"}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveInquiry(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Close"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Property / Interest Topic */}
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] dark:bg-slate-800/60 border border-[#EAE6DF] dark:border-slate-700">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#B38B59] block mb-1">
                Property / Showing Interest
              </span>
              <div className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="size-4 text-[#C5A880] shrink-0" />
                <span>{activeInquiry.property || "General Showing / Consultation"}</span>
              </div>
            </div>

            {/* Full Inquiry Message */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <MessageSquare className="size-3.5 text-[#C5A880]" /> Full Client Message &amp; Notes
                </span>
                {activeInquiry.message && (
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(activeInquiry.message || "");
                      toast.success("Message copied to clipboard!");
                    }}
                    className="text-[11px] font-semibold text-slate-500 hover:text-[#DC2626] flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="size-3" /> Copy
                  </button>
                )}
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                {activeInquiry.message ? (
                  activeInquiry.message
                ) : (
                  <em className="text-slate-400">No message body provided with this inquiry.</em>
                )}
              </div>
            </div>

            {/* Contact Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Phone</span>
                  <a
                    href={`tel:${activeInquiry.phone}`}
                    className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-[#DC2626] hover:underline"
                  >
                    {activeInquiry.phone || "Not provided"}
                  </a>
                </div>
                {activeInquiry.phone && (
                  <a
                    href={`tel:${activeInquiry.phone}`}
                    className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors"
                    title="Call Client"
                  >
                    <Phone className="size-4" />
                  </a>
                )}
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between">
                <div className="space-y-0.5 truncate mr-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Email Address</span>
                  <a
                    href={`mailto:${activeInquiry.email}`}
                    className="text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-[#DC2626] hover:underline truncate block"
                  >
                    {activeInquiry.email}
                  </a>
                </div>
                <a
                  href={`mailto:${activeInquiry.email}`}
                  className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-colors shrink-0"
                  title="Email Client"
                >
                  <Mail className="size-4" />
                </a>
              </div>
            </div>

            {/* Status Management Bar */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Status:</span>
                {(["New", "In Progress", "In Contract", "Closed"] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      updateLeadStatus(activeInquiry.id, st);
                      setActiveInquiry((prev) => prev ? { ...prev, status: st } : null);
                      toast.success(`Inquiry status set to "${st}".`);
                    }}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                      activeInquiry.status === st
                        ? st === "New"
                          ? "bg-emerald-600 text-white shadow-sm"
                          : st === "In Progress" || st === "In Contract"
                          ? "bg-amber-600 text-white shadow-sm"
                          : "bg-slate-700 text-white shadow-sm"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete inquiry from "${activeInquiry.name}"?`)) {
                      deleteLead(activeInquiry.id);
                      setActiveInquiry(null);
                      toast.success("Inquiry deleted.");
                    }
                  }}
                  className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                  title="Delete inquiry"
                >
                  <Trash2 className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveInquiry(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
