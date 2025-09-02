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

type Errors = {
  name?: string;
  image?: string;
};

interface Brand {
  id: number | string;
  name: string;
  imageUrl?: string;
  // Add any other brand fields here
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
  const [image, setImage] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const [errors, setErrors] = React.useState<Errors>({});

  // Use controlled or internal open state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  // Initialize form with existing data in edit mode
  React.useEffect(() => {
    if (mode === "edit" && existingData && open) {
      setBrandName(existingData.name || "");
      if (existingData.imageUrl) {
        setPreview(existingData.imageUrl);
      }
    } else if (mode === "add" && open) {
      // Reset form for add mode
      setBrandName("");
      setImage(null);
      setPreview(null);
    }
  }, [mode, existingData, open]);

  const validate = () => {
    const e: Errors = {};
    if (!brandName.trim()) e.name = "Brand name is required";
    if (mode === "add" && !image) e.image = "Image is required";
    if (mode === "edit" && !image && !preview) e.image = "Image is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const brandData: Brand = {
      id: existingData?.id || Date.now(),
      name: brandName,
      imageUrl: preview || existingData?.imageUrl || "",
      ...existingData, // Preserve other existing fields
    };

    console.log(`${mode === "edit" ? "Updating" : "Saving new"} brand:`, brandData);

    onSave?.(brandData);

    // Reset form and close dialog
    setBrandName("");
    setImage(null);
    setPreview(null);
    setErrors({});
    setOpen(false);
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

        {/* Image Upload */}
        <div className="grid gap-2">
          <Label htmlFor="upload-images">Upload image</Label>
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
                  alt="Preview"
                  className="h-40 w-auto rounded-md object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                >
                  <IconX size={16} />
                </button>
              </>
            ) : (
              <>
                <IconCloudUpload className="h-10 w-10" />
                <p className="mt-2 text-sm">
                  Drag & drop your image here or{" "}
                  <span className="text-blue-600 hover:underline">
                    click to browse
                  </span>
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
          {mode === "edit" ? "Update" : "Save"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );

  if (mode === "edit") {
    // For edit mode, return just the dialog content (controlled externally)
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        {dialogContent}
      </Dialog>
    );
  }

  // For add mode, return the trigger button with dialog
  return (
    <Dialog open={open} onOpenChange={setOpen}>
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

// Export the Add version for backward compatibility
export function AddBrandDialog() {
  return <BrandDialog mode="add" />;
}

// Export a function to create edit dialogs for the data table
// eslint-disable-next-line react-refresh/only-export-components
export function createEditBrandDialog(rowData: Brand, onSave: (updatedData: Brand) => void) {
  return <BrandDialog mode="edit" existingData={rowData} onSave={onSave} open={true} />;
}