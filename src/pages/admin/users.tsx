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
  banUser,
  banManyUsers,
  unbanUser,
  unbanManyUsers,
  clearError,
  setQueryParams,
  type CreateUserData,
  type UpdateUserData,
} from "../../features/users/usersSlice";
import { useTranslation } from 'react-i18next';
import { fetchCurrentUser } from "../../features/auth/authSlice";

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

// Define columns specific to Users - we'll create this inside the component to access t function
const getUsersColumns = (t: (key: string) => string): ColumnDef<User>[] => [
  {
    accessorKey: "name",
    header: t('users.columns.user'),
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
    header: t('users.columns.role'),
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
    header: t('users.columns.status'),
    cell: ({ row }) => {
      const active = row.getValue("active") as boolean;
      return (
        <Badge variant={active ? "default" : "secondary"}>
          {active ? t('users.status.active') : t('users.status.inactive')}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: t('users.columns.joined'),
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return (
        <div className="text-muted-foreground">{date.toLocaleDateString()}</div>
      );
    },
  },
];

export default function Users() {
  const { t } = useTranslation();

  // Advanced filter configuration for users (no numeric fields on the User model)
  const advancedFilterConfig = {
    numeric: {},
    date: {
      createdAt: {
        label: t('users.filters.createdDate'),
      },
    },
  };

  const dispatch = useAppDispatch();
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const {
    users,
    pagination,
    loading,
    error,
    isCreating,
    isUpdating,
    isBanning,
    isUnbanning,
    isBulkBanning,
    isBulkUnbanning,
    currentQueryParams,
  } = useAppSelector((state) => state.users);

  // Create columns inside the component to access t function
  const usersColumns = React.useMemo(() => getUsersColumns(t), [t]);

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
      const isNoResults = /there are no .+ to get/i.test(error);
      if (!isNoResults) {
        toast.error(error);
      }
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
    name?: string;
    email?: string;
    password?: string;
    role?: "admin" | "user";
    image?: File | null;
  }) => {
    try {
      const payload: CreateUserData = {
        name: userData.name ?? '',
        email: userData.email ?? '',
        password: userData.password ?? '',
        role: userData.role,
        image: userData.image ?? undefined,
      };
      await dispatch(createUser(payload)).unwrap();
      toast.success(t('users.messages.addSuccess'));
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
      image?: File | null;
    }
  ) => {
    try {
      const payload: UpdateUserData = {
        name: userData.name,
        email: userData.email,
        role: userData.role,
        image: userData.image ?? undefined,
      };
      await dispatch(
        updateUser({ id, userData: payload })
      ).unwrap();
      toast.success(t('users.messages.updateSuccess'));
      // Note: updateUser thunk automatically refetches data

      // If the admin edited their own profile, refresh the current user so the
      // sidebar/My Account avatar and name update live without re-login.
      if (id === currentUser?._id) {
        dispatch(fetchCurrentUser());
      }
    } catch (error) {
      console.error("Failed to update user:", error);
      // Error toast is handled by the error useEffect above
      throw error; // Re-throw so the dialog knows the update failed and stays open
    }
  };

  // Handle single user ban
  const handleBanUser = async (id: string) => {
    try {
      await dispatch(banUser(id)).unwrap();
      toast.success(t('users.messages.banSuccess'));
    } catch (error) {
      const message =
        (typeof error === "string" && error) ||
        (error as { message?: string })?.message ||
        t('users.messages.bulkBanError');
      toast.error(message);
      console.error("Failed to ban user:", error);
    }
  };

  // Handle single user unban
  const handleUnbanUser = async (id: string) => {
    try {
      await dispatch(unbanUser(id)).unwrap();
      toast.success(t('users.messages.unbanSuccess'));
    } catch (error) {
      const message =
        (typeof error === "string" && error) ||
        (error as { message?: string })?.message ||
        t('users.messages.bulkUnbanError');
      toast.error(message);
      console.error("Failed to unban user:", error);
    }
  };

  // Handle bulk ban users
  const handleBulkBanUsers = async (ids: string[]) => {
    try {
      const result = await dispatch(banManyUsers(ids)).unwrap();
      if (result.bannedCount === 0) {
        toast.error(t('users.messages.noUsersBanned'));
      } else {
        toast.success(
          t('users.messages.bulkBanSuccess', { count: result.bannedCount })
        );
      }
    } catch (error) {
      console.error("Failed to ban users:", error);
      toast.error(t('users.messages.bulkBanError'));
    }
  };

  // Handle bulk unban users
  const handleBulkUnbanUsers = async (ids: string[]) => {
    try {
      const result = await dispatch(unbanManyUsers(ids)).unwrap();
      if (result.unbannedCount === 0) {
        toast.error(t('users.messages.noUsersUnbanned'));
      } else {
        toast.success(
          t('users.messages.bulkUnbanSuccess', { count: result.unbannedCount })
        );
      }
    } catch (error) {
      console.error("Failed to unban users:", error);
      toast.error(t('users.messages.bulkUnbanError'));
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <h1 className="text-2xl font-semibold">{t('users.title')}</h1>
            <p className="text-muted-foreground">
              {t('users.subtitle')}
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
                async (updatedData) => {
                  await handleUpdateUser(rowData._id, updatedData);
                },
                isUpdating // Pass the loading state
              )
            }
            // Row action handlers
            onRowBan={handleBanUser}
            onRowUnban={handleUnbanUser}
            isBanning={isBanning}
            isUnbanning={isUnbanning}
            onBulkBan={handleBulkBanUsers}
            onBulkUnban={handleBulkUnbanUsers}
            isBulkBanning={isBulkBanning}
            isBulkUnbanning={isBulkUnbanning}
            // Table features configuration
            enableRowSelection={true}
            enableGlobalFilter={true}
            enableColumnFilter={false} // Disable simple column filter since we're using search
            enableAdvancedFilter={true}
            advancedFilterConfig={advancedFilterConfig}
            enableDragAndDrop={false} // Disable drag and drop for users
            filterColumn="role"
            filterPlaceholder={t('users.filterPlaceholder')}
            // Set page size for initial load
            pageSize={10}
          />
        </div>
      </div>
    </div>
  );
}