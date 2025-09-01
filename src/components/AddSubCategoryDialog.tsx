import { useState } from "react";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  IconPlus,
  IconPhoto,
  IconCloudUpload,
  IconX,
} from "@tabler/icons-react";

// Dummy data for categories
const dummyCategories = [
  { id: "cat1", name: "Electronics" },
  { id: "cat2", name: "Apparel" },
  { id: "cat3", name: "Home & Garden" },
  { id: "cat4", name: "Books" },
];

type Errors = {
  category?: string;
  name?: string;
  image?: string;
};

export function AddSubCategoryDialog() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [subCategoryName, setSubCategoryName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const [errors, setErrors] = useState<Errors>({});

  const validate = () => {
    const e: Errors = {};
    if (!selectedCategory) e.category = "Category is required";
    if (!subCategoryName.trim()) e.name = "Subcategory name is required";
    if (!image) e.image = "Image is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    console.log("Saving new subcategory...");
    console.log("Selected Parent Category:", selectedCategory);
    console.log("Subcategory Name:", subCategoryName);
    console.log("Image File:", image ? image.name : "No image selected");

    // reset form after save
    setSelectedCategory("");
    setSubCategoryName("");
    setImage(null);
    setPreview(null);
    setErrors({});
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <IconPlus className="mr-2 h-4 w-4" />
          <span className="hidden lg:inline">Add Subcategory</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Subcategory</DialogTitle>
          <DialogDescription>
            Choose a parent category and enter the subcategory details here.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Category Selector */}
          <div className="grid grid-cols-4 items-start gap-2">
            <Label htmlFor="category" className="text-right mt-2">
              Category
            </Label>
            <div className="col-span-3">
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
                  <SelectValue placeholder="Select a parent category" />
                </SelectTrigger>
                <SelectContent>
                  {dummyCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-600 mt-1">{errors.category}</p>
              )}
            </div>
          </div>

          {/* Subcategory Name */}
          <div className="grid grid-cols-4 items-start gap-2">
            <Label htmlFor="sub-category-name" className="text-right mt-2">
              Name
            </Label>
            <div className="col-span-3">
              <Input
                id="sub-category-name"
                placeholder="e.g., Laptops"
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
                Selected: {image.name}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSave}>
            <IconPhoto className="mr-2 h-4 w-4" />
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
