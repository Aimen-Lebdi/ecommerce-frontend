/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-case-declarations */
import * as React from "react";
import { useTranslation } from 'react-i18next';
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
  IconBan,
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

import {
  AdvancedFilter,
  type AdvancedFilters,
  type FilterConfig,
} from "./AdvancedFilter";

// Generic data type that all entities must extend
export interface BaseEntity {
  id?: number | string;
  _id?: string;
  [key: string]: any;
}

// Server-side query parameters interface
export interface ServerQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  keyword?: string;
  fields?: string;
  [key: string]: any;
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
  serverSide?: boolean;
  // Accept null too — all admin slices initialise pagination as null.
  pagination?: PaginationMeta | null;
  loading?: boolean;
  error?: string | null;
  onQueryParamsChange?: (params: ServerQueryParams) => void;
  currentQueryParams?: ServerQueryParams;
  dialogComponent?: React.ReactNode;
  editDialogComponent?: (
    rowData: TData,
    onSave: (updatedData: TData) => void
  ) => React.ReactNode;
  onRowDelete?: (id: string) => void;
  isDeleting?: boolean;
  onBulkDelete?: (ids: string[]) => void;
  isBulkDeleting?: boolean;
  onRowBan?: (id: string) => void;
  onRowUnban?: (id: string) => void;
  isBanning?: boolean;
  isUnbanning?: boolean;
  onBulkBan?: (ids: string[]) => void;
  onBulkUnban?: (ids: string[]) => void;
  isBulkBanning?: boolean;
  isBulkUnbanning?: boolean;
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
  const { t } = useTranslation();
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
      <span className="sr-only">{t('dataTable.dragHandle.srOnly')}</span>
    </Button>
  );
}

// Separate component for Actions Cell
function ActionsCellComponent<TData extends BaseEntity>({
  row,
  onEditClick,
  onRowDelete,
  isDeleting,
  onRowBan,
  onRowUnban,
  isBanning,
  isUnbanning,
}: {
  row: Row<TData>;
  onEditClick: (rowData: TData) => void;
  onRowDelete?: (id: string) => void;
  isDeleting?: boolean;
  onRowBan?: (id: string) => void;
  onRowUnban?: (id: string) => void;
  isBanning?: boolean;
  isUnbanning?: boolean;
}) {
  const { t } = useTranslation();

  const handleDeleteClick = () => {
    if (onRowDelete && (row.original._id || row.original.id)) {
      const id = row.original._id || row.original.id;
      onRowDelete(id.toString());
    }
  };

  const handleBanClick = () => {
    if (onRowBan && (row.original._id || row.original.id)) {
      const id = row.original._id || row.original.id;
      onRowBan(id.toString());
    }
  };

  const handleUnbanClick = () => {
    if (onRowUnban && (row.original._id || row.original.id)) {
      const id = row.original._id || row.original.id;
      onRowUnban(id.toString());
    }
  };

  const isActive = row.original.active === true;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
          size="icon"
        >
          <IconDotsVertical />
          <span className="sr-only">{t('dataTable.actions.openMenu')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        <DropdownMenuItem onClick={() => onEditClick(row.original)}>
          {t('dataTable.actions.viewEdit')}
        </DropdownMenuItem>
        {onRowDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={handleDeleteClick}
              disabled={isDeleting}
            >
              {isDeleting ? t('dataTable.actions.deleting') : t('dataTable.actions.delete')}
            </DropdownMenuItem>
          </>
        )}
        {(onRowBan || onRowUnban) && (
          <>
            <DropdownMenuSeparator />
            {isActive ? (
              <DropdownMenuItem
                variant="destructive"
                onClick={handleBanClick}
                disabled={isBanning}
              >
                {isBanning ? t('dataTable.actions.banning') : t('dataTable.actions.ban')}
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={handleUnbanClick}
                disabled={isUnbanning}
              >
                {isUnbanning ? t('dataTable.actions.unbanning') : t('dataTable.actions.unban')}
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Enhanced actions column component with Edit functionality
export function ActionsColumn<TData extends BaseEntity>(
  onEditClick: (rowData: TData) => void,
  onRowDelete?: (id: string) => void,
  isDeleting?: boolean,
  onRowBan?: (id: string) => void,
  onRowUnban?: (id: string) => void,
  isBanning?: boolean,
  isUnbanning?: boolean
) {
  return {
    id: "actions",
    cell: ({ row }: { row: Row<TData> }) => (
      <ActionsCellComponent
        row={row}
        onEditClick={onEditClick}
        onRowDelete={onRowDelete}
        isDeleting={isDeleting}
        onRowBan={onRowBan}
        onRowUnban={onRowUnban}
        isBanning={isBanning}
        isUnbanning={isUnbanning}
      />
    ),
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

// Separate component for Selection Header Cell
function SelectionHeaderCell({ table }: { table: any }) {
  const { t } = useTranslation();
  
  return (
    <div className="flex items-center justify-center">
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label={t('dataTable.selection.selectAll')}
      />
    </div>
  );
}

// Separate component for Selection Row Cell
function SelectionRowCell({ row }: { row: any }) {
  const { t } = useTranslation();
  
  return (
    <div className="flex items-center justify-center">
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label={t('dataTable.selection.selectRow')}
      />
    </div>
  );
}

// Generic selection column component
export function SelectionColumn<TData extends BaseEntity>() {
  return {
    id: "select",
    header: ({ table }) => <SelectionHeaderCell table={table} />,
    cell: ({ row }) => <SelectionRowCell row={row} />,
    enableSorting: false,
    enableHiding: false,
  } as ColumnDef<TData>;
}

// Bulk Ban/Unban Button Component
function BulkBanButton<TData extends BaseEntity>({
  selectedRows,
  onBulkBan,
  onBulkUnban,
  isBulkBanning,
  isBulkUnbanning,
}: {
  selectedRows: Row<TData>[];
  onBulkBan?: (ids: string[]) => void;
  onBulkUnban?: (ids: string[]) => void;
  isBulkBanning?: boolean;
  isBulkUnbanning?: boolean;
}) {
  const { t } = useTranslation();
  const selectedCount = selectedRows.length;

  const { allActive, allBanned } = React.useMemo(() => {
    let activeCount = 0;
    let bannedCount = 0;
    selectedRows.forEach((row) => {
      if (row.original.active === true) {
        activeCount++;
      } else {
        bannedCount++;
      }
    });
    return {
      allActive: activeCount === selectedCount,
      allBanned: bannedCount === selectedCount,
    };
  }, [selectedRows, selectedCount]);

  const isBanAction = allActive;
  const isMixed = !allActive && !allBanned;

  const handleBulkAction = () => {
    if (selectedCount === 0) return;

    const ids = selectedRows
      .map((row) => {
        const id = row.original._id || row.original.id;
        return id ? id.toString() : "";
      })
      .filter(Boolean);

    if (isBanAction && onBulkBan) {
      onBulkBan(ids);
    } else if (!isBanAction && !isMixed && onBulkUnban) {
      onBulkUnban(ids);
    } else if (isMixed) {
      // For mixed selection, call both
      const activeIds = selectedRows
        .filter((row) => row.original.active === true)
        .map((row) => {
          const id = row.original._id || row.original.id;
          return id ? id.toString() : "";
        })
        .filter(Boolean);
      const bannedIds = selectedRows
        .filter((row) => row.original.active !== true)
        .map((row) => {
          const id = row.original._id || row.original.id;
          return id ? id.toString() : "";
        })
        .filter(Boolean);

      if (activeIds.length > 0 && onBulkBan) {
        onBulkBan(activeIds);
      }
      if (bannedIds.length > 0 && onBulkUnban) {
        onBulkUnban(bannedIds);
      }
    }
  };

  const isLoading = isBulkBanning || isBulkUnbanning;

  if (selectedCount === 0) return null;

  const getButtonLabel = () => {
    if (isBanAction) {
      return t('dataTable.bulkBan.button', { count: selectedCount });
    }
    if (allBanned) {
      return t('dataTable.bulkUnban.button', { count: selectedCount });
    }
    return t('dataTable.bulkBan.banUnbanButton', { count: selectedCount });
  };

  const getDialogTitle = () => {
    if (isBanAction) {
      return t('dataTable.bulkBan.title');
    }
    if (allBanned) {
      return t('dataTable.bulkUnban.title');
    }
    return t('dataTable.bulkBan.title');
  };

  const getDialogDescription = () => {
    if (isBanAction) {
      return t('dataTable.bulkBan.description', { count: selectedCount });
    }
    if (allBanned) {
      return t('dataTable.bulkUnban.description', { count: selectedCount });
    }
    return t('dataTable.bulkBan.description', { count: selectedCount });
  };

  const getConfirmLabel = () => {
    if (isLoading) {
      if (isBulkBanning) return t('dataTable.bulkBan.banning');
      if (isBulkUnbanning) return t('dataTable.bulkUnban.unbanning');
    }
    if (isBanAction) return t('dataTable.bulkBan.ban');
    if (allBanned) return t('dataTable.bulkUnban.unban');
    return t('dataTable.bulkBan.ban');
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant={isBanAction || isMixed ? "destructive" : "default"}
          size="sm"
          disabled={isLoading}
          className="gap-2 mr-3"
        >
          <IconBan className="h-4 w-4" />
          <span className="hidden sm:inline">
            {getButtonLabel()}
          </span>
          <span className="sm:hidden">{getButtonLabel()}</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{getDialogTitle()}</AlertDialogTitle>
          <AlertDialogDescription>
            {getDialogDescription()}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('dataTable.bulkBan.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleBulkAction}
            disabled={isLoading}
            className={isBanAction || isMixed ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
          >
            {getConfirmLabel()}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
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
  const { t } = useTranslation();
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
            {t('dataTable.bulkDelete.button', { count: selectedCount })}
          </span>
          <span className="sm:hidden">{t('dataTable.bulkDelete.buttonShort', { count: selectedCount })}</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('dataTable.bulkDelete.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('dataTable.bulkDelete.description', { count: selectedCount })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('dataTable.bulkDelete.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleBulkDelete}
            disabled={isBulkDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isBulkDeleting ? t('dataTable.bulkDelete.deleting') : t('dataTable.bulkDelete.delete')}
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

  filters.numeric.forEach((filter) => {
    keys.add(filter.column);
    keys.add(`${filter.column}[gt]`);
    keys.add(`${filter.column}[gte]`);
    keys.add(`${filter.column}[lt]`);
    keys.add(`${filter.column}[lte]`);
  });

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
function cleanQueryParams(
  currentParams: ServerQueryParams,
  advancedFilters: AdvancedFilters
): ServerQueryParams {
  const cleanedParams = { ...currentParams };
  const filterKeys = getAdvancedFilterKeys(advancedFilters);

  filterKeys.forEach((key) => {
    delete cleanedParams[key];
  });

  return cleanedParams;
}

// Convert advanced filters to server query parameters
function convertAdvancedFiltersToQueryParams(
  filters: AdvancedFilters
): Record<string, any> {
  const params: Record<string, any> = {};

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

  filters.date.forEach((filter) => {
    if (filter.value !== null) {
      const { column, operator, value, value2 } = filter;

      switch (operator) {
        // Build the day window in LOCAL time: the date input yields a
        // "YYYY-MM-DD" string, so appending the local time-of-day keeps the
        // ISO range aligned with the local calendar day (matching the
        // client-side toDateString() comparison).
        case "eq": {
          const startOfDay = new Date(`${value}T00:00:00`);
          const endOfDay = new Date(`${value}T23:59:59.999`);
          params[`${column}[gte]`] = startOfDay.toISOString();
          params[`${column}[lte]`] = endOfDay.toISOString();
          break;
        }
        case "before":
          params[`${column}[lt]`] = new Date(`${value}T00:00:00`).toISOString();
          break;
        case "after":
          params[`${column}[gt]`] = new Date(`${value}T23:59:59.999`).toISOString();
          break;
        case "between": {
          if (value2 !== null) {
            const startDate = new Date(`${value}T00:00:00`);
            const endDate = new Date(`${value2}T23:59:59.999`);
            params[`${column}[gte]`] = startDate.toISOString();
            params[`${column}[lte]`] = endDate.toISOString();
          }
          break;
        }
      }
    }
  });

  return params;
}

export function DataTable<TData extends BaseEntity>({
  data: initialData,
  columns,
  serverSide = false,
  pagination: serverPagination,
  loading = false,
  error = null,
  onQueryParamsChange,
  currentQueryParams: externalQueryParams,
  dialogComponent,
  editDialogComponent,
  onRowDelete,
  isDeleting,
  onBulkDelete,
  isBulkDeleting,
  onRowBan,
  onRowUnban,
  isBanning,
  isUnbanning,
  onBulkBan,
  onBulkUnban,
  isBulkBanning,
  isBulkUnbanning,
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
  const { t } = useTranslation();
  
  const [data, setData] = React.useState(() => initialData || []);
  const [filteredData, setFilteredData] = React.useState(
    () => initialData || []
  );

  const currentQueryParams = externalQueryParams || {
    page: 1,
    limit: pageSize,
  };

  const [rowSelection, setRowSelection] = React.useState({});
  const [editingRow, setEditingRow] = React.useState<TData | null>(null);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [advancedFilters, setAdvancedFilters] = React.useState<AdvancedFilters>(
    {
      numeric: [],
      date: [],
    }
  );
  // Tracks the last filters actually applied to the server so stale filter
  // keys are cleaned deterministically regardless of render timing.
  const prevAdvancedFiltersRef = React.useRef<AdvancedFilters>({
    numeric: [],
    date: [],
  });

  const hasActiveSearchOrFilter = React.useMemo(() => {
    if (serverSide) {
      if (!!currentQueryParams?.keyword) return true;
      if (!currentQueryParams) return false;

      // Advanced filters emit bracket keys (price[gt], createdAt[gte]) and
      // bare-column keys for `eq` — treat any as an active search so an
      // empty result set shows "No results" instead of "No data".
      const advancedColumnKeys = new Set<string>();
      advancedFilters.numeric.forEach((f) => advancedColumnKeys.add(f.column));
      advancedFilters.date.forEach((f) => advancedColumnKeys.add(f.column));

      return Object.keys(currentQueryParams).some(
        (key) => key.includes("[") || advancedColumnKeys.has(key)
      );
    }
    return !!globalFilter || columnFilters.length > 0;
  }, [
    serverSide,
    currentQueryParams,
    globalFilter,
    columnFilters,
    advancedFilters,
  ]);

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

  const updateServerQueryParams = React.useCallback(
    (updates: Partial<ServerQueryParams>) => {
      if (!serverSide || !onQueryParamsChange) return;

      const newParams = { ...currentQueryParams, ...updates };
      onQueryParamsChange(newParams);
    },
    [serverSide, onQueryParamsChange, currentQueryParams]
  );

  const applyClientSideAdvancedFilters = React.useCallback(
    (data: TData[], filters: AdvancedFilters): TData[] => {
      if (
        serverSide ||
        (filters.numeric.length === 0 && filters.date.length === 0)
      ) {
        return data;
      }

      return data.filter((row) => {
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

        const dateMatch = filters.date.every((filter) => {
          if (filter.value === null) return true;

          const rowDate = new Date(row[filter.column]);
          const filterDate = new Date(filter.value);

          if (isNaN(rowDate.getTime()) || isNaN(filterDate.getTime()))
            return false;

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

  React.useEffect(() => {
    if (!serverSide) {
      const filtered = applyClientSideAdvancedFilters(data, advancedFilters);
      setFilteredData(filtered);
    }
  }, [data, advancedFilters, serverSide, applyClientSideAdvancedFilters]);

  const handleSortingChange = React.useCallback(
    (newSorting: SortingState | ((old: SortingState) => SortingState)) => {
      const resolvedSorting =
        typeof newSorting === "function" ? newSorting(sorting) : newSorting;
      setSorting(resolvedSorting);

      if (serverSide) {
        let sortParam = "";
        if (resolvedSorting.length > 0) {
          const { id, desc } = resolvedSorting[0];
          sortParam = desc ? `-${id}` : id;
        }

        updateServerQueryParams({
          sort: sortParam || undefined,
          page: 1,
        });
      }
    },
    [serverSide, updateServerQueryParams, sorting]
  );

  const handlePaginationChange = React.useCallback(
    (newPagination: { pageIndex: number; pageSize: number }) => {
      if (serverSide) {
        updateServerQueryParams({
          page: newPagination.pageIndex + 1,
          limit: newPagination.pageSize,
        });
      } else {
        setPagination(newPagination);
      }
    },
    [serverSide, updateServerQueryParams]
  );

  const handleGlobalFilterChange = React.useCallback(
    (value: string) => {
      setGlobalFilter(value);

      if (serverSide) {
        updateServerQueryParams({
          keyword: value || undefined,
          page: 1,
        });
      }
    },
    [serverSide, updateServerQueryParams]
  );

  const handleColumnFiltersChange = React.useCallback(
    (newColumnFilters: ColumnFiltersState) => {
      setColumnFilters(newColumnFilters);

      if (serverSide) {
        const filterValue = newColumnFilters.find(
          (f) => f.id === filterColumn
        )?.value;
        const filterParams: Record<string, any> = {};

        if (filterValue) {
          filterParams[filterColumn] = filterValue;
        }

        updateServerQueryParams({
          ...filterParams,
          page: 1,
        });
      }
    },
    [serverSide, updateServerQueryParams, filterColumn]
  );

  const handleColumnVisibilityChange = React.useCallback(
    (newVisibility: VisibilityState) => {
      setColumnVisibility(newVisibility);

      if (serverSide) {
        const visibleColumns = columns
          .filter((col) => {
            if ("accessorKey" in col && col.accessorKey) {
              const columnId = col.accessorKey as string;
              return newVisibility[columnId] !== false;
            }
            return true;
          })
          .map((col) => col.accessorKey as string)
          .filter(Boolean);

        const essentialFields = ["_id", "name", "slug", "mainImage", "image"];
        const allRequiredFields = [
          ...new Set([...essentialFields, ...visibleColumns]),
        ];

        if (allRequiredFields.length > 0) {
          updateServerQueryParams({
            fields: allRequiredFields.join(","),
          });
        }
      }
    },
    [serverSide, updateServerQueryParams, columns]
  );

  const handleAdvancedFiltersChange = React.useCallback(
    (filters: AdvancedFilters) => {
      setAdvancedFilters(filters);

      if (serverSide) {
        const cleanedParams = cleanQueryParams(
          currentQueryParams,
          prevAdvancedFiltersRef.current
        );

        const filterParams = convertAdvancedFiltersToQueryParams(filters);

        const newParams = {
          ...cleanedParams,
          ...filterParams,
          page: 1,
        };

        Object.keys(newParams).forEach((key) => {
          if (newParams[key] === undefined) {
            delete newParams[key];
          }
        });

        prevAdvancedFiltersRef.current = filters;
        onQueryParamsChange?.(newParams);
      }
    },
    [serverSide, currentQueryParams, onQueryParamsChange]
  );

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

  const handleBulkDelete = React.useCallback(
    (ids: string[]) => {
      if (onBulkDelete) {
        onBulkDelete(ids);
        setRowSelection({});
      }
    },
    [onBulkDelete]
  );

  const handleBulkBan = React.useCallback(
    (ids: string[]) => {
      if (onBulkBan) {
        onBulkBan(ids);
        setRowSelection({});
      }
    },
    [onBulkBan]
  );

  const handleBulkUnban = React.useCallback(
    (ids: string[]) => {
      if (onBulkUnban) {
        onBulkUnban(ids);
        setRowSelection({});
      }
    },
    [onBulkUnban]
  );

  const handleEditSave = React.useCallback(
    (updatedData: TData) => {
      handleRowUpdate(updatedData);
    },
    [handleRowUpdate]
  );

  const finalColumns = React.useMemo(() => {
  const cols: ColumnDef<TData>[] = [];

  if (enableDragAndDrop && !serverSide) {
    cols.push(DragColumn<TData>());
  }

  if (enableRowSelection) {
    cols.push(SelectionColumn<TData>());
  }

  cols.push(...columns);

  // FIX: Only add ActionsColumn if no actions column exists already
  const hasActionsColumn = columns.some(col => col.id === "actions");
  if (!hasActionsColumn) {
    cols.push(
      ActionsColumn<TData>(
        setEditingRow,
        onRowDelete,
        isDeleting,
        onRowBan,
        onRowUnban,
        isBanning,
        isUnbanning
      )
    );
  }

  return cols;
}, [
  columns,
  enableDragAndDrop,
  enableRowSelection,
  serverSide,
  onRowDelete,
  isDeleting,
  onRowBan,
  onRowUnban,
  isBanning,
  isUnbanning,
]);

  const tableData = serverSide ? initialData : filteredData;
  const tablePagination = serverSide
    ? {
        pageIndex: (serverPagination?.currentPage || 1) - 1,
        pageSize: serverPagination?.limit || pageSize,
      }
    : pagination;

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
    getFilteredRowModel: serverSide ? undefined : getFilteredRowModel(),
    getPaginationRowModel: serverSide ? undefined : getPaginationRowModel(),
    getSortedRowModel: serverSide ? undefined : getSortedRowModel(),
    getFacetedRowModel: serverSide ? undefined : getFacetedRowModel(),
    getFacetedUniqueValues: serverSide ? undefined : getFacetedUniqueValues(),
    manualPagination: serverSide,
    manualSorting: serverSide,
    manualFiltering: serverSide,
    pageCount: serverSide ? serverPagination?.numberOfPages : undefined,
  });

  function handleDragEnd(event: DragEndEvent) {
    if (serverSide) return;

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
        const isDesc = sortParam.startsWith("-");
        const columnId = isDesc ? sortParam.substring(1) : sortParam;
        newSorting = [{ id: columnId, desc: isDesc }];
      }

      if (JSON.stringify(newSorting) !== JSON.stringify(sorting)) {
        setSorting(newSorting);
      }
    }
  }, [serverSide, currentQueryParams.sort, sorting]);

  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const paginationInfo =
    serverSide && serverPagination
      ? {
          currentPage: serverPagination.currentPage,
          totalPages: serverPagination.numberOfPages,
          canPreviousPage: serverPagination.currentPage > 1,
          canNextPage:
            serverPagination.currentPage < serverPagination.numberOfPages,
        }
      : {
          currentPage: table.getState().pagination.pageIndex + 1,
          totalPages: table.getPageCount(),
          canPreviousPage: table.getCanPreviousPage(),
          canNextPage: table.getCanNextPage(),
        };

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
            <TableCell
              colSpan={finalColumns.length}
              className="h-24 text-center"
            >
              {t('dataTable.loading')}
            </TableCell>
          </TableRow>
        ) : table.getRowModel().rows?.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={finalColumns.length}
              className="h-24 text-center"
            >
              {error || hasActiveSearchOrFilter ? (
                t('dataTable.noResults')
              ) : (
                t('dataTable.noData')
              )}
            </TableCell>
          </TableRow>
        ) : enableDragAndDrop && !serverSide ? (
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
        )}
      </TableBody>
    </Table>
  );

  return (
    <>
      <Tabs
        defaultValue="outline"
        className="w-full flex-col justify-start gap-6"
      >
        <div className="flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-2 flex-wrap">
            {enableGlobalFilter && (
              <Input
                placeholder={t('dataTable.search')}
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
                  <span className="hidden lg:inline">{t('dataTable.customizeColumns')}</span>
                  <span className="lg:hidden">{t('dataTable.columns')}</span>
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
            {enableRowSelection && (onBulkBan || onBulkUnban) && (
              <BulkBanButton
                selectedRows={selectedRows}
                onBulkBan={handleBulkBan}
                onBulkUnban={handleBulkUnban}
                isBulkBanning={isBulkBanning}
                isBulkUnbanning={isBulkUnbanning}
              />
            )}

            {enableRowSelection && onBulkDelete && (
              <BulkDeleteButton
                selectedRows={selectedRows}
                onBulkDelete={handleBulkDelete}
                isBulkDeleting={isBulkDeleting}
              />
            )}

            {enableRowSelection && (
              <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
                {t('dataTable.rowsSelected', {
                  selected: table.getFilteredSelectedRowModel().rows.length,
                  total: table.getFilteredRowModel().rows.length,
                })}
              </div>
            )}

            <div className="flex w-full items-center gap-8 lg:w-fit">
              <div className="hidden items-center gap-2 lg:flex">
                <Label htmlFor="rows-per-page" className="text-sm font-medium">
                  {t('dataTable.rowsPerPage')}
                </Label>
                <Select
                  value={`${tablePagination.pageSize}`}
                  onValueChange={(value) => {
                    const newPageSize = Number(value);
                    if (serverSide) {
                      updateServerQueryParams({
                        limit: newPageSize,
                        page: 1,
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
                {t('dataTable.pageInfo', {
                  current: paginationInfo.currentPage,
                  total: paginationInfo.totalPages,
                })}
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
                  <span className="sr-only">{t('dataTable.firstPage')}</span>
                  <IconChevronsLeft />
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() => {
                    if (serverSide) {
                      updateServerQueryParams({
                        page: Math.max(
                          1,
                          (serverPagination?.currentPage || 1) - 1
                        ),
                      });
                    } else {
                      table.previousPage();
                    }
                  }}
                  disabled={!paginationInfo.canPreviousPage}
                >
                  <span className="sr-only">{t('dataTable.previousPage')}</span>
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
                        ),
                      });
                    } else {
                      table.nextPage();
                    }
                  }}
                  disabled={!paginationInfo.canNextPage}
                >
                  <span className="sr-only">{t('dataTable.nextPage')}</span>
                  <IconChevronRight />
                </Button>
                <Button
                  variant="outline"
                  className="hidden size-8 lg:flex"
                  size="icon"
                  onClick={() => {
                    if (serverSide) {
                      updateServerQueryParams({
                        page: serverPagination?.numberOfPages || 1,
                      });
                    } else {
                      table.setPageIndex(table.getPageCount() - 1);
                    }
                  }}
                  disabled={!paginationInfo.canNextPage}
                >
                  <span className="sr-only">{t('dataTable.lastPage')}</span>
                  <IconChevronsRight />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {editDialogComponent &&
        editingRow &&
        React.cloneElement(
          editDialogComponent(editingRow, handleEditSave) as React.ReactElement,
          {
            open: true,
            onOpenChange: (isOpen: boolean) => {
              if (!isOpen) setEditingRow(null);
            },
          }
        )}
    </>
  );
}