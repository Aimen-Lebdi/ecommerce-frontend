import * as React from "react";
import { useTranslation } from 'react-i18next';
import {
  IconCloudUpload,
  IconPlus,
  IconX,
} from "@tabler/icons-react";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";

type Errors = {
  name?: string;
  image?: string;
};

// Updated Brand interface to match backend structure
interface Brand {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  productCount: number;
  createdAt: string;
}

interface BrandDialogProps {
  mode?: "add" | "edit";
  existingData?: Brand;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSave?: (data: { name?: string; image?: File | null }) => void; // Made name optional for updates
  isLoading?: boolean; // Add loading prop
}

export function BrandDialog({
  mode = "add",
  existingData,
  open: controlledOpen,
  onOpenChange,
  onSave,
  isLoading = false, // Add loading prop with default
}: BrandDialogProps) {
  const { t } = useTranslation();
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [brandName, setBrandName] = React.useState("");
  const [originalName, setOriginalName] = React.useState(""); // Track original name
  const [image, setImage] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [imageRemoved, setImageRemoved] = React.useState(false);
  const [dragActive, setDragActive] = React.useState(false);
  const [errors, setErrors] = React.useState<Errors>({});

  // Use controlled or internal open state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  // Initialize form with existing data in edit mode
  React.useEffect(() => {
    if (mode === "edit" && existingData && open) {
      setBrandName(existingData.name || "");
      setOriginalName(existingData.name || ""); // Store original name
      if (existingData.image) {
        setPreview(existingData.image);
      }
      setImageRemoved(false);
    } else if (mode === "add" && open) {
      // Reset form for add mode
      setBrandName("");
      setOriginalName(""); // Reset original name
      setImage(null);
      setPreview(null);
    }
  }, [mode, existingData, open]);

  const validate = () => {
    const e: Errors = {};
    if (!brandName.trim()) e.name = t('brandDialog.errors.nameRequired');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const resetForm = () => {
    setBrandName("");
    setOriginalName("");
    setImage(null);
    setPreview(null);
    setImageRemoved(false);
    setErrors({});
  };

  // Function to detect changes and prepare payload
  const prepareUpdatePayload = () => {
    const payload: { name?: string; image?: File | null } = {};
    
    // Only include name if it changed
    if (mode === "add" || brandName !== originalName) {
      payload.name = brandName;
    }
    
    // Only include image if a new file was selected
    // Only include image if a new file was selected OR if image was removed
if (image instanceof File) {
  payload.image = image;
} else if (mode === "edit" && imageRemoved && existingData?.image) {
  payload.image = null;
}
    
    return payload;
  };

  const handleSave = () => {
    if (!validate()) return;

    // Get only changed fields
    const brandData = prepareUpdatePayload();
    
    // Don't proceed if nothing changed in edit mode
    if (mode === "edit" && Object.keys(brandData).length === 0) {
      console.log("No changes detected");
      setOpen(false);
      return;
    }

    console.log(
      `${mode === "edit" ? "Updating" : "Saving new"} brand:`,
      brandData
    );

    onSave?.(brandData);

    if (mode === "add") {
      // For add mode: reset form but keep dialog open
      resetForm();
    } else {
      // For edit mode: close dialog
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
  
  if (mode === "edit") {
    setImageRemoved(true);
  }
};

  const handleDialogClose = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      resetForm();
    }
    setOpen(newOpen);
  };

  // Update the save button to show loading state
  const saveButtonContent = isLoading ? (
    mode === "edit" ? t('brandDialog.buttons.updating') : t('brandDialog.buttons.saving')
  ) : (
    mode === "edit" ? t('brandDialog.buttons.update') : t('brandDialog.buttons.save')
  );

  const dialogContent = (
    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {mode === "edit" ? t('brandDialog.titles.edit') : t('brandDialog.titles.add')}
        </DialogTitle>
        <DialogDescription>
          {mode === "edit"
            ? t('brandDialog.descriptions.edit')
            : t('brandDialog.descriptions.add')}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        {/* Brand Name */}
        <div className="grid gap-2">
          <Label htmlFor="brand-name">{t('brandDialog.labels.brandName')}</Label>
          <Input
            id="brand-name"
            placeholder={t('brandDialog.placeholders.brandName')}
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
          <Label htmlFor="upload-images">{t('brandDialog.labels.brandLogo')}</Label>
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
                  alt={t('brandDialog.uploadArea.altPreview')}
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
                  {t('brandDialog.uploadArea.dragDrop')}{" "}
                  <span className="text-blue-600 hover:underline">
                    {t('brandDialog.uploadArea.clickToBrowse')}
                  </span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('brandDialog.uploadArea.formatRecommendation')}
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
              {t('brandDialog.uploadArea.selected')} {image.name}
            </p>
          )}
        </div>
      </div>

      <DialogFooter>
        <Button onClick={handleSave} disabled={isLoading}>
          {saveButtonContent}
        </Button>
      </DialogFooter>
    </DialogContent>
  );

  if (mode === "edit") {
    // For edit mode, return dialog with proper close handling
    return (
      <Dialog open={open} onOpenChange={handleDialogClose}>
        {dialogContent}
      </Dialog>
    );
  }

  // For add mode, return the trigger button with dialog
  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <IconPlus />
          <span className="hidden lg:inline">{t('brandDialog.buttons.addBrand')}</span>
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
export function createEditBrandDialog(
  rowData: Brand,
  onSave: (updatedData: { name?: string; image?: File | null }) => void,
  isLoading: boolean = false
) {
  return (
    <BrandDialog
      mode="edit"
      existingData={rowData}
      onSave={onSave}
      isLoading={isLoading}
      onOpenChange={() => {}} // Edit dialog closes when clicking outside or X
    />
  );
}