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
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";

type Errors = {
  category?: string;
  subcategory?: string;
  brand?: string;
  name?: string;
  description?: string;
  price?: string;
  quantity?: string;
  colors?: string;
  mainImage?: string;
  images?: string;
};

interface Product {
  id: number | string;
  category: string;
  subcategory: string;
  brand: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  colors: string[];
  status: "active" | "inactive" | "draft";
  sku?: string;
  weight?: number;
  dimensions?: string;
  mainImageUrl?: string;
  otherImageUrls?: string[];
  createdAt: string;
  updatedAt?: string;
}

interface ProductDialogProps {
  mode?: "add" | "edit";
  existingData?: Product;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSave?: (data: Product) => void;
}

// Dummy data - in a real app, these would come from your API
const dummyCategories = [
  { id: "electronics", name: "Electronics" },
  { id: "fashion", name: "Fashion" },
  { id: "home", name: "Home & Garden" },
  { id: "books", name: "Books" },
  { id: "sports", name: "Sports & Outdoors" },
];

const dummySubcategories = [
  { id: "phones", name: "Smartphones", categoryId: "electronics" },
  { id: "laptops", name: "Laptops", categoryId: "electronics" },
  { id: "men-clothing", name: "Men's Clothing", categoryId: "fashion" },
  { id: "women-clothing", name: "Women's Clothing", categoryId: "fashion" },
];

const dummyBrands = [
  { id: "apple", name: "Apple" },
  { id: "samsung", name: "Samsung" },
  { id: "nike", name: "Nike" },
  { id: "adidas", name: "Adidas" },
];

export function ProductDialog({ 
  mode = "add", 
  existingData, 
  open: controlledOpen, 
  onOpenChange, 
  onSave 
}: ProductDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);

  // Form state
  const [category, setCategory] = React.useState("");
  const [subcategory, setSubcategory] = React.useState("");
  const [brand, setBrand] = React.useState("");
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [quantity, setQuantity] = React.useState("");
  const [colors, setColors] = React.useState("");
  const [status, setStatus] = React.useState<"active" | "inactive" | "draft">("active");
  const [sku, setSku] = React.useState("");
  const [weight, setWeight] = React.useState("");
  const [dimensions, setDimensions] = React.useState("");

  // Images
  const [mainImage, setMainImage] = React.useState<File | null>(null);
  const [previewMain, setPreviewMain] = React.useState<string | null>(null);
  const [dragActiveMain, setDragActiveMain] = React.useState(false);

  const [otherImages, setOtherImages] = React.useState<File[]>([]);
  const [previewOthers, setPreviewOthers] = React.useState<string[]>([]);
  const [dragActiveOthers, setDragActiveOthers] = React.useState(false);

  const [errors, setErrors] = React.useState<Errors>({});

  // Use controlled or internal open state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  // Initialize form with existing data in edit mode
  React.useEffect(() => {
    if (mode === "edit" && existingData && open) {
      setCategory(existingData.category || "");
      setSubcategory(existingData.subcategory || "");
      setBrand(existingData.brand || "");
      setName(existingData.name || "");
      setDescription(existingData.description || "");
      setPrice(existingData.price?.toString() || "");
      setQuantity(existingData.quantity?.toString() || "");
      setColors(existingData.colors?.join(", ") || "");
      setStatus(existingData.status || "active");
      setSku(existingData.sku || "");
      setWeight(existingData.weight?.toString() || "");
      setDimensions(existingData.dimensions || "");
      
      if (existingData.mainImageUrl) {
        setPreviewMain(existingData.mainImageUrl);
      }
      if (existingData.otherImageUrls) {
        setPreviewOthers(existingData.otherImageUrls);
      }
    } else if (mode === "add" && open) {
      // Reset form for add mode
      resetForm();
    }
  }, [mode, existingData, open]);

  // Reset form function
  const resetForm = () => {
    setCategory("");
    setSubcategory("");
    setBrand("");
    setName("");
    setDescription("");
    setPrice("");
    setQuantity("");
    setColors("");
    setStatus("active");
    setSku("");
    setWeight("");
    setDimensions("");
    setMainImage(null);
    setPreviewMain(null);
    setOtherImages([]);
    setPreviewOthers([]);
    setErrors({});
  };

  // --- Validation ---
  const validate = () => {
    const e: Errors = {};
    if (!category) e.category = "Category is required";
    if (!subcategory) e.subcategory = "Subcategory is required";
    if (!brand) e.brand = "Brand is required";
    if (!name.trim()) e.name = "Product name is required";
    if (!description.trim()) e.description = "Description is required";
    if (!price || isNaN(Number(price)) || Number(price) <= 0) e.price = "Valid price is required";
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) < 0) e.quantity = "Valid quantity is required";
    if (!colors.trim()) e.colors = "At least one color is required";
    if (mode === "add" && !mainImage) e.mainImage = "Main image is required";
    if (mode === "edit" && !mainImage && !previewMain) e.mainImage = "Main image is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Generate SKU if not provided
  const generateSku = () => {
    if (!sku && name && brand) {
      const brandCode = brand.substring(0, 3).toUpperCase();
      const nameCode = name.substring(0, 3).toUpperCase();
      const randomCode = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      return `${brandCode}-${nameCode}-${randomCode}`;
    }
    return sku;
  };

  // --- Save Handler ---
  const handleSave = () => {
    if (!validate()) return;

    const productData: Product = {
      id: existingData?.id || Date.now(),
      category,
      subcategory,
      brand,
      name,
      description,
      price: Number(price),
      quantity: Number(quantity),
      colors: colors.split(",").map((c) => c.trim()).filter(c => c.length > 0),
      status,
      sku: generateSku(),
      weight: weight ? Number(weight) : undefined,
      dimensions: dimensions || undefined,
      mainImageUrl: previewMain || existingData?.mainImageUrl || "",
      otherImageUrls: previewOthers.length > 0 ? previewOthers : existingData?.otherImageUrls || [],
      createdAt: existingData?.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: mode === "edit" ? new Date().toISOString().split('T')[0] : undefined,
      ...existingData, // Preserve other existing fields
    };

    console.log(`${mode === "edit" ? "Updating" : "Saving new"} product:`, productData);

    onSave?.(productData);

    if (mode === "add") {
      // For add mode: reset form but keep dialog open
      resetForm();
    } else {
      // For edit mode: close dialog
      setOpen(false);
    }
  };

  // Dialog close handler
  const handleDialogClose = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      resetForm();
    }
    setOpen(newOpen);
  };

  // --- Image Handlers ---
  const handleMainFile = (file: File) => {
    setMainImage(file);
    setPreviewMain(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, mainImage: undefined }));
  };

  const handleMainFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleMainFile(e.target.files[0]);
    }
  };

  const handleRemoveMain = () => {
    setMainImage(null);
    setPreviewMain(null);
    setErrors((prev) => ({ ...prev, mainImage: "Main image is required" }));
  };

  const handleOtherFiles = (files: FileList) => {
    const arr = Array.from(files);
    setOtherImages((prev) => [...prev, ...arr]);
    setPreviewOthers((prev) => [...prev, ...arr.map((f) => URL.createObjectURL(f))]);
    setErrors((prev) => ({ ...prev, images: undefined }));
  };

  const handleRemoveOther = (idx: number) => {
    setOtherImages((prev) => prev.filter((_, i) => i !== idx));
    setPreviewOthers((prev) => prev.filter((_, i) => i !== idx));
  };

  const dialogContent = (
    <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {mode === "edit" ? "Edit Product" : "Add New Product"}
        </DialogTitle>
        <DialogDescription>
          {mode === "edit" 
            ? "Update the product details below." 
            : "Enter the product details below."
          }
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        {/* Category */}
        <div className="grid gap-2">
          <Label>Category</Label>
          <Select 
            value={category} 
            onValueChange={(value) => {
              setCategory(value);
              setSubcategory(""); // Reset subcategory when category changes
              setErrors((prev) => ({ ...prev, category: undefined }));
            }}
          >
            <SelectTrigger className={errors.category ? "border-red-500" : ""}>
              <SelectValue placeholder="Choose category" />
            </SelectTrigger>
            <SelectContent>
              {dummyCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && <p className="text-sm text-red-600">{errors.category}</p>}
        </div>

        {/* Subcategory */}
        <div className="grid gap-2">
          <Label>Subcategory</Label>
          <Select 
            value={subcategory} 
            onValueChange={(value) => {
              setSubcategory(value);
              setErrors((prev) => ({ ...prev, subcategory: undefined }));
            }}
            disabled={!category}
          >
            <SelectTrigger className={errors.subcategory ? "border-red-500" : ""}>
              <SelectValue placeholder={category ? "Choose subcategory" : "Select category first"} />
            </SelectTrigger>
            <SelectContent>
              {dummySubcategories
                .filter(sub => sub.categoryId === category)
                .map((sub) => (
                  <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                ))}
            </SelectContent>
          </Select>
          {errors.subcategory && <p className="text-sm text-red-600">{errors.subcategory}</p>}
        </div>

        {/* Brand */}
        <div className="grid gap-2">
          <Label>Brand</Label>
          <Select 
            value={brand} 
            onValueChange={(value) => {
              setBrand(value);
              setErrors((prev) => ({ ...prev, brand: undefined }));
            }}
          >
            <SelectTrigger className={errors.brand ? "border-red-500" : ""}>
              <SelectValue placeholder="Choose brand" />
            </SelectTrigger>
            <SelectContent>
              {dummyBrands.map((br) => (
                <SelectItem key={br.id} value={br.id}>{br.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.brand && <p className="text-sm text-red-600">{errors.brand}</p>}
        </div>

        {/* Product Name */}
        <div className="grid gap-2">
          <Label>Product Name</Label>
          <Input
            placeholder="e.g., iPhone 15 Pro Max"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (e.target.value.trim()) {
                setErrors((prev) => ({ ...prev, name: undefined }));
              }
            }}
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
        </div>

        {/* Description */}
        <div className="grid gap-2">
          <Label>Description</Label>
          <Textarea
            placeholder="Enter detailed product description..."
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (e.target.value.trim()) {
                setErrors((prev) => ({ ...prev, description: undefined }));
              }
            }}
            className={errors.description ? "border-red-500" : ""}
            rows={3}
          />
          {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
        </div>

        {/* Price & Quantity & Status */}
        <div className="grid grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label>Price ($)</Label>
            <Input
              type="number"
              placeholder="99.99"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                if (e.target.value && !isNaN(Number(e.target.value)) && Number(e.target.value) > 0) {
                  setErrors((prev) => ({ ...prev, price: undefined }));
                }
              }}
              className={errors.price ? "border-red-500" : ""}
              step="0.01"
              min="0"
            />
            {errors.price && <p className="text-sm text-red-600">{errors.price}</p>}
          </div>
          <div className="grid gap-2">
            <Label>Quantity</Label>
            <Input
              type="number"
              placeholder="100"
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                if (e.target.value && !isNaN(Number(e.target.value)) && Number(e.target.value) >= 0) {
                  setErrors((prev) => ({ ...prev, quantity: undefined }));
                }
              }}
              className={errors.quantity ? "border-red-500" : ""}
              min="0"
            />
            {errors.quantity && <p className="text-sm text-red-600">{errors.quantity}</p>}
          </div>
          <div className="grid gap-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(value: "active" | "inactive" | "draft") => setStatus(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Colors */}
        <div className="grid gap-2">
          <Label>Colors (comma separated)</Label>
          <Input
            placeholder="e.g., Black, Silver, Gold, Space Gray"
            value={colors}
            onChange={(e) => {
              setColors(e.target.value);
              if (e.target.value.trim()) {
                setErrors((prev) => ({ ...prev, colors: undefined }));
              }
            }}
            className={errors.colors ? "border-red-500" : ""}
          />
          {errors.colors && <p className="text-sm text-red-600">{errors.colors}</p>}
        </div>

        {/* Additional Fields */}
        <div className="grid grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label>SKU <span className="text-muted-foreground text-sm">(Optional)</span></Label>
            <Input
              placeholder="Auto-generated if empty"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Weight (kg) <span className="text-muted-foreground text-sm">(Optional)</span></Label>
            <Input
              type="number"
              placeholder="0.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              step="0.01"
              min="0"
            />
          </div>
          <div className="grid gap-2">
            <Label>Dimensions <span className="text-muted-foreground text-sm">(Optional)</span></Label>
            <Input
              placeholder="L x W x H (cm)"
              value={dimensions}
              onChange={(e) => setDimensions(e.target.value)}
            />
          </div>
        </div>

        {/* Main Image Upload */}
        <div className="grid gap-2">
          <Label>Main Product Image</Label>
          <div
            className={`relative flex min-h-[16rem] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-colors
              ${
                dragActiveMain
                  ? "border-blue-500 bg-blue-50 text-blue-500"
                  : errors.mainImage
                  ? "border-red-500 text-red-500"
                  : "border-gray-300 bg-gray-50 text-gray-500 hover:border-blue-500 hover:text-blue-500"
              }`}
            onClick={() => !previewMain && document.getElementById("main-image")?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActiveMain(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragActiveMain(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragActiveMain(false);
              if (e.dataTransfer.files?.[0]) {
                handleMainFile(e.dataTransfer.files[0]);
              }
            }}
          >
            {previewMain ? (
              <>
                <img
                  src={previewMain}
                  alt="Main Preview"
                  className="h-40 w-auto rounded-md object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveMain();
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
                  Drag & drop main product image here or{" "}
                  <span className="text-blue-600 hover:underline">
                    click to browse
                  </span>
                </p>
              </>
            )}
          </div>
          <input
            id="main-image"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleMainFileChange}
          />
          {errors.mainImage && <p className="text-sm text-red-600 mt-1">{errors.mainImage}</p>}
          {mainImage && !errors.mainImage && (
            <p className="mt-2 text-xs text-green-600">Selected: {mainImage.name}</p>
          )}
        </div>

        {/* Other Images Upload */}
        <div className="grid gap-2">
          <Label>Additional Images <span className="text-muted-foreground text-sm">(Optional)</span></Label>
          <div
            className={`relative flex min-h-[16rem] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-colors
              ${
                dragActiveOthers
                  ? "border-blue-500 bg-blue-50 text-blue-500"
                  : errors.images
                  ? "border-red-500 text-red-500"
                  : "border-gray-300 bg-gray-50 text-gray-500 hover:border-blue-500 hover:text-blue-500"
              }`}
            onClick={() => document.getElementById("other-images")?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActiveOthers(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragActiveOthers(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragActiveOthers(false);
              if (e.dataTransfer.files) {
                handleOtherFiles(e.dataTransfer.files);
              }
            }}
          >
            {previewOthers.length > 0 ? (
              <div className="flex flex-wrap gap-2 justify-center">
                {previewOthers.map((src, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={src}
                      alt={`Preview ${idx + 1}`}
                      className="h-24 w-24 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveOther(idx);
                      }}
                      className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                    >
                      <IconX size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <IconCloudUpload className="h-10 w-10" />
                <p className="mt-2 text-sm">
                  Drag & drop multiple images here or{" "}
                  <span className="text-blue-600 hover:underline">
                    click to browse
                  </span>
                </p>
              </>
            )}
          </div>
          <input
            id="other-images"
            type="file"
            className="hidden"
            accept="image/*"
            multiple
            onChange={(e) => {
              if (e.target.files) handleOtherFiles(e.target.files);
            }}
          />
          {errors.images && <p className="text-sm text-red-600 mt-1">{errors.images}</p>}
          {otherImages.length > 0 && !errors.images && (
            <p className="mt-2 text-xs text-green-600">
              Selected: {otherImages.length} additional image(s)
            </p>
          )}
        </div>
      </div>

      <DialogFooter>
        <Button onClick={handleSave}>
          <IconPhoto className="mr-2 h-4 w-4" />
          {mode === "edit" ? "Update Product" : "Save Product"}
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
          <span className="hidden lg:inline">Add Product</span>
        </Button>
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
}

// Export the Add version for backward compatibility
export function AddProductDialog() {
  return <ProductDialog mode="add" />;
}

// Export a function to create edit dialogs for the data table
// eslint-disable-next-line react-refresh/only-export-components
export function createEditProductDialog(rowData: Product, onSave: (updatedData: Product) => void) {
  return (
    <ProductDialog 
      mode="edit" 
      existingData={rowData} 
      onSave={onSave}
      // Don't set open=true here, let the component manage its own state
    />
  );
}