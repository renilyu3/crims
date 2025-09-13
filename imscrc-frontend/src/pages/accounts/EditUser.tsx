import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import accountApi from "../../services/accountApi";
import type { User } from "../../types/auth";
import type { UpdateUserRequest } from "../../types/account";

const EditUser: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [departments, setDepartments] = useState<string[]>([]);
  const [positions, setPositions] = useState<string[]>([]);
  const [formData, setFormData] = useState<UpdateUserRequest>({
    name: "",
    email: "",
    role: "staff",
    employee_id: "",
    position: "",
    department: "",
    is_active: true,
  });

  // Only allow admin access
  if (currentUser?.role !== "admin") {
    return (
      <div className="alert alert-danger">
        <h4>Access Denied</h4>
        <p>You don't have permission to edit user accounts.</p>
      </div>
    );
  }

  useEffect(() => {
    if (id) {
      fetchUser(parseInt(id));
      fetchDropdownData();
    }
  }, [id]);

  const fetchUser = async (userId: number) => {
    try {
      setLoading(true);
      const userData = await accountApi.getUser(userId);
      setUser(userData);
      setFormData({
        name: userData.name,
        email: userData.email,
        role: userData.role,
        employee_id: userData.employee_id,
        position: userData.position,
        department: userData.department,
        is_active: userData.is_active,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch user details");
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [deptResponse, posResponse] = await Promise.all([
        accountApi.getDepartments(),
        accountApi.getPositions(),
      ]);
      setDepartments(deptResponse);
      setPositions(posResponse);
    } catch (err) {
      console.error("Failed to fetch dropdown data:", err);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setError("");

    try {
      await accountApi.updateUser(user.id, formData);
      navigate("/accounts", {
        state: { message: "User updated successfully!" },
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update user");
    } finally {
      setSaving(false);
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

  if (error && !user) {
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
    <div className="edit-user">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Edit User: {user.name}</h4>
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

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              {/* Personal Information */}
              <div className="col-md-6">
                <h6 className="text-muted mb-3">Personal Information</h6>

                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="employee_id" className="form-label">
                    Employee ID *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="employee_id"
                    name="employee_id"
                    value={formData.employee_id}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Work Information */}
              <div className="col-md-6">
                <h6 className="text-muted mb-3">Work Information</h6>

                <div className="mb-3">
                  <label htmlFor="role" className="form-label">
                    Role *
                  </label>
                  <select
                    className="form-select"
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                  >
                    <option value="staff">Staff</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="department" className="form-label">
                    Department *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    list="departments"
                    required
                  />
                  <datalist id="departments">
                    {departments.map((dept, index) => (
                      <option key={index} value={dept} />
                    ))}
                  </datalist>
                </div>

                <div className="mb-3">
                  <label htmlFor="position" className="form-label">
                    Position *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    list="positions"
                    required
                  />
                  <datalist id="positions">
                    {positions.map((pos, index) => (
                      <option key={index} value={pos} />
                    ))}
                  </datalist>
                </div>

                <div className="mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="is_active"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="is_active">
                      Active User
                    </label>
                  </div>
                  <div className="form-text">
                    Inactive users cannot log in to the system
                  </div>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="row mt-4">
              <div className="col-12">
                <h6 className="text-muted mb-3">Account Information</h6>
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  <strong>Account Created:</strong>{" "}
                  {new Date(user.created_at).toLocaleString()}
                  <br />
                  <strong>Last Updated:</strong>{" "}
                  {new Date(user.updated_at).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate("/accounts")}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Updating...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg me-2"></i>
                    Update User
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditUser;
