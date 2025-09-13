import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PDLRegistrationForm from "../../components/pdl/PDLRegistrationForm";
import { pdlApi } from "../../services/pdlApi";
import type { PDL, PDLFormData } from "../../types/pdl";

const PDLEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pdl, setPdl] = useState<PDL | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchPDL = async () => {
      try {
        setLoading(true);
        const response = await pdlApi.getById(Number(id));
        if (response.success) {
          setPdl(response.data);
        } else {
          setError("Failed to load PDL details");
        }
      } catch (err) {
        setError("Error loading PDL details");
      } finally {
        setLoading(false);
      }
    };

    fetchPDL();
  }, [id]);

  const handleSubmit = async (formData: PDLFormData) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await pdlApi.update(Number(id), formData);

      if (response.success) {
        setSuccess("PDL updated successfully!");

        // Redirect to PDL detail after 2 seconds
        setTimeout(() => {
          navigate(`/pdls/${id}`);
        }, 2000);
      } else {
        setError(response.message || "Failed to update PDL");
      }
    } catch (err: any) {
      console.error("Error updating PDL:", err);

      if (err.response?.data?.errors) {
        const validationErrors = err.response.data.errors;
        const errorMessages = Object.values(validationErrors).flat();
        setError(errorMessages.join(", "));
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("An unexpected error occurred while updating the PDL");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="container-fluid">
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "400px" }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
        <button className="btn btn-secondary" onClick={handleGoBack}>
          Back
        </button>
      </div>
    );
  }

  if (!pdl) {
    return null;
  }

  // Convert PDL to PDLFormData for the form
  const initialFormData: PDLFormData = {
    first_name: pdl.first_name,
    middle_name: pdl.middle_name,
    last_name: pdl.last_name,
    aliases: pdl.aliases || [],
    date_of_birth: pdl.date_of_birth,
    place_of_birth: pdl.place_of_birth,
    gender: pdl.gender,
    civil_status: pdl.civil_status,
    nationality: pdl.nationality,
    religion: pdl.religion,
    address: pdl.address,
    contact_information: pdl.contact_information,
    emergency_contacts: pdl.emergency_contacts || [],
    physical_characteristics: pdl.physical_characteristics,
    case_number: pdl.case_number,
    charges: pdl.charges,
    court_information: pdl.court_information,
    sentence_details: pdl.sentence_details,
    legal_status: pdl.legal_status,
    admission_date: pdl.admission_date,
    admission_time: pdl.admission_time,
    arresting_officer: pdl.arresting_officer,
    arresting_agency: pdl.arresting_agency,
    property_inventory: pdl.property_inventory,
    medical_screening: pdl.medical_screening,
    status: pdl.status,
    cell_assignment: pdl.cell_assignment,
    notes: pdl.notes,
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
              Back
            </button>
            <div>
              <h1 className="h2 fw-bold text-dark mb-1">Edit PDL</h1>
              <p className="text-muted mb-0">
                Update information for PDL Number: {pdl.pdl_number}
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

      {/* Edit Form */}
      <div className="row">
        <div className="col-12">
          <PDLRegistrationForm
            onSubmit={handleSubmit}
            loading={loading}
            initialData={initialFormData}
          />
        </div>
      </div>
    </div>
  );
};

export default PDLEdit;
