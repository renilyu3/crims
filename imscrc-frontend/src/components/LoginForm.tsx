import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../styles/login.css";
import backgroundImage from "../assets/crimslogobg.jpg";

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
        backgroundImage: "url('../assets/crimslogobg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
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
            "radial-gradient(circle at 25% 25%, rgba(255, 69, 0, 0.08) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255, 140, 0, 0.08) 0%, transparent 50%)",
          pointerEvents: "none",
        }}
      />

      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div
              className="card shadow-lg"
              style={{
                background: "linear-gradient(145deg, #ffffff, #f8f9fa)",
                border: "2px solid #ff4500",
                borderRadius: "20px",
                backdropFilter: "blur(10px)",
              }}
            >
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <img
                    src="crclogo.jpg"
                    alt="CRIMS Logo"
                    className="mb-3"
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "contain",
                      border: "3px solid #ff4500",
                      borderRadius: "50%",
                      padding: "8px",
                      background: "linear-gradient(45deg, #ff4500, #ff8c00)",
                      boxShadow: "0 4px 15px rgba(255, 69, 0, 0.3)",
                    }}
                  />
                  <h2
                    className="fw-bold mb-2"
                    style={{
                      color: "#2c3e50",
                      fontSize: "2rem",
                      letterSpacing: "3px",
                      textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      fontFamily: "'Segoe UI', 'Roboto', sans-serif",
                      fontWeight: "700",
                    }}
                  >
                    CRIMS
                  </h2>
                  <p
                    className="small"
                    style={{
                      color: "#6c757d",
                      fontSize: "0.85rem",
                      fontWeight: "500",
                      letterSpacing: "0.5px",
                      fontFamily: "'Segoe UI', 'Roboto', sans-serif",
                    }}
                  >
                    Capiz Rehabilitation Information Management System
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="enhanced-login-form">
                  {error && (
                    <div
                      className="alert alert-danger"
                      role="alert"
                      style={{
                        background: "rgba(220, 53, 69, 0.1)",
                        border: "1px solid #dc3545",
                        color: "#ff6b6b",
                        borderRadius: "8px",
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
                        color: "#495057",
                        fontWeight: "600",
                        fontSize: "0.9rem",
                        fontFamily: "'Segoe UI', 'Roboto', sans-serif",
                      }}
                    >
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
                      style={{
                        background: "#ffffff",
                        border: "2px solid #e9ecef",
                        borderRadius: "10px",
                        color: "#495057",
                        padding: "12px 15px",
                        fontSize: "0.95rem",
                        transition: "all 0.3s ease",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                      }}
                      onFocus={(e) => {
                        (e.target as HTMLInputElement).style.borderColor =
                          "#ff4500";
                        (e.target as HTMLInputElement).style.boxShadow =
                          "0 0 0 0.2rem rgba(255, 69, 0, 0.25)";
                      }}
                      onBlur={(e) => {
                        (e.target as HTMLInputElement).style.borderColor =
                          "#e9ecef";
                        (e.target as HTMLInputElement).style.boxShadow =
                          "0 2px 4px rgba(0,0,0,0.05)";
                      }}
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="password"
                      className="form-label"
                      style={{
                        color: "#495057",
                        fontWeight: "600",
                        fontSize: "0.9rem",
                        fontFamily: "'Segoe UI', 'Roboto', sans-serif",
                      }}
                    >
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
                      style={{
                        background: "#ffffff",
                        border: "2px solid #e9ecef",
                        borderRadius: "10px",
                        color: "#495057",
                        padding: "12px 15px",
                        fontSize: "0.95rem",
                        transition: "all 0.3s ease",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                      }}
                      onFocus={(e) => {
                        (e.target as HTMLInputElement).style.borderColor =
                          "#ff4500";
                        (e.target as HTMLInputElement).style.boxShadow =
                          "0 0 0 0.2rem rgba(255, 69, 0, 0.25)";
                      }}
                      onBlur={(e) => {
                        (e.target as HTMLInputElement).style.borderColor =
                          "#e9ecef";
                        (e.target as HTMLInputElement).style.boxShadow =
                          "0 2px 4px rgba(0,0,0,0.05)";
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn w-100 mb-3"
                    style={{
                      background: "linear-gradient(45deg, #ff4500, #ff8c00)",
                      border: "none",
                      borderRadius: "10px",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "1rem",
                      padding: "12px",
                      textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                      boxShadow: "0 4px 15px rgba(255, 69, 0, 0.3)",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLButtonElement).style.transform =
                        "translateY(-2px)";
                      (e.target as HTMLButtonElement).style.boxShadow =
                        "0 6px 20px rgba(255, 69, 0, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLButtonElement).style.transform =
                        "translateY(0)";
                      (e.target as HTMLButtonElement).style.boxShadow =
                        "0 4px 15px rgba(255, 69, 0, 0.3)";
                    }}
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
                    <small style={{ color: "#6c757d" }}>
                      <div className="mb-1">
                        <strong style={{ color: "#ff4500", fontWeight: "600" }}>
                          Default Credentials:
                        </strong>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
