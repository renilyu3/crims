import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { pdlApi } from "../../services/pdlApi";
import type { PDL } from "../../types/pdl";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";

// Helper function to normalize PDL data from API
const normalizePDLData = (data: any): PDL => {
  const normalized = { ...data };

  // Ensure array fields are arrays
  if (normalized.aliases) {
    if (typeof normalized.aliases === "string") {
      try {
        normalized.aliases = JSON.parse(normalized.aliases);
      } catch {
        normalized.aliases = [];
      }
    } else if (!Array.isArray(normalized.aliases)) {
      normalized.aliases = [];
    }
  } else {
    normalized.aliases = [];
  }

  if (normalized.charges) {
    if (typeof normalized.charges === "string") {
      try {
        normalized.charges = JSON.parse(normalized.charges);
      } catch {
        normalized.charges = [];
      }
    } else if (!Array.isArray(normalized.charges)) {
      normalized.charges = [];
    }
  } else {
    normalized.charges = [];
  }

  if (normalized.emergency_contacts) {
    if (typeof normalized.emergency_contacts === "string") {
      try {
        normalized.emergency_contacts = JSON.parse(
          normalized.emergency_contacts
        );
      } catch {
        normalized.emergency_contacts = [];
      }
    } else if (!Array.isArray(normalized.emergency_contacts)) {
      normalized.emergency_contacts = [];
    }
  } else {
    normalized.emergency_contacts = [];
  }

  // Ensure object fields are objects
  const objectFields = [
    "address",
    "contact_information",
    "physical_characteristics",
    "court_information",
    "sentence_details",
    "property_inventory",
    "medical_screening",
  ];
  objectFields.forEach((field) => {
    if (normalized[field]) {
      if (typeof normalized[field] === "string") {
        try {
          normalized[field] = JSON.parse(normalized[field]);
        } catch {
          normalized[field] = {};
        }
      } else if (
        typeof normalized[field] !== "object" ||
        Array.isArray(normalized[field])
      ) {
        normalized[field] = {};
      }
    } else {
      normalized[field] = {};
    }
  });

  return normalized as PDL;
};

const PDLDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pdl, setPdl] = useState<PDL | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchPDL = async () => {
      try {
        setLoading(true);
        const response = await pdlApi.getById(Number(id));
        if (response.success && response.data) {
          console.log("PDL data received:", response.data);
          const normalizedPDL = normalizePDLData(response.data);
          setPdl(normalizedPDL);
        } else {
          setError("Failed to load PDL details");
        }
      } catch (err) {
        console.error("Error loading PDL details:", err);
        setError("Error loading PDL details: " + (err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPDL();
    }
  }, [id]);

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!pdl) return;

    try {
      setDeleteLoading(true);
      const response = await pdlApi.delete(pdl.id);

      if (response.success) {
        // Navigate back to PDL list after successful deletion
        navigate("/pdls/list");
      } else {
        setError("Failed to delete PDL");
      }
    } catch (err) {
      console.error("Error deleting PDL:", err);
      setError("Error deleting PDL");
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
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
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
    );
  }

  if (!pdl) {
    return null;
  }

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <Link to="/pdls/list" className="btn btn-outline-secondary mb-3">
            &larr; Back to PDL List
          </Link>
          <h1 className="h2 fw-bold text-dark mb-1">PDL Details</h1>
          <p className="text-muted mb-0">
            Details for PDL Number: {pdl.pdl_number}
          </p>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Personal Information</h5>
              <p>
                <strong>Full Name:</strong> {pdl.full_name}
              </p>
              <p>
                <strong>Age:</strong> {pdl.age}
              </p>
              <p>
                <strong>Date of Birth:</strong>{" "}
                {new Date(pdl.date_of_birth).toLocaleDateString()}
              </p>
              <p>
                <strong>Place of Birth:</strong> {pdl.place_of_birth}
              </p>
              <p>
                <strong>Gender:</strong> {pdl.gender}
              </p>
              <p>
                <strong>Civil Status:</strong> {pdl.civil_status}
              </p>
              <p>
                <strong>Nationality:</strong> {pdl.nationality}
              </p>
              <p>
                <strong>Religion:</strong> {pdl.religion || "N/A"}
              </p>
              <p>
                <strong>Address:</strong> {pdl.address.current}
              </p>
              {pdl.address.permanent && (
                <p>
                  <strong>Permanent Address:</strong> {pdl.address.permanent}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Case Information</h5>
              <p>
                <strong>Case Number:</strong> {pdl.case_number}
              </p>
              <p>
                <strong>Charges:</strong>
              </p>
              <ul>
                {pdl.charges.map((charge, index) => (
                  <li key={index}>{charge}</li>
                ))}
              </ul>
              {pdl.court_information?.court_name && (
                <p>
                  <strong>Court Name:</strong>{" "}
                  {pdl.court_information.court_name}
                </p>
              )}
              {pdl.court_information?.judge && (
                <p>
                  <strong>Judge:</strong> {pdl.court_information.judge}
                </p>
              )}
              {pdl.sentence_details?.sentence && (
                <p>
                  <strong>Sentence:</strong> {pdl.sentence_details.sentence}
                </p>
              )}
              {pdl.sentence_details?.date_sentenced && (
                <p>
                  <strong>Date Sentenced:</strong>{" "}
                  {new Date(
                    pdl.sentence_details.date_sentenced
                  ).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Admission Details</h5>
              <p>
                <strong>Admission Date:</strong>{" "}
                {new Date(pdl.admission_date).toLocaleDateString()}
              </p>
              <p>
                <strong>Admission Time:</strong> {pdl.admission_time}
              </p>
              <p>
                <strong>Legal Status:</strong> {pdl.legal_status}
              </p>
              <p>
                <strong>Status:</strong> {pdl.status}
              </p>
              {pdl.arresting_officer && (
                <p>
                  <strong>Arresting Officer:</strong> {pdl.arresting_officer}
                </p>
              )}
              {pdl.arresting_agency && (
                <p>
                  <strong>Arresting Agency:</strong> {pdl.arresting_agency}
                </p>
              )}
              {pdl.cell_assignment && (
                <p>
                  <strong>Cell Assignment:</strong> {pdl.cell_assignment}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Additional Information</h5>
              {pdl.aliases && pdl.aliases.length > 0 && (
                <>
                  <p>
                    <strong>Aliases:</strong>
                  </p>
                  <ul>
                    {pdl.aliases.map((alias, index) => (
                      <li key={index}>{alias}</li>
                    ))}
                  </ul>
                </>
              )}
              {pdl.physical_characteristics && (
                <>
                  <p>
                    <strong>Height:</strong>{" "}
                    {pdl.physical_characteristics.height || "N/A"}
                  </p>
                  <p>
                    <strong>Weight:</strong>{" "}
                    {pdl.physical_characteristics.weight || "N/A"}
                  </p>
                  <p>
                    <strong>Identifying Marks:</strong>{" "}
                    {pdl.physical_characteristics.identifying_marks || "N/A"}
                  </p>
                </>
              )}
              {pdl.notes && (
                <p>
                  <strong>Notes:</strong> {pdl.notes}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex gap-2">
        <Link to={`/pdls/edit/${pdl.id}`} className="btn btn-primary">
          Edit PDL
        </Link>
        <button
          className="btn btn-danger"
          onClick={handleDeleteClick}
          disabled={deleteLoading}
        >
          {deleteLoading ? (
            <>
              <div
                className="spinner-border spinner-border-sm me-2"
                role="status"
              >
                <span className="visually-hidden">Loading...</span>
              </div>
              Deleting...
            </>
          ) : (
            <>
              <i className="bi bi-trash me-1"></i>
              Delete PDL
            </>
          )}
        </button>
        <Link to="/pdls/list" className="btn btn-secondary">
          Back to List
        </Link>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        pdl={pdl}
        isLoading={deleteLoading}
      />
    </div>
  );
};

export default PDLDetail;
