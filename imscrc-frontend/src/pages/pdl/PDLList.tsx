import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  pdlApi,
  getStatusBadgeColor,
  getLegalStatusBadgeColor,
} from "../../services/pdlApi";
import type { PDL, PDLSearchParams } from "../../types/pdl";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";

const PDLList: React.FC = () => {
  const navigate = useNavigate();
  const [pdls, setPdls] = useState<PDL[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pdlToDelete, setPdlToDelete] = useState<PDL | null>(null);
  const [searchParams, setSearchParams] = useState<PDLSearchParams>({
    page: 1,
    per_page: 15,
    sort_by: "created_at",
    sort_order: "desc",
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0,
  });

  useEffect(() => {
    fetchPDLs();
  }, [searchParams]);

  const fetchPDLs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await pdlApi.getAll(searchParams);

      if (response.success) {
        setPdls(response.data.data);
        setPagination({
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          total: response.data.total,
          from: response.data.from,
          to: response.data.to,
        });
      } else {
        setError("Failed to load PDLs");
      }
    } catch (err) {
      console.error("Error fetching PDLs:", err);
      setError("Error loading PDLs");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm: string) => {
    setSearchParams((prev) => ({
      ...prev,
      search: searchTerm,
      page: 1,
    }));
  };

  const handleFilterChange = (field: string, value: string) => {
    setSearchParams((prev) => ({
      ...prev,
      [field]: value === "" ? undefined : value,
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => ({
      ...prev,
      page,
    }));
  };

  const handleSort = (field: string) => {
    setSearchParams((prev) => ({
      ...prev,
      sort_by: field,
      sort_order:
        prev.sort_by === field && prev.sort_order === "asc" ? "desc" : "asc",
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleDeleteClick = (pdl: PDL) => {
    setPdlToDelete(pdl);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!pdlToDelete) return;

    try {
      setDeleteLoading(true);
      const response = await pdlApi.delete(pdlToDelete.id);

      if (response.success) {
        // Remove the deleted PDL from the list
        setPdls((prevPdls) => prevPdls.filter((p) => p.id !== pdlToDelete.id));
        // Update pagination
        setPagination((prev) => ({
          ...prev,
          total: prev.total - 1,
        }));
        setShowDeleteModal(false);
        setPdlToDelete(null);
      } else {
        setError("Failed to delete PDL");
      }
    } catch (err) {
      console.error("Error deleting PDL:", err);
      setError("Error deleting PDL");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setPdlToDelete(null);
  };

  if (loading && pdls.length === 0) {
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
              <h1 className="h2 fw-bold text-dark mb-1">PDL List</h1>
              <p className="text-muted mb-0">
                Showing {pagination.from}-{pagination.to} of {pagination.total}{" "}
                PDLs
              </p>
            </div>
            <div className="d-flex gap-2">
              <Link to="/pdls" className="btn btn-outline-secondary">
                <i className="bi bi-arrow-left me-1"></i>
                Back to Dashboard
              </Link>
              <Link to="/pdls/register" className="btn btn-primary">
                <i className="bi bi-person-plus me-1"></i>
                Register New PDL
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Search</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by name, PDL number, or case number..."
                    value={searchParams.search || ""}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={searchParams.status || ""}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="transferred">Transferred</option>
                    <option value="released">Released</option>
                    <option value="deceased">Deceased</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label">Legal Status</label>
                  <select
                    className="form-select"
                    value={searchParams.legal_status || ""}
                    onChange={(e) =>
                      handleFilterChange("legal_status", e.target.value)
                    }
                  >
                    <option value="">All Legal Status</option>
                    <option value="detained">Detained</option>
                    <option value="convicted">Convicted</option>
                    <option value="acquitted">Acquitted</option>
                    <option value="transferred">Transferred</option>
                    <option value="released">Released</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label">From Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={searchParams.admission_date_from || ""}
                    onChange={(e) =>
                      handleFilterChange("admission_date_from", e.target.value)
                    }
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label">To Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={searchParams.admission_date_to || ""}
                    onChange={(e) =>
                      handleFilterChange("admission_date_to", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="alert alert-danger">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
          </div>
        </div>
      )}

      {/* PDL Table */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body p-0">
              {pdls.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-people fs-1 text-muted mb-3"></i>
                  <h5 className="text-muted">No PDLs Found</h5>
                  <p className="text-muted mb-3">
                    {searchParams.search ||
                    searchParams.status ||
                    searchParams.legal_status
                      ? "No PDLs match your search criteria"
                      : "No PDLs have been registered yet"}
                  </p>
                  <Link to="/pdls/register" className="btn btn-primary">
                    <i className="bi bi-person-plus me-1"></i>
                    Register First PDL
                  </Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th
                          className="cursor-pointer"
                          onClick={() => handleSort("pdl_number")}
                        >
                          PDL Number
                          {searchParams.sort_by === "pdl_number" && (
                            <i
                              className={`bi bi-arrow-${
                                searchParams.sort_order === "asc"
                                  ? "up"
                                  : "down"
                              } ms-1`}
                            ></i>
                          )}
                        </th>
                        <th
                          className="cursor-pointer"
                          onClick={() => handleSort("first_name")}
                        >
                          Full Name
                          {searchParams.sort_by === "first_name" && (
                            <i
                              className={`bi bi-arrow-${
                                searchParams.sort_order === "asc"
                                  ? "up"
                                  : "down"
                              } ms-1`}
                            ></i>
                          )}
                        </th>
                        <th>Case Number</th>
                        <th>Legal Status</th>
                        <th>Status</th>
                        <th
                          className="cursor-pointer"
                          onClick={() => handleSort("admission_date")}
                        >
                          Admission Date
                          {searchParams.sort_by === "admission_date" && (
                            <i
                              className={`bi bi-arrow-${
                                searchParams.sort_order === "asc"
                                  ? "up"
                                  : "down"
                              } ms-1`}
                            ></i>
                          )}
                        </th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pdls.map((pdl) => (
                        <tr key={pdl.id}>
                          <td>
                            <span className="fw-medium">{pdl.pdl_number}</span>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div
                                className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2"
                                style={{ width: "32px", height: "32px" }}
                              >
                                <span className="text-white small fw-bold">
                                  {pdl.first_name.charAt(0)}
                                  {pdl.last_name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <div className="fw-medium">{pdl.full_name}</div>
                                <small className="text-muted">
                                  Age: {pdl.age}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="text-muted">
                              {pdl.case_number}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`badge bg-${getLegalStatusBadgeColor(
                                pdl.legal_status
                              )}`}
                            >
                              {pdl.legal_status}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`badge bg-${getStatusBadgeColor(
                                pdl.status
                              )}`}
                            >
                              {pdl.status}
                            </span>
                          </td>
                          <td>
                            <span className="text-muted">
                              {formatDate(pdl.admission_date)}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-primary"
                                title="View Details"
                                onClick={() => navigate(`/pdls/${pdl.id}`)}
                              >
                                <i className="bi bi-eye"></i>
                              </button>
                              <button
                                className="btn btn-outline-secondary"
                                title="Edit PDL"
                                onClick={() => navigate(`/pdls/edit/${pdl.id}`)}
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                title="Delete PDL"
                                onClick={() => handleDeleteClick(pdl)}
                                disabled={deleteLoading}
                              >
                                {deleteLoading && pdlToDelete?.id === pdl.id ? (
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
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className="row mt-4">
          <div className="col-12">
            <nav>
              <ul className="pagination justify-content-center">
                <li
                  className={`page-item ${
                    pagination.current_page === 1 ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() =>
                      handlePageChange(pagination.current_page - 1)
                    }
                    disabled={pagination.current_page === 1}
                  >
                    Previous
                  </button>
                </li>

                {Array.from(
                  { length: pagination.last_page },
                  (_, i) => i + 1
                ).map((page) => (
                  <li
                    key={page}
                    className={`page-item ${
                      pagination.current_page === page ? "active" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  </li>
                ))}

                <li
                  className={`page-item ${
                    pagination.current_page === pagination.last_page
                      ? "disabled"
                      : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() =>
                      handlePageChange(pagination.current_page + 1)
                    }
                    disabled={pagination.current_page === pagination.last_page}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}

      {loading && (
        <div className="position-fixed top-50 start-50 translate-middle">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        pdl={pdlToDelete}
        isLoading={deleteLoading}
      />
    </div>
  );
};

export default PDLList;
