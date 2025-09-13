import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import accountApi from "../../services/accountApi";
import type { User } from "../../types/auth";
import type { AccountFilters } from "../../types/account";

const AccountsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<AccountFilters>({});
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    staffUsers: 0,
  });

  // Only allow admin access
  if (user?.role !== "admin") {
    return (
      <div className="alert alert-danger">
        <h4>Access Denied</h4>
        <p>You don't have permission to access account management.</p>
      </div>
    );
  }

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await accountApi.getUsers(1, filters);

      // Handle the paginated response structure
      if (response && response.data) {
        setUsers(response.data);

        // Calculate stats
        const totalUsers = response.total || response.data.length;
        const activeUsers = response.data.filter(
          (u: User) => u.is_active
        ).length;
        const adminUsers = response.data.filter(
          (u: User) => u.role === "admin"
        ).length;
        const staffUsers = response.data.filter(
          (u: User) => u.role === "staff"
        ).length;

        setStats({ totalUsers, activeUsers, adminUsers, staffUsers });
      } else {
        // Fallback: if response structure is different, try to use it directly
        const users = Array.isArray(response) ? response : [];
        setUsers(users);

        const totalUsers = users.length;
        const activeUsers = users.filter((u: User) => u.is_active).length;
        const adminUsers = users.filter((u: User) => u.role === "admin").length;
        const staffUsers = users.filter((u: User) => u.role === "staff").length;

        setStats({ totalUsers, activeUsers, adminUsers, staffUsers });
      }
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError(err.response?.data?.message || "Failed to fetch users");
      // Set empty array on error to prevent map() errors
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: number) => {
    try {
      await accountApi.toggleUserStatus(userId);
      fetchUsers(); // Refresh the list
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update user status");
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await accountApi.deleteUser(userId);
        fetchUsers(); // Refresh the list
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

  return (
    <div className="accounts-dashboard">
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

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="card-title">{stats.totalUsers}</h4>
                  <p className="card-text">Total Users</p>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-people fs-1"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="card-title">{stats.activeUsers}</h4>
                  <p className="card-text">Active Users</p>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-person-check fs-1"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="card-title">{stats.adminUsers}</h4>
                  <p className="card-text">Administrators</p>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-shield-check fs-1"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="card-title">{stats.staffUsers}</h4>
                  <p className="card-text">Staff Members</p>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-person-badge fs-1"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>User Management</h5>
        <Link to="/accounts/create" className="btn btn-primary">
          <i className="bi bi-person-plus me-2"></i>
          Create New User
        </Link>
      </div>

      {/* Filters */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Search</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name or email..."
                value={filters.search || ""}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Role</label>
              <select
                className="form-select"
                value={filters.role || ""}
                onChange={(e) =>
                  setFilters({ ...filters, role: e.target.value as any })
                }
              >
                <option value="">All Roles</option>
                <option value="admin">Administrator</option>
                <option value="staff">Staff</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={
                  filters.is_active === undefined
                    ? ""
                    : filters.is_active.toString()
                }
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    is_active:
                      e.target.value === ""
                        ? undefined
                        : e.target.value === "true",
                  })
                }
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Department</label>
              <input
                type="text"
                className="form-control"
                placeholder="Department..."
                value={filters.department || ""}
                onChange={(e) =>
                  setFilters({ ...filters, department: e.target.value })
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="avatar-sm bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="fw-semibold">{user.name}</div>
                          <small className="text-muted">
                            ID: {user.employee_id}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span
                        className={`badge ${
                          user.role === "admin" ? "bg-warning" : "bg-info"
                        }`}
                      >
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td>{user.department}</td>
                    <td>{user.position}</td>
                    <td>
                      <span
                        className={`badge ${
                          user.is_active ? "bg-success" : "bg-secondary"
                        }`}
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <Link
                          to={`/accounts/${user.id}`}
                          className="btn btn-outline-primary"
                          title="View Details"
                        >
                          <i className="bi bi-eye"></i>
                        </Link>
                        <Link
                          to={`/accounts/${user.id}/edit`}
                          className="btn btn-outline-warning"
                          title="Edit User"
                        >
                          <i className="bi bi-pencil"></i>
                        </Link>
                        <button
                          className={`btn ${
                            user.is_active
                              ? "btn-outline-secondary"
                              : "btn-outline-success"
                          }`}
                          onClick={() => handleToggleStatus(user.id)}
                          title={user.is_active ? "Deactivate" : "Activate"}
                        >
                          <i
                            className={`bi ${
                              user.is_active ? "bi-pause" : "bi-play"
                            }`}
                          ></i>
                        </button>
                        {user.id !== user?.id && (
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDeleteUser(user.id)}
                            title="Delete User"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="text-center py-4">
                <i className="bi bi-people fs-1 text-muted"></i>
                <p className="text-muted mt-2">No users found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountsDashboard;
