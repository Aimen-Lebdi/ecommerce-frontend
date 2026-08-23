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
import type { Brand } from "../../../types";

type Errors = {
  name?: string;
  image?: string;
};

interface BrandDialogProps {
  mode?: "add" | "edit";
  existingData?: Brand;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSave?: (data: { name?: string; image?: File | null }) => Promise<void>; // Made name optional for updates
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
  const [isSubmitting, setIsSubmitting] = React.useState(false);

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

  const handleSave = async () => {
    if (!validate()) return;

    // Get only changed fields
    const brandData = prepareUpdatePayload();
    
    // Don't proceed if nothing changed in edit mode
    if (mode === "edit" && Object.keys(brandData).length === 0) {
      setOpen(false);
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave?.(brandData);

      if (mode === "add") {
        // For add mode: reset form but keep dialog open
        resetForm();
      } else {
        // For edit mode: close dialog only after successful update
        setOpen(false);
      }
    } catch (error) {
      console.error("Save failed:", error);
      // Dialog stays open on error so user can retry
    } finally {
      setIsSubmitting(false);
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

  // Combined loading state: external isLoading OR internal isSubmitting
  const isDisabled = isLoading || isSubmitting;

  // Update the save button to show loading state
  const saveButtonContent = isDisabled ? (
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
            className={errors.name ? "border-destructive" : ""}
          />
          {errors.name && (
            <p className="text-sm text-destructive mt-1">{errors.name}</p>
          )}
        </div>

        {/* Image Upload */}
        <div className="grid gap-2">
          <Label htmlFor="upload-images">{t('brandDialog.labels.brandLogo')}</Label>
          <div
            role="button"
            tabIndex={0}
            aria-label={t('brandDialog.labels.brandLogo')}
            className={`relative flex min-h-[16rem] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
              ${
                dragActive
                  ? "border-primary bg-primary/10 text-primary"
                  : errors.image
                  ? "border-destructive text-destructive"
                  : "border-border bg-muted/50 text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            onClick={() =>
              !preview && document.getElementById("brand-image")?.click()
            }
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && !preview) {
                e.preventDefault();
                document.getElementById("brand-image")?.click();
              }
            }}
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
                  className="absolute top-2 right-2 rounded-full bg-destructive p-1 text-white hover:bg-destructive/90"
                >
                  <IconX size={16} />
                </button>
              </>
            ) : (
              <>
                <IconCloudUpload className="h-10 w-10" />
                <p className="mt-2 text-sm">
                  {t('brandDialog.uploadArea.dragDrop')}{" "}
                  <span className="text-primary hover:underline">
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
            <p className="text-sm text-destructive mt-1">{errors.image}</p>
          )}
          {image && !errors.image && (
            <p className="mt-2 text-xs text-success">
              {t('brandDialog.uploadArea.selected')} {image.name}
            </p>
          )}
        </div>
      </div>

      <DialogFooter>
        <Button onClick={handleSave} disabled={isDisabled}>
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
  onSave: (updatedData: { name?: string; image?: File | null }) => Promise<void>,
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