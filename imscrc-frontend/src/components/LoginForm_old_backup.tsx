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
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center py-5"
      style={{
        background:
          "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)",
        position: "relative",
      }}
    >
      {/* Background pattern overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            "radial-gradient(circle at 25% 25%, rgba(255, 69, 0, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255, 140, 0, 0.1) 0%, transparent 50%)",
          pointerEvents: "none",
        }}
      />

      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div
              className="card shadow-lg"
              style={{
                background: "linear-gradient(145deg, #2a2a2a, #1e1e1e)",
                border: "2px solid #ff4500",
                borderRadius: "15px",
              }}
            >
              <div className="card-body p-5">
                {/* Close button */}
                <div className="text-end mb-3">
                  <button
                    type="button"
                    className="btn-close"
                    style={{
                      background: "linear-gradient(45deg, #ff4500, #ff6b35)",
                      borderRadius: "50%",
                      width: "30px",
                      height: "30px",
                      border: "2px solid #ff4500",
                    }}
                  ></button>
                </div>

                <div className="text-center mb-4">
                  {/* Lock Icon with gradient */}
                  <div
                    className="mb-3 mx-auto d-flex align-items-center justify-content-center"
                    style={{
                      width: "80px",
                      height: "80px",
                      background: "linear-gradient(45deg, #ff4500, #ff8c00)",
                      borderRadius: "50%",
                      border: "3px solid white",
                    }}
                  >
                    <i
                      className="fas fa-lock"
                      style={{
                        fontSize: "32px",
                        color: "white",
                      }}
                    ></i>
                  </div>

                  <h1
                    className="fw-bold mb-2"
                    style={{
                      color: "#ffd700",
                      fontSize: "2rem",
                      letterSpacing: "2px",
                      textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                    }}
                  >
                    IMSCRC LOGIN
                  </h1>
                  <p
                    className="small mb-4"
                    style={{
                      color: "#cccccc",
                      fontSize: "0.9rem",
                    }}
                  >
                    Information Management System for Capiz Rehabilitation
                    Center
                  </p>

                  {/* Warning Message */}
                  <div
                    className="alert mb-4"
                    style={{
                      background: "rgba(255, 69, 0, 0.1)",
                      border: "1px solid #ff4500",
                      borderRadius: "8px",
                      color: "#ffd700",
                    }}
                  >
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    <strong>WARNING:</strong> Unauthorized access attempts will
                    be logged and prosecuted. All activities are monitored 24/7.
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  {error && (
                    <div
                      className="alert mb-3"
                      role="alert"
                      style={{
                        background: "rgba(220, 53, 69, 0.1)",
                        border: "1px solid #dc3545",
                        color: "#ff6b6b",
                      }}
                    >
                      {error}
                    </div>
                  )}

                  <div className="mb-3">
                    <label
                      htmlFor="email"
                      className="form-label"
                      style={{
                        color: "#ffd700",
                        fontWeight: "bold",
                        fontSize: "0.9rem",
                        letterSpacing: "1px",
                      }}
                    >
                      EMAIL ADDRESS
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
                      style={{
                        background: "rgba(0,0,0,0.3)",
                        border: "1px solid #555",
                        borderRadius: "8px",
                        color: "#ffffff",
                        padding: "12px 15px",
                        fontSize: "1rem",
                      }}
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="password"
                      className="form-label"
                      style={{
                        color: "#ffd700",
                        fontWeight: "bold",
                        fontSize: "0.9rem",
                        letterSpacing: "1px",
                      }}
                    >
                      PASSWORD
                    </label>
                    <div className="position-relative">
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
                        style={{
                          background: "rgba(0,0,0,0.3)",
                          border: "1px solid #555",
                          borderRadius: "8px",
                          color: "#ffffff",
                          padding: "12px 15px",
                          fontSize: "1rem",
                          paddingRight: "45px",
                        }}
                      />
                      <i
                        className="fas fa-eye position-absolute"
                        style={{
                          right: "15px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#888",
                          cursor: "pointer",
                        }}
                      ></i>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn w-100 mb-4"
                    style={{
                      background: "linear-gradient(45deg, #ff4500, #ff8c00)",
                      border: "none",
                      borderRadius: "8px",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "1.1rem",
                      letterSpacing: "1px",
                      padding: "12px",
                      textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                      boxShadow: "0 4px 15px rgba(255, 69, 0, 0.3)",
                    }}
                  >
                    {isLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        ACCESSING FACILITY...
                      </>
                    ) : (
                      "ACCESS FACILITY"
                    )}
                  </button>

                  {/* Last Access Section */}
                  <div
                    className="mb-4 p-3"
                    style={{
                      background: "rgba(0,0,0,0.3)",
                      border: "1px solid #333",
                      borderRadius: "8px",
                    }}
                  >
                    <div
                      style={{
                        color: "#ffd700",
                        fontWeight: "bold",
                        fontSize: "0.8rem",
                        marginBottom: "8px",
                      }}
                    >
                      LAST ACCESS:
                    </div>
                    <div
                      style={{
                        color: "#cccccc",
                        fontSize: "0.75rem",
                        fontFamily: "monospace",
                      }}
                    >
                      [SYSTEM] Administrator logged in - 2024-01-15 08:30:45
                      <br />
                      [SECURITY] Patrol shift started - 2024-01-15 07:00:00
                    </div>
                  </div>

                  <div className="text-center">
                    <small style={{ color: "#888" }}>
                      <div className="mb-2">
                        <strong style={{ color: "#ffd700" }}>
                          Default Credentials:
                        </strong>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span>Admin: admin@imscrc.gov.ph / admin123</span>
                        <button
                          type="button"
                          className="btn btn-link p-0"
                          style={{ color: "#ff8c00", fontSize: "0.75rem" }}
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
                          style={{ color: "#ff8c00", fontSize: "0.75rem" }}
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

                {/* Bottom Links */}
                <div className="text-center mt-4">
                  <div className="d-flex justify-content-center gap-4">
                    <a
                      href="#"
                      style={{
                        color: "#ffd700",
                        fontSize: "0.8rem",
                        textDecoration: "none",
                      }}
                    >
                      Emergency Access
                    </a>
                    <a
                      href="#"
                      style={{
                        color: "#ffd700",
                        fontSize: "0.8rem",
                        textDecoration: "none",
                      }}
                    >
                      Security Protocol
                    </a>
                    <a
                      href="#"
                      style={{
                        color: "#ffd700",
                        fontSize: "0.8rem",
                        textDecoration: "none",
                      }}
                    >
                      Support
                    </a>
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

export default LoginForm;
