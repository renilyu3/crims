import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  visitorCheckinApi,
  type VisitorCheckin,
} from "../../services/visitorCheckinApi";

interface FilterState {
  search: string;
  status: string;
  date_from: string;
  date_to: string;
}

const VisitsHistory: React.FC = () => {
  const [visits, setVisits] = useState<VisitorCheckin[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "",
    date_from: "",
    date_to: "",
  });

  useEffect(() => {
    loadVisits();
  }, [currentPage, filters]);

  const loadVisits = async () => {
    try {
      setLoading(true);

      const params: any = {
        page: currentPage,
        per_page: 15,
        sort_by: "check_in_time",
        sort_order: "desc",
        status: "completed", // Only show completed visits in history
      };

      // Add filters
      if (filters.search) params.search = filters.search;
      if (filters.status && filters.status !== "completed") {
        // If user specifically filters for active, allow it, otherwise keep completed
        params.status = filters.status;
      }
      if (filters.date_from) params.date_from = filters.date_from;
      if (filters.date_to) params.date_to = filters.date_to;

      const response = await visitorCheckinApi.getCheckins(params);

      if (response.success) {
        setVisits(response.data.data);
        setCurrentPage(response.data.current_page);
        setTotalPages(response.data.last_page);
        setTotalRecords(response.data.total);
      } else {
        console.error("Failed to load visits:", response.message);
        setVisits([]); // Clear the list if API fails
        setTotalRecords(0);
      }
    } catch (err) {
      console.error("Error loading visits:", err);
      setVisits([]); // Clear the list if API fails
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleDeleteVisit = async (visitId: number) => {
    if (!confirm("Are you sure you want to delete this visit record?")) {
      return;
    }

    try {
      setDeleting(visitId);

      const response = await visitorCheckinApi.deleteCheckin(visitId);

      if (response.success) {
        // Reload visits to get updated list
        await loadVisits();
      } else {
        alert(response.message || "Failed to delete visit record");
      }
    } catch (error: any) {
      console.error("Error deleting visit:", error);
      alert(
        error.response?.data?.message ||
          "An error occurred while deleting the visit. Please try again."
      );
    } finally {
      setDeleting(null);
    }
  };

  const handleClearAllVisits = async () => {
    if (
      !confirm(
        "Are you sure you want to delete ALL visit records? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setLoading(true);

      // Delete all visits one by one (since we don't have a bulk delete endpoint)
      for (const visit of visits) {
        await visitorCheckinApi.deleteCheckin(visit.id);
      }

      // Reload visits
      await loadVisits();
    } catch (error: any) {
      console.error("Error deleting all visits:", error);
      alert("An error occurred while deleting all visits. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (checkInTime: string, checkOutTime?: string) => {
    if (!checkOutTime) return "N/A";

    const start = new Date(checkInTime);
    const end = new Date(checkOutTime);
    const durationMs = end.getTime() - start.getTime();
    const minutes = Math.floor(durationMs / (1000 * 60));

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <li
          key={i}
          className={`page-item ${currentPage === i ? "active" : ""}`}
        >
          <button
            className="page-link"
            onClick={() => setCurrentPage(i)}
            disabled={loading}
          >
            {i}
          </button>
        </li>
      );
    }

    return (
      <nav aria-label="Visits pagination">
        <ul className="pagination justify-content-center">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1 || loading}
            >
              Previous
            </button>
          </li>
          {pages}
          <li
            className={`page-item ${
              currentPage === totalPages ? "disabled" : ""
            }`}
          >
            <button
              className="page-link"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h2 fw-bold text-dark mb-1">Visits History</h1>
              <p className="text-muted mb-0">
                Complete record of all completed visitor visits
              </p>
            </div>
            <div className="d-flex gap-2">
              <Link to="/visitors" className="btn btn-outline-secondary">
                <i className="bi bi-arrow-left me-2"></i>
                Back to Dashboard
              </Link>
              {visits.length > 0 && (
                <button
                  className="btn btn-outline-danger"
                  onClick={handleClearAllVisits}
                  disabled={loading}
                >
                  <i className="bi bi-trash me-2"></i>
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h5 className="card-title mb-0">
                <i className="bi bi-funnel me-2"></i>
                Filters
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <label htmlFor="search" className="form-label">
                    Search
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="search"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Name or phone number..."
                  />
                </div>
                <div className="col-md-2">
                  <label htmlFor="status" className="form-label">
                    Status
                  </label>
                  <select
                    className="form-select"
                    id="status"
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label htmlFor="date_from" className="form-label">
                    From Date
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="date_from"
                    name="date_from"
                    value={filters.date_from}
                    onChange={handleFilterChange}
                  />
                </div>
                <div className="col-md-3">
                  <label htmlFor="date_to" className="form-label">
                    To Date
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="date_to"
                    name="date_to"
                    value={filters.date_to}
                    onChange={handleFilterChange}
                  />
                </div>
                <div className="col-md-1 d-flex align-items-end">
                  <button
                    className="btn btn-outline-secondary w-100"
                    onClick={() => {
                      setFilters({
                        search: "",
                        status: "",
                        date_from: "",
                        date_to: "",
                      });
                      setCurrentPage(1);
                    }}
                    disabled={loading}
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visits Table */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <h5 className="card-title mb-0">
                <i className="bi bi-clock-history me-2"></i>
                Visits History ({totalRecords} records)
              </h5>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : visits.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-clock-history fs-1 text-muted mb-3"></i>
                  <h5 className="text-muted">No Visit Records Found</h5>
                  <p className="text-muted mb-0">
                    {Object.values(filters).some((f) => f !== "")
                      ? "Try adjusting your filters to see more results."
                      : "No visit records have been created yet."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Name</th>
                          <th>Phone</th>
                          <th>Address</th>
                          <th>Check-In Time</th>
                          <th>Check-Out Time</th>
                          <th>Duration</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visits.map((visit) => (
                          <tr key={visit.id}>
                            <td>
                              <div className="fw-medium">{visit.full_name}</div>
                              {visit.notes && (
                                <small className="text-muted">
                                  {visit.notes}
                                </small>
                              )}
                            </td>
                            <td>
                              <span className="text-muted">
                                {visit.phone_number}
                              </span>
                            </td>
                            <td>
                              <small className="text-muted">
                                {visit.address}
                              </small>
                            </td>
                            <td>
                              <div>
                                <div className="fw-medium">
                                  {new Date(
                                    visit.check_in_time
                                  ).toLocaleDateString()}
                                </div>
                                <small className="text-muted">
                                  {new Date(
                                    visit.check_in_time
                                  ).toLocaleTimeString()}
                                </small>
                              </div>
                            </td>
                            <td>
                              {visit.check_out_time ? (
                                <div>
                                  <div className="fw-medium">
                                    {new Date(
                                      visit.check_out_time
                                    ).toLocaleDateString()}
                                  </div>
                                  <small className="text-muted">
                                    {new Date(
                                      visit.check_out_time
                                    ).toLocaleTimeString()}
                                  </small>
                                </div>
                              ) : (
                                <span className="text-muted">Still active</span>
                              )}
                            </td>
                            <td>
                              <span className="fw-medium">
                                {visit.formatted_duration ||
                                  formatDuration(
                                    visit.check_in_time,
                                    visit.check_out_time
                                  )}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  visit.status === "completed"
                                    ? "bg-success"
                                    : "bg-primary"
                                }`}
                              >
                                {visit.status.charAt(0).toUpperCase() +
                                  visit.status.slice(1)}
                              </span>
                            </td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteVisit(visit.id)}
                                disabled={deleting === visit.id}
                                title="Delete Visit"
                              >
                                {deleting === visit.id ? (
                                  <div
                                    className="spinner-border spinner-border-sm"
                                    role="status"
                                  >
                                    <span className="visually-hidden">
                                      Loading...
                                    </span>
                                  </div>
                                ) : (
                                  <i className="bi bi-trash"></i>
                                )}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="mt-4">{renderPagination()}</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitsHistory;
