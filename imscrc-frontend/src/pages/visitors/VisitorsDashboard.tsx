import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  visitorCheckinApi,
  type VisitorCheckin,
  type CheckinFormData,
} from "../../services/visitorCheckinApi";
import "../../styles/toast-animations.css";

interface NotificationState {
  show: boolean;
  message: string;
  type: "success" | "error";
  isExiting: boolean;
}

const VisitorsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeVisitors, setActiveVisitors] = useState<VisitorCheckin[]>([]);
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
  const [formData, setFormData] = useState<CheckinFormData>({
    first_name: "",
    last_name: "",
    phone_number: "",
    address: "",
    notes: "",
  });

  useEffect(() => {
    loadActiveVisitors();
  }, []);

  // Auto-hide notification with smooth exit animation
  useEffect(() => {
    if (notification.show && !notification.isExiting) {
      const timer = setTimeout(() => {
        // Start exit animation
        setNotification((prev) => ({ ...prev, isExiting: true }));

        // Hide notification after exit animation completes
        setTimeout(() => {
          setNotification((prev) => ({
            ...prev,
            show: false,
            isExiting: false,
          }));
        }, 400); // Match the CSS animation duration
      }, 6000); // Increased duration to 6 seconds to see the animation better
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
      const response = await visitorCheckinApi.getActiveVisitors();
      if (response.success) {
        setActiveVisitors(response.data);
      } else {
        console.error("Failed to load active visitors:", response.message);
        setActiveVisitors([]); // Clear the list if API fails
      }
    } catch (err) {
      console.error("Error loading active visitors:", err);
      setActiveVisitors([]); // Clear the list if API fails
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.phone_number ||
      !formData.address
    ) {
      showNotification("Please fill in all required fields", "error");
      return;
    }

    try {
      setSubmitting(true);

      const response = await visitorCheckinApi.checkIn(formData);

      if (response.success) {
        // Reload active visitors to get updated list
        await loadActiveVisitors();

        // Clear form
        setFormData({
          first_name: "",
          last_name: "",
          phone_number: "",
          address: "",
          notes: "",
        });

        // Show success notification
        showNotification(
          `${formData.first_name} ${formData.last_name} has been checked in successfully!`,
          "success"
        );
      } else {
        showNotification(
          response.message || "Failed to check in visitor",
          "error"
        );
      }
    } catch (error: any) {
      console.error("Error checking in visitor:", error);
      showNotification(
        error.response?.data?.message ||
          "An error occurred while checking in the visitor. Please try again.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckOut = async (visitor: VisitorCheckin) => {
    try {
      setCheckingOut(visitor.id);

      const response = await visitorCheckinApi.checkOut(visitor.id);

      if (response.success) {
        // Reload active visitors to get updated list
        await loadActiveVisitors();

        // Show success notification
        showNotification(
          `${visitor.first_name} ${visitor.last_name} has been checked out successfully!`,
          "success"
        );
      } else {
        showNotification(
          response.message || "Failed to check out visitor",
          "error"
        );
      }
    } catch (error: any) {
      console.error("Error checking out visitor:", error);
      showNotification(
        error.response?.data?.message ||
          "An error occurred while checking out the visitor. Please try again.",
        "error"
      );
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
                <div className="mb-3">
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

                <div className="mb-3">
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
                  <label htmlFor="address" className="form-label">
                    Address *
                  </label>
                  <textarea
                    className="form-control"
                    id="address"
                    name="address"
                    rows={3}
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter complete address"
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
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Address</th>
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
                            {visitor.notes && (
                              <small className="text-muted">
                                {visitor.notes}
                              </small>
                            )}
                          </td>
                          <td>
                            <span className="text-muted">
                              {visitor.phone_number}
                            </span>
                          </td>
                          <td>
                            <small className="text-muted">
                              {visitor.address}
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
                            <span className="badge bg-info">
                              {formatDuration(visitor.check_in_time)}
                            </span>
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

export default VisitorsDashboard;
