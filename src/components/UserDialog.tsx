import * as React from "react";
import {
  IconCloudUpload,
  IconPlus,
  IconX,
  IconUser,
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

// Define the shape of the user object passed to the parent component
// This should match the interface in users.tsx
interface UserForParent {
  id: number;
  name: string;
  email: string;
  role: "admin" | "customer" | "moderator" | "support";
  status: "active" | "inactive" | "suspended" | "pending";
  avatar?: string;
  lastLogin: string;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
}

interface UserDialogProps {
  mode?: "add" | "edit";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  existingData?: any; // Use 'any' to accommodate the different User shapes initially
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSave?: (data: UserForParent) => void;
}

export function UserDialog({
  mode = "add",
  existingData,
  open: controlledOpen,
  onOpenChange,
  onSave,
}: UserDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);

  // Form state
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [role, setRole] = React.useState("");
  const [status, setStatus] = React.useState<
    "active" | "inactive" | "suspended" | "pending"
  >("active");

  // Image
  const [image, setImage] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [dragActive, setDragActive] = React.useState(false);

  const [errors, setErrors] = React.useState<Errors>({});

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  React.useEffect(() => {
    if (mode === "edit" && existingData && open) {
      setUsername(existingData.name || ""); // <-- FIX: Use 'name' from existingData
      setEmail(existingData.email || "");
      setRole(existingData.role || "");
      setStatus(existingData.status || "active");
      if (existingData.avatar) {
        // <-- FIX: Use 'avatar'
        setPreview(existingData.avatar);
      }
      setPassword("");
      setConfirmPassword("");
    } else if (mode === "add" && open) {
      resetForm();
    }
  }, [mode, existingData, open]);

  const validate = () => {
    const e: Errors = {};
    if (!username.trim()) e.username = "Username is required";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Valid email is required";

    if (mode === "add") {
      if (!password) e.password = "Password is required";
      if (password.length < 6)
        e.password = "Password must be at least 6 characters";
      if (confirmPassword !== password)
        e.confirmPassword = "Passwords do not match";
    } else if (mode === "edit" && password) {
      if (password.length < 6)
        e.password = "Password must be at least 6 characters";
      if (confirmPassword !== password)
        e.confirmPassword = "Passwords do not match";
    }

    if (!role) e.role = "Role is required";
    // Image validation is optional for edit mode if an image already exists
    if (mode === "add" && !image) e.image = "User image is required";
    if (mode === "edit" && !preview && !image)
      e.image = "User image is required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const resetForm = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setRole("");
    setStatus("active");
    setImage(null);
    setPreview(null);
    setErrors({});
  };

  const handleSave = () => {
    if (!validate()) return;

    // --- START: MAJOR FIX ---
    // Create an object that matches the User interface in `users.tsx`
    const userData: UserForParent = {
      id: existingData?.id || Date.now(),
      name: username, // FIX: Map local 'username' state to 'name' property
      email,
      role: role as UserForParent["role"], // Assert the role type
      status: status as UserForParent["status"],
      avatar: preview || existingData?.avatar || "", // FIX: Map preview to 'avatar'
      createdAt:
        existingData?.createdAt || new Date().toISOString().split("T")[0],

      // FIX: Add missing properties with default values for new users
      lastLogin:
        existingData?.lastLogin || new Date().toISOString().split("T")[0],
      totalOrders: existingData?.totalOrders || 0,
      totalSpent: existingData?.totalSpent || 0,
    };
    // --- END: MAJOR FIX ---

    console.log(
      `${mode === "edit" ? "Updating" : "Saving new"} user:`,
      userData
    );
    if (mode === "edit" && password) {
      console.log("Password will be updated");
    }

    onSave?.(userData);

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
    if (mode === "add") {
      setErrors((prev) => ({ ...prev, image: "User image is required" }));
    }
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
          {mode === "edit" ? "Edit User" : "Add New User"}
        </DialogTitle>
        <DialogDescription>
          {mode === "edit"
            ? "Update the user details below."
            : "Enter the user details below."}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        {/* Username */}
        <div className="grid gap-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
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
            <p className="text-sm text-red-600 mt-1">{errors.username}</p>
          )}
        </div>

        {/* Email */}
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
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
            <p className="text-sm text-red-600 mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="grid gap-2">
          <Label htmlFor="password">
            Password
            {mode === "edit" && (
              <span className="text-sm text-muted-foreground ml-2">
                (Leave blank to keep current password)
              </span>
            )}
          </Label>
          <Input
            id="password"
            type="password"
            placeholder={
              mode === "edit"
                ? "Enter new password (optional)"
                : "Enter password"
            }
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
            <p className="text-sm text-red-600 mt-1">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        {(mode === "add" || password) && (
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (e.target.value === password) {
                  setErrors((prev) => ({
                    ...prev,
                    confirmPassword: undefined,
                  }));
                }
              }}
              className={errors.confirmPassword ? "border-red-500" : ""}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-600 mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>
        )}

        {/* Role */}
        <div className="grid gap-2">
          <Label htmlFor="user-role">Role</Label>
          <Select
            value={role}
            onValueChange={(value) => {
              setRole(value);
              setErrors((prev) => ({ ...prev, role: undefined }));
            }}
          >
            <SelectTrigger id="user-role">
              <SelectValue placeholder="Choose role" />
            </SelectTrigger>
            {/* --- START: FIX --- */}
            {/* Use roles that match the main users.tsx page */}
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
              <SelectItem value="support">Support</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
            </SelectContent>
            {/* --- END: FIX --- */}
          </Select>
          {errors.role && (
            <p className="text-sm text-red-600 mt-1">{errors.role}</p>
          )}
        </div>

        {/* Status */}
        <div className="grid gap-2">
          <Label htmlFor="user-status">Status</Label>
          <Select
            value={status}
            onValueChange={(
              value: "active" | "inactive" | "suspended" | "pending"
            ) => setStatus(value)}
          >
            <SelectTrigger id="user-status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            {/* --- START: FIX --- */}
            {/* Use all available statuses */}
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
            {/* --- END: FIX --- */}
          </Select>
        </div>

        {/* User Image Upload */}
        <div className="grid gap-2">
          <Label htmlFor="upload-user-image">Upload user image</Label>
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
              !preview && document.getElementById("user-image")?.click()
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
                  className="h-40 w-40 rounded-full object-cover"
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
                  Drag & drop your user image here or{" "}
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
          <IconUser className="mr-2 h-4 w-4" />
          {mode === "edit" ? "Update" : "Save"}
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
          <span className="hidden lg:inline">Add User</span>
        </Button>
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
}

// This factory function needs to accept the parent's User type
// eslint-disable-next-line react-refresh/only-export-components
export function createEditUserDialog(
  rowData: UserForParent,
  onSave: (updatedData: UserForParent) => void
) {
  return <UserDialog mode="edit" existingData={rowData} onSave={onSave} />;
}
