import * as React from "react";
import {
  IconCloudUpload,
  IconPlus,
  IconX,
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";

type Errors = {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
  image?: string;
};

interface User {
  id: number | string;
  username: string;
  email: string;
  role: string;
  imageUrl?: string;
  // Add any other user fields here
}

interface UserDialogProps {
  mode?: "add" | "edit";
  existingData?: User;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSave?: (data: User) => void;
}

export function UserDialog({ 
  mode = "add", 
  existingData, 
  open: controlledOpen, 
  onOpenChange, 
  onSave 
}: UserDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  
  // Form state
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [role, setRole] = React.useState("");

  // Image
  const [image, setImage] = React.useState<File | null>(null);
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);
  const [dragActive, setDragActive] = React.useState(false);

  const [errors, setErrors] = React.useState<Errors>({});

  // Use controlled or internal open state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  // Initialize form with existing data in edit mode
  React.useEffect(() => {
    if (mode === "edit" && existingData && open) {
      setUsername(existingData.username || "");
      setEmail(existingData.email || "");
      setRole(existingData.role || "");
      if (existingData.imageUrl) {
        setPreviewImage(existingData.imageUrl);
      }
      // Don't pre-fill passwords in edit mode for security
      setPassword("");
      setConfirmPassword("");
    } else if (mode === "add" && open) {
      // Reset form for add mode
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setRole("");
      setImage(null);
      setPreviewImage(null);
    }
  }, [mode, existingData, open]);

  // --- Validation ---
  const validate = () => {
    const e: Errors = {};
    if (!username.trim()) e.username = "Username is required";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Valid email is required";
    
    // Password validation - required for add mode, optional for edit mode
    if (mode === "add") {
      if (!password) e.password = "Password is required";
      if (password.length < 6) e.password = "Password must be at least 6 characters";
      if (confirmPassword !== password) e.confirmPassword = "Passwords do not match";
    } else if (mode === "edit" && password) {
      // If password is provided in edit mode, validate it
      if (password.length < 6) e.password = "Password must be at least 6 characters";
      if (confirmPassword !== password) e.confirmPassword = "Passwords do not match";
    }
    
    if (!role) e.role = "Role is required";
    if (mode === "add" && !image) e.image = "User image is required";
    if (mode === "edit" && !image && !previewImage) e.image = "User image is required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // --- Save Handler ---
  const handleSave = () => {
    if (!validate()) return;

    const userData: User = {
      id: existingData?.id || Date.now(),
      username,
      email,
      role,
      imageUrl: previewImage || existingData?.imageUrl || "",
      ...existingData, // Preserve other existing fields
      // Note: In a real app, password would be handled securely on the server
    };

    console.log(`${mode === "edit" ? "Updating" : "Saving new"} user:`, userData);
    if (mode === "edit" && password) {
      console.log("Password will be updated"); // Don't log actual password
    }

    onSave?.(userData);

    // Reset form and close dialog
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setRole("");
    setImage(null);
    setPreviewImage(null);
    setErrors({});
    setOpen(false);
  };

  // --- Image Handlers ---
  const handleFile = (file: File) => {
    setImage(file);
    setPreviewImage(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, image: undefined }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreviewImage(null);
    setErrors((prev) => ({ ...prev, image: "User image is required" }));
  };

  const dialogContent = (
    <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {mode === "edit" ? "Edit User" : "Add New User"}
        </DialogTitle>
        <DialogDescription>
          {mode === "edit" 
            ? "Update the user details below." 
            : "Enter the user details below."
          }
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        {/* Username */}
        <div className="grid gap-2">
          <Label>Username</Label>
          <Input
            placeholder="e.g., johndoe"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (e.target.value.trim()) {
                setErrors((prev) => ({ ...prev, username: undefined }));
              }
            }}
            className={errors.username ? "border-red-500" : ""}
          />
          {errors.username && (
            <p className="text-sm text-red-600">{errors.username}</p>
          )}
        </div>

        {/* Email */}
        <div className="grid gap-2">
          <Label>Email</Label>
          <Input
            type="email"
            placeholder="e.g., john@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (e.target.value.trim()) {
                setErrors((prev) => ({ ...prev, email: undefined }));
              }
            }}
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="grid gap-2">
          <Label>
            Password
            {mode === "edit" && (
              <span className="text-sm text-muted-foreground ml-2">
                (Leave blank to keep current password)
              </span>
            )}
          </Label>
          <Input
            type="password"
            placeholder={mode === "edit" ? "Enter new password (optional)" : "Enter password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (e.target.value) {
                setErrors((prev) => ({ ...prev, password: undefined }));
              }
            }}
            className={errors.password ? "border-red-500" : ""}
          />
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password - only show if password is being set */}
        {(mode === "add" || password) && (
          <div className="grid gap-2">
            <Label>Confirm Password</Label>
            <Input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (e.target.value === password) {
                  setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }
              }}
              className={errors.confirmPassword ? "border-red-500" : ""}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>
        )}

        {/* Role */}
        <div className="grid gap-2">
          <Label>Role</Label>
          <Select 
            value={role} 
            onValueChange={(value) => {
              setRole(value);
              setErrors((prev) => ({ ...prev, role: undefined }));
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
            </SelectContent>
          </Select>
          {errors.role && (
            <p className="text-sm text-red-600">{errors.role}</p>
          )}
        </div>

        {/* User Image Upload */}
        <div className="grid gap-2">
          <Label>User Image</Label>
          <div
            className={`relative flex min-h-[12rem] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-colors
              ${
                dragActive
                  ? "border-blue-500 bg-blue-50 text-blue-500"
                  : errors.image
                  ? "border-red-500 text-red-500"
                  : "border-gray-300 bg-gray-50 text-gray-500 hover:border-blue-500 hover:text-blue-500"
              }`}
            onClick={() =>
              !previewImage && document.getElementById("user-image")?.click()
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
            {previewImage ? (
              <>
                <img
                  src={previewImage}
                  alt="User Preview"
                  className="h-32 w-32 rounded-full object-cover"
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
                  Drag & drop user image here or{" "}
                  <span className="text-blue-600 hover:underline">
                    click to browse
                  </span>
                </p>
              </>
            )}
          </div>
          <input
            id="user-image"
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
          {mode === "edit" ? "Update User" : "Save User"}
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
          <span className="hidden lg:inline">Add User</span>
        </Button>
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
}

// Export the Add version for backward compatibility
export function AddUserDialog() {
  return <UserDialog mode="add" />;
}

// Export a function to create edit dialogs for the data table
// eslint-disable-next-line react-refresh/only-export-components
export function createEditUserDialog(rowData: User, onSave: (updatedData: User) => void) {
  return <UserDialog mode="edit" existingData={rowData} onSave={onSave} open={true} />;
}