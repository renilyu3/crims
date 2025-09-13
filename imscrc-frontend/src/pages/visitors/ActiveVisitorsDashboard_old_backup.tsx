import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  activeVisitorApi,
  ActiveVisitor,
  ActiveVisitorFormData,
} from "../../services/activeVisitorApi";
import { pdlApi } from "../../services/pdlApi";
import "../../styles/toast-animations.css";

interface NotificationState {
  show: boolean;
  message: string;
  type: "success" | "error";
  isExiting: boolean;
}

interface PDL {
  id: number;
  pdl_number: string;
  first_name: string;
  last_name: string;
}

const ActiveVisitorsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeVisitors, setActiveVisitors] = useState<ActiveVisitor[]>([]);
  const [pdls, setPdls] = useState<PDL[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkingOut, setCheckingOut] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    message: "",
    type: "success",
    isExiting: false,
  });

  // Form state
  const [formData, setFormData] = useState<ActiveVisitorFormData>({
    first_name: "",
    last_name: "",
    middle_name: "",
    phone_number: "",
    email: "",
    address: "",
    id_type: "",
    id_number: "",
    date_of_birth: "",
    gender: undefined,
    pdl_id: 0,
    visit_purpose: "",
    visit_type: "family",
    items_brought: [],
    notes: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relationship: "",
  });

  useEffect(() => {
    loadActiveVisitors();
    loadPDLs();
  }, []);

  // Auto-hide notification with smooth exit animation
  useEffect(() => {
    if (notification.show && !notification.isExiting) {
      const timer = setTimeout(() => {
        setNotification((prev) => ({ ...prev, isExiting: true }));
        setTimeout(() => {
          setNotification((prev) => ({
            ...prev,
            show: false,
            isExiting: false,
          }));
        }, 400);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [notification.show, notification.isExiting]);

  const showNotification = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setNotification({
      show: true,
      message,
      type,
      isExiting: false,
    });
  };

  const loadActiveVisitors = async () => {
    try {
      setLoading(true);
      const response = await activeVisitorApi.getActiveVisitors({
        sort_by: "check_in_time",
        sort_order: "desc",
      });

      if (response.success) {
        setActiveVisitors(response.data.data || []);
      }
    } catch (err) {
      console.error("Error loading active visitors:", err);
      showNotification("Error loading active visitors", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadPDLs = async () => {
    try {
      const response = await pdlApi.getPDLs({
        status: "active",
        per_page: 100,
      });

      if (response.success) {
        setPdls(response.data.data || []);
      }
    } catch (err) {
      console.error("Error loading PDLs:", err);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "pdl_id" ? parseInt(value) || 0 : value,
    }));
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.phone_number ||
      !formData.address ||
      !formData.pdl_id
    ) {
      showNotification("Please fill in all required fields", "error");
      return;
    }

    try {
      setSubmitting(true);

      const response = await activeVisitorApi.checkInVisitor(formData);

      if (response.success) {
        await loadActiveVisitors();

        showNotification(
          `${formData.first_name} ${formData.last_name} has been checked in successfully!`,
          "success"
        );

        // Reset form
        setFormData({
          first_name: "",
          last_name: "",
          middle_name: "",
          phone_number: "",
          email: "",
          address: "",
          id_type: "",
          id_number: "",
          date_of_birth: "",
          gender: undefined,
          pdl_id: 0,
          visit_purpose: "",
          visit_type: "family",
          items_brought: [],
          notes: "",
          emergency_contact_name: "",
          emergency_contact_phone: "",
          emergency_contact_relationship: "",
        });
      } else {
        showNotification(
          response.message || "Error checking in visitor",
          "error"
        );
      }
    } catch (error: any) {
      console.error("Error checking in visitor:", error);
      const errorMessage =
        error.response?.data?.message ||
        "An error occurred while checking in the visitor";
      showNotification(errorMessage, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckOut = async (visitor: ActiveVisitor) => {
    try {
      setCheckingOut(visitor.id);

      const response = await activeVisitorApi.checkOutVisitor(visitor.id);

      if (response.success) {
        await loadActiveVisitors();

        showNotification(
          `${visitor.first_name} ${visitor.last_name} has been checked out successfully!`,
          "success"
        );
      } else {
        showNotification(
          response.message || "Error checking out visitor",
          "error"
        );
      }
    } catch (error: any) {
      console.error("Error checking out visitor:", error);
      const errorMessage =
        error.response?.data?.message ||
        "An error occurred while checking out the visitor";
      showNotification(errorMessage, "error");
    } finally {
      setCheckingOut(null);
    }
  };

  const formatDuration = (checkInTime: string) => {
    const start = new Date(checkInTime);
    const now = new Date();
    const durationMs = now.getTime() - start.getTime();
    const minutes = Math.floor(durationMs / (1000 * 60));

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="container-fluid">
      <div className="row g-4">
        {/* Check-In Form */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="card-title mb-0">
                <i className="bi bi-box-arrow-in-right me-2"></i>
                Check In Visitor
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleCheckIn}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="first_name" className="form-label">
                      First Name *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="last_name" className="form-label">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="phone_number" className="form-label">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="pdl_id" className="form-label">
                    Visiting PDL *
                  </label>
                  <select
                    className="form-select"
                    id="pdl_id"
                    name="pdl_id"
                    value={formData.pdl_id}
                    onChange={handleInputChange}
                  >
                    <option value="">Select PDL to visit</option>
                    {pdls.map((pdl) => (
                      <option key={pdl.id} value={pdl.id}>
                        {pdl.pdl_number} - {pdl.first_name} {pdl.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="visit_type" className="form-label">
                    Visit Type
                  </label>
                  <select
                    className="form-select"
                    id="visit_type"
                    name="visit_type"
                    value={formData.visit_type}
                    onChange={handleInputChange}
                  >
                    <option value="family">Family Visit</option>
                    <option value="legal">Legal Consultation</option>
                    <option value="official">Official Visit</option>
                    <option value="emergency">Emergency Visit</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="address" className="form-label">
                    Address *
                  </label>
                  <textarea
                    className="form-control"
                    id="address"
                    name="address"
                    rows={2}
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter complete address"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="visit_purpose" className="form-label">
                    Visit Purpose
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="visit_purpose"
                    name="visit_purpose"
                    value={formData.visit_purpose}
                    onChange={handleInputChange}
                    placeholder="Purpose of visit"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="notes" className="form-label">
                    Notes (Optional)
                  </label>
                  <textarea
                    className="form-control"
                    id="notes"
                    name="notes"
                    rows={2}
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Any additional notes..."
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      Checking In...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-in-right me-2"></i>
                      Check In
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Active Visitors */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">
                  <i className="bi bi-people me-2 text-success"></i>
                  Active Visitors ({activeVisitors.length})
                </h5>
                <div className="text-muted">
                  <i className="bi bi-clock me-1"></i>
                  {new Date().toLocaleString()}
                </div>
              </div>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : activeVisitors.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-people fs-1 text-muted mb-3"></i>
                  <h5 className="text-muted">No Active Visitors</h5>
                  <p className="text-muted mb-0">
                    Use the form on the left to check in visitors
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Visitor</th>
                        <th>Visiting PDL</th>
                        <th>Check-In Time</th>
                        <th>Duration</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeVisitors.map((visitor) => (
                        <tr key={visitor.id}>
                          <td>
                            <div className="fw-medium">{visitor.full_name}</div>
                            <span className="text-muted">
                              {visitor.phone_number}
                            </span>
                            <small className="d-block text-muted">
                              Badge: {visitor.visitor_badge_number}
                            </small>
                          </td>
                          <td>
                            <div className="fw-medium">
                              {visitor.pdl?.pdl_number}
                            </div>
                            <small className="text-muted">
                              {visitor.pdl?.first_name} {visitor.pdl?.last_name}
                            </small>
                          </td>
                          <td>
                            <div>
                              <div className="fw-medium">
                                {new Date(
                                  visitor.check_in_time
                                ).toLocaleDateString()}
                              </div>
                              <small className="text-muted">
                                {new Date(
                                  visitor.check_in_time
                                ).toLocaleTimeString()}
                              </small>
                            </div>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                visitor.is_overdue ? "bg-warning" : "bg-info"
                              }`}
                            >
                              {formatDuration(visitor.check_in_time)}
                            </span>
                            {visitor.is_overdue && (
                              <small className="d-block text-warning">
                                Overdue
                              </small>
                            )}
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleCheckOut(visitor)}
                              disabled={checkingOut === visitor.id}
                              title="Check Out"
                            >
                              {checkingOut === visitor.id ? (
                                <div
                                  className="spinner-border spinner-border-sm"
                                  role="status"
                                >
                                  <span className="visually-hidden">
                                    Loading...
                                  </span>
                                </div>
                              ) : (
                                <>
                                  <i className="bi bi-box-arrow-right me-1"></i>
                                  Check Out
                                </>
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
          </div>

          {/* Quick Stats */}
          <div className="row mt-4">
            <div className="col-md-4">
              <div className="card text-center">
                <div className="card-body">
                  <div className="display-4 text-primary mb-2">
                    {activeVisitors.length}
                  </div>
                  <p className="text-muted mb-0">Currently Active</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card text-center">
                <div className="card-body">
                  <div className="display-4 text-warning mb-2">
                    {activeVisitors.filter((v) => v.is_overdue).length}
                  </div>
                  <p className="text-muted mb-0">Overdue Visits</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card text-center">
                <div className="card-body">
                  <div className="display-4 text-info mb-2">
                    {
                      activeVisitors.filter(
                        (v) =>
                          new Date(v.check_in_time).toDateString() ===
                          new Date().toDateString()
                      ).length
                    }
                  </div>
                  <p className="text-muted mb-0">Today's Check-ins</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Toast Notification */}
      {notification.show && (
        <div
          className="position-fixed top-0 end-0 p-3"
          style={{ zIndex: 1050 }}
        >
          <div
            className={`toast show align-items-center text-white border-0 toast-notification ${
              notification.type === "success" ? "toast-success" : "toast-error"
            } ${notification.isExiting ? "toast-exit" : "toast-enter"}`}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            <div className="d-flex">
              <div className="toast-body d-flex align-items-center">
                <div className="toast-icon-container">
                  <i
                    className={`bi ${
                      notification.type === "success"
                        ? "bi-check-circle-fill"
                        : "bi-exclamation-triangle-fill"
                    } text-white`}
                    style={{ fontSize: "1.1rem" }}
                  ></i>
                </div>
                <div className="toast-content">
                  <div className="toast-title">
                    {notification.type === "success" ? "Success!" : "Error!"}
                  </div>
                  <div className="toast-message">{notification.message}</div>
                </div>
              </div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                onClick={() => {
                  setNotification((prev) => ({ ...prev, isExiting: true }));
                  setTimeout(() => {
                    setNotification((prev) => ({
                      ...prev,
                      show: false,
                      isExiting: false,
                    }));
                  }, 300);
                }}
                aria-label="Close"
              ></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveVisitorsDashboard;
