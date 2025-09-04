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
import { ArrowUpDown } from "lucide-react";

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

// Import the new AdvancedFilter component
import {
  AdvancedFilter,
  type AdvancedFilters,
  // type NumericFilter,
  // type DateFilter,
} from "./AdvancedFilter";

// Generic data type that all entities must extend
export interface BaseEntity {
  id: number | string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

// Props for the generic DataTable
export interface DataTableProps<TData extends BaseEntity> {
  data: TData[];
  columns: ColumnDef<TData>[];
  dialogComponent?: React.ReactNode;
  editDialogComponent?: (
    rowData: TData,
    onSave: (updatedData: TData) => void
  ) => React.ReactNode;
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
  onRowUpdate?: (updatedRow: TData) => void
) {
  return {
    id: "actions",
    cell: ({ row }: { row: Row<TData> }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [editDialogOpen, setEditDialogOpen] = React.useState(false);

      const handleEditSave = (updatedData: TData) => {
        onRowUpdate?.(updatedData);
        setEditDialogOpen(false);
      };

      const handleEditClick = () => {
        setEditDialogOpen(true);
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
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>Make a copy</DropdownMenuItem>
              <DropdownMenuItem>Favorite</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Render edit dialog when open */}
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

// Advanced filtering logic
function applyAdvancedFilters<TData extends BaseEntity>(
  data: TData[],
  filters: AdvancedFilters
): TData[] {
  if (filters.numeric.length === 0 && filters.date.length === 0) {
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
}

export function DataTable<TData extends BaseEntity>({
  data: initialData,
  columns,
  dialogComponent,
  editDialogComponent,
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
  const [data, setData] = React.useState(() => initialData);
  const [filteredData, setFilteredData] = React.useState(() => initialData);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize,
  });
  const [advancedFilters, setAdvancedFilters] = React.useState<AdvancedFilters>(
    {
      numeric: [],
      date: [],
    }
  );

  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  // Apply advanced filters whenever data or filters change
  React.useEffect(() => {
    const filtered = applyAdvancedFilters(data, advancedFilters);
    setFilteredData(filtered);
  }, [data, advancedFilters]);

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  );

  // Handle row updates
  const handleRowUpdate = React.useCallback(
    (updatedRow: TData) => {
      setData((prevData) => {
        const newData = prevData.map((row) =>
          row.id === updatedRow.id ? updatedRow : row
        );
        onDataChange?.(newData);
        return newData;
      });
      onRowUpdate?.(updatedRow);
    },
    [onDataChange, onRowUpdate]
  );

  // Handle advanced filter changes
  const handleAdvancedFiltersChange = React.useCallback(
    (filters: AdvancedFilters) => {
      setAdvancedFilters(filters);
      // Reset to first page when filters change
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    },
    []
  );

  // Build final columns array with optional system columns
  const finalColumns = React.useMemo(() => {
    const cols: ColumnDef<TData>[] = [];

    if (enableDragAndDrop) {
      cols.push(DragColumn<TData>());
    }

    if (enableRowSelection) {
      cols.push(SelectionColumn<TData>());
    }

    cols.push(...columns);
    cols.push(ActionsColumn<TData>(editDialogComponent, handleRowUpdate));

    return cols;
  }, [
    columns,
    enableDragAndDrop,
    enableRowSelection,
    editDialogComponent,
    handleRowUpdate,
  ]);

  const table = useReactTable({
    data: filteredData, // Use filtered data instead of original data
    columns: finalColumns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: enableRowSelection,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  function handleDragEnd(event: DragEndEvent) {
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

  // Sync external data changes
  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);

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
                        asc: <ArrowUpDown className="h-4 w-4 rotate-180" />,
                        desc: <ArrowUpDown className="h-4 w-4" />,
                      }[header.column.getIsSorted() as string] ?? (
                        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                      ))}
                  </div>
                )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>

      <TableBody className="**:data-[slot=table-cell]:first:w-8">
        {table.getRowModel().rows?.length ? (
          enableDragAndDrop ? (
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
        ) : (
          <TableRow>
            <TableCell
              colSpan={finalColumns.length}
              className="h-24 text-center"
            >
              No results.
            </TableCell>
          </TableRow>
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
              value={(table.getState().globalFilter as string) ?? ""}
              onChange={(e) => table.setGlobalFilter(e.target.value)}
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
          {enableDragAndDrop ? (
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
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
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
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
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
