import { Filters } from "@/types/book";
import { Star, Filter, X, Calendar, User, StarIcon, ChevronDown } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Slider } from "../ui/slider";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
export function FilterSection({
  filters,
  setFilters,
  authors,
  activeFiltersCount,
  showFilters,
  setShowFilters,
}: {
  filters: Filters;
  setFilters: (filters: Filters) => void;
  authors: string[];
  activeFiltersCount: number;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
}) {
  const clearFilters = () => {
    setFilters({
      author: "",
      dateRange: "",
      minRating: 0,
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 hover:text-gray-700 transition-colors"
          >
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="font-semibold text-gray-900">Filters</h2>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {activeFiltersCount} active
              </Badge>
            )}
            <ChevronDown
              className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showFilters ? "rotate-180" : ""}`}
            />
          </button>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4 mr-1" />
                Clear all
              </Button>
            )}
          </div>
        </div>
      </div>

      <div
        className={`transition-all duration-300 ease-in-out ${
          showFilters ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden`}
      >
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <User className="w-4 h-4" />
                Author
              </label>
              <Select
                value={filters.author}
                onValueChange={(value) => setFilters({ ...filters, author: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All authors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All authors</SelectItem>
                  {authors.map((author) => (
                    <SelectItem key={author} value={author}>
                      {author}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Date Uploaded
              </label>
              <Select
                value={filters.dateRange}
                onValueChange={(value) => setFilters({ ...filters, dateRange: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All dates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This week</SelectItem>
                  <SelectItem value="month">This month</SelectItem>
                  <SelectItem value="year">This year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <StarIcon className="w-4 h-4" />
                Minimum Rating
              </label>
              <div className="space-y-2">
                <Slider
                  value={[filters.minRating]}
                  onValueChange={(value) => setFilters({ ...filters, minRating: value[0] })}
                  max={5}
                  min={0}
                  step={0.5}
                  className="w-full"
                />
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>0</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="font-medium">{filters.minRating.toFixed(1)}+</span>
                  </div>
                  <span>5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
