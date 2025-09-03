import * as React from "react";
import { Filter, X } from "lucide-react";
import { Button } from "../..//ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Badge } from "../../ui/badge";
import { Separator } from "../../ui/separator";

export interface NumericFilter {
  column: string;
  operator: "eq" | "gt" | "gte" | "lt" | "lte" | "between";
  value: number | null;
  value2?: number | null; // For between operator
}

export interface DateFilter {
  column: string;
  operator: "eq" | "before" | "after" | "between";
  value: string | null; // ISO date string
  value2?: string | null; // For between operator
}

export interface AdvancedFilters {
  numeric: NumericFilter[];
  date: DateFilter[];
}

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

interface AdvancedFilterProps {
  config: FilterConfig;
  onFiltersChange: (filters: AdvancedFilters) => void;
  initialFilters?: AdvancedFilters;
}

const numericOperators = [
  { value: "eq", label: "Equal to" },
  { value: "gt", label: "Greater than" },
  { value: "gte", label: "Greater than or equal" },
  { value: "lt", label: "Less than" },
  { value: "lte", label: "Less than or equal" },
  { value: "between", label: "Between" },
];

const dateOperators = [
  { value: "eq", label: "On" },
  { value: "before", label: "Before" },
  { value: "after", label: "After" },
  { value: "between", label: "Between" },
];

export function AdvancedFilter({
  config,
  onFiltersChange,
  initialFilters,
}: AdvancedFilterProps) {
  const [filters, setFilters] = React.useState<AdvancedFilters>(
    initialFilters || { numeric: [], date: [] }
  );
  const [open, setOpen] = React.useState(false);

  const addNumericFilter = () => {
    const firstColumn = Object.keys(config.numeric)[0];
    if (!firstColumn) return;

    const newFilter: NumericFilter = {
      column: firstColumn,
      operator: "eq",
      value: null,
    };

    setFilters((prev) => ({
      ...prev,
      numeric: [...prev.numeric, newFilter],
    }));
  };

  const addDateFilter = () => {
    const firstColumn = Object.keys(config.date)[0];
    if (!firstColumn) return;

    const newFilter: DateFilter = {
      column: firstColumn,
      operator: "eq",
      value: null,
    };

    setFilters((prev) => ({
      ...prev,
      date: [...prev.date, newFilter],
    }));
  };

  const updateNumericFilter = (
    index: number,
    updates: Partial<NumericFilter>
  ) => {
    setFilters((prev) => ({
      ...prev,
      numeric: prev.numeric.map((filter, i) =>
        i === index ? { ...filter, ...updates } : filter
      ),
    }));
  };

  const updateDateFilter = (index: number, updates: Partial<DateFilter>) => {
    setFilters((prev) => ({
      ...prev,
      date: prev.date.map((filter, i) =>
        i === index ? { ...filter, ...updates } : filter
      ),
    }));
  };

  const removeNumericFilter = (index: number) => {
    setFilters((prev) => ({
      ...prev,
      numeric: prev.numeric.filter((_, i) => i !== index),
    }));
  };

  const removeDateFilter = (index: number) => {
    setFilters((prev) => ({
      ...prev,
      date: prev.date.filter((_, i) => i !== index),
    }));
  };

  const clearAllFilters = () => {
    const emptyFilters = { numeric: [], date: [] };
    setFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const applyFilters = () => {
    onFiltersChange(filters);
    setOpen(false);
  };

  const getActiveFilterCount = () => {
    return (
      filters.numeric.filter((f) => f.value !== null).length +
      filters.date.filter((f) => f.value !== null).length
    );
  };

  const formatFilterDisplay = (filter: NumericFilter | DateFilter) => {
    const isNumeric = "value" in filter && typeof filter.value === "number";
    const config_key = isNumeric ? config.numeric : config.date;
    const column_config = config_key[filter.column];

    if (!column_config || filter.value === null) return null;

    const operatorLabel = isNumeric
      ? numericOperators.find((op) => op.value === filter.operator)?.label
      : dateOperators.find((op) => op.value === filter.operator)?.label;

    if (filter.operator === "between" && filter.value2 !== null) {
      return `${column_config.label}: ${operatorLabel} ${filter.value} and ${filter.value2}`;
    }

    return `${column_config.label}: ${operatorLabel} ${filter.value}`;
  };

  const activeFilters = [
    ...filters.numeric.filter((f) => f.value !== null),
    ...filters.date.filter((f) => f.value !== null),
  ];

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
            {getActiveFilterCount() > 0 && (
              <Badge
                variant="secondary"
                className="ml-2 h-5 w-5 rounded-full p-0 text-xs"
              >
                {getActiveFilterCount()}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="min-w-96 p-4 " align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Advanced Filters</h4>
              {getActiveFilterCount() > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  Clear All
                </Button>
              )}
            </div>

            {/* Scrollable content area */}
            <div className="max-h-56 overflow-y-auto space-y-4 custom-scroll">
              {/* Numeric Filters */}
              {Object.keys(config.numeric).length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Numeric Filters
                    </Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addNumericFilter}
                    >
                      Add Filter
                    </Button>
                  </div>

                  {filters.numeric.map((filter, index) => (
                    <div
                      key={index}
                      className="space-y-2 p-3 border rounded-md bg-muted/30"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Filter {index + 1}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeNumericFilter(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Column</Label>
                          <Select
                            value={filter.column}
                            onValueChange={(value) =>
                              updateNumericFilter(index, { column: value })
                            }
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(config.numeric).map(
                                ([key, config]) => (
                                  <SelectItem key={key} value={key}>
                                    {config.label}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-xs">Operator</Label>
                          <Select
                            value={filter.operator}
                            onValueChange={(value: NumericFilter["operator"]) =>
                              updateNumericFilter(index, { operator: value })
                            }
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {numericOperators.map((op) => (
                                <SelectItem key={op.value} value={op.value}>
                                  {op.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Value</Label>
                          <Input
                            type="number"
                            className="h-8"
                            placeholder={
                              config.numeric[filter.column]?.placeholder ||
                              "Enter value"
                            }
                            value={filter.value || ""}
                            onChange={(e) =>
                              updateNumericFilter(index, {
                                value: e.target.value
                                  ? Number(e.target.value)
                                  : null,
                              })
                            }
                          />
                        </div>

                        {filter.operator === "between" && (
                          <div>
                            <Label className="text-xs">To Value</Label>
                            <Input
                              type="number"
                              className="h-8"
                              placeholder="Max value"
                              value={filter.value2 || ""}
                              onChange={(e) =>
                                updateNumericFilter(index, {
                                  value2: e.target.value
                                    ? Number(e.target.value)
                                    : null,
                                })
                              }
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Date Filters */}
              {Object.keys(config.date).length > 0 && (
                <>
                  {Object.keys(config.numeric).length > 0 && <Separator />}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        Date Filters
                      </Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addDateFilter}
                      >
                        Add Filter
                      </Button>
                    </div>

                    {filters.date.map((filter, index) => (
                      <div
                        key={index}
                        className="space-y-2 p-3 border rounded-md bg-muted/30"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Filter {index + 1}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDateFilter(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Column</Label>
                            <Select
                              value={filter.column}
                              onValueChange={(value) =>
                                updateDateFilter(index, { column: value })
                              }
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(config.date).map(
                                  ([key, config]) => (
                                    <SelectItem key={key} value={key}>
                                      {config.label}
                                    </SelectItem>
                                  )
                                )}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-xs">Operator</Label>
                            <Select
                              value={filter.operator}
                              onValueChange={(value: DateFilter["operator"]) =>
                                updateDateFilter(index, { operator: value })
                              }
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {dateOperators.map((op) => (
                                  <SelectItem key={op.value} value={op.value}>
                                    {op.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Date</Label>
                            <Input
                              type="date"
                              className="h-8"
                              value={filter.value || ""}
                              onChange={(e) =>
                                updateDateFilter(index, {
                                  value: e.target.value || null,
                                })
                              }
                            />
                          </div>

                          {filter.operator === "between" && (
                            <div>
                              <Label className="text-xs">To Date</Label>
                              <Input
                                type="date"
                                className="h-8"
                                value={filter.value2 || ""}
                                onChange={(e) =>
                                  updateDateFilter(index, {
                                    value2: e.target.value || null,
                                  })
                                }
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <Separator />

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={applyFilters}>
                Apply Filters ({getActiveFilterCount()})
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filters Display */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          {activeFilters.map((filter, index) => {
            const displayText = formatFilterDisplay(filter);
            if (!displayText) return null;

            return (
              <Badge key={index} variant="secondary" className="text-xs">
                {displayText}
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
