import * as React from "react";
import { useTranslation } from 'react-i18next';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import {
  IconPlus,
  IconCloudUpload,
  IconX,
} from "@tabler/icons-react";
import { useAppSelector, useAppDispatch } from "../../../app/hooks";
import { fetchCategories } from "../../../features/categories/categoriesSlice";

type Errors = {
  category?: string;
  name?: string;
  image?: string;
};

interface SubCategory {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  category: {
    _id: string;
    name: string;
  } | string;
  productCount: number;
  createdAt: string;
  updatedAt?: string;
}

interface SubCategoryDialogProps {
  mode?: "add" | "edit";
  existingData?: SubCategory;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSave?: (data: { name?: string; category?: string; image?: File | null }) => void;
  isLoading?: boolean;
}

export function SubCategoryDialog({
  mode = "add",
  existingData,
  open: controlledOpen,
  onOpenChange,
  onSave,
  isLoading = false,
}: SubCategoryDialogProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const {categories} = useAppSelector((state) => state.categories);
  
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<string>("");
  const [originalCategory, setOriginalCategory] = React.useState<string>("");
  const [subCategoryName, setSubCategoryName] = React.useState("");
  const [originalName, setOriginalName] = React.useState("");
  const [image, setImage] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [imageRemoved, setImageRemoved] = React.useState(false);
  const [dragActive, setDragActive] = React.useState(false);
  const [errors, setErrors] = React.useState<Errors>({});

  // Use controlled or internal open state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  // Load categories when dialog opens
  React.useEffect(() => {
    if (open && categories.length === 0) {
      dispatch(fetchCategories({ limit: 100 })); // Load all categories for dropdown
    }
  }, [open, categories.length, dispatch]);

  // Initialize form with existing data in edit mode
  React.useEffect(() => {
    if (mode === "edit" && existingData && open) {
      setSubCategoryName(existingData.name || "");
      setOriginalName(existingData.name || "");
      
      // Handle category (could be populated object or string ID)
      const categoryId = typeof existingData.category === 'object' 
        ? existingData.category._id 
        : existingData.category;
      setSelectedCategory(categoryId);
      setOriginalCategory(categoryId);
      
      if (existingData.image) {
        setPreview(existingData.image);
      }
      setImageRemoved(false);
    } else if (mode === "add" && open) {
      // Reset form for add mode
      setSelectedCategory("");
      setOriginalCategory("");
      setSubCategoryName("");
      setOriginalName("");
      setImage(null);
      setPreview(null);
    }
  }, [mode, existingData, open]);

  const validate = () => {
    const e: Errors = {};
    if (!selectedCategory) e.category = t('subCategoryDialog.errors.categoryRequired');
    if (!subCategoryName.trim()) e.name = t('subCategoryDialog.errors.nameRequired');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const resetForm = () => {
    setSelectedCategory("");
    setOriginalCategory("");
    setSubCategoryName("");
    setOriginalName("");
    setImage(null);
    setPreview(null);
    setImageRemoved(false);
    setErrors({});
  };

  // Function to detect changes and prepare payload
  const prepareUpdatePayload = () => {
    const payload: { name?: string; category?: string; image?: File | null } = {};
    
    // Only include name if it changed
    if (mode === "add" || subCategoryName !== originalName) {
      payload.name = subCategoryName;
    }
    
    // Only include category if it changed
    if (mode === "add" || selectedCategory !== originalCategory) {
      payload.category = selectedCategory;
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
    const subCategoryData = prepareUpdatePayload();
    
    // Don't proceed if nothing changed in edit mode
    if (mode === "edit" && Object.keys(subCategoryData).length === 0) {
      console.log("No changes detected");
      setOpen(false);
      return;
    }

    console.log(
      `${mode === "edit" ? "Updating" : "Saving new"} subcategory:`,
      subCategoryData
    );

    onSave?.(subCategoryData);

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
    mode === "edit" ? t('subCategoryDialog.buttons.updating') : t('subCategoryDialog.buttons.saving')
  ) : (
    mode === "edit" ? t('subCategoryDialog.buttons.update') : t('subCategoryDialog.buttons.save')
  );

  const dialogContent = (
    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {mode === "edit" ? t('subCategoryDialog.titles.edit') : t('subCategoryDialog.titles.add')}
        </DialogTitle>
        <DialogDescription>
          {mode === "edit"
            ? t('subCategoryDialog.descriptions.edit')
            : t('subCategoryDialog.descriptions.add')
          }
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        {/* Category Selector */}
        <div className="grid gap-2">
          <Label htmlFor="category">{t('subCategoryDialog.labels.category')}</Label>
          <Select
            value={selectedCategory}
            onValueChange={(value) => {
              setSelectedCategory(value);
              setErrors((prev) => ({ ...prev, category: undefined }));
            }}
          >
            <SelectTrigger
              id="category"
              aria-invalid={!!errors.category}
              className={errors.category ? "border-red-500" : ""}
            >
              <SelectValue placeholder={t('subCategoryDialog.placeholders.category')} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category._id} value={category._id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-red-600 mt-1">{errors.category}</p>
          )}
        </div>

        {/* Subcategory Name */}
        <div className="grid gap-2">
          <Label htmlFor="sub-category-name">{t('subCategoryDialog.labels.subcategoryName')}</Label>
          <Input
            id="sub-category-name"
            placeholder={t('subCategoryDialog.placeholders.subcategoryName')}
            value={subCategoryName}
            onChange={(e) => {
              setSubCategoryName(e.target.value);
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
          <Label htmlFor="upload-images">{t('subCategoryDialog.labels.uploadImage')}</Label>
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
              !preview && document.getElementById("subcat-image")?.click()
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
                  {t('subCategoryDialog.uploadArea.dragDrop')}{" "}
                  <span className="text-blue-600 hover:underline">
                    {t('subCategoryDialog.uploadArea.clickToBrowse')}
                  </span>
                </p>
              </>
            )}
          </div>
          <input
            id="subcat-image"
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
              {t('subCategoryDialog.uploadArea.selected')} {image.name}
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
          <span className="hidden lg:inline">{t('subCategoryDialog.buttons.addSubcategory')}</span>
        </Button>
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
}

// Export the Add version for backward compatibility
export function AddSubCategoryDialog() {
  return <SubCategoryDialog mode="add" />;
}

// Export a function to create edit dialogs for the data table
// eslint-disable-next-line react-refresh/only-export-components
export function createEditSubCategoryDialog(
  rowData: SubCategory,
  onSave: (updatedData: { name?: string; category?: string; image?: File | null }) => void,
  isLoading: boolean = false
) {
  return (
    <SubCategoryDialog
      mode="edit"
      existingData={rowData}
      onSave={onSave}
      isLoading={isLoading}
      onOpenChange={() => {}} // Edit dialog closes when clicking outside or X
    />
  );
}