import * as React from "react";
import {
  IconCloudUpload,
  IconPlus,
  IconX,
  IconPhoto,
} from "@tabler/icons-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

type Errors = {
  name?: string;
  description?: string;
  website?: string;
  image?: string;
};

// FIX 1: Rename `imageUrl` to `logo` to match the main page's interface.
interface Brand {
  id: number | string;
  name: string;
  description: string;
  website?: string;
  status: "active" | "inactive";
  productCount: number;
  logo?: string; // <-- RENAMED
  createdAt: string;
}

interface BrandDialogProps {
  mode?: "add" | "edit";
  existingData?: Brand;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSave?: (data: Brand) => void;
}

export function BrandDialog({ 
  mode = "add", 
  existingData, 
  open: controlledOpen, 
  onOpenChange, 
  onSave 
}: BrandDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [brandName, setBrandName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [website, setWebsite] = React.useState("");
  const [status, setStatus] = React.useState<"active" | "inactive">("active");
  const [image, setImage] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const [errors, setErrors] = React.useState<Errors>({});

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  React.useEffect(() => {
    if (mode === "edit" && existingData && open) {
      setBrandName(existingData.name || "");
      setDescription(existingData.description || "");
      setWebsite(existingData.website || "");
      setStatus(existingData.status || "active");
      // FIX 2: Check for `logo` on existingData, not `imageUrl`.
      if (existingData.logo) { // <-- RENAMED
        setPreview(existingData.logo); // <-- RENAMED
      }
    } else if (mode === "add" && open) {
      resetForm();
    }
  }, [mode, existingData, open]);

  const validate = () => {
    const e: Errors = {};
    if (!brandName.trim()) e.name = "Brand name is required";
    if (!description.trim()) e.description = "Description is required";
    
    if (website && website.trim() && !isValidUrl(website)) {
      e.website = "Please enter a valid website URL";
    }
    
    if (mode === "add" && !image) e.image = "Image is required";
    if (mode === "edit" && !image && !preview) e.image = "Image is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string.startsWith('http') ? string : `https://${string}`);
      return true;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      return false;
    }
  };

  const resetForm = () => {
    setBrandName("");
    setDescription("");
    setWebsite("");
    setStatus("active");
    setImage(null);
    setPreview(null);
    setErrors({});
  };

  const handleSave = () => {
    if (!validate()) return;

    let formattedWebsite = website.trim();
    if (formattedWebsite && !formattedWebsite.startsWith('http')) {
      formattedWebsite = `https://${formattedWebsite}`;
    }

    const brandData: Brand = {
      id: existingData?.id || Date.now(),
      name: brandName,
      description: description,
      website: formattedWebsite || undefined,
      status: status,
      productCount: existingData?.productCount || 0,
      // FIX 3: Set the `logo` property, not `imageUrl`.
      logo: preview || existingData?.logo || "", // <-- RENAMED
      createdAt: existingData?.createdAt || new Date().toISOString().split('T')[0],
    };

    console.log(`${mode === "edit" ? "Updating" : "Saving new"} brand:`, brandData);

    onSave?.(brandData);

    if (mode === "add") {
      resetForm();
    } else {
      setOpen(false);
    }
  };

  const handleFile = (file: File) => {
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, image: undefined }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreview(null);
    setErrors((prev) => ({ ...prev, image: "Image is required" }));
  };

  const handleDialogClose = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    setOpen(newOpen);
  };

  const dialogContent = (
    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {mode === "edit" ? "Edit Brand" : "Add New Brand"}
        </DialogTitle>
        <DialogDescription>
          {mode === "edit" 
            ? "Update the brand details below." 
            : "Enter the brand details below."
          }
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        {/* Brand Name */}
        <div className="grid gap-2">
          <Label htmlFor="brand-name">Brand Name</Label>
          <Input
            id="brand-name"
            placeholder="e.g., Nike"
            value={brandName}
            onChange={(e) => {
              setBrandName(e.target.value);
              if (e.target.value.trim()) {
                setErrors((prev) => ({ ...prev, name: undefined }));
              }
            }}
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && (
            <p className="text-sm text-red-600 mt-1">{errors.name}</p>
          )}
        </div>

        {/* Description */}
        <div className="grid gap-2">
          <Label htmlFor="brand-description">Description</Label>
          <Textarea
            id="brand-description"
            placeholder="e.g., Athletic apparel and footwear brand"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (e.target.value.trim()) {
                setErrors((prev) => ({ ...prev, description: undefined }));
              }
            }}
            className={errors.description ? "border-red-500" : ""}
          />
          {errors.description && (
            <p className="text-sm text-red-600 mt-1">{errors.description}</p>
          )}
        </div>

        {/* Website (Optional) */}
        <div className="grid gap-2">
          <Label htmlFor="brand-website">
            Website <span className="text-muted-foreground text-sm">(Optional)</span>
          </Label>
          <Input
            id="brand-website"
            placeholder="e.g., nike.com or https://nike.com"
            value={website}
            onChange={(e) => {
              setWebsite(e.target.value);
              if (errors.website) {
                setErrors((prev) => ({ ...prev, website: undefined }));
              }
            }}
            className={errors.website ? "border-red-500" : ""}
          />
          {errors.website && (
            <p className="text-sm text-red-600 mt-1">{errors.website}</p>
          )}
        </div>

        {/* Status */}
        <div className="grid gap-2">
          <Label htmlFor="brand-status">Status</Label>
          <Select value={status} onValueChange={(value: "active" | "inactive") => setStatus(value)}>
            <SelectTrigger id="brand-status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Image Upload */}
        <div className="grid gap-2">
          <Label htmlFor="upload-images">Brand Logo</Label>
          <div
            className={`relative flex min-h-[16rem] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-colors
              ${
                dragActive
                  ? "border-blue-500 bg-blue-50 text-blue-500"
                  : errors.image
                  ? "border-red-500 text-red-500"
                  : "border-gray-300 bg-gray-50 text-gray-500 hover:border-blue-500 hover:text-blue-500"
              }`}
            onClick={() =>
              !preview && document.getElementById("brand-image")?.click()
            }
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragActive(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              if (e.dataTransfer.files?.[0]) {
                handleFile(e.dataTransfer.files[0]);
              }
            }}
          >
            {preview ? (
              <>
                <img
                  src={preview}
                  alt="Brand Logo Preview"
                  className="h-40 w-auto rounded-md object-contain bg-white p-2"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage();
                  }}
                  className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                >
                  <IconX size={16} />
                </button>
              </>
            ) : (
              <>
                <IconCloudUpload className="h-10 w-10" />
                <p className="mt-2 text-sm">
                  Drag & drop brand logo here or{" "}
                  <span className="text-blue-600 hover:underline">
                    click to browse
                  </span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  PNG, JPG, or SVG format recommended
                </p>
              </>
            )}
          </div>
          <input
            id="brand-image"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          {errors.image && (
            <p className="text-sm text-red-600 mt-1">{errors.image}</p>
          )}
          {image && !errors.image && (
            <p className="mt-2 text-xs text-green-600">
              Selected: {image.name}
            </p>
          )}
        </div>
      </div>

      <DialogFooter>
        <Button onClick={handleSave}>
          <IconPhoto className="mr-2 h-4 w-4" />
          {mode === "edit" ? "Update Brand" : "Save Brand"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );

  if (mode === "edit") {
    return (
      <Dialog open={open} onOpenChange={handleDialogClose}>
        {dialogContent}
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <IconPlus />
          <span className="hidden lg:inline">Add Brand</span>
        </Button>
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
}

export function AddBrandDialog() {
  return <BrandDialog mode="add" />;
}

// eslint-disable-next-line react-refresh/only-export-components
export function createEditBrandDialog(rowData: Brand, onSave: (updatedData: Brand) => void) {
  return (
    <BrandDialog 
      mode="edit" 
      existingData={rowData} 
      onSave={onSave}
    />
  );
}