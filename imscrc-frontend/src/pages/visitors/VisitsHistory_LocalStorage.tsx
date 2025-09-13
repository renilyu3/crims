import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { visitApi } from "../../services/visitorApi";
import type { Visit } from "../../types/visitor";

interface SimpleVisit {
  id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  address: string;
  time_in: string;
  time_out?: string;
  status: "active" | "completed";
}

const VisitsHistory: React.FC = () => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    date_from: "",
    date_to: "",
  });

  const itemsPerPage = 20;

  useEffect(() => {
    loadVisitsHistory();
  }, [currentPage, filters]);

  const loadVisitsHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build API parameters
      const params: any = {
        page: currentPage,
        per_page: itemsPerPage,
        status: "completed", // Only load completed visits for history
        sort_by: "actual_end_time",
        sort_order: "desc",
      };

      // Add search filter
      if (filters.search) {
        params.search = filters.search;
      }

      // Add date filters
      if (filters.date_from) {
        params.date_from = filters.date_from;
      }
      if (filters.date_to) {
        params.date_to = filters.date_to;
      }

      const response = await visitApi.getVisits(params);

      if (response.success) {
        setVisits(response.data.data);
        setTotalPages(response.data.last_page);
        setTotalRecords(response.data.total);
      } else {
        setError("Failed to load visits history");
        // Fallback to localStorage for backward compatibility
        const stored = localStorage.getItem("visitHistory");
        if (stored) {
          const history = JSON.parse(stored);
          setVisits(
            history.map((visit: SimpleVisit) => ({
              id: visit.id,
              visitor: {
                first_name: visit.first_name,
                last_name: visit.last_name,
                contact_information: { phone: visit.phone_number },
                address: { street: visit.address, city: "", province: "" },
              },
              status: visit.status === "active" ? "in_progress" : "completed",
              check_in_time: visit.time_in,
              check_out_time: visit.time_out,
              actual_start_time: visit.time_in,
              actual_end_time: visit.time_out,
              created_at: visit.time_in,
            }))
          );
          setTotalRecords(history.length);
        }
      }
    } catch (err: any) {
      console.error("Error loading visits history:", err);
      setError("Error loading visits history. Using local data if available.");
      // Fallback to localStorage
      const stored = localStorage.getItem("visitHistory");
      if (stored) {
        const history = JSON.parse(stored);
        setVisits(
          history.map((visit: SimpleVisit) => ({
            id: visit.id,
            visitor: {
              first_name: visit.first_name,
              last_name: visit.last_name,
              contact_information: { phone: visit.phone_number },
              address: { street: visit.address, city: "", province: "" },
            },
            status: visit.status === "active" ? "in_progress" : "completed",
            check_in_time: visit.time_in,
            check_out_time: visit.time_out,
            actual_start_time: visit.time_in,
            actual_end_time: visit.time_out,
            created_at: visit.time_in,
          }))
        );
        setTotalRecords(history.length);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      date_from: "",
      date_to: "",
    });
    setCurrentPage(1);
  };

  const formatDuration = (timeIn: string, timeOut?: string) => {
    if (!timeOut) return "N/A";

    const start = new Date(timeIn);
    const end = new Date(timeOut);
    const durationMs = end.getTime() - start.getTime();
    const durationMinutes = Math.floor(durationMs / (1000 * 60));

    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleDeleteVisit = async (visitId: number) => {
    try {
      setDeleting(visitId);

      // Remove from visits array
      const updatedVisits = visits.filter((visit) => visit.id !== visitId);
      setVisits(updatedVisits);

      // Update localStorage
      localStorage.setItem("visitHistory", JSON.stringify(updatedVisits));

      // Visit deleted successfully - no alert needed
    } catch (error) {
      console.error("Error deleting visit:", error);
      alert("An error occurred while deleting the visit. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteAll = async () => {
    try {
      setDeleting(-1); // Use -1 to indicate deleting all

      // Clear all visits
      setVisits([]);

      // Clear localStorage
      localStorage.removeItem("visitHistory");

      // All visits deleted successfully - no alert needed
    } catch (error) {
      console.error("Error deleting all visits:", error);
      alert("An error occurred while deleting all visits. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  // Helper functions for Visit data
  const getVisitorName = (visit: Visit) => {
    if (visit.visitor) {
      return `${visit.visitor.first_name} ${visit.visitor.last_name}`;
    }
    return "Unknown Visitor";
  };

  const getVisitorContact = (visit: Visit) => {
    if (visit.visitor?.contact_information?.phone) {
      return visit.visitor.contact_information.phone;
    }
    return "No contact info";
  };

  const getVisitorAddress = (visit: Visit) => {
    if (visit.visitor?.address) {
      const addr = visit.visitor.address;
      return `${addr.street}, ${addr.city}, ${addr.province}`;
    }
    return "No address";
  };

  const getCheckInTime = (visit: Visit) => {
    return visit.check_in_time || visit.actual_start_time || visit.created_at;
  };

  const getCheckOutTime = (visit: Visit) => {
    return visit.check_out_time || visit.actual_end_time;
  };

  // Pagination info
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalRecords);

  if (loading) {
    return (
      <div className="container-fluid">
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "400px" }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

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
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <h5 className="card-title mb-0">
                <i className="bi bi-funnel me-2"></i>
                Filters
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Search</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Name or phone number..."
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">From Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={filters.date_from}
                    onChange={(e) =>
                      handleFilterChange("date_from", e.target.value)
                    }
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">To Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={filters.date_to}
                    onChange={(e) =>
                      handleFilterChange("date_to", e.target.value)
                    }
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label">&nbsp;</label>
                  <button
                    className="btn btn-outline-secondary w-100"
                    onClick={clearFilters}
                    title="Clear Filters"
                  >
                    <i className="bi bi-x-circle me-2"></i>
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
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">
                  <i className="bi bi-clock-history me-2"></i>
                  Visits History ({totalRecords} records)
                </h5>
                {visits.length > 0 && (
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={handleDeleteAll}
                    disabled={deleting === -1}
                    title="Delete All History"
                  >
                    {deleting === -1 ? (
                      <>
                        <div
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-trash me-2"></i>
                        Delete All
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
            <div className="card-body p-0">
              {visits.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-clock-history fs-1 text-muted mb-3"></i>
                  <h5 className="text-muted">No Visits Found</h5>
                  <p className="text-muted">
                    {Object.values(filters).some((f) => f)
                      ? "Try adjusting your filters to see more results."
                      : "No completed visits have been recorded yet."}
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Address</th>
                        <th>Time In</th>
                        <th>Time Out</th>
                        <th>Duration</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visits.map((visit: Visit) => (
                        <tr key={visit.id}>
                          <td>
                            <div className="fw-medium">
                              {getVisitorName(visit)}
                            </div>
                          </td>
                          <td>
                            <span className="text-muted">
                              {getVisitorContact(visit)}
                            </span>
                          </td>
                          <td>
                            <small className="text-muted">
                              {getVisitorAddress(visit)}
                            </small>
                          </td>
                          <td>
                            <div>
                              <div className="fw-medium">
                                {new Date(
                                  getCheckInTime(visit)
                                ).toLocaleDateString()}
                              </div>
                              <small className="text-muted">
                                {new Date(
                                  getCheckInTime(visit)
                                ).toLocaleTimeString()}
                              </small>
                            </div>
                          </td>
                          <td>
                            {getCheckOutTime(visit) ? (
                              <div>
                                <div className="fw-medium">
                                  {new Date(
                                    getCheckOutTime(visit)!
                                  ).toLocaleDateString()}
                                </div>
                                <small className="text-muted">
                                  {new Date(
                                    getCheckOutTime(visit)!
                                  ).toLocaleTimeString()}
                                </small>
                              </div>
                            ) : (
                              <span className="text-muted">
                                Not checked out
                              </span>
                            )}
                          </td>
                          <td>
                            <span className="fw-medium">
                              {formatDuration(
                                getCheckInTime(visit),
                                getCheckOutTime(visit)
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
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="card-footer bg-white border-top">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="text-muted">
                    Showing {startIndex + 1} to{" "}
                    {Math.min(endIndex, totalRecords)} of {totalRecords} entries
                  </div>
                  <nav>
                    <ul className="pagination pagination-sm mb-0">
                      <li
                        className={`page-item ${
                          currentPage === 1 ? "disabled" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <i className="bi bi-chevron-left"></i>
                        </button>
                      </li>

                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          const pageNum =
                            Math.max(
                              1,
                              Math.min(totalPages - 4, currentPage - 2)
                            ) + i;
                          return (
                            <li
                              key={pageNum}
                              className={`page-item ${
                                currentPage === pageNum ? "active" : ""
                              }`}
                            >
                              <button
                                className="page-link"
                                onClick={() => setCurrentPage(pageNum)}
                              >
                                {pageNum}
                              </button>
                            </li>
                          );
                        }
                      )}

                      <li
                        className={`page-item ${
                          currentPage === totalPages ? "disabled" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          <i className="bi bi-chevron-right"></i>
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitsHistory;
