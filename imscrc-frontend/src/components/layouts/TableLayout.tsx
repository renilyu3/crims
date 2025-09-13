import React, { useState } from "react";

interface TableLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  actions?: React.ReactNode;
  filters?: React.ReactNode;
  showSearch?: boolean;
  showFilters?: boolean;
}

const TableLayout: React.FC<TableLayoutProps> = ({
  children,
  title,
  subtitle,
  searchPlaceholder = "Search...",
  onSearch,
  actions,
  filters,
  showSearch = true,
  showFilters = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  return (
    <div className="table-layout">
      {/* Header Section */}
      {(title || subtitle || showSearch || actions) && (
        <div className="table-header">
          <div className="table-title-section">
            {title && <h2 className="table-title">{title}</h2>}
            {subtitle && <p className="table-subtitle">{subtitle}</p>}
          </div>

          <div className="table-controls">
            {showSearch && (
              <form className="table-search" onSubmit={handleSearchSubmit}>
                <div className="search-input-wrapper">
                  <i className="bi bi-search search-icon"></i>
                  <input
                    type="text"
                    className="form-control search-input"
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="clear-search-btn"
                      onClick={() => {
                        setSearchQuery("");
                        if (onSearch) onSearch("");
                      }}
                    >
                      <i className="bi bi-x"></i>
                    </button>
                  )}
                </div>
              </form>
            )}

            {showFilters && filters && (
              <button
                className="btn btn-outline-secondary"
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              >
                <i className="bi bi-funnel me-1"></i>
                Filters
                {showFiltersPanel && <i className="bi bi-chevron-up ms-1"></i>}
                {!showFiltersPanel && (
                  <i className="bi bi-chevron-down ms-1"></i>
                )}
              </button>
            )}

            {actions && <div className="table-actions">{actions}</div>}
          </div>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && filters && showFiltersPanel && (
        <div className="filters-panel">
          <div className="card border-0 bg-light">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">
                  <i className="bi bi-funnel me-2"></i>
                  Filter Options
                </h6>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setShowFiltersPanel(false)}
                >
                  <i className="bi bi-x"></i>
                </button>
              </div>
              {filters}
            </div>
          </div>
        </div>
      )}

      {/* Table Content */}
      <div className="table-content">
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default TableLayout;
