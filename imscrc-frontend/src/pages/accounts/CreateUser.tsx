import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import accountApi from "../../services/accountApi";
import type { CreateUserRequest } from "../../types/account";

const CreateUser: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [departments, setDepartments] = useState<string[]>([]);
  const [positions, setPositions] = useState<string[]>([]);
  const [formData, setFormData] = useState<CreateUserRequest>({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "staff",
    employee_id: "",
    position: "",
    department: "",
  });

  // Only allow admin access
  if (user?.role !== "admin") {
    return (
      <div className="alert alert-danger">
        <h4>Access Denied</h4>
        <p>You don't have permission to create user accounts.</p>
      </div>
    );
  }

  useEffect(() => {
    fetchDropdownData();
  }, []);

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
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (formData.password !== formData.password_confirmation) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    try {
      await accountApi.createUser(formData);
      navigate("/accounts", {
        state: { message: "User created successfully!" },
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-user">
      <div className="d-flex justify-content-end align-items-center mb-4">
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
              </div>
            </div>

            {/* Security Information */}
            <div className="row mt-4">
              <div className="col-12">
                <h6 className="text-muted mb-3">Security Information</h6>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password *
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    minLength={8}
                    required
                  />
                  <div className="form-text">Minimum 8 characters</div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="password_confirmation" className="form-label">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password_confirmation"
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    minLength={8}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate("/accounts")}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Creating...
                  </>
                ) : (
                  <>
                    <i className="bi bi-person-plus me-2"></i>
                    Create User
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

export default CreateUser;
