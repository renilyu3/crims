import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import accountApi from "../../services/accountApi";
import type { User } from "../../types/auth";

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Only allow admin access
  if (currentUser?.role !== "admin") {
    return (
      <div className="alert alert-danger">
        <h4>Access Denied</h4>
        <p>You don't have permission to view user details.</p>
      </div>
    );
  }

  useEffect(() => {
    if (id) {
      fetchUser(parseInt(id));
    }
  }, [id]);

  const fetchUser = async (userId: number) => {
    try {
      setLoading(true);
      const userData = await accountApi.getUser(userId);
      setUser(userData);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch user details");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!user) return;

    try {
      const updatedUser = await accountApi.toggleUserStatus(user.id);
      setUser(updatedUser);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update user status");
    }
  };

  const handleDeleteUser = async () => {
    if (!user) return;

    if (
      window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      try {
        await accountApi.deleteUser(user.id);
        navigate("/accounts", {
          state: { message: "User deleted successfully!" },
        });
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to delete user");
      }
    }
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <h4>Error</h4>
        <p>{error}</p>
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate("/accounts")}
        >
          Back to Users
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="alert alert-warning">
        <h4>User Not Found</h4>
        <p>The requested user could not be found.</p>
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate("/accounts")}
        >
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="user-detail">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>User Details</h4>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => navigate("/accounts")}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Users
        </button>
      </div>

      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError("")}
            aria-label="Close"
          ></button>
        </div>
      )}

      <div className="row">
        {/* User Profile Card */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-body text-center">
              <div
                className="avatar-lg bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: "80px", height: "80px" }}
              >
                <i className="bi bi-person-fill fs-1"></i>
              </div>
              <h5 className="card-title">{user.name}</h5>
              <p className="text-muted">{user.position}</p>
              <span
                className={`badge ${
                  user.role === "admin" ? "bg-warning" : "bg-info"
                } mb-2`}
              >
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
              <br />
              <span
                className={`badge ${
                  user.is_active ? "bg-success" : "bg-secondary"
                }`}
              >
                {user.is_active ? "Active" : "Inactive"}
              </span>

              <div className="d-grid gap-2 mt-3">
                <Link
                  to={`/accounts/${user.id}/edit`}
                  className="btn btn-warning"
                >
                  <i className="bi bi-pencil me-2"></i>
                  Edit User
                </Link>
                <button
                  className={`btn ${
                    user.is_active
                      ? "btn-outline-secondary"
                      : "btn-outline-success"
                  }`}
                  onClick={handleToggleStatus}
                >
                  <i
                    className={`bi ${
                      user.is_active ? "bi-pause" : "bi-play"
                    } me-2`}
                  ></i>
                  {user.is_active ? "Deactivate" : "Activate"}
                </button>
                {user.id !== currentUser?.id && (
                  <button
                    className="btn btn-outline-danger"
                    onClick={handleDeleteUser}
                  >
                    <i className="bi bi-trash me-2"></i>
                    Delete User
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* User Information */}
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h6 className="card-title mb-0">User Information</h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6 className="text-muted mb-3">Personal Information</h6>
                  <div className="mb-3">
                    <label className="form-label text-muted">Full Name</label>
                    <p className="fw-semibold">{user.name}</p>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted">
                      Email Address
                    </label>
                    <p className="fw-semibold">{user.email}</p>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted">Employee ID</label>
                    <p className="fw-semibold">{user.employee_id}</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <h6 className="text-muted mb-3">Work Information</h6>
                  <div className="mb-3">
                    <label className="form-label text-muted">Role</label>
                    <p>
                      <span
                        className={`badge ${
                          user.role === "admin" ? "bg-warning" : "bg-info"
                        }`}
                      >
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </p>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted">Department</label>
                    <p className="fw-semibold">{user.department}</p>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted">Position</label>
                    <p className="fw-semibold">{user.position}</p>
                  </div>
                </div>
              </div>

              <hr />

              <div className="row">
                <div className="col-md-6">
                  <h6 className="text-muted mb-3">Account Status</h6>
                  <div className="mb-3">
                    <label className="form-label text-muted">Status</label>
                    <p>
                      <span
                        className={`badge ${
                          user.is_active ? "bg-success" : "bg-secondary"
                        }`}
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="col-md-6">
                  <h6 className="text-muted mb-3">Account Dates</h6>
                  <div className="mb-3">
                    <label className="form-label text-muted">Created At</label>
                    <p className="fw-semibold">
                      {new Date(user.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted">
                      Last Updated
                    </label>
                    <p className="fw-semibold">
                      {new Date(user.updated_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
