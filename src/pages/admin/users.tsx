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
import {
  DataTable,
  type ServerQueryParams,
} from "../../components/admin/global/data-table";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  deleteManyUsers,
  clearError,
  setQueryParams,
  type CreateUserData,
  type UpdateUserData,
} from "../../features/users/usersSlice";

// Define the User entity type to match backend response
export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  active: boolean;
  image?: string;
  createdAt: string;
  updatedAt?: string;
}

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
            <AvatarImage src={user.image} alt={user.name} />
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
        user: "secondary",
      } as const;
      return (
        <Badge variant={variants[role as keyof typeof variants]}>{role}</Badge>
      );
    },
  },
  {
    accessorKey: "active",
    header: "Status",
    cell: ({ row }) => {
      const active = row.getValue("active") as boolean;
      return (
        <Badge variant={active ? "default" : "secondary"}>
          {active ? "active" : "inactive"}
        </Badge>
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

// Advanced filter configuration for users
const advancedFilterConfig = {
  numeric: {
    createdAt: {
      label: "Created Date",
    },
  },
  date: {
    createdAt: {
      label: "Created Date",
    },
  },
};

export default function Users() {
  const dispatch = useAppDispatch();
  const {
    users,
    pagination,
    loading,
    error,
    isCreating,
    isUpdating,
    isDeleting,
    isDeletingMany,
    currentQueryParams,
  } = useAppSelector((state) => state.users);

  // Load initial data on component mount
  React.useEffect(() => {
    // Load users with default parameters on mount
    const initialParams: ServerQueryParams = {
      page: 1,
      limit: 10,
    };
    dispatch(fetchUsers(initialParams));
  }, [dispatch]);

  // Handle errors
  React.useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Handle query parameter changes from the DataTable
  const handleQueryParamsChange = React.useCallback(
    (params: ServerQueryParams) => {
      // Store the parameters in Redux state for future reference
      dispatch(setQueryParams(params));
      // Fetch data with new parameters
      dispatch(fetchUsers(params));
    },
    [dispatch]
  );

  // Handle adding new user
  const handleAddUser = async (userData: {
    name: string;
    email: string;
    password: string;
    role?: "admin" | "user";
    image?: File;
  }) => {
    try {
      await dispatch(createUser(userData as CreateUserData)).unwrap();
      toast.success("User added successfully");
      // Note: createUser thunk automatically refetches data
    } catch (error) {
      console.error("Failed to add user:", error);
      // Error toast is handled by the error useEffect above
    }
  };

  // Handle updating existing user
  const handleUpdateUser = async (
    id: string,
    userData: {
      name?: string;
      email?: string;
      role?: "admin" | "user";
      image?: File;
    }
  ) => {
    try {
      await dispatch(
        updateUser({ id, userData: userData as UpdateUserData })
      ).unwrap();
      toast.success("User updated successfully");
      // Note: updateUser thunk automatically refetches data
    } catch (error) {
      console.error("Failed to update user:", error);
      // Error toast is handled by the error useEffect above
    }
  };

  // Handle single user delete
  const handleDeleteUser = async (id: string) => {
    try {
      await dispatch(deleteUser(id)).unwrap();
      toast.success("User deleted successfully");
      // Note: deleteUser thunk automatically refetches data
    } catch (error) {
      console.error("Failed to delete user:", error);
      // Error toast is handled by the error useEffect above
    }
  };

  // Handle bulk user delete
  const handleBulkDeleteUsers = async (ids: string[]) => {
    try {
      await dispatch(deleteManyUsers(ids)).unwrap();
      toast.success(
        `${ids.length} ${
          ids.length === 1 ? "user" : "users"
        } deleted successfully`
      );
      // Note: deleteManyUsers thunk automatically refetches data
    } catch (error) {
      console.error("Failed to delete users:", error);
      // Error toast is handled by the error useEffect above, but we show a specific message for bulk delete
      toast.error("Failed to delete selected users");
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <h1 className="text-2xl font-semibold">Users</h1>
            <p className="text-muted-foreground">
              Manage user accounts and their access levels.
            </p>
          </div>

          <DataTable<User>
            // Server-side specific props
            serverSide={true}
            data={users || []}
            pagination={pagination}
            loading={loading}
            onQueryParamsChange={handleQueryParamsChange}
            currentQueryParams={currentQueryParams}
            error={error}
            // Table configuration
            columns={usersColumns}
            dialogComponent={
              <UserDialog
                mode="add"
                onSave={handleAddUser}
                isLoading={isCreating}
              />
            }
            editDialogComponent={(rowData: User) =>
              createEditUserDialog(
                rowData,
                (updatedData) => {
                  // Handle the user update by extracting ID and calling update handler
                  const id = updatedData._id || rowData._id; // Fallback to rowData._id if needed
                  // Remove the _id from the update data since it's not needed in the payload
                  const { _id, ...userUpdateData } = updatedData;
                  console.log(
                    "Users page received update data:",
                    userUpdateData
                  );
                  console.log("User ID being used for update:", id);

                  if (!id) {
                    console.error("No user ID found!", {
                      updatedData,
                      rowData,
                    });
                    toast.error("Error: User ID is missing");
                    return;
                  }

                  handleUpdateUser(id, userUpdateData);
                },
                isUpdating // Pass the loading state
              )
            }
            // Row action handlers
            onRowDelete={handleDeleteUser}
            isDeleting={isDeleting}
            onBulkDelete={handleBulkDeleteUsers}
            isBulkDeleting={isDeletingMany}
            // Table features configuration
            enableRowSelection={true}
            enableGlobalFilter={true}
            enableColumnFilter={false} // Disable simple column filter since we're using search
            enableAdvancedFilter={true}
            advancedFilterConfig={advancedFilterConfig}
            enableDragAndDrop={false} // Disable drag and drop for users
            filterColumn="role"
            filterPlaceholder="Filter by role..."
            // Set page size for initial load
            pageSize={10}
          />
        </div>
      </div>
    </div>
  );
}
