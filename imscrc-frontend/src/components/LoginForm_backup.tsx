import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface LoginCredentials {
  email: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login(credentials);

      // Get the intended destination from location state, or default to dashboard
      const from = (location.state as any)?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card shadow">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <img
                    src="crclogo.jpg"
                    alt="IMSCRC Logo"
                    className="mb-3"
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "contain",
                    }}
                  />
                  <h2 className="fw-bold text-dark mb-2">IMSCRC Login</h2>
                  <p className="text-muted small">
                    Information Management System for Capiz Rehabilitation
                    Center
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={credentials.email}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Enter email address"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="password" className="form-label">
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={credentials.password}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Enter password"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-primary w-100 mb-3"
                  >
                    {isLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Signing in...
                      </>
                    ) : (
                      "Sign in"
                    )}
                  </button>

                  <div className="text-center">
                    <small className="text-muted">
                      <div className="mb-1">
                        <strong>Default Credentials:</strong>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span>Admin: admin@imscrc.gov.ph / admin123</span>
                        <button
                          type="button"
                          className="btn btn-link p-0"
                          onClick={() =>
                            setCredentials({
                              email: "admin@imscrc.gov.ph",
                              password: "admin123",
                            })
                          }
                        >
                          Click to fill form
                        </button>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span>Staff: staff@imscrc.gov.ph / staff123</span>
                        <button
                          type="button"
                          className="btn btn-link p-0"
                          onClick={() =>
                            setCredentials({
                              email: "staff@imscrc.gov.ph",
                              password: "staff123",
                            })
                          }
                        >
                          Click to fill form
                        </button>
                      </div>
                    </small>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
