/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-case-declarations */
import * as React from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
  IconGripVertical,
  IconLayoutColumns,
  IconTrash,
} from "@tabler/icons-react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type Row,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { Button } from "../../ui/button";
import { Checkbox } from "../../ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { Tabs, TabsContent } from "../../ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../ui/alert-dialog";

import { AdvancedFilter, type AdvancedFilters } from "./AdvancedFilter";

// Generic data type that all entities must extend
export interface BaseEntity {
  id?: number | string;
  _id?: string;
  [key: string]: any;
}

// Filter configuration interface
interface FilterConfig {
  numeric: {
    [key: string]: {
      label: string;
      placeholder: string;
    };
  };
  date: {
    [key: string]: {
      label: string;
    };
  };
}

// Server-side query parameters interface
export interface ServerQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  keyword?: string;
  fields?: string;
  [key: string]: any; // For dynamic filter parameters
}

// Pagination metadata interface
export interface PaginationMeta {
  currentPage: number;
  limit: number;
  numberOfPages: number;
  nextPage?: number;
  previousPage?: number;
  totalResults: number;
}

// Props for the generic DataTable with server-side support
export interface DataTableProps<TData extends BaseEntity> {
  data: TData[];
  columns: ColumnDef<TData>[];
  // Server-side specific props
  serverSide?: boolean;
  pagination?: PaginationMeta;
  loading?: boolean;
  error?: string | null; // Add error prop for handling 404/empty results
  onQueryParamsChange?: (params: ServerQueryParams) => void;
  currentQueryParams?: ServerQueryParams;
  // Existing props
  dialogComponent?: React.ReactNode;
  editDialogComponent?: (
    rowData: TData,
    onSave: (updatedData: TData) => void
  ) => React.ReactNode;
  onRowDelete?: (id: string) => void;
  isDeleting?: boolean;
  onBulkDelete?: (ids: string[]) => void;
  isBulkDeleting?: boolean;
  enableDragAndDrop?: boolean;
  enableRowSelection?: boolean;
  enableGlobalFilter?: boolean;
  enableColumnFilter?: boolean;
  enableAdvancedFilter?: boolean;
  advancedFilterConfig?: FilterConfig;
  filterColumn?: string;
  filterPlaceholder?: string;
  onDataChange?: (newData: TData[]) => void;
  onRowUpdate?: (updatedRow: TData) => void;
  pageSize?: number;
}

// Create a separate component for the drag handle
function DragHandle({ id }: { id: number | string }) {
  const { attributes, listeners } = useSortable({
    id,
  });

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

// Enhanced actions column component with Edit functionality
export function ActionsColumn<TData extends BaseEntity>(
  editDialogComponent?: (
    rowData: TData,
    onSave: (updatedData: TData) => void
  ) => React.ReactNode,
  onRowUpdate?: (updatedRow: TData) => void,
  onRowDelete?: (id: string) => void,
  isDeleting?: boolean
) {
  return {
    id: "actions",
    cell: ({ row }: { row: Row<TData> }) => {
      const [editDialogOpen, setEditDialogOpen] = React.useState(false);

      const handleEditSave = (updatedData: TData) => {
        onRowUpdate?.(updatedData);
        setEditDialogOpen(false);
      };

      const handleEditClick = () => {
        setEditDialogOpen(true);
      };

      const handleDeleteClick = () => {
        if (onRowDelete && (row.original._id || row.original.id)) {
          const id = row.original._id || row.original.id;
          onRowDelete(id.toString());
        }
      };

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                size="icon"
              >
                <IconDotsVertical />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={handleEditClick}>
                View & Edit
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={handleDeleteClick}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {editDialogComponent &&
            editDialogOpen &&
            React.cloneElement(
              editDialogComponent(
                row.original,
                handleEditSave
              ) as React.ReactElement,
              {
                open: editDialogOpen,
                onOpenChange: setEditDialogOpen,
              }
            )}
        </>
      );
    },
  } as ColumnDef<TData>;
}

// Generic drag column component
export function DragColumn<TData extends BaseEntity>() {
  return {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
    enableSorting: false,
    enableHiding: false,
  } as ColumnDef<TData>;
}

// Generic selection column component
export function SelectionColumn<TData extends BaseEntity>() {
  return {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  } as ColumnDef<TData>;
}

// Bulk Delete Button Component
function BulkDeleteButton<TData extends BaseEntity>({
  selectedRows,
  onBulkDelete,
  isBulkDeleting,
}: {
  selectedRows: Row<TData>[];
  onBulkDelete?: (ids: string[]) => void;
  isBulkDeleting?: boolean;
}) {
  const selectedCount = selectedRows.length;

  const handleBulkDelete = () => {
    if (!onBulkDelete || selectedCount === 0) return;

    const ids = selectedRows
      .map((row) => {
        const id = row.original._id || row.original.id;
        return id ? id.toString() : "";
      })
      .filter(Boolean);

    onBulkDelete(ids);
  };

  if (selectedCount === 0) return null;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          disabled={isBulkDeleting}
          className="gap-2 mr-3"
        >
          <IconTrash className="h-4 w-4" />
          <span className="hidden sm:inline">
            Delete {selectedCount} {selectedCount === 1 ? "item" : "items"}
          </span>
          <span className="sm:hidden">Delete ({selectedCount})</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Bulk Delete</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete {selectedCount}{" "}
            {selectedCount === 1 ? "item" : "items"}? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleBulkDelete}
            disabled={isBulkDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isBulkDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function DraggableRow<TData extends BaseEntity>({ row }: { row: Row<TData> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  });

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

// Helper function to get all possible filter keys from advanced filters
function getAdvancedFilterKeys(filters: AdvancedFilters): string[] {
  const keys = new Set<string>();
  
  // Add keys from numeric filters
  filters.numeric.forEach((filter) => {
    keys.add(filter.column);
    keys.add(`${filter.column}[gt]`);
    keys.add(`${filter.column}[gte]`);
    keys.add(`${filter.column}[lt]`);
    keys.add(`${filter.column}[lte]`);
  });
  
  // Add keys from date filters
  filters.date.forEach((filter) => {
    keys.add(filter.column);
    keys.add(`${filter.column}[gt]`);
    keys.add(`${filter.column}[gte]`);
    keys.add(`${filter.column}[lt]`);
    keys.add(`${filter.column}[lte]`);
  });
  
  return Array.from(keys);
}

// Clean query parameters by removing old filter keys
function cleanQueryParams(currentParams: ServerQueryParams, advancedFilters: AdvancedFilters): ServerQueryParams {
  const cleanedParams = { ...currentParams };
  const filterKeys = getAdvancedFilterKeys(advancedFilters);
  
  // Remove all possible filter keys
  filterKeys.forEach((key) => {
    delete cleanedParams[key];
  });
  
  return cleanedParams;
}

// Convert advanced filters to server query parameters
function convertAdvancedFiltersToQueryParams(filters: AdvancedFilters): Record<string, any> {
  const params: Record<string, any> = {};

  // Process numeric filters
  filters.numeric.forEach((filter) => {
    if (filter.value !== null) {
      const { column, operator, value, value2 } = filter;
      
      switch (operator) {
        case "eq":
          params[column] = value;
          break;
        case "gt":
          params[`${column}[gt]`] = value;
          break;
        case "gte":
          params[`${column}[gte]`] = value;
          break;
        case "lt":
          params[`${column}[lt]`] = value;
          break;
        case "lte":
          params[`${column}[lte]`] = value;
          break;
        case "between":
          if (value2 !== null) {
            params[`${column}[gte]`] = value;
            params[`${column}[lte]`] = value2;
          }
          break;
      }
    }
  });

  // Process date filters - Fix the operator mapping
  filters.date.forEach((filter) => {
    if (filter.value !== null) {
      const { column, operator, value, value2 } = filter;
      
      switch (operator) {
        case "eq":
          // For exact date matching, we should use date range for the entire day
          const startOfDay = new Date(value);
          const endOfDay = new Date(value);
          endOfDay.setHours(23, 59, 59, 999);
          params[`${column}[gte]`] = startOfDay.toISOString();
          params[`${column}[lte]`] = endOfDay.toISOString();
          break;
        case "before":
          params[`${column}[lt]`] = new Date(value).toISOString();
          break;
        case "after":
          params[`${column}[gt]`] = new Date(value).toISOString();
          break;
        case "between":
          if (value2 !== null) {
            const startDate = new Date(value);
            const endDate = new Date(value2);
            endDate.setHours(23, 59, 59, 999); // Include the entire end day
            params[`${column}[gte]`] = startDate.toISOString();
            params[`${column}[lte]`] = endDate.toISOString();
          }
          break;
      }
    }
  });

  return params;
}

export function DataTable<TData extends BaseEntity>({
  data: initialData,
  columns,
  // Server-side props
  serverSide = false,
  pagination: serverPagination,
  loading = false,
  error = null, // Add error prop
  onQueryParamsChange,
  currentQueryParams: externalQueryParams,
  // Existing props
  dialogComponent,
  editDialogComponent,
  onRowDelete,
  isDeleting,
  onBulkDelete,
  isBulkDeleting,
  enableDragAndDrop = true,
  enableRowSelection = true,
  enableGlobalFilter = true,
  enableColumnFilter = true,
  enableAdvancedFilter = false,
  advancedFilterConfig,
  filterColumn = "status",
  filterPlaceholder = "Filter status...",
  onDataChange,
  onRowUpdate,
  pageSize = 10,
}: DataTableProps<TData>) {
  // Client-side state (used when serverSide is false)
  const [data, setData] = React.useState(() => initialData || []);
  const [filteredData, setFilteredData] = React.useState(() => initialData || []);

  // Server-side state (used when serverSide is true)
  const currentQueryParams = externalQueryParams || {
    page: 1,
    limit: pageSize,
  };

  // Common state for both modes
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [advancedFilters, setAdvancedFilters] = React.useState<AdvancedFilters>({
    numeric: [],
    date: [],
  });

  // Client-side pagination state
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize,
  });

  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => (Array.isArray(data) ? data.map((item) => item.id || item._id) : []),
    [data]
  );

  // Handle server-side query parameter changes
  const updateServerQueryParams = React.useCallback(
    (updates: Partial<ServerQueryParams>) => {
      if (!serverSide || !onQueryParamsChange) return;

      const newParams = { ...currentQueryParams, ...updates };
      onQueryParamsChange(newParams);
    },
    [serverSide, onQueryParamsChange, currentQueryParams]
  );

  // Handle client-side advanced filtering (only when serverSide is false)
  const applyClientSideAdvancedFilters = React.useCallback(
    (data: TData[], filters: AdvancedFilters): TData[] => {
      if (serverSide || (filters.numeric.length === 0 && filters.date.length === 0)) {
        return data;
      }

      return data.filter((row) => {
        // Check numeric filters
        const numericMatch = filters.numeric.every((filter) => {
          if (filter.value === null) return true;

          const rowValue = Number(row[filter.column]);
          if (isNaN(rowValue)) return false;

          switch (filter.operator) {
            case "eq":
              return rowValue === filter.value;
            case "gt":
              return rowValue > filter.value;
            case "gte":
              return rowValue >= filter.value;
            case "lt":
              return rowValue < filter.value;
            case "lte":
              return rowValue <= filter.value;
            case "between":
              return (
                filter.value2 !== null &&
                rowValue >= filter.value &&
                rowValue <= filter.value2
              );
            default:
              return true;
          }
        });

        // Check date filters
        const dateMatch = filters.date.every((filter) => {
          if (filter.value === null) return true;

          const rowDate = new Date(row[filter.column]);
          const filterDate = new Date(filter.value);

          if (isNaN(rowDate.getTime()) || isNaN(filterDate.getTime())) return false;

          const rowDateOnly = new Date(rowDate.toDateString());
          const filterDateOnly = new Date(filterDate.toDateString());

          switch (filter.operator) {
            case "eq":
              return rowDateOnly.getTime() === filterDateOnly.getTime();
            case "before":
              return rowDateOnly.getTime() < filterDateOnly.getTime();
            case "after":
              return rowDateOnly.getTime() > filterDateOnly.getTime();
            case "between":
              if (filter.value2 === null) return false;
              const filterDate2 = new Date(filter.value2);
              const filterDate2Only = new Date(filterDate2.toDateString());
              return (
                rowDateOnly.getTime() >= filterDateOnly.getTime() &&
                rowDateOnly.getTime() <= filterDate2Only.getTime()
              );
            default:
              return true;
          }
        });

        return numericMatch && dateMatch;
      });
    },
    [serverSide]
  );

  // Apply client-side advanced filters when data or filters change (only in client-side mode)
  React.useEffect(() => {
    if (!serverSide) {
      const filtered = applyClientSideAdvancedFilters(data, advancedFilters);
      setFilteredData(filtered);
    }
  }, [data, advancedFilters, serverSide, applyClientSideAdvancedFilters]);

  // Handle sorting changes
  const handleSortingChange = React.useCallback(
    (newSorting: SortingState | ((old: SortingState) => SortingState)) => {
      // Handle both direct state and function updates
      const resolvedSorting = typeof newSorting === 'function' ? newSorting(sorting) : newSorting;
      setSorting(resolvedSorting);
      
      if (serverSide) {
        // Convert TanStack table sorting to server format
        let sortParam = "";
        if (resolvedSorting.length > 0) {
          const { id, desc } = resolvedSorting[0];
          sortParam = desc ? `-${id}` : id;
        }
        
        updateServerQueryParams({ 
          sort: sortParam || undefined, 
          page: 1 // Reset to first page when sorting
        });
      }
    },
    [serverSide, updateServerQueryParams, sorting]
  );

  // Handle pagination changes
  const handlePaginationChange = React.useCallback(
    (newPagination: { pageIndex: number; pageSize: number }) => {
      if (serverSide) {
        // Server-side pagination
        updateServerQueryParams({
          page: newPagination.pageIndex + 1, // Convert 0-based to 1-based
          limit: newPagination.pageSize,
        });
      } else {
        // Client-side pagination
        setPagination(newPagination);
      }
    },
    [serverSide, updateServerQueryParams]
  );

  // Handle global filter (search) changes
  const handleGlobalFilterChange = React.useCallback(
    (value: string) => {
      setGlobalFilter(value);
      
      if (serverSide) {
        updateServerQueryParams({ 
          keyword: value || undefined,
          page: 1 // Reset to first page when searching
        });
      }
    },
    [serverSide, updateServerQueryParams]
  );

  // Handle column filter changes
  const handleColumnFiltersChange = React.useCallback(
    (newColumnFilters: ColumnFiltersState) => {
      setColumnFilters(newColumnFilters);
      
      if (serverSide) {
        // For server-side, we'll handle the specific filter column
        const filterValue = newColumnFilters.find(f => f.id === filterColumn)?.value;
        const filterParams: Record<string, any> = {};
        
        if (filterValue) {
          filterParams[filterColumn] = filterValue;
        }
        
        updateServerQueryParams({ 
          ...filterParams,
          page: 1 // Reset to first page when filtering
        });
      }
    },
    [serverSide, updateServerQueryParams, filterColumn]
  );

  // Handle column visibility changes (affects fields parameter)
  const handleColumnVisibilityChange = React.useCallback(
    (newVisibility: VisibilityState) => {
      setColumnVisibility(newVisibility);
      
      if (serverSide) {
        // Build fields parameter from visible columns
        const visibleColumns = columns
          .filter(col => {
            if ('accessorKey' in col && col.accessorKey) {
              const columnId = col.accessorKey as string;
              return newVisibility[columnId] !== false;
            }
            return true;
          })
          .map(col => col.accessorKey as string)
          .filter(Boolean);
        
        if (visibleColumns.length > 0) {
          updateServerQueryParams({ 
            fields: visibleColumns.join(',')
          });
        }
      }
    },
    [serverSide, updateServerQueryParams, columns]
  );

  // FIXED: Handle advanced filters change with proper parameter cleaning
  const handleAdvancedFiltersChange = React.useCallback(
    (filters: AdvancedFilters) => {
      setAdvancedFilters(filters);
      
      if (serverSide) {
        // Clean old filter parameters first
        const cleanedParams = cleanQueryParams(currentQueryParams, advancedFilters);
        
        // Convert new advanced filters to query parameters
        const filterParams = convertAdvancedFiltersToQueryParams(filters);
        
        // Merge cleaned params with new filter params
        const newParams = {
          ...cleanedParams,
          ...filterParams,
          page: 1, // Reset to first page when filtering
        };
        
        // Remove undefined values
        Object.keys(newParams).forEach(key => {
          if (newParams[key] === undefined) {
            delete newParams[key];
          }
        });
        
        console.log('Advanced filters:', filters);
        console.log('Cleaned params:', cleanedParams);
        console.log('New filter params:', filterParams);
        console.log('Final params:', newParams);
        
        onQueryParamsChange?.(newParams);
      }
    },
    [serverSide, currentQueryParams, advancedFilters, onQueryParamsChange]
  );

  // Handle row updates
  const handleRowUpdate = React.useCallback(
    (updatedRow: TData) => {
      if (!serverSide) {
        setData((prevData) => {
          const newData = prevData.map((row) =>
            row.id === updatedRow.id ? updatedRow : row
          );
          onDataChange?.(newData);
          return newData;
        });
      }
      onRowUpdate?.(updatedRow);
    },
    [serverSide, onDataChange, onRowUpdate]
  );

  // Handle bulk delete with row selection reset
  const handleBulkDelete = React.useCallback(
    (ids: string[]) => {
      if (onBulkDelete) {
        onBulkDelete(ids);
        // Clear row selection after successful delete
        setRowSelection({});
      }
    },
    [onBulkDelete]
  );

  // Build final columns array with optional system columns
  const finalColumns = React.useMemo(() => {
    const cols: ColumnDef<TData>[] = [];

    if (enableDragAndDrop && !serverSide) {
      cols.push(DragColumn<TData>());
    }

    if (enableRowSelection) {
      cols.push(SelectionColumn<TData>());
    }

    cols.push(...columns);
    cols.push(
      ActionsColumn<TData>(
        editDialogComponent,
        handleRowUpdate,
        onRowDelete,
        isDeleting
      )
    );

    return cols;
  }, [
    columns,
    enableDragAndDrop,
    enableRowSelection,
    serverSide,
    editDialogComponent,
    handleRowUpdate,
    onRowDelete,
    isDeleting,
  ]);

  // Determine which data to use and pagination configuration
  const tableData = serverSide ? initialData : filteredData;
  const tablePagination = serverSide 
    ? {
        pageIndex: (serverPagination?.currentPage || 1) - 1, // Convert 1-based to 0-based
        pageSize: serverPagination?.limit || pageSize,
      }
    : pagination;

  // Configure table instance
  const table = useReactTable({
    data: tableData,
    columns: finalColumns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination: tablePagination,
      globalFilter,
    },
    getRowId: (row) => (row.id || row._id).toString(),
    enableRowSelection: enableRowSelection,
    onRowSelectionChange: setRowSelection,
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: handleColumnFiltersChange,
    onColumnVisibilityChange: handleColumnVisibilityChange,
    onPaginationChange: handlePaginationChange,
    onGlobalFilterChange: handleGlobalFilterChange,
    getCoreRowModel: getCoreRowModel(),
    // Only enable client-side features when not in server-side mode
    getFilteredRowModel: serverSide ? undefined : getFilteredRowModel(),
    getPaginationRowModel: serverSide ? undefined : getPaginationRowModel(),
    getSortedRowModel: serverSide ? undefined : getSortedRowModel(),
    getFacetedRowModel: serverSide ? undefined : getFacetedRowModel(),
    getFacetedUniqueValues: serverSide ? undefined : getFacetedUniqueValues(),
    // For server-side mode, we need to provide manual pagination info
    manualPagination: serverSide,
    manualSorting: serverSide,
    manualFiltering: serverSide,
    pageCount: serverSide ? serverPagination?.numberOfPages : undefined,
  });

  // Handle drag and drop (only in client-side mode)
  function handleDragEnd(event: DragEndEvent) {
    if (serverSide) return; // Disable drag and drop in server-side mode
    
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        const newData = arrayMove(data, oldIndex, newIndex);
        onDataChange?.(newData);
        return newData;
      });
    }
  }

  // Sync external data changes (for client-side mode)
  React.useEffect(() => {
    if (!serverSide) {
      setData(initialData);
    }
  }, [initialData, serverSide]);

  React.useEffect(() => {
    if (serverSide && currentQueryParams.sort) {
      const sortParam = currentQueryParams.sort;
      let newSorting: SortingState = [];
      
      if (sortParam) {
        const isDesc = sortParam.startsWith('-');
        const columnId = isDesc ? sortParam.substring(1) : sortParam;
        newSorting = [{ id: columnId, desc: isDesc }];
      }
      
      // Only update if different to avoid infinite loops
      if (JSON.stringify(newSorting) !== JSON.stringify(sorting)) {
        setSorting(newSorting);
      }
    }
  }, [serverSide, currentQueryParams.sort, sorting]);

  // Get selected rows for bulk operations
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  // Calculate pagination info for display
  const paginationInfo = serverSide && serverPagination 
    ? {
        currentPage: serverPagination.currentPage,
        totalPages: serverPagination.numberOfPages,
        canPreviousPage: serverPagination.currentPage > 1,
        canNextPage: serverPagination.currentPage < serverPagination.numberOfPages,
      }
    : {
        currentPage: table.getState().pagination.pageIndex + 1,
        totalPages: table.getPageCount(),
        canPreviousPage: table.getCanPreviousPage(),
        canNextPage: table.getCanNextPage(),
      };

  // FIXED: Enhanced table content with proper error and empty state handling
  const TableContent = () => (
    <Table>
      <TableHeader className="bg-muted sticky top-0 z-10">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead
                key={header.id}
                colSpan={header.colSpan}
                onClick={
                  header.column.getCanSort()
                    ? header.column.getToggleSortingHandler()
                    : undefined
                }
                className={
                  header.column.getCanSort() ? "cursor-pointer select-none" : ""
                }
              >
                {header.isPlaceholder ? null : (
                  <div className="flex items-center gap-1">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}

                    {header.column.getCanSort() &&
                      ({
                        asc: <ArrowDown className="h-3 w-3" />,
                        desc: <ArrowUp className="h-3 w-3" />,
                      }[header.column.getIsSorted() as string] ?? (
                        <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                      ))}
                  </div>
                )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>

      <TableBody className="**:data-[slot=table-cell]:first:w-8">
        {loading ? (
          <TableRow>
            <TableCell colSpan={finalColumns.length} className="h-24 text-center">
              Loading...
            </TableCell>
          </TableRow>
        ) : error || (table.getRowModel().rows?.length === 0) ? (
          <TableRow>
            <TableCell colSpan={finalColumns.length} className="h-24 text-center">
              {error ? (
                <div className="text-muted-foreground">
                  <p className="font-medium">No Results Found</p>
                  <p className="text-sm mt-1">Try adjusting your search or filter criteria</p>
                </div>
              ) : (
                "No results."
              )}
            </TableCell>
          </TableRow>
        ) : (
          enableDragAndDrop && !serverSide ? (
            <SortableContext
              items={dataIds}
              strategy={verticalListSortingStrategy}
            >
              {table.getRowModel().rows.map((row) => (
                <DraggableRow key={row.id} row={row} />
              ))}
            </SortableContext>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )
        )}
      </TableBody>
    </Table>
  );

  return (
    <Tabs
      defaultValue="outline"
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>
        <Select defaultValue="outline">
          <SelectTrigger
            className="flex w-fit @4xl/main:hidden"
            size="sm"
            id="view-selector"
          >
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>
        </Select>

        <div className="flex items-center gap-2 flex-wrap">
          {enableGlobalFilter && (
            <Input
              placeholder="Search..."
              value={globalFilter}
              onChange={(e) => handleGlobalFilterChange(e.target.value)}
              className="max-w-sm"
            />
          )}

          {enableColumnFilter && (
            <Input
              placeholder={filterPlaceholder}
              value={
                (table.getColumn(filterColumn)?.getFilterValue() as string) ??
                ""
              }
              onChange={(e) =>
                table.getColumn(filterColumn)?.setFilterValue(e.target.value)
              }
              className="max-w-sm"
            />
          )}

          {enableAdvancedFilter && advancedFilterConfig && (
            <AdvancedFilter
              config={advancedFilterConfig}
              onFiltersChange={handleAdvancedFiltersChange}
              initialFilters={advancedFilters}
            />
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns />
                <span className="hidden lg:inline">Customize Columns</span>
                <span className="lg:hidden">Columns</span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          {dialogComponent}
        </div>
      </div>

      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          {enableDragAndDrop && !serverSide ? (
            <DndContext
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={handleDragEnd}
              sensors={sensors}
              id={sortableId}
            >
              <TableContent />
            </DndContext>
          ) : (
            <TableContent />
          )}
        </div>

        <div className="flex items-center justify-between px-4">
          {/* Bulk Delete Button */}
          {enableRowSelection && onBulkDelete && (
            <BulkDeleteButton
              selectedRows={selectedRows}
              onBulkDelete={handleBulkDelete}
              isBulkDeleting={isBulkDeleting}
            />
          )}

          {enableRowSelection && (
            <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
          )}

          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${tablePagination.pageSize}`}
                onValueChange={(value) => {
                  const newPageSize = Number(value);
                  if (serverSide) {
                    updateServerQueryParams({ 
                      limit: newPageSize,
                      page: 1 // Reset to first page when changing page size
                    });
                  } else {
                    table.setPageSize(newPageSize);
                  }
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue placeholder={tablePagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {paginationInfo.currentPage} of {paginationInfo.totalPages}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => {
                  if (serverSide) {
                    updateServerQueryParams({ page: 1 });
                  } else {
                    table.setPageIndex(0);
                  }
                }}
                disabled={!paginationInfo.canPreviousPage}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => {
                  if (serverSide) {
                    updateServerQueryParams({ page: Math.max(1, (serverPagination?.currentPage || 1) - 1) });
                  } else {
                    table.previousPage();
                  }
                }}
                disabled={!paginationInfo.canPreviousPage}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => {
                  if (serverSide) {
                    updateServerQueryParams({ 
                      page: Math.min(
                        serverPagination?.numberOfPages || 1, 
                        (serverPagination?.currentPage || 1) + 1
                      ) 
                    });
                  } else {
                    table.nextPage();
                  }
                }}
                disabled={!paginationInfo.canNextPage}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => {
                  if (serverSide) {
                    updateServerQueryParams({ page: serverPagination?.numberOfPages || 1 });
                  } else {
                    table.setPageIndex(table.getPageCount() - 1);
                  }
                }}
                disabled={!paginationInfo.canNextPage}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}