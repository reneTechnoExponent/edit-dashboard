"use client";

import * as React from "react";
import { Search, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
  placeholder?: string;
}

interface DataTableToolbarProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: FilterConfig[];
  filterValues?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  onCreateClick?: () => void;
  createButtonLabel?: string;
  className?: string;
  hideSearch?: boolean;
}

export function DataTableToolbar({
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  filters = [],
  filterValues = {},
  onFilterChange,
  onCreateClick,
  createButtonLabel = "Create New",
  className,
  hideSearch = false,
}: DataTableToolbarProps) {
  const [localSearchValue, setLocalSearchValue] = React.useState(searchValue);
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Update local search value when prop changes
  React.useEffect(() => {
    setLocalSearchValue(searchValue);
  }, [searchValue]);

  // Handle search input with 300ms debounce
  const handleSearchChange = (value: string) => {
    setLocalSearchValue(value);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      onSearchChange?.(value);
    }, 300);
  };

  // Clear search
  const handleClearSearch = () => {
    setLocalSearchValue("");
    onSearchChange?.("");
  };

  // Cleanup timer on unmount
  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      {/* Left side: Search and Filters */}
      <div className="flex flex-1 items-center gap-2">
        {/* Search Input */}
        {!hideSearch && (
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={localSearchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-8 pr-8"
            />
            {localSearchValue && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
                onClick={handleClearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Filter Dropdowns */}
        {filters.map((filter) => (
          <Select
            key={filter.key}
            value={filterValues[filter.key] || ""}
            onValueChange={(value) => onFilterChange?.(filter.key, value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={filter.placeholder || filter.label} />
            </SelectTrigger>
            <SelectContent>
              {/* Clear filter option */}
              {filterValues[filter.key] && (
                <SelectItem value="">
                  <span className="text-muted-foreground">Clear filter</span>
                </SelectItem>
              )}
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
      </div>

      {/* Right side: Create Button */}
      {onCreateClick && (
        <Button onClick={onCreateClick}>
          <Plus className="mr-2 h-4 w-4" />
          {createButtonLabel}
        </Button>
      )}
    </div>
  );
}
