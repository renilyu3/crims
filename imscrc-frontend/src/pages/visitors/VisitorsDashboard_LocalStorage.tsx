import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { activityTracker } from "../../utils/activityTracker";
import { useAuth } from "../../contexts/AuthContext";
import { visitApi, visitorApi } from "../../services/visitorApi";
import type { Visit, Visitor } from "../../types/visitor";

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

interface NotificationState {
  show: boolean;
  message: string;
  type: "success" | "error";
}

const VisitorsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeVisits, setActiveVisits] = useState<SimpleVisit[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkingOut, setCheckingOut] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    message: "",
    type: "success",
  });

  // Form state
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    address: "",
  });

  useEffect(() => {
    loadActiveVisits();
  }, []);

  // Auto-hide notification after 4 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const showNotification = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setNotification({
      show: true,
      message,
      type,
    });
  };

  const loadActiveVisits = async () => {
    try {
      setLoading(true);
      const stored = localStorage.getItem("activeVisits");
      if (stored) {
        setActiveVisits(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Error loading active visits:", err);
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

  const handleTimeIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.phone_number ||
      !formData.address
    ) {
      alert("Please fill in all fields");
      return;
    }

    try {
      setSubmitting(true);

      const newVisit: SimpleVisit = {
        id: Date.now(),
        ...formData,
        time_in: new Date().toISOString(),
        status: "active",
      };

      const updatedActiveVisits = [...activeVisits, newVisit];
      setActiveVisits(updatedActiveVisits);
      localStorage.setItem("activeVisits", JSON.stringify(updatedActiveVisits));

      // Add activity to tracker
      activityTracker.addVisitorCheckIn(
        `${formData.first_name} ${formData.last_name}`,
        user?.name || "Staff"
      );

      // Clear form
      setFormData({
        first_name: "",
        last_name: "",
        phone_number: "",
        address: "",
      });

      // Show success notification
      showNotification(
        `${formData.first_name} ${formData.last_name} has been checked in successfully!`,
        "success"
      );
    } catch (error) {
      console.error("Error checking in visitor:", error);
      alert(
        "An error occurred while checking in the visitor. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleTimeOut = async (visit: SimpleVisit) => {
    try {
      setCheckingOut(visit.id);

      const completedVisit = {
        ...visit,
        time_out: new Date().toISOString(),
        status: "completed" as const,
      };

      // Remove from active visits
      const updatedActiveVisits = activeVisits.filter((v) => v.id !== visit.id);
      setActiveVisits(updatedActiveVisits);
      localStorage.setItem("activeVisits", JSON.stringify(updatedActiveVisits));

      // Add to visit history
      const existingHistory = localStorage.getItem("visitHistory");
      const history = existingHistory ? JSON.parse(existingHistory) : [];
      history.unshift(completedVisit);
      localStorage.setItem("visitHistory", JSON.stringify(history));

      // Add activity to tracker
      activityTracker.addVisitorCheckOut(
        `${visit.first_name} ${visit.last_name}`,
        user?.name || "Staff"
      );

      // Show success notification
      showNotification(
        `${visit.first_name} ${visit.last_name} has been checked out successfully!`,
        "success"
      );
    } catch (error) {
      console.error("Error checking out visitor:", error);
      alert(
        "An error occurred while checking out the visitor. Please try again."
      );
    } finally {
      setCheckingOut(null);
    }
  };

  const formatDuration = (timeIn: string) => {
    const start = new Date(timeIn);
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
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h2 fw-bold text-dark mb-1">
                Visitor Check-In System
              </h1>
              <p className="text-muted mb-0">
                Simple visitor check-in and check-out management
              </p>
            </div>
            <div className="d-flex gap-2">
              <Link to="/visits/history" className="btn btn-outline-secondary">
                <i className="bi bi-clock-history me-2"></i>
                View History
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Check-In Form */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="card-title mb-0">
                <i className="bi bi-box-arrow-in-right me-2"></i>
                Visitor
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleTimeIn}>
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
                    required
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
                    required
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
                    required
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="mb-4">
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
                    required
                    placeholder="Enter complete address"
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
                      Time In
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Active Visits */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">
                  <i className="bi bi-people me-2 text-success"></i>
                  Active Visits ({activeVisits.length})
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
              ) : activeVisits.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-people fs-1 text-muted mb-3"></i>
                  <h5 className="text-muted">No Active Visits</h5>
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
                        <th>Time In</th>
                        <th>Duration</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeVisits.map((visit) => (
                        <tr key={visit.id}>
                          <td>
                            <div className="fw-medium">
                              {visit.first_name} {visit.last_name}
                            </div>
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
                                {new Date(visit.time_in).toLocaleDateString()}
                              </div>
                              <small className="text-muted">
                                {new Date(visit.time_in).toLocaleTimeString()}
                              </small>
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-info">
                              {formatDuration(visit.time_in)}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleTimeOut(visit)}
                              disabled={checkingOut === visit.id}
                              title="Time Out"
                            >
                              {checkingOut === visit.id ? (
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
                                  Time Out
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

      {/* Statistics Cards */}
      <div className="row mt-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="display-4 text-primary mb-2">
                {activeVisits.length}
              </div>
              <h6 className="text-muted mb-0">Currently Active</h6>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="display-4 text-success mb-2">
                {
                  JSON.parse(localStorage.getItem("visitHistory") || "[]")
                    .length
                }
              </div>
              <h6 className="text-muted mb-0">Total Completed</h6>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="display-4 text-info mb-2">
                {
                  JSON.parse(
                    localStorage.getItem("visitHistory") || "[]"
                  ).filter(
                    (v: SimpleVisit) =>
                      new Date(v.time_in).toDateString() ===
                      new Date().toDateString()
                  ).length
                }
              </div>
              <h6 className="text-muted mb-0">Today's Visits</h6>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {notification.show && (
        <div
          className={`position-fixed top-0 end-0 p-3`}
          style={{ zIndex: 1050 }}
        >
          <div
            className={`toast show align-items-center text-white bg-${
              notification.type === "success" ? "success" : "danger"
            } border-0`}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            <div className="d-flex">
              <div className="toast-body">
                <i
                  className={`bi ${
                    notification.type === "success"
                      ? "bi-check-circle"
                      : "bi-exclamation-triangle"
                  } me-2`}
                ></i>
                {notification.message}
              </div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                onClick={() =>
                  setNotification((prev) => ({ ...prev, show: false }))
                }
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
