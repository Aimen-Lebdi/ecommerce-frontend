import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "../../components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { toast } from "sonner";
import {
  createEditUserDialog,
  UserDialog,
} from "../../components/admin/global/UserDialog";
import { DataTable } from "../../components/admin/global/data-table";
// Define the User entity type
export interface User {
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

// Sample data - in a real app, this would come from your API
const usersData: User[] = [
  {
    id: 7,
    name: "Robert Taylor",
    email: "robert.taylor@email.com",
    role: "support",
    status: "active",
    lastLogin: "2024-02-19",
    totalOrders: 0,
    totalSpent: 0,
    createdAt: "2023-09-12",
  },
  {
    id: 8,
    name: "Jennifer White",
    email: "jennifer.white@email.com",
    role: "customer",
    status: "pending",
    avatar:
      "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=40&h=40&fit=crop&crop=face",
    lastLogin: "2024-02-20",
    totalOrders: 1,
    totalSpent: 149.99,
    createdAt: "2024-02-19",
  },
  {
    id: 9,
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    role: "customer",
    status: "inactive",
    lastLogin: "2024-01-05",
    totalOrders: 5,
    totalSpent: 789.45,
    createdAt: "2023-10-18",
  },
  {
    id: 10,
    name: "Maria Garcia",
    email: "maria.garcia@email.com",
    role: "customer",
    status: "active",
    avatar:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=40&h=40&fit=crop&crop=face",
    lastLogin: "2024-02-18",
    totalOrders: 12,
    totalSpent: 2156.3,
    createdAt: "2023-07-03",
  },
];

// Define columns specific to Users
const usersColumns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "User",
    cell: ({ row }) => {
      const user = row.original;
      const initials = user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();

      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-xs text-muted-foreground">{user.email}</div>
          </div>
        </div>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      const variants = {
        admin: "destructive",
        moderator: "default",
        support: "default",
        customer: "secondary",
      } as const;
      return (
        <Badge variant={variants[role as keyof typeof variants]}>{role}</Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variants = {
        active: "default",
        inactive: "secondary",
        suspended: "destructive",
        pending: "secondary",
      } as const;
      return (
        <Badge variant={variants[status as keyof typeof variants]}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "totalOrders",
    header: "Orders",
    cell: ({ row }) => {
      const orders = row.getValue("totalOrders") as number;
      return (
        <div className="text-center font-medium">{orders.toLocaleString()}</div>
      );
    },
  },
  {
    accessorKey: "totalSpent",
    header: "Total Spent",
    cell: ({ row }) => {
      const spent = row.getValue("totalSpent") as number;
      return <div className="text-center font-medium">${spent.toFixed(2)}</div>;
    },
  },
  {
    accessorKey: "lastLogin",
    header: "Last Login",
    cell: ({ row }) => {
      const date = new Date(row.getValue("lastLogin"));
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return (
        <div className="text-muted-foreground">
          {diffDays === 1
            ? "Yesterday"
            : diffDays < 7
            ? `${diffDays} days ago`
            : date.toLocaleDateString()}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return (
        <div className="text-muted-foreground">{date.toLocaleDateString()}</div>
      );
    },
  },
];

// Advanced filter configuration for categories
const advancedFilterConfig = {
  numeric: {
    totalOrders: {
      label: "Total Orders",
      placeholder: "Enter number of total orders",
    },
    totalSpent: {
      label: "Total Spent",
      placeholder: "Enter total spent amount",
    },
  },
  date: {
    lastLogin: {
      label: "Last Login",
    },
    createdAt: {
      label: "Created Date",
    },
  },
};

export default function Users() {
  const [users, setUsers] = React.useState(usersData);

  // Handle adding new User
  const handleAddUser = (newUser: User) => {
    setUsers((prev) => [...prev, newUser]);
    console.log("Added new User:", newUser);
  };

  // Handle updating existing User
  const handleUpdateUser = (updatedUser: User) => {
    setUsers((prev) =>
      prev.map((cat) => (cat.id === updatedUser.id ? updatedUser : cat))
    );
    console.log("Updated User:", updatedUser);
  };

  const handleDataChange = (newData: User[]) => {
    setUsers(newData);
    // Here you would typically sync with your backend
    toast.success("Users reordered successfully");
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <DataTable
            data={users}
            columns={usersColumns}
            dialogComponent={<UserDialog mode="add" onSave={handleAddUser} />}
            editDialogComponent={createEditUserDialog}
            onRowUpdate={handleUpdateUser}
            enableDragAndDrop={false} // Users shouldn't be reorderable
            enableRowSelection={true}
            enableGlobalFilter={true}
            enableColumnFilter={true}
            enableAdvancedFilter={true}
            advancedFilterConfig={advancedFilterConfig}
            filterColumn="role"
            filterPlaceholder="Filter by role..."
            onDataChange={handleDataChange}
            pageSize={15}
          />
        </div>
      </div>
    </div>
  );
}
