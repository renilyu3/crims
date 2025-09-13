import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PDLRegistrationForm from "../../components/pdl/PDLRegistrationForm";
import { pdlApi } from "../../services/pdlApi";
import type { PDLFormData } from "../../types/pdl";
import { activityTracker } from "../../utils/activityTracker";

const PDLRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (formData: PDLFormData) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await pdlApi.create(formData);

      if (response.success) {
        setSuccess(
          `PDL registered successfully! PDL Number: ${response.data.pdl_number}`
        );

        // Add activity for PDL registration
        const fullName = `${formData.first_name} ${
          formData.middle_name ? formData.middle_name + " " : ""
        }${formData.last_name}`;
        activityTracker.addPDLRegistration(fullName || "Unknown", "Staff");

        // Redirect to PDL list after 2 seconds
        setTimeout(() => {
          navigate("/pdls/list");
        }, 2000);
      } else {
        setError(response.message || "Failed to register PDL");
      }
    } catch (err: any) {
      console.error("Error registering PDL:", err);

      if (err.response?.data?.errors) {
        // Handle validation errors
        const validationErrors = err.response.data.errors;
        const errorMessages = Object.values(validationErrors).flat();
        setError(errorMessages.join(", "));
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("An unexpected error occurred while registering the PDL");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate("/pdls");
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex align-items-center">
            <button
              className="btn btn-outline-secondary me-3"
              onClick={handleGoBack}
              disabled={loading}
            >
              <i className="bi bi-arrow-left me-1"></i>
              Back to PDL Management
            </button>
            <div>
              <h1 className="h2 fw-bold text-dark mb-1">Register New PDL</h1>
              <p className="text-muted mb-0">
                Add a new Person Deprived of Liberty to the system
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="row mb-4">
          <div className="col-12">
            <div
              className="alert alert-success alert-dismissible fade show"
              role="alert"
            >
              <i className="bi bi-check-circle me-2"></i>
              {success}
              <button
                type="button"
                className="btn-close"
                onClick={() => setSuccess(null)}
              ></button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="row mb-4">
          <div className="col-12">
            <div
              className="alert alert-danger alert-dismissible fade show"
              role="alert"
            >
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
              <button
                type="button"
                className="btn-close"
                onClick={() => setError(null)}
              ></button>
            </div>
          </div>
        </div>
      )}

      {/* Registration Form */}
      <div className="row">
        <div className="col-12">
          <PDLRegistrationForm onSubmit={handleSubmit} loading={loading} />
        </div>
      </div>

      {/* Help Section */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card bg-light">
            <div className="card-body">
              <h6 className="card-title">
                <i className="bi bi-info-circle me-2"></i>
                Registration Guidelines
              </h6>
              <div className="row">
                <div className="col-md-6">
                  <ul className="list-unstyled mb-0">
                    <li className="mb-2">
                      <i className="bi bi-check text-success me-2"></i>
                      All fields marked with (*) are required
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-check text-success me-2"></i>
                      PDL number will be auto-generated if not provided
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-check text-success me-2"></i>
                      You can add multiple aliases and charges
                    </li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <ul className="list-unstyled mb-0">
                    <li className="mb-2">
                      <i className="bi bi-check text-success me-2"></i>
                      Emergency contacts are optional but recommended
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-check text-success me-2"></i>
                      Photos can be uploaded after registration
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-check text-success me-2"></i>
                      All data is automatically saved and tracked
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDLRegistration;
