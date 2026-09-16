import { useState, useRef } from "react";
import {
  Building2,
  Check,
  Compass,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Plus,
  Trash2,
  UploadCloud,
  Video,
  X,
  Layers,
  FolderOpen,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ALL_AMENITIES,
  POST_CATEGORIES,
  PROPERTY_TYPES,
  useAdmin,
  type AdminPropertyPost,
  type MediaAsset,
} from "@/lib/admin-store";

type Props = {
  property?: any;
  onSave?: (values: any) => void | Promise<void>;
  onCancel?: () => void;
  open?: boolean;
  onClose?: () => void;
};

export function PropertyEditor({ property, onSave, onCancel, open, onClose }: Props) {
  const { createPost, updatePost, mediaAssets, addMediaAsset } = useAdmin();
  const [pending, setPending] = useState(false);
  const [title, setTitle] = useState(property?.title ?? "");
  const [slug, setSlug] = useState(property?.slug ?? "");
  const [description, setDescription] = useState(property?.description ?? "");
  const [price, setPrice] = useState(property?.price ?? 750000);
  const [isCallOnPrice, setIsCallOnPrice] = useState<boolean>(
    Boolean(
      property?.priceLabel?.toLowerCase().includes("call") ||
      property?.priceLabel === "Price on Call" ||
      (property && property.price === 0 && property.priceLabel)
    )
  );
  const [status, setStatus] = useState<AdminPropertyPost["status"]>(
    property?.status ?? "Published",
  );
  const [listingType, setListingType] = useState<AdminPropertyPost["listingType"]>(
    property?.listingType ?? "buy",
  );
  const [propertyStatus, setPropertyStatus] = useState<AdminPropertyPost["propertyStatus"]>(
    property?.propertyStatus ?? "for_sale",
  );
  const [category, setCategory] = useState(property?.category ?? "Luxury Estates");
  const [propertyType, setPropertyType] = useState(
    property?.propertyType ?? "Single Family Villa",
  );
  const [beds, setBeds] = useState(property?.beds ?? 4);
  const [baths, setBaths] = useState(property?.baths ?? 3);
  const [sqft, setSqft] = useState(property?.sqft ?? 3200);
  const [lotSize, setLotSize] = useState(property?.lotSize ?? "1.25 Acres");
  const [garageSpaces, setGarageSpaces] = useState(property?.garageSpaces ?? 2);
  const [yearBuilt, setYearBuilt] = useState(property?.yearBuilt ?? 2021);
  const [mlsId, setMlsId] = useState(property?.mlsId ?? "SR-32075");
  const [address, setAddress] = useState(property?.address ?? "5 Shire Way");
  const [city, setCity] = useState(property?.city ?? "Burlington");
  const [state, setState] = useState(property?.state ?? "CT");
  const [zip, setZip] = useState(property?.zip ?? "06013");
  const [virtualTourUrl, setVirtualTourUrl] = useState(property?.virtualTourUrl ?? "");
  const [isFeatured, setIsFeatured] = useState(property?.isFeatured ?? true);

  // Media picker modal state
  const [showLibraryModal, setShowLibraryModal] = useState(false);

  // Multi-image list
  const [images, setImages] = useState<string[]>(
    property?.images && property.images.length > 0
      ? property.images
      : [
          property?.image ||
            "/wp-content/uploads/image-16.png",
        ],
  );
  const [newImageUrl, setNewImageUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Amenities checklist
  const [features, setFeatures] = useState<string[]>(
    property?.features ?? [
      "Infinity Pool & Spa",
      "Smart Home Automation (Crestron/Lutron)",
      "Chef's Gourmet Kitchen & Sub-Zero",
      "Two Car Attached Garage",
      "Central Air Conditioning",
    ],
  );

  function handleAddImage() {
    if (!newImageUrl.trim()) return;
    setImages((prev) => [...prev, newImageUrl.trim()]);
    setNewImageUrl("");
    toast.success("Image added to gallery.");
  }

  function handleRemoveImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleToggleFeature(feat: string) {
    setFeatures((prev) =>
      prev.includes(feat) ? prev.filter((f) => f !== feat) : [...prev, feat],
    );
  }

  // Handle uploading photos from device
  const handleDeviceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setImages((prev) => [...prev, result]);
          // Also register in admin media store for future reuse
          addMediaAsset({
            title: file.name.replace(/\.[^/.]+$/, ""),
            url: result,
            filename: file.name,
            fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            dimensions: "Auto",
            type: file.type.startsWith("video") ? "video" : "image",
          });
        }
      };
      reader.readAsDataURL(file);
    });

    toast.success(`Added ${files.length} photo(s) from device.`);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Select photo from media library
  const handleSelectFromLibrary = (url: string) => {
    if (!images.includes(url)) {
      setImages((prev) => [...prev, url]);
      toast.success("Image added from Media Library.");
    } else {
      toast.info("Image already in gallery.");
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a property title.");
      return;
    }

    setPending(true);

    const generatedSlug =
      slug.trim() ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    const data: Partial<AdminPropertyPost> = {
      title,
      slug: generatedSlug,
      description,
      price: isCallOnPrice ? 0 : Number(price) || 0,
      priceLabel: isCallOnPrice
        ? "Price on Call"
        : propertyStatus === "sold"
        ? (property?.priceLabel || "Sold")
        : undefined,
      status,
      listingType,
      propertyStatus,
      category,
      propertyType,
      beds: Number(beds),
      baths: Number(baths),
      sqft: Number(sqft),
      lotSize,
      garageSpaces: Number(garageSpaces),
      yearBuilt: Number(yearBuilt),
      mlsId,
      address,
      city,
      state,
      zip,
      image: images[0] || "/wp-content/uploads/image-16.png",
      images,
      features,
      isFeatured,
      virtualTourUrl,
    };

    try {
      if (onSave) {
        await onSave(data);
      } else {
        if (property?.id) {
          updatePost(property.id, data);
          toast.success("Property listing updated successfully!");
        } else {
          createPost(data);
          toast.success("New property listing published successfully!");
        }
      }

      if (onClose) onClose();
      else if (onCancel) onCancel();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save property.");
    } finally {
      setPending(false);
    }
  }

  const handleClose = () => {
    if (onClose) onClose();
    else if (onCancel) onCancel();
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6 text-[#1E293B]">
      {/* Header if modal */}
      <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-[#0F172A]">
            {property ? "Edit Property Listing" : "Add New Property Listing"}
          </h2>
          <p className="text-xs text-slate-500">
            Fill in the specifications to publish live to the public real estate portfolio.
          </p>
        </div>
        {(open || onClose || onCancel) && (
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="size-5" />
          </button>
        )}
      </div>

      {/* 1. Basic Property Information */}
      <div className="space-y-4 border-b border-[#EAE6DF] pb-6">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#B38B59] flex items-center gap-2">
          <Building2 className="size-4 text-[#C5A880]" />
          1. Basic Property Information
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="prop-title" className="text-xs font-semibold text-slate-700">
              Property Title *
            </Label>
            <Input
              id="prop-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 5 Shire Way, Burlington, CT 06013 · Luxury Estate"
              required
              className="text-xs border-[#EAE6DF] bg-[#FAF8F5] rounded-xl focus:border-[#C5A880]"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="prop-price" className="text-xs font-semibold text-slate-700">
                Listing Price ($) *
              </Label>
              {isCallOnPrice && (
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded">
                  Price on Call Active
                </span>
              )}
            </div>
            <Input
              id="prop-price"
              type="number"
              value={isCallOnPrice ? "" : price}
              onChange={(e) => setPrice(Number(e.target.value))}
              placeholder={isCallOnPrice ? "Price on Call" : "750000"}
              disabled={isCallOnPrice}
              required={!isCallOnPrice}
              className={`text-xs font-mono font-bold text-[#0F172A] border-[#EAE6DF] rounded-xl focus:border-[#C5A880] ${
                isCallOnPrice ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-[#FAF8F5]"
              }`}
            />
            <label className="flex items-center gap-2 cursor-pointer pt-1 select-none">
              <input
                type="checkbox"
                checked={isCallOnPrice}
                onChange={(e) => setIsCallOnPrice(e.target.checked)}
                className="size-4 text-[#C5A880] rounded border-slate-300 focus:ring-[#C5A880] cursor-pointer"
              />
              <span className="text-xs font-medium text-slate-700">
                <strong>Call on price</strong> (Hide exact numeric price &amp; display "Price on Call")
              </span>
            </label>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prop-slug" className="text-xs font-semibold text-slate-700">
              URL Slug (optional)
            </Label>
            <Input
              id="prop-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="5-shire-way-burlington-ct"
              className="text-xs font-mono border-[#EAE6DF] bg-[#FAF8F5] rounded-xl focus:border-[#C5A880]"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prop-category" className="text-xs font-semibold text-slate-700">
              Category
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="prop-category" className="text-xs border-[#EAE6DF] bg-[#FAF8F5] rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#EAE6DF]">
                {POST_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prop-type" className="text-xs font-semibold text-slate-700">
              Property Type
            </Label>
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger id="prop-type" className="text-xs border-[#EAE6DF] bg-[#FAF8F5] rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#EAE6DF]">
                {PROPERTY_TYPES.map((pt) => (
                  <SelectItem key={pt} value={pt}>
                    {pt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prop-status" className="text-xs font-semibold text-slate-700">
              Listing Status
            </Label>
            <Select
              value={propertyStatus}
              onValueChange={(val: any) => setPropertyStatus(val)}
            >
              <SelectTrigger id="prop-status" className="text-xs border-[#EAE6DF] bg-[#FAF8F5] rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#EAE6DF]">
                <SelectItem value="for_sale">Active (For Sale)</SelectItem>
                <SelectItem value="pending">Under Contract / Pending</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="for_rent">For Rent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="prop-desc" className="text-xs font-semibold text-slate-700">
              Full Description
            </Label>
            <Textarea
              id="prop-desc"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed architectural description, lot specifics, interior luxury features..."
              className="text-xs border-[#EAE6DF] bg-[#FAF8F5] rounded-xl focus:border-[#C5A880]"
            />
          </div>
        </div>
      </div>

      {/* 2. Location Details */}
      <div className="space-y-4 border-b border-[#EAE6DF] pb-6">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#B38B59] flex items-center gap-2">
          <MapPin className="size-4 text-[#C5A880]" />
          2. Location Details
        </h3>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5 sm:col-span-3">
            <Label htmlFor="prop-address" className="text-xs font-semibold text-slate-700">
              Street Address *
            </Label>
            <Input
              id="prop-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 5 Shire Way"
              required
              className="text-xs border-[#EAE6DF] bg-[#FAF8F5] rounded-xl focus:border-[#C5A880]"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prop-city" className="text-xs font-semibold text-slate-700">
              City
            </Label>
            <Input
              id="prop-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="text-xs border-[#EAE6DF] bg-[#FAF8F5] rounded-xl focus:border-[#C5A880]"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prop-state" className="text-xs font-semibold text-slate-700">
              State
            </Label>
            <Input
              id="prop-state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="text-xs border-[#EAE6DF] bg-[#FAF8F5] rounded-xl focus:border-[#C5A880]"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prop-zip" className="text-xs font-semibold text-slate-700">
              ZIP Code
            </Label>
            <Input
              id="prop-zip"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              className="text-xs border-[#EAE6DF] bg-[#FAF8F5] rounded-xl focus:border-[#C5A880]"
            />
          </div>
        </div>
      </div>

      {/* 3. Property Specifications */}
      <div className="space-y-4 border-b border-[#EAE6DF] pb-6">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#B38B59] flex items-center gap-2">
          <Layers className="size-4 text-[#C5A880]" />
          3. Property Specifications
        </h3>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="prop-beds" className="text-xs font-semibold text-slate-700">
              Bedrooms
            </Label>
            <Input
              id="prop-beds"
              type="number"
              value={beds}
              onChange={(e) => setBeds(Number(e.target.value))}
              className="text-xs border-[#EAE6DF] bg-[#FAF8F5] rounded-xl focus:border-[#C5A880]"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prop-baths" className="text-xs font-semibold text-slate-700">
              Bathrooms
            </Label>
            <Input
              id="prop-baths"
              type="number"
              step="0.5"
              value={baths}
              onChange={(e) => setBaths(Number(e.target.value))}
              className="text-xs border-[#EAE6DF] bg-[#FAF8F5] rounded-xl focus:border-[#C5A880]"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prop-sqft" className="text-xs font-semibold text-slate-700">
              Living Area (sqft)
            </Label>
            <Input
              id="prop-sqft"
              type="number"
              value={sqft}
              onChange={(e) => setSqft(Number(e.target.value))}
              className="text-xs border-[#EAE6DF] bg-[#FAF8F5] rounded-xl focus:border-[#C5A880]"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prop-lot" className="text-xs font-semibold text-slate-700">
              Lot Size
            </Label>
            <Input
              id="prop-lot"
              value={lotSize}
              onChange={(e) => setLotSize(e.target.value)}
              placeholder="e.g. 1.25 Acres"
              className="text-xs border-[#EAE6DF] bg-[#FAF8F5] rounded-xl focus:border-[#C5A880]"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prop-garage" className="text-xs font-semibold text-slate-700">
              Garage Spaces
            </Label>
            <Input
              id="prop-garage"
              type="number"
              value={garageSpaces}
              onChange={(e) => setGarageSpaces(Number(e.target.value))}
              className="text-xs border-[#EAE6DF] bg-[#FAF8F5] rounded-xl focus:border-[#C5A880]"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prop-year" className="text-xs font-semibold text-slate-700">
              Year Built
            </Label>
            <Input
              id="prop-year"
              type="number"
              value={yearBuilt}
              onChange={(e) => setYearBuilt(Number(e.target.value))}
              className="text-xs border-[#EAE6DF] bg-[#FAF8F5] rounded-xl focus:border-[#C5A880]"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prop-mls" className="text-xs font-semibold text-slate-700">
              MLS / Listing ID
            </Label>
            <Input
              id="prop-mls"
              value={mlsId}
              onChange={(e) => setMlsId(e.target.value)}
              className="text-xs font-mono border-[#EAE6DF] bg-[#FAF8F5] rounded-xl focus:border-[#C5A880]"
            />
          </div>

          <div className="space-y-1.5 flex flex-col justify-end">
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer pb-2 text-slate-800">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="size-4 text-[#0F172A] rounded border-[#EAE6DF] focus:ring-[#C5A880]"
              />
              <span>Featured on Homepage</span>
            </label>
          </div>
        </div>
      </div>

      {/* 4. Photo Gallery & Virtual Tour (Device Upload & Media Library) */}
      <div className="space-y-4 border-b border-[#EAE6DF] pb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#B38B59] flex items-center gap-2">
            <ImageIcon className="size-4 text-[#C5A880]" />
            4. Photo Gallery &amp; Virtual Tour
          </h3>

          <div className="flex items-center gap-2">
            {/* Upload from Device */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              multiple
              onChange={handleDeviceUpload}
              className="hidden"
              id="device-photo-upload"
            />
            <label
              htmlFor="device-photo-upload"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl text-xs font-semibold cursor-pointer shadow-sm transition-all"
            >
              <UploadCloud className="size-3.5 text-[#C5A880]" />
              <span>Upload from Device</span>
            </label>

            {/* Select from Media Library */}
            <button
              type="button"
              onClick={() => setShowLibraryModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#EAE6DF] hover:bg-[#FAF8F5] text-[#0F172A] rounded-xl text-xs font-semibold cursor-pointer transition-all"
            >
              <FolderOpen className="size-3.5 text-[#B38B59]" />
              <span>Choose from Library</span>
            </button>
          </div>
        </div>

        {/* Fallback URL input */}
        <div className="flex gap-2">
          <Input
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder="Or enter image URL (e.g. /wp-content/uploads/1-1.png)"
            className="text-xs flex-1 border-[#EAE6DF] bg-[#FAF8F5] rounded-xl"
          />
          <Button
            type="button"
            onClick={handleAddImage}
            className="bg-[#0F172A] text-white hover:bg-[#1E293B] text-xs px-4 rounded-xl"
          >
            <Plus className="size-3.5 mr-1 text-[#C5A880]" /> Add URL
          </Button>
        </div>

        {/* Gallery Preview Grid */}
        {images.length > 0 && (
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-500 block">
              Active Gallery Photos ({images.length}) — First image will be used as primary thumbnail:
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="group relative aspect-video bg-slate-100 border border-[#EAE6DF] rounded-xl overflow-hidden shadow-xs"
                >
                  <img src={img} alt="preview" className="h-full w-full object-cover" />
                  {idx === 0 && (
                    <span className="absolute bottom-1 left-1 bg-[#0F172A]/90 text-[#C5A880] text-[9px] font-bold px-1.5 py-0.5 rounded">
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-red-600/90 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                    title="Remove Photo"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Virtual Tour 3D Link */}
        <div className="space-y-1.5 pt-2">
          <Label htmlFor="prop-virtual-tour" className="text-xs font-semibold text-slate-700">
            Matterport 3D / Virtual Tour URL (optional)
          </Label>
          <Input
            id="prop-virtual-tour"
            value={virtualTourUrl}
            onChange={(e) => setVirtualTourUrl(e.target.value)}
            placeholder="https://my.matterport.com/show/?m=..."
            className="text-xs font-mono border-[#EAE6DF] bg-[#FAF8F5] rounded-xl"
          />
        </div>
      </div>

      {/* 5. Amenities & Highlights */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#B38B59] flex items-center gap-2">
          <Check className="size-4 text-[#C5A880]" />
          5. Amenities &amp; Highlights
        </h3>

        <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
          {ALL_AMENITIES.slice(0, 12).map((amenity) => {
            const isChecked = features.includes(amenity);
            return (
              <label
                key={amenity}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  isChecked
                    ? "border-[#C5A880] bg-[#FAF8F5] text-[#0F172A] font-semibold"
                    : "border-[#EAE6DF] bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleToggleFeature(amenity)}
                  className="rounded border-[#EAE6DF] text-[#0F172A] focus:ring-[#C5A880]"
                />
                <span>{amenity}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Submit Action Bar */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EAE6DF]">
        <Button
          type="button"
          variant="outline"
          onClick={handleClose}
          disabled={pending}
          className="rounded-xl border-[#EAE6DF] text-xs font-semibold"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={pending}
          className="bg-[#0F172A] hover:bg-[#1E293B] text-white px-6 rounded-xl text-xs font-bold shadow-sm"
        >
          {pending ? (
            <>
              <Loader2 className="size-3.5 mr-1.5 animate-spin" /> Saving...
            </>
          ) : property ? (
            "Save Changes"
          ) : (
            "Publish Property"
          )}
        </Button>
      </div>

      {/* Media Library Selection Modal */}
      {showLibraryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-[#EAE6DF] space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#0F172A]">Media Library</h3>
                <p className="text-xs text-slate-500">Click any image to add it directly to this property gallery.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowLibraryModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto grid grid-cols-3 sm:grid-cols-4 gap-3 p-1">
              {mediaAssets.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => handleSelectFromLibrary(asset.url)}
                  className={`group relative aspect-square rounded-xl overflow-hidden border cursor-pointer transition-all ${
                    images.includes(asset.url)
                      ? "border-[#C5A880] ring-2 ring-[#C5A880]/40 opacity-70"
                      : "border-[#EAE6DF] hover:border-[#C5A880] hover:scale-102"
                  }`}
                >
                  <img src={asset.url} alt={asset.title} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <span className="text-[10px] text-white truncate font-semibold">{asset.title}</span>
                  </div>
                  {images.includes(asset.url) && (
                    <span className="absolute top-1.5 right-1.5 size-5 bg-[#C5A880] text-white rounded-full flex items-center justify-center text-xs shadow-sm">
                      ✓
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-[#EAE6DF]">
              <Button
                type="button"
                onClick={() => setShowLibraryModal(false)}
                className="bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs px-5 rounded-xl"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </form>
  );

  if (open !== undefined) {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
        <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-[#EAE6DF] my-8 max-h-[90vh] overflow-y-auto">
          {formContent}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#EAE6DF]">
      {formContent}
    </div>
  );
}
