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
  image?: string;
};

interface Category {
  id: number;
  name: string;
  description: string;
  status: "active" | "inactive";
  productCount: number;
  image?: string;
  createdAt: string;
}

interface CategoryDialogProps {
  mode?: "add" | "edit";
  existingData?: Category;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSave?: (data: Category) => void;
}

export function CategoryDialog({
  mode = "add",
  existingData,
  open: controlledOpen,
  onOpenChange,
  onSave,
}: CategoryDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [categoryName, setCategoryName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [status, setStatus] = React.useState<"active" | "inactive">("active");
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
      setDescription(existingData.description || "");
      setStatus(existingData.status || "active");
      if (existingData.image) {
        setPreview(existingData.image);
      }
    } else if (mode === "add" && open) {
      // Reset form for add mode
      setCategoryName("");
      setDescription("");
      setStatus("active");
      setImage(null);
      setPreview(null);
    }
  }, [mode, existingData, open]);

  const validate = () => {
    const e: Errors = {};
    if (!categoryName.trim()) e.name = "Category name is required";
    if (!description.trim()) e.description = "Description is required";
    if (mode === "add" && !image) e.image = "Image is required";
    if (mode === "edit" && !image && !preview) e.image = "Image is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const resetForm = () => {
    setCategoryName("");
    setDescription("");
    setStatus("active");
    setImage(null);
    setPreview(null);
    setErrors({});
  };

  const handleSave = () => {
    if (!validate()) return;

    const categoryData: Category = {
      id: existingData?.id || Date.now(),
      name: categoryName,
      description: description,
      status: status,
      productCount: existingData?.productCount || 0, // Default to 0 for new categories
      image: preview || existingData?.image || "",
      createdAt:
        existingData?.createdAt || new Date().toISOString().split("T")[0],
    };

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

        {/* Description */}
        <div className="grid gap-2">
          <Label htmlFor="category-description">Description</Label>
          <Textarea
            id="category-description"
            placeholder="e.g., Electronic devices and accessories"
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

        {/* Status */}
        <div className="grid gap-2">
          <Label htmlFor="category-status">Status</Label>
          <Select
            value={status}
            onValueChange={(value: "active" | "inactive") => setStatus(value)}
          >
            <SelectTrigger id="category-status">
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
        <Button onClick={handleSave}>
          <IconPhoto className="mr-2 h-4 w-4" />
          {mode === "edit" ? "Update" : "Save"}
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
  onSave: (updatedData: Category) => void
) {
  return (
    <CategoryDialog
      mode="edit"
      existingData={rowData}
      onSave={onSave}
      // open={true}
      onOpenChange={() => {}} // Edit dialog closes when clicking outside or X
    />
  );
}
