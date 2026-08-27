import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "../../ui/input";
import { fetchProductsAPI } from "../../../features/products/productsAPI";
import { useDebounce } from "../../../hooks/useDebounce";
import { useTranslation } from "react-i18next";

const MIN_CHARS = 2;
const MAX_SUGGESTIONS = 5;
const DEBOUNCE_MS = 300;

interface SearchBoxProps {
  placeholder?: string;
  /** Wrapper classes (e.g. width constraints for the desktop header). */
  className?: string;
  /** Extra classes applied to the input element. */
  inputClassName?: string;
}

interface Suggestion {
  _id: string;
  name: string;
}

/**
 * Live product search box used in the client header (desktop + mobile).
 *
 * - Fetches name-only suggestions directly via `fetchProductsAPI` (NOT Redux)
 *   so the Shop page's product state is never clobbered.
 * - Dropdown is hidden while loading, when there are no matches, and when the
 *   input is empty/focused-empty (per project decisions).
 * - Enter / clicking a suggestion fills the box and navigates to
 *   `/shop?keyword=<encoded>`.
 * - Keyboard: ↑/↓ move, Enter selects, Escape closes; click-outside closes.
 * - Stale responses are ignored so out-of-order results never win.
 * - RTL-aware (logical properties adapt to the `dir` attribute).
 */
export function SearchBox({
  placeholder,
  className = "",
  inputClassName = "",
}: SearchBoxProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Unique per instance: the header mounts two SearchBoxes (desktop + mobile).
  // Static ids would collide, and an input without id/name trips Chrome's
  // "form field element has neither an id nor a name" autofill warning.
  const inputId = useId();
  const listboxId = useId();

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const debouncedQuery = useDebounce(query, DEBOUNCE_MS);

  const containerRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);

  // Fetch suggestions when the debounced query changes.
  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (trimmed.length < MIN_CHARS) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    let cancelled = false;

    fetchProductsAPI({
      keyword: trimmed,
      limit: MAX_SUGGESTIONS,
      fields: "name",
      sort: "name",
    })
      .then((res) => {
        // Ignore out-of-order / stale responses.
        if (cancelled || requestId !== requestIdRef.current) return;
        setSuggestions(res.documents ?? []);
        setShowDropdown(true);
        setActiveIndex(-1);
      })
      .catch(() => {
        if (cancelled || requestId !== requestIdRef.current) return;
        // Network/API failure → hide dropdown, keep typed text.
        setSuggestions([]);
        setShowDropdown(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const closeDropdown = useCallback(() => {
    setShowDropdown(false);
    setActiveIndex(-1);
  }, []);

  // Close the dropdown when clicking outside the component.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeDropdown]);

  const submitSearch = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      closeDropdown();
      if (trimmed) {
        navigate(`/shop?keyword=${encodeURIComponent(trimmed)}`);
      }
    },
    [closeDropdown, navigate]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    // Clear the dropdown immediately when the input is emptied.
    if (!e.target.value.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) {
      // No dropdown open → Enter submits the current text.
      if (e.key === "Enter") {
        e.preventDefault();
        submitSearch(query);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev >= suggestions.length - 1 ? 0 : prev + 1
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const value = activeIndex >= 0 ? suggestions[activeIndex].name : query;
      submitSearch(value);
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeDropdown();
    }
  };

  const handleSelect = (name: string) => {
    setQuery(name);
    submitSearch(name);
  };

  const showSuggestions =
    showDropdown &&
    suggestions.length > 0 &&
    debouncedQuery.trim().length >= MIN_CHARS;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        id={inputId}
        name="search"
        type="text"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length > 0) setShowDropdown(true);
        }}
        placeholder={placeholder ?? t("header.searchPlaceholder")}
        className={`ps-10 pe-4 ${inputClassName}`}
        role="combobox"
        aria-expanded={showSuggestions}
        aria-autocomplete="list"
        aria-controls={listboxId}
      />
      {showSuggestions && (
        <ul
          id={listboxId}
          className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md"
          role="listbox"
          aria-label={t("header.searchPlaceholder")}
        >
          {suggestions.map((suggestion, index) => (
            <li key={suggestion._id}>
              <button
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => handleSelect(suggestion.name)}
                className={`flex w-full cursor-pointer items-center px-4 py-2 text-start text-sm ${
                  index === activeIndex
                    ? "bg-accent text-accent-foreground"
                    : ""
                }`}
              >
                {suggestion.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
