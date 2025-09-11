import * as React from "react";
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
  description?: string;
  image?: string;
};

interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  productCount: number;
  createdAt: string;
}

interface CategoryDialogProps {
  mode?: "add" | "edit";
  existingData?: Category;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSave?: (data: { name?: string; image?: File }) => void; // ✅ Made name optional
  isLoading?: boolean; // Add loading prop

}

export function CategoryDialog({
  mode = "add",
  existingData,
  open: controlledOpen,
  onOpenChange,
  onSave,
    isLoading = false, // Add loading prop with default

}: CategoryDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [categoryName, setCategoryName] = React.useState("");
  const [originalName, setOriginalName] = React.useState(""); // ✅ Track original name

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
      setCategoryName(existingData.name || "");
            setOriginalName(existingData.name || ""); // ✅ Store original name

      if (existingData.image) {
        setPreview(existingData.image);
      }
    } else if (mode === "add" && open) {
      // Reset form for add mode
      setCategoryName("");
            setOriginalName(""); // ✅ Reset original name

      setImage(null);
      setPreview(null);
    }
  }, [mode, existingData, open]);

  const validate = () => {
    const e: Errors = {};
    if (!categoryName.trim()) e.name = "Category name is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const resetForm = () => {
    setCategoryName("");
    setImage(null);
    setPreview(null);
    setErrors({});
  };

  // ✅ NEW: Function to detect changes and prepare payload
  const prepareUpdatePayload = () => {
    const payload: { name?: string; image?: File } = {};
    
    // Only include name if it changed
    if (mode === "add" || categoryName !== originalName) {
      payload.name = categoryName;
    }
    
    // Only include image if a new file was selected
    if (image instanceof File) {
      payload.image = image;
    }
    
    return payload;
  };

  const handleSave = () => {
    if (!validate()) return;

    // ✅ Get only changed fields
    const categoryData = prepareUpdatePayload();
    
    // ✅ Don't proceed if nothing changed in edit mode
    if (mode === "edit" && Object.keys(categoryData).length === 0) {
      console.log("No changes detected");
      setOpen(false);
      return;
    }

    console.log(
      `${mode === "edit" ? "Updating" : "Saving new"} category:`,
      categoryData
    );

    onSave?.(categoryData);

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
    setErrors((prev) => ({ ...prev, image: "Image is required" }));
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
    mode === "edit" ? "Updating..." : "Saving..."
  ) : (
    mode === "edit" ? "Update" : "Save"
  );

  const dialogContent = (
    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {mode === "edit" ? "Edit Category" : "Add New Category"}
        </DialogTitle>
        <DialogDescription>
          {mode === "edit"
            ? "Update the category details below."
            : "Enter the category details below."}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">

        {/* Category Name */}
        <div className="grid gap-2">
          <Label htmlFor="category-name">Category Name</Label>
          <Input
            id="category-name"
            placeholder="e.g., Electronics"
            value={categoryName}
            onChange={(e) => {
              setCategoryName(e.target.value);
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
              !preview && document.getElementById("cat-image")?.click()
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
                  Drag & drop your image here or{" "}
                  <span className="text-blue-600 hover:underline">
                    click to browse
                  </span>
                </p>
              </>
            )}
          </div>
          <input
            id="cat-image"
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
          <span className="hidden lg:inline">Add Category</span>
        </Button>
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
}

// Export the Add version for backward compatibility
export function AddCategoryDialog() {
  return <CategoryDialog mode="add" />;
}

// Export a function to create edit dialogs for the data table
// eslint-disable-next-line react-refresh/only-export-components
export function createEditCategoryDialog(
  rowData: Category,
  onSave: (updatedData: { name?: string; image?: File }) => void,
  isLoading: boolean = false
) {
  return (
    <CategoryDialog
      mode="edit"
      existingData={rowData}
      onSave={onSave}
      isLoading={isLoading}
      onOpenChange={() => {}} // Edit dialog closes when clicking outside or X
    />
  );
}
